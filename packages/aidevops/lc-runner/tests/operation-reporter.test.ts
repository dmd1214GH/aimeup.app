import * as fs from 'fs';
import { OperationReporter } from '../src/operation-reporter';
import type { OperationReport } from '../src/operation-reporter';

// Mock fs module
jest.mock('fs');

describe('OperationReporter', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const workingFolder = '/test/working/folder';
  let reporter: OperationReporter;

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new OperationReporter(workingFolder);

    // Mock Date for consistent timestamps
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-22T10:30:45.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createInitialReport', () => {
    it('should create initial report with Inprog status', () => {
      mockFs.writeFileSync.mockImplementation(() => undefined);

      reporter.createInitialReport('AM-19', 'Delivery', 'lcr-AM-19/op-Delivery-123');

      const expectedReport: OperationReport = {
        issueId: 'AM-19',
        operation: 'Delivery',
        workingFolder: 'lcr-AM-19/op-Delivery-123',
        operationStatus: 'Inprog',
        'start-timestamp': '2025-08-22T10:30:45.000Z',
        'end-timestamp': null,
        summary: 'Operation in progress',
        outputs: {},
      };

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/working/folder/operation-report.json',
        JSON.stringify(expectedReport, null, 2),
        'utf8'
      );
    });

    it('should handle write errors', () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        reporter.createInitialReport('AM-19', 'Delivery', 'lcr-AM-19/op-Delivery-123');
      }).toThrow('Failed to save operation report: Permission denied');
    });
  });

  describe('updateReport', () => {
    it('should update existing report with Completed status', () => {
      const existingReport: OperationReport = {
        issueId: 'AM-19',
        operation: 'Delivery',
        workingFolder: 'lcr-AM-19/op-Delivery-123',
        operationStatus: 'Inprog',
        'start-timestamp': '2025-08-22T10:00:00.000Z',
        'end-timestamp': null,
        summary: 'Operation in progress',
        outputs: {},
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingReport));
      mockFs.writeFileSync.mockImplementation(() => undefined);

      const outputs = {
        updatedIssue: 'updated-issue.md',
        commentFiles: ['comment-001.md'],
        contextDump: 'context-dump.md',
      };

      reporter.updateReport('Completed', 'Successfully completed all tasks', outputs);

      const expectedReport: OperationReport = {
        ...existingReport,
        operationStatus: 'Completed',
        'end-timestamp': '2025-08-22T10:30:45.000Z',
        summary: 'Successfully completed all tasks',
        outputs,
      };

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/working/folder/operation-report.json',
        JSON.stringify(expectedReport, null, 2),
        'utf8'
      );
    });

    it('should update report with Blocked status', () => {
      const existingReport: OperationReport = {
        issueId: 'AM-19',
        operation: 'Delivery',
        workingFolder: 'lcr-AM-19/op-Delivery-123',
        operationStatus: 'Inprog',
        'start-timestamp': '2025-08-22T10:00:00.000Z',
        'end-timestamp': null,
        summary: 'Operation in progress',
        outputs: { updatedIssue: 'updated-issue.md' },
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingReport));
      mockFs.writeFileSync.mockImplementation(() => undefined);

      reporter.updateReport('Blocked', 'Missing required dependencies');

      const capturedContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      const savedReport = JSON.parse(capturedContent) as OperationReport;

      expect(savedReport.operationStatus).toBe('Blocked');
      expect(savedReport.summary).toBe('Missing required dependencies');
      expect(savedReport['end-timestamp']).toBe('2025-08-22T10:30:45.000Z');
      expect(savedReport.outputs).toEqual({ updatedIssue: 'updated-issue.md' });
    });

    it('should throw error if no existing report found', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        reporter.updateReport('Completed', 'Done');
      }).toThrow('Cannot update report: No existing report found');
    });
  });

  describe('loadReport', () => {
    it('should load existing report', () => {
      const report: OperationReport = {
        issueId: 'AM-19',
        operation: 'Delivery',
        workingFolder: 'lcr-AM-19/op-Delivery-123',
        operationStatus: 'Inprog',
        'start-timestamp': '2025-08-22T10:00:00.000Z',
        'end-timestamp': null,
        summary: 'In progress',
        outputs: {},
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(report));

      const loadedReport = reporter.loadReport();

      expect(loadedReport).toEqual(report);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/test/working/folder/operation-report.json',
        'utf8'
      );
    });

    it('should return null if report does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = reporter.loadReport();

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      expect(() => {
        reporter.loadReport();
      }).toThrow('Failed to load operation report');
    });
  });

  describe('reportExists', () => {
    it('should return true when report exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const exists = reporter.reportExists();

      expect(exists).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/working/folder/operation-report.json');
    });

    it('should return false when report does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const exists = reporter.reportExists();

      expect(exists).toBe(false);
    });
  });

  describe('getReportPath', () => {
    it('should return the correct report path', () => {
      const path = reporter.getReportPath();
      expect(path).toBe('/test/working/folder/operation-report.json');
    });
  });
});
