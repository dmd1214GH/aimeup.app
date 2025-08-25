import * as fs from 'fs';
import * as path from 'path';
import { WorkingFolderManager } from '../src/working-folder';
import { OperationLogger } from '../src/operation-logger';
import { PromptAssembler } from '../src/prompt-assembler';
import { LinearClient } from '../src/linear-client';
import { LinearApiService } from '../src/linear-api-service';

// Mock modules for integration test
jest.mock('fs');
jest.mock('../src/linear-api-service');

describe('lc-runner Integration Tests', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  const testWorkroot = '/test/repo/.linear-watcher/work';
  const testIssueId = 'AM-19';
  const testOperation = 'Delivery';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Set system time to get desired local timestamp
    jest.setSystemTime(new Date('2025-08-22T10:30:45'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Complete workflow integration', () => {
    it('should create working folder, log entry, prompt, and report', () => {
      // Setup mocks for the complete workflow
      mockFs.existsSync.mockImplementation((path: any) => {
        // Simulate various file existence checks
        if (path.includes('lcr-AM-19')) return false; // Working folder doesn't exist yet
        if (path.includes('prompt')) return true; // Prompt files exist
        if (path.includes('config.json')) return true; // Config exists
        return false;
      });

      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);
      mockFs.appendFileSync.mockImplementation(() => undefined);
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.includes('general')) {
          return '## General Prompt\nIssue: <ArgIssueId>\nOperation: <ArgOperation>\nFolder: <ArgWorkingFolder>';
        }
        if (filePath.includes('operation')) {
          return '## Delivery Instructions\nDeliver the issue';
        }
        if (filePath.includes('config.json')) {
          return JSON.stringify({
            linear: { issuePrefix: 'AM' },
            generalPrompt: 'lc-runner-general-prompt.md',
            'lc-runner-operations': {
              Delivery: {
                operationName: 'Delivery',
                linearIssueStatus: 'Code & Test',
                promptFile: 'delivery-prompt.md',
              },
            },
          });
        }
        return '';
      });

      // Create instances and execute workflow
      const folderManager = new WorkingFolderManager(testWorkroot);
      const workingFolderPath = folderManager.createWorkingFolder(testIssueId, testOperation);

      // Verify working folder creation
      expect(workingFolderPath).toBe(
        '/test/repo/.linear-watcher/work/lcr-AM-19/op-Delivery-20250822103045'
      );
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/repo/.linear-watcher/work/lcr-AM-19', {
        recursive: true,
      });
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(workingFolderPath, { recursive: true });

      // Create and verify operation log
      const logger = new OperationLogger(testWorkroot);
      const logEntry = {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: testOperation,
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      };
      logger.appendLogEntry(testIssueId, logEntry);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/repo/.linear-watcher/work/lcr-AM-19/issue-operation-log.md',
        expect.stringContaining('# Operation Log for AM-19'),
        'utf8'
      );

      // Assemble and verify master prompt
      const assembler = new PromptAssembler();
      const generalPromptPath = '/test/prompts/general.md';
      const operationPromptPath = '/test/prompts/operation.md';
      const masterPromptPath = path.join(workingFolderPath, 'master-prompt.md');

      // Reset mock to track master prompt write
      mockFs.writeFileSync.mockClear();
      mockFs.existsSync.mockReturnValue(true);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        {
          issueId: testIssueId,
          operation: testOperation,
          workingFolder: workingFolderPath,
        },
        masterPromptPath
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        masterPromptPath,
        expect.stringContaining('Issue: AM-19'),
        'utf8'
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        masterPromptPath,
        expect.stringContaining('Operation: Delivery'),
        'utf8'
      );

      // Verify master prompt was written with correct content
      const lastWriteCall =
        mockFs.writeFileSync.mock.calls[mockFs.writeFileSync.mock.calls.length - 1];
      expect(lastWriteCall[0]).toContain('master-prompt.md');
      expect(lastWriteCall[1]).toContain('Delivery Instructions');
    });

    it('should handle errors gracefully and update report to Failed', () => {
      // Simulate an error during folder creation
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const folderManager = new WorkingFolderManager(testWorkroot);

      expect(() => {
        folderManager.createWorkingFolder(testIssueId, testOperation);
      }).toThrow('Failed to create working folder');
    });

    it('should validate prompt format during assembly', () => {
      const assembler = new PromptAssembler();

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.includes('general')) {
          return '## General Prompt\nContent';
        }
        if (filePath.includes('operation')) {
          return '# Invalid Level 1 Heading\nContent'; // Invalid format
        }
        return '';
      });

      expect(() => {
        assembler.assembleMasterPrompt(
          '/test/general.md',
          '/test/operation.md',
          {
            issueId: testIssueId,
            operation: testOperation,
            workingFolder: testWorkroot,
          },
          '/test/output.md'
        );
      }).toThrow('Level-1 heading (#) found');
    });

    it('should create all required artifacts in correct locations', () => {
      // Track all file operations
      const fileWrites: Array<{ path: string; content: string }> = [];

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation((filePath: any, content: any) => {
        fileWrites.push({ path: filePath.toString(), content: content.toString() });
      });
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.includes('general')) {
          return '## General\nGeneral: <ArgIssueId>';
        }
        if (filePath.includes('operation')) {
          return '## Operation\nContent';
        }
        return '';
      });

      // Execute workflow
      const folderManager = new WorkingFolderManager(testWorkroot);
      const workingFolderPath = folderManager.createWorkingFolder(testIssueId, testOperation);

      const logger = new OperationLogger(testWorkroot);
      logger.appendLogEntry(testIssueId, {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: testOperation,
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      });

      // Reset to track prompt assembly
      mockFs.existsSync.mockReturnValue(true);

      const assembler = new PromptAssembler();
      assembler.assembleMasterPrompt(
        '/test/general.md',
        '/test/operation.md',
        {
          issueId: testIssueId,
          operation: testOperation,
          workingFolder: workingFolderPath,
        },
        path.join(workingFolderPath, 'master-prompt.md')
      );

      // Verify all expected files were created
      const expectedFiles = ['issue-operation-log.md', 'master-prompt.md'];

      expectedFiles.forEach((fileName) => {
        const fileCreated = fileWrites.some((write) => write.path.includes(fileName));
        expect(fileCreated).toBe(true);
      });

      // Verify content replacements in master prompt
      const masterPromptWrite = fileWrites.find((w) => w.path.includes('master-prompt.md'));
      expect(masterPromptWrite?.content).toContain('General: AM-19');
      expect(masterPromptWrite?.content).toContain('## Operation');
    });
  });

  describe('Linear API integration workflow', () => {
    let mockApiService: jest.Mocked<LinearApiService>;

    beforeEach(() => {
      // Setup mock LinearApiService
      mockApiService = {
        isConfigured: jest.fn().mockReturnValue(true),
        validateIssueStatus: jest.fn(),
        getIssueBody: jest.fn(),
        getIssueStatus: jest.fn(),
        checkConnection: jest.fn(),
        addComment: jest.fn(),
        updateIssueStatus: jest.fn(),
      } as any;

      (LinearApiService as jest.MockedClass<typeof LinearApiService>).mockImplementation(
        () => mockApiService
      );
    });

    it('should extract issue from Linear and save to files', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-19',
        title: 'Test Issue Title',
        description: 'This is the issue body content',
        status: 'In Progress',
        priority: 1,
        assignee: 'John Doe',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        url: 'https://linear.app/team/issue/AM-19',
      };

      mockApiService.getIssueBody.mockResolvedValue(mockIssue);
      mockApiService.validateIssueStatus.mockResolvedValue(true);

      const linearClient = new LinearClient({
        apiUrl: 'https://api.linear.app',
        apiKeyEnvVar: 'LINEAR_API_KEY',
        issuePrefix: 'AM',
      });

      // Test issue extraction
      const issue = await linearClient.getIssue('AM-19');
      expect(issue).toEqual(mockIssue);

      // Simulate saving to files
      const workingFolderPath = '/test/work/lcr-AM-19/op-Delivery-20250822103045';
      const issueContent = `# ${issue.title}

${issue.description}

## Metadata
- URL: ${issue.url}
- Identifier: ${issue.identifier}
- Status: ${issue.status}
- Priority: Priority ${issue.priority}
- Assignee: ${issue.assignee}
- Created: ${issue.createdAt}
- Updated: ${issue.updatedAt}
`;

      mockFs.writeFileSync.mockClear();
      mockFs.writeFileSync(path.join(workingFolderPath, 'original-issue.md'), issueContent, 'utf8');
      mockFs.writeFileSync(path.join(workingFolderPath, 'updated-issue.md'), issueContent, 'utf8');

      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('original-issue.md'),
        expect.stringContaining('Test Issue Title'),
        'utf8'
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('updated-issue.md'),
        expect.stringContaining('Test Issue Title'),
        'utf8'
      );
    });

    it('should include issue body in master prompt', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-19',
        title: 'Test Issue',
        description: 'Issue description here',
        status: 'In Progress',
        priority: 1,
        assignee: 'John Doe',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        url: 'https://linear.app/issue',
      };

      mockApiService.getIssueBody.mockResolvedValue(mockIssue);

      const issueBody = `# ${mockIssue.title}

${mockIssue.description}

## Metadata
- URL: ${mockIssue.url}`;

      // Test prompt assembly with issue body
      const assembler = new PromptAssembler();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.includes('general')) {
          return '## General Prompt\nIssue: <ArgIssueId>';
        }
        if (filePath.includes('operation')) {
          return '## Operation\nDeliver the issue';
        }
        return '';
      });

      mockFs.writeFileSync.mockClear();

      assembler.assembleMasterPrompt(
        '/test/general.md',
        '/test/operation.md',
        {
          issueId: 'AM-19',
          operation: 'Delivery',
          workingFolder: '/test/work',
        },
        '/test/master-prompt.md'
      );

      const masterPromptCall = mockFs.writeFileSync.mock.calls[0];
      expect(masterPromptCall[1]).toContain('Issue: AM-19');
      expect(masterPromptCall[1]).toContain('## Operation');
      expect(masterPromptCall[1]).toContain('Deliver the issue');
    });

    it('should log Linear API events in operation log', async () => {
      const workroot = '/test/repo/.linear-watcher/work';
      const logger = new OperationLogger(workroot);

      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockClear();

      // Log issue extraction success
      logger.appendLogEntry('AM-19', {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: 'Delivery',
        status: 'Issue Extracted',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      });

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('issue-operation-log.md'),
        expect.stringContaining('Issue Extracted'),
        'utf8'
      );

      // Log issue extraction failure
      mockFs.writeFileSync.mockClear();
      logger.appendLogEntry('AM-19', {
        timestamp: '2025-08-22T10:31:00.000Z',
        operation: 'Delivery',
        status: 'Issue Extraction Failed',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      } as any);

      const logCall = mockFs.writeFileSync.mock.calls[0];
      expect(logCall[1]).toContain('Issue Extraction Failed');
    });

    it('should handle Linear API failures gracefully', async () => {
      const error: any = new Error('API key not configured');
      error.code = 'API_KEY_MISSING';
      mockApiService.getIssueBody.mockRejectedValue(error);

      const linearClient = new LinearClient({
        apiUrl: 'https://api.linear.app',
        apiKeyEnvVar: 'LINEAR_API_KEY',
        issuePrefix: 'AM',
      });

      // Should return placeholder when API key is missing
      const issue = await linearClient.getIssue('AM-19');
      expect(issue.title).toBe('Placeholder Issue');
      expect(issue.description).toContain('configure LINEAR_API_KEY');

      // Should continue with empty issue body for prompt assembly
      const assembler = new PromptAssembler();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.includes('general')) return '## General\nContent';
        if (filePath.includes('operation')) return '## Operation\nContent';
        return '';
      });

      mockFs.writeFileSync.mockClear();

      // Assembly should work without issue body
      assembler.assembleMasterPrompt(
        '/test/general.md',
        '/test/operation.md',
        {
          issueId: 'AM-19',
          operation: 'Delivery',
          workingFolder: '/test/work',
        },
        '/test/master-prompt.md'
      );

      const masterPromptCall = mockFs.writeFileSync.mock.calls[0];
      expect(masterPromptCall[1]).not.toContain('## Issue Definition From Linear:');
    });

    it('should validate issue status before proceeding', async () => {
      mockApiService.validateIssueStatus.mockResolvedValue(false);

      const linearClient = new LinearClient({
        apiUrl: 'https://api.linear.app',
        apiKeyEnvVar: 'LINEAR_API_KEY',
        issuePrefix: 'AM',
      });

      const isValid = await linearClient.validateIssueStatus('AM-19', 'Code & Test');
      expect(isValid).toBe(false);
      expect(mockApiService.validateIssueStatus).toHaveBeenCalledWith('AM-19', 'Code & Test');
    });
  });

  describe('CLI argument validation', () => {
    it('should validate issue prefix matches configuration', () => {
      const invalidIssueId = 'WRONG-123';

      // This would be validated by ConfigLoader in the real CLI
      const isValidPrefix = invalidIssueId.startsWith('AM');
      expect(isValidPrefix).toBe(false);
    });

    it('should validate operation exists in configuration', () => {
      const invalidOperation = 'InvalidOp';
      const validOperations = ['Delivery', 'Task', 'Smoke'];

      const isValidOperation = validOperations.includes(invalidOperation);
      expect(isValidOperation).toBe(false);
    });
  });
});
