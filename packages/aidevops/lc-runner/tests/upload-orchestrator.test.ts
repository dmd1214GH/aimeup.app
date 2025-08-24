import * as fs from 'fs';
import { UploadOrchestrator } from '../src/upload-orchestrator';
import { UploadValidator } from '../src/upload-validator';
import { OperationReportGenerator } from '../src/operation-report-generator';
import { OperationLogger } from '../src/operation-logger';
import { LinearClient } from '../src/linear-client';
import type { UploadOptions } from '../src/upload-orchestrator';
import type { Config } from '../src/types';

// Mock modules
jest.mock('fs');
jest.mock('../src/upload-validator');
jest.mock('../src/operation-report-generator');
jest.mock('../src/operation-logger');

describe('UploadOrchestrator', () => {
  const mockWorkroot = '/work/root';
  const mockWorkingFolder = '/work/folder';
  let orchestrator: UploadOrchestrator;
  let mockValidator: jest.Mocked<UploadValidator>;
  let mockReportGenerator: jest.Mocked<OperationReportGenerator>;
  let mockOperationLogger: jest.Mocked<OperationLogger>;
  let mockLinearClient: jest.Mocked<LinearClient>;

  const mockConfig: Config = {
    version: 1,
    workroot: '/work/root',
    generalPrompt: 'general-prompt.md',
    linear: {
      apiUrl: 'https://api.linear.app/graphql',
      apiKeyEnvVar: 'LINEAR_API_KEY',
      issuePrefix: 'AM',
    },
    'lc-runner-operations': {
      Deliver: {
        operationName: 'Deliver',
        linearIssueStatus: 'Delivery-ai',
        promptFile: 'delivery-prompt.md',
        transitions: {
          success: 'Delivery-review',
          blocked: 'Blocked',
        },
        linearIssueStatusSuccess: 'Delivery-review',
        linearIssueStatusBlocked: 'Blocked',
      },
    },
    operations: {
      Deliver: {
        operationName: 'Deliver',
        linearIssueStatus: 'Delivery-ai',
        promptFile: 'delivery-prompt.md',
        transitions: {
          success: 'Delivery-review',
          blocked: 'Blocked',
        },
        linearIssueStatusSuccess: 'Delivery-review',
        linearIssueStatusBlocked: 'Blocked',
      },
    },
  };

  const mockOptions: UploadOptions = {
    issueId: 'AM-25',
    operation: 'Deliver',
    workingFolder: mockWorkingFolder,
    config: mockConfig,
    linearClient: {} as LinearClient,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Setup mock validator
    mockValidator = {
      validate: jest.fn(),
      generatePrecheckFailureReport: jest
        .fn()
        .mockReturnValue('operation-report-UploadPrecheck-001.md'),
    } as any;
    (UploadValidator as jest.MockedClass<typeof UploadValidator>).mockImplementation(
      () => mockValidator
    );

    // Setup mock report generator
    mockReportGenerator = {
      generateReport: jest.fn().mockReturnValue('operation-report-UploadFailure-001.md'),
      getAllReports: jest.fn(),
      readReport: jest.fn(),
      getLatestReportStatus: jest.fn(),
    } as any;
    (
      OperationReportGenerator as jest.MockedClass<typeof OperationReportGenerator>
    ).mockImplementation(() => mockReportGenerator);

    // Setup mock operation logger
    mockOperationLogger = {
      appendLogEntry: jest.fn(),
    } as any;
    (OperationLogger as jest.MockedClass<typeof OperationLogger>).mockImplementation(
      () => mockOperationLogger
    );

    // Setup mock Linear client
    mockLinearClient = {
      addComment: jest.fn().mockResolvedValue(undefined),
      updateIssueBody: jest.fn().mockResolvedValue(undefined),
      updateIssueStatus: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Setup fs mocks
    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('operation-report')) {
        return '## Operation Report\nTest content';
      }
      if (path.includes('updated-issue.md')) {
        return '# Updated Issue\nNew content';
      }
      return 'Mock file content';
    });

    mockOptions.linearClient = mockLinearClient;
    orchestrator = new UploadOrchestrator(mockWorkroot, mockWorkingFolder);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('successful upload flow', () => {
    beforeEach(() => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Start-001.md', 'operation-report-Finished-002.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Complete',
        },
      });
    });

    it('should complete full upload successfully', async () => {
      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.uploadedAssets.comments).toEqual([
        'operation-report-Start-001.md',
        'operation-report-Finished-002.md',
      ]);
      expect(result.uploadedAssets.issueBody).toBe(true);
      expect(result.uploadedAssets.statusUpdate).toBe(true);
    });

    it('should upload operation reports as comments', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.addComment).toHaveBeenCalledTimes(2);
      expect(mockLinearClient.addComment).toHaveBeenCalledWith(
        'AM-25',
        '## Operation Report\nTest content'
      );
    });

    it('should update issue body', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.updateIssueBody).toHaveBeenCalledWith(
        'AM-25',
        '# Updated Issue\nNew content'
      );
    });

    it('should update issue status to success', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.updateIssueStatus).toHaveBeenCalledWith('AM-25', 'Delivery-review');
    });

    it('should update issue status to blocked for Blocked result', async () => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Blocked-001.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Blocked',
        },
      });

      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.updateIssueStatus).toHaveBeenCalledWith('AM-25', 'Blocked');
    });

    it('should log upload start and completion', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockOperationLogger.appendLogEntry).toHaveBeenCalledTimes(2);
      expect(mockOperationLogger.appendLogEntry).toHaveBeenCalledWith(
        'AM-25',
        expect.objectContaining({
          operation: 'Deliver - Upload Start',
          status: 'Starting upload to Linear',
        })
      );
      expect(mockOperationLogger.appendLogEntry).toHaveBeenCalledWith(
        'AM-25',
        expect.objectContaining({
          operation: 'Deliver - Upload Complete',
          status: 'Success',
        })
      );
    });
  });

  describe('validation failure handling', () => {
    beforeEach(() => {
      mockValidator.validate.mockResolvedValue({
        isValid: false,
        errors: ['updated-issue.md is identical to original-issue.md', 'No terminal status found'],
        assets: {
          updatedIssue: false,
          operationReports: [],
          hasTerminalStatus: false,
        },
      });
    });

    it('should handle validation failure', async () => {
      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('updated-issue.md is identical to original-issue.md');
      expect(result.failureReportFilename).toBe('operation-report-UploadPrecheck-001.md');
    });

    it('should upload precheck failure report', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockValidator.generatePrecheckFailureReport).toHaveBeenCalled();
      expect(mockLinearClient.addComment).toHaveBeenCalledWith(
        'AM-25',
        expect.stringContaining('Operation Report')
      );
    });

    it('should update status to blocked on validation failure', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.updateIssueStatus).toHaveBeenCalledWith('AM-25', 'Blocked');
    });
  });

  describe('partial upload failure handling', () => {
    beforeEach(() => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Start-001.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Complete',
        },
      });
    });

    it('should continue on comment upload failure', async () => {
      mockLinearClient.addComment.mockRejectedValueOnce(new Error('API error'));

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(true);
      expect(result.uploadedAssets.comments).toEqual([]);
      expect(result.uploadedAssets.issueBody).toBe(true);
    });

    it('should handle issue body update failure', async () => {
      mockLinearClient.updateIssueBody.mockRejectedValue(new Error('Update failed'));

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(true);
      expect(result.uploadedAssets.issueBody).toBe(false);
      expect(result.uploadedAssets.statusUpdate).toBe(true);
    });

    it('should handle status update failure', async () => {
      mockLinearClient.updateIssueStatus.mockRejectedValue(new Error('Status update failed'));

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(true);
      expect(result.uploadedAssets.statusUpdate).toBe(false);
    });
  });

  describe('complete upload failure', () => {
    it('should handle unexpected errors', async () => {
      mockValidator.validate.mockRejectedValue(new Error('Unexpected error'));

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unexpected error');
      expect(mockReportGenerator.generateReport).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UploadFailure',
          operationStatus: 'Failed',
        })
      );
    });

    it('should upload failure report on error', async () => {
      mockValidator.validate.mockRejectedValue(new Error('Unexpected error'));

      await orchestrator.upload(mockOptions);

      expect(mockLinearClient.addComment).toHaveBeenCalledWith(
        'AM-25',
        expect.stringContaining('Operation Report')
      );
      expect(mockLinearClient.updateIssueStatus).toHaveBeenCalledWith('AM-25', 'Blocked');
    });
  });

  describe('missing configuration handling', () => {
    it('should handle missing operation config', async () => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Done-001.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Complete',
        },
      });

      const optionsWithBadOp = {
        ...mockOptions,
        operation: 'UnknownOp',
      };

      const result = await orchestrator.upload(optionsWithBadOp);

      expect(result.success).toBe(true);
      expect(result.uploadedAssets.statusUpdate).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No status mapping found'));
    });

    it('should handle missing target status', async () => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Done-001.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Complete',
        },
      });

      const configWithoutSuccess = {
        ...mockConfig,
        operations: {
          Deliver: {
            operationName: 'Deliver',
            linearIssueStatus: 'Delivery-ai',
            promptFile: 'delivery-prompt.md',
            transitions: {
              success: '', // Empty success transition
              blocked: 'Blocked',
            },
            linearIssueStatusBlocked: 'Blocked',
            // Missing linearIssueStatusSuccess
          },
        },
      };

      const optionsWithBadConfig = {
        ...mockOptions,
        config: configWithoutSuccess as Config,
      };

      const result = await orchestrator.upload(optionsWithBadConfig);

      expect(result.success).toBe(true);
      expect(result.uploadedAssets.statusUpdate).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('No target status configured')
      );
    });
  });
});
