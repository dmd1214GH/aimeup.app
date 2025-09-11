import * as fs from 'fs';
import { UploadValidator } from '../src/upload-validator';
import type { LinearClient } from '../src/linear-client';
import type { ValidationOptions } from '../src/upload-validator';
import type { Config } from '../src/types';

// Mock modules
jest.mock('fs');
jest.mock('../src/linear-client');

describe('UploadValidator', () => {
  const mockWorkingFolder = '/test/working/folder';
  let validator: UploadValidator;
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

    // Test removed - obsolete after OperationReportGenerator removal
    // This test was validating report generation logic that no longer exists

    describe('issue file validation', () => {
      it('should fail when original-issue.md is missing', async () => {
        (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
          return !path.includes('original-issue.md');
        });
        // Mock readdirSync to return empty array (no operation reports)
        (fs.readdirSync as jest.Mock).mockReturnValue([]);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('original-issue.md not found in working folder');
      });

      it('should fail when updated-issue.md is missing', async () => {
        (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
          return !path.includes('updated-issue.md');
        });
        // Mock readdirSync to return empty array (no operation reports)
        (fs.readdirSync as jest.Mock).mockReturnValue([]);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('updated-issue.md not found in working folder');
      });

      it('should fail when files are identical', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue('Same content');
        // Mock readdirSync to return empty array (no operation reports)
        (fs.readdirSync as jest.Mock).mockReturnValue([]);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'updated-issue.md is identical to original-issue.md - no changes made'
        );
      });
    });

    describe('operation report validation', () => {
      it('should fail when no operation reports exist', async () => {
        // Mock no operation reports
        (fs.readdirSync as jest.Mock).mockReturnValue(['updated-issue.md', 'original-issue.md']);

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('No operation-report-*.md files found in working folder');
      });

      // Test removed - obsolete after OperationReportGenerator removal
      // Report ordering is no longer relevant without the generator
    });

    describe('terminal status validation', () => {
      it('should fail when latest report has non-terminal status', async () => {
        // Mock in-progress operation report
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Progress-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Progress')) {
            return `# operation-report-Progress-001\noperationStatus: InProgress`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining('does not have terminal status')
        );
      });

      it('should fail for Failed status', async () => {
        // Mock failed operation report
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Error-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Error')) {
            return `# operation-report-Error-001\noperationStatus: Failed`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(false);
        expect(result.assets.hasTerminalStatus).toBe(false);
        expect(result.errors).toContainEqual(
          expect.stringContaining("Only 'Blocked' or 'Complete' statuses can be uploaded")
        );
      });

      it('should pass for Blocked status', async () => {
        // Mock blocked operation report
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Blocked-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Blocked')) {
            return `# operation-report-Blocked-001\noperationStatus: Blocked`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });

        const result = await validator.validate(validOptions);

        expect(result.assets.hasTerminalStatus).toBe(true);
        expect(result.assets.terminalStatus).toBe('Blocked');
      });

      // Test removed - obsolete after OperationReportGenerator removal
      // Parse failure scenario no longer applies with simplified validation
    });

    describe('Linear issue status validation', () => {
      it('should skip Linear check when client not provided', async () => {
        // Mock operation report for Linear status test
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Done-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Done')) {
            return `# operation-report-Done-001\noperationStatus: Complete`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });

        const result = await validator.validate(validOptions);

        expect(result.isValid).toBe(true);
        expect(mockLinearClient.getIssueStatus).not.toHaveBeenCalled();
      });

      it('should pass when Linear status matches expected', async () => {
        // Mock operation report for Linear status test
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Done-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Done')) {
            return `# operation-report-Done-001\noperationStatus: Complete`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });

        const optionsWithLinear = { ...validOptions, linearClient: mockLinearClient };
        const result = await validator.validate(optionsWithLinear);

        expect(result.isValid).toBe(true);
        expect(mockLinearClient.getIssueStatus).toHaveBeenCalledWith('AM-25');
      });

      it('should fail when Linear status does not match', async () => {
        // Mock operation report for Linear status test
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Done-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Done')) {
            return `# operation-report-Done-001\noperationStatus: Complete`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
        });
        mockLinearClient.getIssueStatus.mockResolvedValue('In Progress');

        const optionsWithLinear = { ...validOptions, linearClient: mockLinearClient };
        const result = await validator.validate(optionsWithLinear);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining('not in expected status'));
      });

      it('should warn but not fail on Linear API errors', async () => {
        // Mock operation report for Linear status test
        (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Done-001.md', 'updated-issue.md', 'original-issue.md']);
        (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
          if (path.includes('operation-report-Done')) {
            return `# operation-report-Done-001\noperationStatus: Complete`;
          }
          if (path.includes('original-issue.md')) {
            return 'Original content';
          }
          if (path.includes('updated-issue.md')) {
            return 'Updated content';
          }
          return '';
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

      // Note: Report generation has been removed, so this now returns empty string
      expect(filename).toBe('');
      // The old expectation for mockReportGenerator.generateReport has been removed
      // since we no longer generate operation reports
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

      // Note: Report generation has been removed, so we can't check the payload content anymore
      // The generatePrecheckFailureReport method now returns an empty string
    });
  });
});
