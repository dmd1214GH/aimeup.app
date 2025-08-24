import * as fs from 'fs';
import { ConfigLoader } from '../src/config';
import type { Config } from '../src/types';

jest.mock('fs');

describe('ConfigLoader', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let configLoader: ConfigLoader;

  const mockConfig: any = {
    version: 1,
    workroot: '${REPO_PATH}/.linear-watcher',
    generalPrompt: 'lc-runner-general-prompt.md',
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKeyEnvVar: 'LINEAR_API_KEY',
      issuePrefix: 'AM-',
    },
    'lc-runner-operations': {
      Tasking: {
        operationName: 'Task',
        linearIssueStatus: 'Tasking-ai',
        promptFile: 'tasking-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          blocked: 'Tasking-BLOCKED',
        },
      },
      Review: {
        operationName: 'Review',
        linearIssueStatus: 'Review-ai',
        promptFile: 'review-prompt.md',
        transitions: {
          success: 'Done',
          blocked: 'Review-BLOCKED',
        },
      },
    },
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

      // Check that operations mapping was created
      expect(config.operations).toBeDefined();
      expect(config.operations['Task']).toEqual({
        operationName: 'Task',
        linearIssueStatus: 'Tasking-ai',
        promptFile: 'tasking-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          blocked: 'Tasking-BLOCKED',
        },
        linearIssueStatusSuccess: 'Delivery-Ready',
        linearIssueStatusBlocked: 'Tasking-BLOCKED',
      });

      // Check original fields are preserved
      expect(config.version).toBe(mockConfig.version);
      expect(config.linear).toEqual(mockConfig.linear);
      expect(config['lc-runner-operations']).toEqual(mockConfig['lc-runner-operations']);

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
      const invalidConfig = { version: 1 }; // Missing required fields
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

  describe('getOperationByCliName', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should return operation mapping for valid CLI name', () => {
      const operation = configLoader.getOperationByCliName('Task', mockConfig);
      expect(operation).toBeDefined();
      expect(operation?.operationName).toBe('Task');
      expect(operation?.linearIssueStatus).toBe('Tasking-ai');
      expect(operation?.promptFile).toBe('tasking-prompt.md');
    });

    it('should return null for invalid CLI name', () => {
      const operation = configLoader.getOperationByCliName('Invalid', mockConfig);
      expect(operation).toBeNull();
    });
  });

  describe('validatePromptFiles', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should validate when all prompt files exist', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return true;
          }
          if (filePath.includes('.linear-watcher/prompts/')) {
            return true; // All prompt files exist
          }
        }
        return false;
      });

      expect(() => configLoader.validatePromptFiles(mockConfig)).not.toThrow();
    });

    it('should throw error when general prompt file is missing', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return true;
          }
          if (filePath.includes('lc-runner-general-prompt.md')) {
            return false; // General prompt missing
          }
          if (filePath.includes('.linear-watcher/prompts/')) {
            return true;
          }
        }
        return false;
      });

      expect(() => configLoader.validatePromptFiles(mockConfig)).toThrow(
        'General prompt file not found'
      );
    });

    it('should throw error when operation prompt file is missing', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return true;
          }
          if (filePath.includes('tasking-prompt.md')) {
            return false; // Tasking prompt missing
          }
          if (filePath.includes('.linear-watcher/prompts/')) {
            return true;
          }
        }
        return false;
      });

      expect(() => configLoader.validatePromptFiles(mockConfig)).toThrow(
        'Prompt file not found for operation Tasking'
      );
    });
  });

  describe('loadPrompt', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should load prompt file content', () => {
      const promptContent = '# Test Prompt\nThis is a test prompt file.';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(promptContent);

      const content = configLoader.loadPrompt('test-prompt.md');
      expect(content).toBe(promptContent);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.linear-watcher/prompts/test-prompt.md'),
        'utf-8'
      );
    });

    it('should throw error when prompt file not found', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('test-prompt.md')) {
            return false;
          }
        }
        return false;
      });

      expect(() => configLoader.loadPrompt('test-prompt.md')).toThrow('Prompt file not found');
    });
  });

  describe('validateIssuePrefix', () => {
    beforeEach(() => {
      configLoader = new ConfigLoader();
    });

    it('should return true for valid issue prefixes', () => {
      expect(configLoader.validateIssuePrefix('AM-123', mockConfig)).toBe(true);
      expect(configLoader.validateIssuePrefix('AM-456', mockConfig)).toBe(true);
    });

    it('should return false for invalid issue prefixes', () => {
      expect(configLoader.validateIssuePrefix('BUG-123', mockConfig)).toBe(false);
      expect(configLoader.validateIssuePrefix('XX-123', mockConfig)).toBe(false);
      expect(configLoader.validateIssuePrefix('123-AM', mockConfig)).toBe(false);
      expect(configLoader.validateIssuePrefix('', mockConfig)).toBe(false);
    });
  });
});
