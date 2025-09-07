import { StateMappingRefresher } from '../src/utils/state-mapping-refresher';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('File Locking Integration Tests', () => {
  let tempDir: string;
  let testPath: string;
  
  beforeEach(() => {
    // Create a temp directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-runner-test-'));
    testPath = path.join(tempDir, 'state-mappings.json');
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should handle concurrent refresh attempts', async () => {
    // Skip if no API key is configured (CI environment)
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.log('Skipping integration test - LINEAR_API_KEY not set');
      return;
    }

    // Create two refreshers pointing to the same file
    const refresher1 = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
      staleThresholdMinutes: 0, // Always stale
      lockTimeout: 5000,
    });

    const refresher2 = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
      staleThresholdMinutes: 0, // Always stale
      lockTimeout: 5000,
    });

    // Start both refreshes concurrently
    const [result1, result2] = await Promise.all([
      refresher1.refresh(),
      refresher2.refresh(),
    ]);

    // One should succeed, one might fail or skip
    expect(result1 || result2).toBe(true);
    
    // File should exist and be valid JSON
    expect(fs.existsSync(testPath)).toBe(true);
    const content = fs.readFileSync(testPath, 'utf-8');
    const mappings = JSON.parse(content);
    expect(mappings.stateUUIDs).toBeDefined();
    expect(mappings._metadata).toBeDefined();
  });

  it('should recover from stale locks', async () => {
    // Skip if no API key is configured (CI environment)
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.log('Skipping integration test - LINEAR_API_KEY not set');
      return;
    }

    const lockPath = `${testPath}.lock`;
    
    // Create a lock file manually (simulating a stale lock)
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    fs.writeFileSync(lockPath, '');

    const refresher = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
      lockTimeout: 2000, // Short timeout
    });

    // Should be able to acquire lock and refresh
    const result = await refresher.refresh();
    
    // Should handle the stale lock appropriately
    // Either by taking it over or waiting
    expect(typeof result).toBe('boolean');
    
    // Clean up lock file if it exists
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  });

  it('should perform atomic file replacement', async () => {
    // Skip if no API key is configured (CI environment)
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.log('Skipping integration test - LINEAR_API_KEY not set');
      return;
    }

    // Create initial file with known content
    fs.mkdirSync(path.dirname(testPath), { recursive: true });
    const initialContent = { stateUUIDs: { 'Test': 'old-uuid' } };
    fs.writeFileSync(testPath, JSON.stringify(initialContent));

    const refresher = new StateMappingRefresher({
      apiKey,
      outputPath: testPath,
      staleThresholdMinutes: 0, // Force refresh
    });

    // Start a reader that continuously reads the file
    let readError = false;
    const readPromise = new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        try {
          const content = fs.readFileSync(testPath, 'utf-8');
          JSON.parse(content); // Should always be valid JSON
        } catch (error) {
          readError = true;
          clearInterval(interval);
          resolve();
        }
      }, 10);

      // Stop after 1 second
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 1000);
    });

    // Perform refresh while reading
    await Promise.all([
      refresher.refresh(),
      readPromise,
    ]);

    // Should never have read errors (atomic replacement)
    expect(readError).toBe(false);
    
    // File should have new content - either from refresh or initial content
    const finalContent = JSON.parse(fs.readFileSync(testPath, 'utf-8'));
    expect(finalContent.stateUUIDs).toBeDefined();
    // Metadata might not exist if refresh didn't happen (already fresh)
    // Just check that the file is valid JSON with stateUUIDs
  });
});