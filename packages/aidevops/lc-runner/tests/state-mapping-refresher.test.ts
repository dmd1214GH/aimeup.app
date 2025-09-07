import { StateMappingRefresher } from '../src/utils/state-mapping-refresher';
import { LinearClient as LinearSDKClient } from '@linear/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as lockfile from 'proper-lockfile';

// Mock the Linear SDK
jest.mock('@linear/sdk');

// Mock proper-lockfile
jest.mock('proper-lockfile');

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  statSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  renameSync: jest.fn(),
}));

describe('StateMappingRefresher', () => {
  const mockApiKey = 'test-api-key';
  const testOutputPath = '/test/.linear-watcher/state-mappings.json';
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mocks
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.renameSync as jest.Mock).mockImplementation(() => {});
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const refresher = new StateMappingRefresher();
      expect(refresher.getMappingsPath()).toContain('state-mappings.json');
    });

    it('should accept custom options', () => {
      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
        staleThresholdMinutes: 60,
        lockTimeout: 5000,
      });
      expect(refresher.getMappingsPath()).toBe(testOutputPath);
      expect(refresher.isConfigured()).toBe(true);
    });

    it('should use LINEAR_API_KEY from environment', () => {
      const originalEnv = process.env.LINEAR_API_KEY;
      process.env.LINEAR_API_KEY = mockApiKey;
      
      const refresher = new StateMappingRefresher();
      expect(refresher.isConfigured()).toBe(true);
      
      // Restore
      if (originalEnv) {
        process.env.LINEAR_API_KEY = originalEnv;
      } else {
        delete process.env.LINEAR_API_KEY;
      }
    });
  });

  describe('needsRefresh', () => {
    it('should return true if file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const refresher = new StateMappingRefresher({ outputPath: testOutputPath });
      expect(refresher.needsRefresh()).toBe(true);
    });

    it('should return true if file is stale', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - 100 * 60 * 1000, // 100 minutes old
      });
      
      const refresher = new StateMappingRefresher({
        outputPath: testOutputPath,
        staleThresholdMinutes: 90,
      });
      expect(refresher.needsRefresh()).toBe(true);
    });

    it('should return false if file is fresh', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - 30 * 60 * 1000, // 30 minutes old
      });
      
      const refresher = new StateMappingRefresher({
        outputPath: testOutputPath,
        staleThresholdMinutes: 90,
      });
      expect(refresher.needsRefresh()).toBe(false);
    });
  });

  describe('fetchWorkflowStates', () => {
    it('should fetch all workflow states from Linear API', async () => {
      const mockStates = [
        { id: 'uuid-1', name: 'Backlog' },
        { id: 'uuid-2', name: 'In Progress' },
        { id: 'uuid-3', name: 'Done' },
      ];

      const mockTeam = {
        name: 'Test Team',
        states: jest.fn().mockResolvedValue({ nodes: mockStates }),
      };

      const mockClient = {
        teams: jest.fn().mockResolvedValue({
          nodes: [mockTeam],
        }),
      };

      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      const result = await refresher.fetchWorkflowStates();

      expect(result.stateUUIDs).toEqual({
        'Backlog': 'uuid-1',
        'In Progress': 'uuid-2',
        'Done': 'uuid-3',
      });
      expect(result._metadata?.teams).toEqual(['Test Team']);
      expect(result._metadata?.fetchedAt).toBeTruthy();
    });

    it('should throw error if no API key configured', async () => {
      // Save and clear the API key from environment
      const originalKey = process.env.LINEAR_API_KEY;
      delete process.env.LINEAR_API_KEY;
      
      const refresher = new StateMappingRefresher({ outputPath: testOutputPath });
      
      await expect(refresher.fetchWorkflowStates()).rejects.toThrow(
        'Linear API key not configured'
      );
      
      // Restore the original key
      if (originalKey) {
        process.env.LINEAR_API_KEY = originalKey;
      }
    });

    it('should handle multiple teams', async () => {
      const mockStates1 = [
        { id: 'uuid-1', name: 'Backlog' },
        { id: 'uuid-2', name: 'Done' },
      ];
      const mockStates2 = [
        { id: 'uuid-3', name: 'Todo' },
        { id: 'uuid-4', name: 'Done' }, // Duplicate name, should override
      ];

      const mockTeam1 = {
        name: 'Team 1',
        states: jest.fn().mockResolvedValue({ nodes: mockStates1 }),
      };
      const mockTeam2 = {
        name: 'Team 2',
        states: jest.fn().mockResolvedValue({ nodes: mockStates2 }),
      };

      const mockClient = {
        teams: jest.fn().mockResolvedValue({
          nodes: [mockTeam1, mockTeam2],
        }),
      };

      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      const result = await refresher.fetchWorkflowStates();

      expect(result.stateUUIDs).toEqual({
        'Backlog': 'uuid-1',
        'Done': 'uuid-4', // Last one wins
        'Todo': 'uuid-3',
      });
      expect(result._metadata?.teams).toEqual(['Team 1', 'Team 2']);
    });
  });

  describe('refresh', () => {
    it('should refresh when file does not exist', async () => {
      const mockStates = [{ id: 'uuid-1', name: 'Backlog' }];
      const mockTeam = {
        name: 'Test Team',
        states: jest.fn().mockResolvedValue({ nodes: mockStates }),
      };
      const mockClient = {
        teams: jest.fn().mockResolvedValue({ nodes: [mockTeam] }),
      };

      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (lockfile.lock as jest.Mock).mockResolvedValue(() => {});

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      const result = await refresher.refresh();

      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should skip refresh if file is fresh and not forced', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - 30 * 60 * 1000, // 30 minutes old
      });

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
        staleThresholdMinutes: 90,
      });

      const result = await refresher.refresh();

      expect(result).toBe(false);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should force refresh when requested', async () => {
      const mockStates = [{ id: 'uuid-1', name: 'Backlog' }];
      const mockTeam = {
        name: 'Test Team',
        states: jest.fn().mockResolvedValue({ nodes: mockStates }),
      };
      const mockClient = {
        teams: jest.fn().mockResolvedValue({ nodes: [mockTeam] }),
      };

      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({
        mtimeMs: Date.now() - 30 * 60 * 1000, // 30 minutes old (fresh)
      });
      (lockfile.lock as jest.Mock).mockResolvedValue(() => {});

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
        staleThresholdMinutes: 90,
      });

      const result = await refresher.refresh(true); // Force refresh

      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle lock timeout gracefully', async () => {
      // Mock file doesn't exist initially, but lock file check succeeds
      (fs.existsSync as jest.Mock).mockImplementation((path) => {
        return path.endsWith('.lock'); // Only lock file exists
      });
      (lockfile.lock as jest.Mock).mockRejectedValue(new Error('Lock timeout'));

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      const result = await refresher.refresh();

      expect(result).toBe(false); // Non-fatal
      // Note: writeFileSync may be called for lock file creation
      const writeCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const nonLockCalls = writeCalls.filter(call => !call[0].endsWith('.lock'));
      expect(nonLockCalls).toHaveLength(0);
    });

    it('should handle API failures gracefully', async () => {
      // Mock a successful client creation but failing API call
      const mockClient = {
        teams: jest.fn().mockRejectedValue(new Error('API connection failed')),
      };
      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (lockfile.lock as jest.Mock).mockResolvedValue(() => {});

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      const result = await refresher.refresh();

      expect(result).toBe(false); // Non-fatal
      // Check that no state mappings were written (only lock file)
      const writeCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const nonLockCalls = writeCalls.filter(call => !call[0].endsWith('.lock'));
      expect(nonLockCalls).toHaveLength(0);
    });

    it('should release lock even on failure', async () => {
      const releaseMock = jest.fn();
      (lockfile.lock as jest.Mock).mockResolvedValue(releaseMock);
      // Mock a successful client creation but failing API call
      const mockClient = {
        teams: jest.fn().mockRejectedValue(new Error('API error')),
      };
      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      await refresher.refresh();

      expect(releaseMock).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      const mockStates = [{ id: 'uuid-1', name: 'Backlog' }];
      const mockTeam = {
        name: 'Test Team',
        states: jest.fn().mockResolvedValue({ nodes: mockStates }),
      };
      const mockClient = {
        teams: jest.fn().mockResolvedValue({ nodes: [mockTeam] }),
      };

      (LinearSDKClient as jest.Mock).mockImplementation(() => mockClient);
      (fs.existsSync as jest.Mock).mockImplementation((path) => {
        // Directory doesn't exist, but lock file check returns false
        return path.endsWith('.lock');
      });
      (lockfile.lock as jest.Mock).mockResolvedValue(() => {});

      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });

      await refresher.refresh();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.dirname(testOutputPath),
        { recursive: true }
      );
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is set', () => {
      const refresher = new StateMappingRefresher({
        apiKey: mockApiKey,
        outputPath: testOutputPath,
      });
      expect(refresher.isConfigured()).toBe(true);
    });

    it('should return false when no API key', () => {
      // Save and clear the API key from environment
      const originalKey = process.env.LINEAR_API_KEY;
      delete process.env.LINEAR_API_KEY;
      
      const refresher = new StateMappingRefresher({ outputPath: testOutputPath });
      expect(refresher.isConfigured()).toBe(false);
      
      // Restore the original key
      if (originalKey) {
        process.env.LINEAR_API_KEY = originalKey;
      }
    });
  });

  describe('getMappingsPath', () => {
    it('should return the configured output path', () => {
      const refresher = new StateMappingRefresher({
        outputPath: testOutputPath,
      });
      expect(refresher.getMappingsPath()).toBe(testOutputPath);
    });
  });
});