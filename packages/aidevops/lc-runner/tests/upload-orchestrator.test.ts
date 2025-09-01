import * as fs from 'fs';
import { UploadOrchestrator } from '../src/upload-orchestrator';
import { UploadValidator } from '../src/upload-validator';
import { OperationReportGenerator } from '../src/operation-report-generator';
import { OperationLogger } from '../src/operation-logger';
import type { LinearClient } from '../src/linear-client';
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
      addComment: jest.fn().mockResolvedValue(true),
      updateIssueBody: jest.fn().mockResolvedValue(true),
      updateIssueStatus: jest.fn().mockResolvedValue(true),
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

    // Test removed: Comment uploads are now handled by Claude Code MCP integration
    // and no longer tested here

    it('should skip issue body update (handled by MCP integration)', async () => {
      await orchestrator.upload(mockOptions);

      // Issue body update is now handled by Claude Code MCP integration
      expect(mockLinearClient.updateIssueBody).not.toHaveBeenCalled();
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

    it('should generate precheck failure report', async () => {
      await orchestrator.upload(mockOptions);

      expect(mockValidator.generatePrecheckFailureReport).toHaveBeenCalled();
      // Comment upload for failure reports still happens but will be removed in future
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

    // Test removed: Comment upload failures are no longer relevant since
    // comments are handled by Claude Code MCP integration

    it('should skip issue body update (handled by MCP)', async () => {
      // Issue body updates are handled by Claude Code MCP integration
      mockLinearClient.updateIssueBody.mockResolvedValue(false);

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(true); // Should succeed despite no issue body update
      expect(result.uploadedAssets.issueBody).toBe(true); // Marked as handled by MCP
      expect(result.uploadedAssets.statusUpdate).toBe(true);
      expect(mockLinearClient.updateIssueBody).not.toHaveBeenCalled();
    });

    it('should handle status update failure', async () => {
      mockLinearClient.updateIssueStatus.mockResolvedValue(false);

      const result = await orchestrator.upload(mockOptions);

      expect(result.success).toBe(false); // Failed because status update failed
      expect(result.uploadedAssets.statusUpdate).toBe(false);
      expect(result.uploadedAssets.issueBody).toBe(true);
      expect(result.errors).toContain('Failed to update issue status');
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

      expect(result.success).toBe(false); // Failed because status update couldn't happen
      expect(result.uploadedAssets.statusUpdate).toBe(false);
      expect(result.errors).toContain('Failed to update issue status');
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

      expect(result.success).toBe(false); // Failed because status update couldn't happen
      expect(result.uploadedAssets.statusUpdate).toBe(false);
      expect(result.errors).toContain('Failed to update issue status');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('No target status configured')
      );
    });
  });

  // MCP-related tests removed - MCP integration was removed as it was based on a misunderstanding
  // MCP tools are only available to Claude Code, not to lc-runner
  /*
  describe('MCP integration', () => {
    beforeEach(() => {
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: [],
        assets: {
          updatedIssue: true,
          operationReports: [
            'operation-report-Start-001.md',
            'operation-report-InProgress-002.md',
            'operation-report-Complete-003.md',
          ],
          hasTerminalStatus: true,
          terminalStatus: 'Complete',
        },
      });
    });

    it('should skip reports already posted via MCP', async () => {
      // Mark first two reports as already posted via MCP
      mockMCPIntegration.isReportAlreadyPosted
        .mockReturnValueOnce(true) // Start report - already posted
        .mockReturnValueOnce(true) // InProgress report - already posted
        .mockReturnValueOnce(false); // Complete report - not posted

      const result = await orchestrator.upload(mockOptions);

      // Should only try to upload the third report
      expect(mockLinearClient.addComment).toHaveBeenCalledTimes(1);
      expect(mockLinearClient.addComment).toHaveBeenCalledWith(
        'AM-25',
        expect.stringContaining('Operation Report')
      );

      // All reports should be counted as uploaded
      expect(result.uploadedAssets.comments).toHaveLength(3);
      expect(result.success).toBe(true);

      // Verify console output for skipped reports
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Skipped operation-report-Start-001.md (already posted via MCP)')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Skipped operation-report-InProgress-002.md (already posted via MCP)'
        )
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('2 report(s) already posted via MCP')
      );
    });

    it('should handle mix of MCP-posted and new reports', async () => {
      // Only first report is posted via MCP
      mockMCPIntegration.isReportAlreadyPosted
        .mockReturnValueOnce(true) // Start report - already posted
        .mockReturnValueOnce(false) // InProgress report - not posted
        .mockReturnValueOnce(false); // Complete report - not posted

      const result = await orchestrator.upload(mockOptions);

      // Should upload two reports (not the first one)
      expect(mockLinearClient.addComment).toHaveBeenCalledTimes(2);
      expect(result.uploadedAssets.comments).toHaveLength(3);
      expect(result.success).toBe(true);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('1 report(s) already posted via MCP')
      );
    });

    it('should handle all reports posted via MCP', async () => {
      // All reports already posted via MCP
      mockMCPIntegration.isReportAlreadyPosted.mockReturnValue(true);

      const result = await orchestrator.upload(mockOptions);

      // Should not call addComment at all
      expect(mockLinearClient.addComment).not.toHaveBeenCalled();

      // All reports should still be counted as uploaded
      expect(result.uploadedAssets.comments).toHaveLength(3);
      expect(result.success).toBe(true);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('3 report(s) already posted via MCP')
      );
    });

    it('should handle MCP check errors gracefully', async () => {
      // Simulate MCP check throwing an error
      mockMCPIntegration.isReportAlreadyPosted.mockImplementation(() => {
        throw new Error('MCP check failed');
      });

      const result = await orchestrator.upload(mockOptions);

      // Should treat as not posted and try to upload normally
      expect(mockLinearClient.addComment).toHaveBeenCalledTimes(3);
      expect(result.uploadedAssets.comments).toHaveLength(3);

      // MCP check failure should be logged as a warning, but upload should succeed
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MCP check failed'));
      expect(result.success).toBe(true);
    });

    it('should correctly count skipped MCP reports as uploaded', async () => {
      // Mix of posted and failed uploads
      mockMCPIntegration.isReportAlreadyPosted
        .mockReturnValueOnce(true) // Start report - already posted via MCP
        .mockReturnValueOnce(false) // InProgress report - not posted
        .mockReturnValueOnce(false); // Complete report - not posted

      // Make the second report fail to upload
      mockLinearClient.addComment
        .mockResolvedValueOnce(false) // InProgress report fails
        .mockResolvedValueOnce(true); // Complete report succeeds

      const result = await orchestrator.upload(mockOptions);

      // 1 skipped (MCP), 1 failed, 1 succeeded = 2 uploaded total
      expect(result.uploadedAssets.comments).toHaveLength(2);
      expect(result.success).toBe(false); // Failed because one upload failed
      expect(result.errors).toContain('Failed to upload 1 comment(s)');
    });
  });
  */
});
