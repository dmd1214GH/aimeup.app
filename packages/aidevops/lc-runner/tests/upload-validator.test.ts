import * as fs from 'fs';
import { UploadValidator } from '../src/upload-validator';
import { OperationReportGenerator } from '../src/operation-report-generator';
import { LinearClient } from '../src/linear-client';
import type { ValidationOptions } from '../src/upload-validator';
import type { Config } from '../src/types';

// Mock modules
jest.mock('fs');
jest.mock('../src/operation-report-generator');
jest.mock('../src/linear-client');

describe('UploadValidator', () => {
  const mockWorkingFolder = '/test/working/folder';
  let validator: UploadValidator;
  let mockReportGenerator: jest.Mocked<OperationReportGenerator>;
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

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock OperationReportGenerator
    mockReportGenerator = {
      generateReport: jest.fn().mockReturnValue('operation-report-UploadPrecheck-001.md'),
      getAllReports: jest.fn().mockReturnValue([]),
      readReport: jest.fn(),
      getLatestReportStatus: jest.fn(),
    } as any;

    (
      OperationReportGenerator as jest.MockedClass<typeof OperationReportGenerator>
    ).mockImplementation(() => mockReportGenerator);

    // Setup mock LinearClient
    mockLinearClient = {
      getIssueStatus: jest.fn().mockResolvedValue('Delivery-ai'),
    } as any;

    // Setup default fs mocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('original-issue.md')) {
        return 'Original content';
      }
      if (path.includes('updated-issue.md')) {
        return 'Updated content';
      }
      return '';
    });

    validator = new UploadValidator(mockWorkingFolder);
  });

  describe('validate', () => {
    const validOptions: ValidationOptions = {
      issueId: 'AM-25',
      operation: 'Deliver',
      workingFolder: mockWorkingFolder,
      config: mockConfig,
    };

    it('should pass all validations when everything is correct', async () => {
      mockReportGenerator.getAllReports.mockReturnValue([
        'operation-report-Start-001.md',
        'operation-report-Finished-002.md',
      ]);
      mockReportGenerator.readReport.mockReturnValue({
        issueId: 'AM-25',
        operation: 'Deliver',
        action: 'Finished',
        workingFolder: mockWorkingFolder,
        operationStatus: 'Complete',
        summary: 'Completed successfully',
      });

      const result = await validator.validate(validOptions);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.assets.updatedIssue).toBe(true);
      expect(result.assets.operationReports).toHaveLength(2);
      expect(result.assets.hasTerminalStatus).toBe(true);
      expect(result.assets.terminalStatus).toBe('Complete');
    });

    describe('issue file validation', () => {
      it('should fail when original-issue.md is missing', async () => {
        (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
          return !path.includes('original-issue.md');
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('original-issue.md not found in working folder');
      });

      it('should fail when updated-issue.md is missing', async () => {
        (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
          return !path.includes('updated-issue.md');
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('updated-issue.md not found in working folder');
      });

      it('should fail when files are identical', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue('Same content');

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'updated-issue.md is identical to original-issue.md - no changes made'
        );
      });
    });

    describe('operation report validation', () => {
      it('should fail when no operation reports exist', async () => {
        mockReportGenerator.getAllReports.mockReturnValue([]);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('No operation-report-*.md files found in working folder');
      });

      it('should include all found reports in assets', async () => {
        const reports = ['operation-report-Start-001.md', 'operation-report-Progress-002.md'];
        mockReportGenerator.getAllReports.mockReturnValue(reports);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Progress',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Complete',
          summary: 'Done',
        });

        const result = await validator.validate(validOptions);

        expect(result.assets.operationReports).toEqual(reports);
      });
    });

    describe('terminal status validation', () => {
      it('should fail when latest report has non-terminal status', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Progress-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Progress',
          workingFolder: mockWorkingFolder,
          operationStatus: 'InProgress',
          summary: 'Still working',
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining('does not have terminal status')
        );
      });

      it('should fail for Failed status', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Error-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Error',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Failed',
          summary: 'Operation failed',
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.assets.hasTerminalStatus).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining("Only 'Blocked' or 'Complete' statuses can be uploaded")
        );
      });

      it('should pass for Blocked status', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Blocked-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Blocked',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Blocked',
          summary: 'Blocked by dependency',
        });

        const result = await validator.validate(validOptions);

        expect(result.assets.hasTerminalStatus).toBe(true);
        expect(result.assets.terminalStatus).toBe('Blocked');
      });

      it('should fail when latest report cannot be parsed', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Bad-001.md']);
        mockReportGenerator.readReport.mockReturnValue(null);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining('Failed to parse latest operation report')
        );
      });
    });

    describe('Linear issue status validation', () => {
      it('should skip Linear check when client not provided', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Done-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Done',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Complete',
          summary: 'Done',
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(true);
        expect(mockLinearClient.getIssueStatus).not.toHaveBeenCalled();
      });

      it('should pass when Linear status matches expected', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Done-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Done',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Complete',
          summary: 'Done',
        });

        const optionsWithLinear = { ...validOptions, linearClient: mockLinearClient };
        const result = await validator.validate(optionsWithLinear);

        expect(result.isValid).toBe(true);
        expect(mockLinearClient.getIssueStatus).toHaveBeenCalledWith('AM-25');
      });

      it('should fail when Linear status does not match', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Done-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Done',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Complete',
          summary: 'Done',
        });
        mockLinearClient.getIssueStatus.mockResolvedValue('In Progress');

        const optionsWithLinear = { ...validOptions, linearClient: mockLinearClient };
        const result = await validator.validate(optionsWithLinear);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining('not in expected status'));
      });

      it('should warn but not fail on Linear API errors', async () => {
        mockReportGenerator.getAllReports.mockReturnValue(['operation-report-Done-001.md']);
        mockReportGenerator.readReport.mockReturnValue({
          issueId: 'AM-25',
          operation: 'Deliver',
          action: 'Done',
          workingFolder: mockWorkingFolder,
          operationStatus: 'Complete',
          summary: 'Done',
        });
        mockLinearClient.getIssueStatus.mockRejectedValue(new Error('API Error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const optionsWithLinear = { ...validOptions, linearClient: mockLinearClient };
        const result = await validator.validate(optionsWithLinear);

        expect(result.isValid).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Could not verify Linear issue status')
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe('generatePrecheckFailureReport', () => {
    it('should generate failure report with all validation errors', () => {
      const options: ValidationOptions = {
        issueId: 'AM-25',
        operation: 'Deliver',
        workingFolder: mockWorkingFolder,
        config: mockConfig,
      };

      const validationResult = {
        isValid: false,
        errors: [
          'updated-issue.md is identical to original-issue.md',
          'No operation reports found',
        ],
        assets: {
          updatedIssue: false,
          operationReports: [],
          hasTerminalStatus: false,
        },
      };

      const filename = validator.generatePrecheckFailureReport(options, validationResult);

      expect(filename).toBe('operation-report-UploadPrecheck-001.md');
      expect(mockReportGenerator.generateReport).toHaveBeenCalledWith({
        issueId: 'AM-25',
        operation: 'Deliver',
        action: 'UploadPrecheck',
        workingFolder: mockWorkingFolder,
        operationStatus: 'Failed',
        summary: 'Pre-upload validation failed',
        payload: expect.stringContaining('### Precheck Failures'),
      });
    });

    it('should include asset status in payload', () => {
      const options: ValidationOptions = {
        issueId: 'AM-25',
        operation: 'Deliver',
        workingFolder: mockWorkingFolder,
        config: mockConfig,
      };

      const validationResult = {
        isValid: false,
        errors: ['Some error'],
        assets: {
          updatedIssue: true,
          operationReports: ['operation-report-Start-001.md'],
          hasTerminalStatus: true,
          terminalStatus: 'Complete' as const,
        },
      };

      validator.generatePrecheckFailureReport(options, validationResult);

      const callArgs = mockReportGenerator.generateReport.mock.calls[0][0];
      expect(callArgs.payload).toContain('✅ updated-issue.md (ready for upload)');
      expect(callArgs.payload).toContain('✅ 1 operation report(s) found');
      expect(callArgs.payload).toContain('✅ Terminal status: Complete');
    });
  });
});
