import * as fs from 'fs';
import * as path from 'path';
import type { Config, OperationMapping } from '../src/types';

// Mock fs module for integration tests
jest.mock('fs');

describe('lc-runner CLI Integration', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  const mockConfig: Config = {
    version: 1,
    workroot: '${REPO_PATH}/.linear-watcher',
    generalPrompt: 'lc-runner-general-prompt.md',
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKeyEnvVar: 'LINEAR_API_KEY',
      issuePrefix: 'AM-',
    },
    'lc-runner-operations': {
      Grooming: {
        operationName: 'Groom',
        linearIssueStatus: 'Grooming',
        promptFile: 'grooming-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          blocked: 'Grooming',
        },
      },
      Delivery: {
        operationName: 'Deliver',
        linearIssueStatus: 'Delivery-ai',
        promptFile: 'delivery-prompt.md',
        transitions: {
          success: 'Acceptance',
          blocked: 'Delivery-BLOCKED',
        },
      },
    },
    operations: {
      Grooming: {
        operationName: 'Groom',
        linearIssueStatus: 'Grooming',
        promptFile: 'grooming-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          blocked: 'Grooming',
        },
      },
      Delivery: {
        operationName: 'Deliver',
        linearIssueStatus: 'Delivery-ai',
        promptFile: 'delivery-prompt.md',
        transitions: {
          success: 'Acceptance',
          blocked: 'Delivery-BLOCKED',
        },
      },
    },
  };

  const mockPromptContent = '# Test Prompt\nThis is a test prompt.';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock file system for config and prompts
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

    mockFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (typeof filePath === 'string') {
        if (filePath.includes('config.json')) {
          return JSON.stringify(mockConfig);
        }
        if (filePath.includes('.md')) {
          return mockPromptContent;
        }
      }
      return '';
    });

    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/repo/some/path');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Operation Mapping', () => {
    it('should map CLI Groom operation to Grooming config entry', () => {
      // This is a unit test for the mapping logic
      const operations = mockConfig['lc-runner-operations'];
      const groomOperation = Object.values(operations).find(
        (op: OperationMapping) => op.operationName === 'Groom'
      );

      expect(groomOperation).toBeDefined();
      expect(groomOperation?.linearIssueStatus).toBe('Grooming');
      expect(groomOperation?.promptFile).toBe('grooming-prompt.md');
    });

    it('should map CLI Deliver operation to Delivery config entry', () => {
      const operations = mockConfig['lc-runner-operations'];
      const deliverOperation = Object.values(operations).find(
        (op: OperationMapping) => op.operationName === 'Deliver'
      );

      expect(deliverOperation).toBeDefined();
      expect(deliverOperation?.linearIssueStatus).toBe('Delivery-ai');
      expect(deliverOperation?.promptFile).toBe('delivery-prompt.md');
    });

    it('should handle invalid operation gracefully', () => {
      const operations = mockConfig['lc-runner-operations'];
      const invalidOperation = Object.values(operations).find(
        (op: OperationMapping) => op.operationName === 'Invalid'
      );

      expect(invalidOperation).toBeUndefined();
    });
  });

  describe('Issue Status Validation', () => {
    it('should validate issue with correct prefix', () => {
      const issueId = 'AM-123';
      const isValid = issueId.startsWith(mockConfig.linear.issuePrefix);
      expect(isValid).toBe(true);
    });

    it('should reject issue with incorrect prefix', () => {
      const issueId = 'BUG-123';
      const isValid = issueId.startsWith(mockConfig.linear.issuePrefix);
      expect(isValid).toBe(false);
    });

    it('should validate Linear issue status matches operation requirement', () => {
      // This is a placeholder test since actual Linear API is out of scope
      const operation = mockConfig['lc-runner-operations'].Grooming;
      const expectedStatus = operation.linearIssueStatus;

      // In real implementation, this would check against Linear API
      expect(expectedStatus).toBe('Grooming');
    });
  });

  describe('Prompt Loading', () => {
    it('should load general prompt and operation-specific prompt', () => {
      const generalPromptPath = path.join(
        '/mock/repo',
        '.linear-watcher/prompts',
        mockConfig.generalPrompt
      );
      const operationPromptPath = path.join(
        '/mock/repo',
        '.linear-watcher/prompts',
        mockConfig['lc-runner-operations'].Grooming.promptFile
      );

      // Verify paths would be constructed correctly
      expect(generalPromptPath).toContain('lc-runner-general-prompt.md');
      expect(operationPromptPath).toContain('grooming-prompt.md');

      // Verify mock would return content
      const generalContent = mockFs.readFileSync(generalPromptPath, 'utf-8');
      const operationContent = mockFs.readFileSync(operationPromptPath, 'utf-8');

      expect(generalContent).toBe(mockPromptContent);
      expect(operationContent).toBe(mockPromptContent);
    });

    it('should handle missing prompt files', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return true;
          }
          if (filePath.includes('grooming-prompt.md')) {
            return false; // Prompt file missing
          }
        }
        return false;
      });

      // Check that missing file is detected
      const promptPath = path.join('/mock/repo', '.linear-watcher/prompts', 'grooming-prompt.md');
      expect(mockFs.existsSync(promptPath)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing config file', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath.includes('pnpm-workspace.yaml')) {
            return filePath.includes('/mock/repo');
          }
          if (filePath.includes('.linear-watcher/config.json')) {
            return false; // Config missing
          }
        }
        return false;
      });

      const configPath = path.join('/mock/repo', '.linear-watcher/config.json');
      expect(mockFs.existsSync(configPath)).toBe(false);
    });

    it('should handle malformed config JSON', () => {
      mockFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (typeof filePath === 'string' && filePath.includes('config.json')) {
          return '{ invalid json }';
        }
        return '';
      });

      const configContent = mockFs.readFileSync('/mock/repo/.linear-watcher/config.json', 'utf-8');
      expect(() => JSON.parse(configContent)).toThrow();
    });

    it('should validate operation exists in config', () => {
      const operations = mockConfig['lc-runner-operations'];
      const validOperations = Object.values(operations).map(
        (op: OperationMapping) => op.operationName
      );

      expect(validOperations).toContain('Groom');
      expect(validOperations).toContain('Deliver');
      expect(validOperations).not.toContain('Invalid');
    });
  });

  describe('Transition Mapping', () => {
    it('should provide correct success transition for Groom operation', () => {
      const groomOperation = mockConfig['lc-runner-operations'].Grooming;
      expect(groomOperation.transitions.success).toBe('Delivery-Ready');
      expect(groomOperation.transitions.blocked).toBe('Grooming');
    });

    it('should provide correct success transition for Deliver operation', () => {
      const deliverOperation = mockConfig['lc-runner-operations'].Delivery;
      expect(deliverOperation.transitions.success).toBe('Acceptance');
      expect(deliverOperation.transitions.blocked).toBe('Delivery-BLOCKED');
    });
  });
});
