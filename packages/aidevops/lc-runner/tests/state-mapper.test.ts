import { StateMapper } from '../src/utils/state-mapper';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('StateMapper', () => {
  let testMappingsPath: string;
  let stateMapper: StateMapper;

  const testMappings = {
    stateUUIDs: {
      'Grooming': '849ee7b3-ac72-4e58-aa55-3966e589428e',
      'Delivery-ai': '2ad7ee66-a85f-47f4-8b5b-77dd722a5cb1',
      'Acceptance': 'bb9c535d-ca77-4eba-8b1a-fbbf32e3a51b',
      'Delivery-BLOCKED': 'e3828aef-9ca3-4e25-936c-59b17664f38b',
      'Done': '2db9942a-f630-461f-ab96-1fc4274108df'
    },
    _metadata: {
      fetchedAt: '2025-09-04 22:00:00 UTC',
      teams: ['Aimeup']
    }
  };

  beforeEach(() => {
    // Create temp mappings file
    testMappingsPath = join(tmpdir(), `state-mappings-test-${Date.now()}.json`);
    writeFileSync(testMappingsPath, JSON.stringify(testMappings, null, 2));
    stateMapper = new StateMapper(testMappingsPath);
  });

  afterEach(() => {
    // Clean up temp file
    if (existsSync(testMappingsPath)) {
      unlinkSync(testMappingsPath);
    }
  });

  describe('getStateUUID', () => {
    it('should return UUID for valid state name', () => {
      const uuid = stateMapper.getStateUUID('Acceptance');
      expect(uuid).toBe('bb9c535d-ca77-4eba-8b1a-fbbf32e3a51b');
    });

    it('should return null for unknown state name', () => {
      const uuid = stateMapper.getStateUUID('UnknownState');
      expect(uuid).toBeNull();
    });

    it('should handle case-sensitive state names', () => {
      const uuid = stateMapper.getStateUUID('grooming');
      expect(uuid).toBeNull(); // Should be 'Grooming' with capital G
    });
  });

  describe('getStateName', () => {
    it('should return state name for valid UUID', () => {
      const name = stateMapper.getStateName('bb9c535d-ca77-4eba-8b1a-fbbf32e3a51b');
      expect(name).toBe('Acceptance');
    });

    it('should return null for unknown UUID', () => {
      const name = stateMapper.getStateName('00000000-0000-0000-0000-000000000000');
      expect(name).toBeNull();
    });
  });

  describe('hasState', () => {
    it('should return true for existing state', () => {
      expect(stateMapper.hasState('Delivery-ai')).toBe(true);
    });

    it('should return false for non-existing state', () => {
      expect(stateMapper.hasState('NonExistent')).toBe(false);
    });
  });

  describe('getAllStates', () => {
    it('should return all state mappings', () => {
      const states = stateMapper.getAllStates();
      expect(Object.keys(states).length).toBe(5);
      expect(states['Grooming']).toBe('849ee7b3-ac72-4e58-aa55-3966e589428e');
    });
  });

  describe('missing mappings file', () => {
    it('should handle missing mappings file gracefully', () => {
      const mapper = new StateMapper('/non/existent/path.json');
      expect(mapper.getStateUUID('Acceptance')).toBeNull();
      expect(mapper.getAllStates()).toEqual({});
    });
  });

  describe('updateIssueStatus', () => {
    it('should fail without LINEAR_API_KEY', async () => {
      const originalKey = process.env.LINEAR_API_KEY;
      delete process.env.LINEAR_API_KEY;

      const result = await stateMapper.updateIssueStatus('AM-68', 'Acceptance');
      expect(result).toBe(false);

      // Restore
      if (originalKey) {
        process.env.LINEAR_API_KEY = originalKey;
      }
    });

    it('should fail with unknown state', async () => {
      const result = await stateMapper.updateIssueStatus('AM-68', 'UnknownState');
      expect(result).toBe(false);
    });

    // Note: Actual API call test would require mocking or integration test setup
  });
});