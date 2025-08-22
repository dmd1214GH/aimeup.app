import * as fs from 'fs';
import { ConfigLoader } from '../src/config';
import type { Config } from '../src/types';

jest.mock('fs');

describe('ConfigLoader', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let configLoader: ConfigLoader;

  const mockConfig: Config = {
    version: '1.0.0',
    issuePrefixes: ['AM', 'BUG'],
    operations: [
      { name: 'Task', linearStatus: 'Tasking' },
      { name: 'Review', linearStatus: 'Review', description: 'Code review' },
    ],
    settings: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock finding repo root
    mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
      if (typeof filePath === 'string') {
        if (filePath.includes('pnpm-workspace.yaml')) {
          return filePath.includes('/mock/repo');
        }
        if (filePath.includes('.linear-watcher/config.json')) {
          return true;
        }
      }
      return false;
    });

    // Mock process.cwd to return a path within our mock repo
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/repo/some/deep/path');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should find repository root', () => {
      expect(() => new ConfigLoader()).not.toThrow();
    });

    it('should throw error when repository root not found', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(() => new ConfigLoader()).toThrow('Unable to find repository root');
    });
  });

  describe('loadConfig', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should load valid configuration', () => {
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = configLoader.loadConfig();

      expect(config).toEqual(mockConfig);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.linear-watcher/config.json'),
        'utf-8'
      );
    });

    it('should throw error when config file not found', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return false; // Config file doesn't exist
          }
        }
        return false;
      });

      expect(() => configLoader.loadConfig()).toThrow('Configuration file not found');
    });

    it('should throw error for invalid JSON', () => {
      mockFs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => configLoader.loadConfig()).toThrow('Invalid JSON in configuration file');
    });

    it('should throw error for invalid config schema', () => {
      const invalidConfig = { version: '1.0.0' }; // Missing required fields
      mockFs.readFileSync.mockReturnValue(JSON.stringify(invalidConfig));

      expect(() => configLoader.loadConfig()).toThrow('Configuration validation failed');
    });
  });

  describe('validateOperation', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should return true for valid operation', () => {
      expect(configLoader.validateOperation('Task', mockConfig)).toBe(true);
      expect(configLoader.validateOperation('Review', mockConfig)).toBe(true);
    });

    it('should return false for invalid operation', () => {
      expect(configLoader.validateOperation('Invalid', mockConfig)).toBe(false);
      expect(configLoader.validateOperation('', mockConfig)).toBe(false);
    });
  });

  describe('validateIssuePrefix', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should return true for valid issue prefixes', () => {
      expect(configLoader.validateIssuePrefix('AM-123', mockConfig)).toBe(true);
      expect(configLoader.validateIssuePrefix('BUG-456', mockConfig)).toBe(true);
    });

    it('should return false for invalid issue prefixes', () => {
      expect(configLoader.validateIssuePrefix('XX-123', mockConfig)).toBe(false);
      expect(configLoader.validateIssuePrefix('123-AM', mockConfig)).toBe(false);
      expect(configLoader.validateIssuePrefix('', mockConfig)).toBe(false);
    });
  });
});
