import { StateMappingRefresher } from '../src/utils/state-mapping-refresher';
import { StateMapper } from '../src/utils/state-mapper';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('UUID Mapping End-to-End Tests', () => {
  let tempDir: string;
  let testPath: string;
  
  beforeEach(() => {
    // Create a temp directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-runner-e2e-'));
    testPath = path.join(tempDir, 'state-mappings.json');
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should complete full refresh and lookup flow', async () => {
    // Skip if no API key is configured (CI environment)
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.log('Skipping E2E test - LINEAR_API_KEY not set');
      return;
    }

    // Step 1: Refresh state mappings
    const refresher = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
    });

    const refreshResult = await refresher.refresh();
    expect(refreshResult).toBe(true);
    expect(fs.existsSync(testPath)).toBe(true);

    // Step 2: Load mappings with StateMapper
    const mapper = new StateMapper(testPath);
    
    // Step 3: Verify we can look up UUIDs
    const allStates = mapper.getAllStates();
    expect(Object.keys(allStates).length).toBeGreaterThan(0);
    
    // Check for common state names (these should exist in most Linear workspaces)
    const commonStates = ['Backlog', 'Todo', 'In Progress', 'Done', 'Canceled'];
    const foundStates = commonStates.filter(state => mapper.hasState(state));
    
    // Should find at least some common states
    expect(foundStates.length).toBeGreaterThan(0);
    
    // Verify UUID lookup works
    foundStates.forEach(stateName => {
      const uuid = mapper.getStateUUID(stateName);
      expect(uuid).toBeTruthy();
      expect(typeof uuid).toBe('string');
      
      // UUID should be in the correct format (Linear UUIDs are base64-like)
      expect(uuid).toMatch(/^[a-zA-Z0-9-_]+$/);
      
      // Reverse lookup should work
      const reverseName = mapper.getStateName(uuid!);
      expect(reverseName).toBe(stateName);
    });
  });

  it('should handle missing state-mappings.json gracefully', () => {
    // Create mapper with non-existent file
    const mapper = new StateMapper(path.join(tempDir, 'non-existent.json'));
    
    // Should return null/empty for lookups
    expect(mapper.getStateUUID('Backlog')).toBeNull();
    expect(mapper.getStateName('some-uuid')).toBeNull();
    expect(mapper.getAllStates()).toEqual({});
    expect(mapper.hasState('Backlog')).toBe(false);
  });

  it('should handle rate limiting (90-minute threshold)', async () => {
    // Skip if no API key is configured
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.log('Skipping E2E test - LINEAR_API_KEY not set');
      return;
    }

    const refresher = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
      staleThresholdMinutes: 90,
    });

    // First refresh should succeed
    const firstRefresh = await refresher.refresh();
    expect(firstRefresh).toBe(true);
    
    // Get file modification time
    const firstStats = fs.statSync(testPath);
    
    // Second immediate refresh should be skipped (not stale)
    const secondRefresh = await refresher.refresh();
    expect(secondRefresh).toBe(false);
    
    // File should not have been modified
    const secondStats = fs.statSync(testPath);
    expect(secondStats.mtimeMs).toBe(firstStats.mtimeMs);
    
    // Forced refresh should still work
    const forcedRefresh = await refresher.refresh(true);
    expect(forcedRefresh).toBe(true);
    
    // File should have been updated
    const thirdStats = fs.statSync(testPath);
    expect(thirdStats.mtimeMs).toBeGreaterThan(firstStats.mtimeMs);
  });

  it('should preserve data integrity during concurrent operations', async () => {
    // Create a known state mappings file
    const testMappings = {
      stateUUIDs: {
        'Backlog': 'uuid-backlog',
        'In Progress': 'uuid-progress',
        'Done': 'uuid-done',
      },
      _metadata: {
        fetchedAt: new Date().toISOString(),
        teams: ['Test Team'],
      },
    };
    
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(testPath, JSON.stringify(testMappings));

    // Create multiple mappers reading the same file
    const mappers = Array.from({ length: 5 }, () => new StateMapper(testPath));
    
    // All mappers should read the same data
    mappers.forEach(mapper => {
      expect(mapper.getStateUUID('Backlog')).toBe('uuid-backlog');
      expect(mapper.getStateUUID('Done')).toBe('uuid-done');
      expect(mapper.hasState('In Progress')).toBe(true);
    });

    // Simulate a refresh happening while mappers are active
    const apiKey = process.env.LINEAR_API_KEY;
    if (apiKey) {
      const refresher = new StateMappingRefresher({
        apiKey,
        outputPath: testPath,
        staleThresholdMinutes: 0, // Force refresh
      });

      await refresher.refresh();
      
      // Create new mapper after refresh
      const newMapper = new StateMapper(testPath);
      
      // Should have fresh data (might have different states)
      const allStates = newMapper.getAllStates();
      expect(Object.keys(allStates).length).toBeGreaterThan(0);
    }
  });
});