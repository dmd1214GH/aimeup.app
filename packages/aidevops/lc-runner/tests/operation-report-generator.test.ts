import * as fs from 'fs';
import * as path from 'path';
import { OperationReportGenerator } from '../src/operation-report-generator';
import type { OperationReportData } from '../src/operation-report-generator';

// Mock fs module
jest.mock('fs');

describe('OperationReportGenerator', () => {
  const mockWorkingFolder = '/test/working/folder';
  let generator: OperationReportGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    generator = new OperationReportGenerator(mockWorkingFolder);

    // Setup default mocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  describe('generateReport', () => {
    const validReportData: OperationReportData = {
      issueId: 'AM-25',
      operation: 'Deliver',
      action: 'Start',
      workingFolder: mockWorkingFolder,
      operationStatus: 'InProgress',
      summary: 'Starting delivery operation',
    };

    it('should generate a report with correct filename', () => {
      const filename = generator.generateReport(validReportData);

      expect(filename).toBe('operation-report-Start-001.md');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockWorkingFolder, 'operation-report-Start-001.md'),
        expect.any(String),
        'utf8'
      );
    });

    it('should increment sequence number for multiple reports', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'operation-report-Start-001.md',
        'operation-report-Precheck-002.md',
      ]);

      const filename = generator.generateReport(validReportData);

      expect(filename).toBe('operation-report-Start-003.md');
    });

    it('should handle special characters in action name', () => {
      const data = { ...validReportData, action: 'Upload/Precheck' };

      const filename = generator.generateReport(data);

      expect(filename).toBe('operation-report-UploadPrecheck-001.md');
    });

    it('should format report content correctly', () => {
      generator.generateReport(validReportData);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      expect(content).toContain('## operation-report-json');
      expect(content).toContain('```json');
      expect(content).toContain('"issueId": "AM-25"');
      expect(content).toContain('"operation": "Deliver"');
      expect(content).toContain('"action": "Start"');
      expect(content).toContain('"operationStatus": "InProgress"');
      expect(content).toContain('## Operation Report Payload');
    });

    it('should add timestamp if not provided', () => {
      generator.generateReport(validReportData);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      expect(content).toMatch(/"timestamp": "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}"/);
    });

    it('should use provided timestamp', () => {
      const data = {
        ...validReportData,
        timestamp: '2025-08-24T10:30:00-10:00',
      };

      generator.generateReport(data);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      expect(content).toContain('"timestamp": "2025-08-24T10:30:00-10:00"');
    });

    it('should include custom payload if provided', () => {
      const data = {
        ...validReportData,
        payload: '### Custom Details\n- Item 1\n- Item 2',
      };

      generator.generateReport(data);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      expect(content).toContain('### Custom Details');
      expect(content).toContain('- Item 1');
      expect(content).toContain('- Item 2');
    });

    it('should validate required fields', () => {
      const invalidData = { ...validReportData };
      delete (invalidData as any).issueId;

      expect(() => generator.generateReport(invalidData)).toThrow(
        'Missing required field: issueId'
      );
    });

    it('should validate operationStatus values', () => {
      const invalidData = {
        ...validReportData,
        operationStatus: 'InvalidStatus' as any,
      };

      expect(() => generator.generateReport(invalidData)).toThrow(
        'Invalid operationStatus: InvalidStatus'
      );
    });
  });

  describe('getAllReports', () => {
    it('should return empty array when folder does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const reports = generator.getAllReports();

      expect(reports).toEqual([]);
    });

    it('should return sorted operation report files', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'operation-report-Start-002.md',
        'other-file.txt',
        'operation-report-Start-001.md',
        'operation-report-Finished-003.md',
      ]);

      const reports = generator.getAllReports();

      expect(reports).toEqual([
        'operation-report-Start-001.md',
        'operation-report-Start-002.md',
        'operation-report-Finished-003.md',
      ]);
    });
  });

  describe('readReport', () => {
    it('should read and parse report successfully', () => {
      const reportContent = `## operation-report-json
\`\`\`json
{
  "issueId": "AM-25",
  "operation": "Deliver",
  "action": "Start",
  "workingFolder": "/test/folder",
  "operationStatus": "InProgress",
  "timestamp": "2025-08-24T10:00:00-10:00",
  "summary": "Test summary"
}
\`\`\`

## Operation Report Payload
### Test Payload
- Item 1`;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(reportContent);

      const data = generator.readReport('operation-report-Start-001.md');

      expect(data).toEqual({
        issueId: 'AM-25',
        operation: 'Deliver',
        action: 'Start',
        workingFolder: '/test/folder',
        operationStatus: 'InProgress',
        timestamp: '2025-08-24T10:00:00-10:00',
        summary: 'Test summary',
        payload: '### Test Payload\n- Item 1',
      });
    });

    it('should return null for non-existent file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const data = generator.readReport('non-existent.md');

      expect(data).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('Invalid content');

      const data = generator.readReport('invalid.md');

      expect(data).toBeNull();
    });
  });

  describe('getLatestReportStatus', () => {
    it('should return status from latest report', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'operation-report-Start-001.md',
        'operation-report-Finished-002.md',
      ]);

      const reportContent = `## operation-report-json
\`\`\`json
{
  "issueId": "AM-25",
  "operation": "Deliver",
  "action": "Finished",
  "workingFolder": "/test",
  "operationStatus": "Complete",
  "timestamp": "2025-08-24T10:00:00-10:00",
  "summary": "Operation completed"
}
\`\`\``;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(reportContent);

      const status = generator.getLatestReportStatus();

      expect(status).toBe('Complete');
    });

    it('should return null when no reports exist', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      const status = generator.getLatestReportStatus();

      expect(status).toBeNull();
    });

    it('should return null when latest report cannot be parsed', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['operation-report-Start-001.md']);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('Invalid content');

      const status = generator.getLatestReportStatus();

      expect(status).toBeNull();
    });
  });

  describe('timestamp generation', () => {
    it('should generate timestamp with correct format', () => {
      // Mock Date to control timezone
      const mockDate = new Date('2025-08-24T20:30:45.000Z');
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;

      const data: OperationReportData = {
        issueId: 'AM-25',
        operation: 'Test',
        action: 'Test',
        workingFolder: '/test',
        operationStatus: 'InProgress',
        summary: 'Test',
      };

      generator.generateReport(data);

      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const content = writeCall[1];

      // The timestamp should be in the format with timezone offset
      expect(content).toMatch(/"timestamp": "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}"/);

      // Restore original Date
      global.Date = originalDate;
    });
  });
});
