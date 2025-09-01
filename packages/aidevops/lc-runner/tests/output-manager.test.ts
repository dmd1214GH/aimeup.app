import { OutputManager } from '../src/output-manager';
import type { ParsedClaudeOutput } from '../src/claude-output-parser';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('OutputManager', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const workingFolder = '/test/working/folder';
  let outputManager: OutputManager;

  beforeEach(() => {
    jest.clearAllMocks();
    outputManager = new OutputManager(workingFolder);
    mockFs.readdirSync.mockReturnValue([] as any);
  });

  describe('writeOutputFiles', () => {
    it('should write updated issue content', () => {
      const parsedOutput: ParsedClaudeOutput = {
        status: 'Completed',
        updatedIssueContent: 'Updated issue content',
        comments: [],
        blockingQuestions: [],
      };

      const references = outputManager.writeOutputFiles(parsedOutput);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'updated-issue.md'),
        'Updated issue content',
        'utf8'
      );
      expect(references.updatedIssue).toBe('updated-issue.md');
    });

    it('should write numbered comment files', () => {
      const parsedOutput: ParsedClaudeOutput = {
        status: 'Completed',
        comments: ['Comment 1', 'Comment 2', 'Comment 3'],
        blockingQuestions: [],
      };

      const references = outputManager.writeOutputFiles(parsedOutput);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'comment-001.md'),
        'Comment 1',
        'utf8'
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'comment-002.md'),
        'Comment 2',
        'utf8'
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'comment-003.md'),
        'Comment 3',
        'utf8'
      );
      expect(references.comments).toEqual(['comment-001.md', 'comment-002.md', 'comment-003.md']);
    });

    it('should write context dump', () => {
      const parsedOutput: ParsedClaudeOutput = {
        status: 'Completed',
        contextDump: 'Context dump content',
        comments: [],
        blockingQuestions: [],
      };

      const references = outputManager.writeOutputFiles(parsedOutput);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'context-dump.md'),
        'Context dump content',
        'utf8'
      );
      expect(references.contextDump).toBe('context-dump.md');
    });

    it('should write operation report', () => {
      const parsedOutput: ParsedClaudeOutput = {
        status: 'Completed',
        operationReport: {
          issueId: 'AM-21',
          operation: 'Task',
          action: 'Finished',
          workingFolder: '/path',
          operationStatus: 'Complete',
          timestamp: '2025-08-23T10:00:00Z',
          summary: 'Task completed',
        },
        comments: [],
        blockingQuestions: [],
      };

      const references = outputManager.writeOutputFiles(parsedOutput);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('operation-report-Finished-001.md'),
        expect.stringContaining('```json'),
        'utf8'
      );
      expect(references.operationReports).toHaveLength(1);
    });

    it('should handle empty parsed output', () => {
      const parsedOutput: ParsedClaudeOutput = {
        status: 'Failed',
        comments: [],
        blockingQuestions: [],
      };

      const references = outputManager.writeOutputFiles(parsedOutput);

      expect(references.updatedIssue).toBeUndefined();
      expect(references.comments).toHaveLength(0);
      expect(references.contextDump).toBeUndefined();
      expect(references.operationReports).toHaveLength(0);
    });
  });

  describe('updateOperationReport', () => {
    it('should create new operation report if none exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      const fileReferences = {
        updatedIssue: 'updated-issue.md',
        comments: ['comment-001.md'],
        contextDump: 'context-dump.md',
        operationReports: ['operation-report-001.md'],
      };

      outputManager.updateOperationReport('Completed', fileReferences, 'Operation completed');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'operation-report.json'),
        expect.stringContaining('"status": "Completed"'),
        'utf8'
      );
    });

    it('should update existing operation report', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"existing": "data"}');

      const fileReferences = {
        comments: [],
        operationReports: [],
      };

      outputManager.updateOperationReport('Blocked', fileReferences, 'Operation blocked');

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      const parsedContent = JSON.parse(writtenContent);

      expect(parsedContent.existing).toBe('data');
      expect(parsedContent.claudeCodeExecution.status).toBe('Blocked');
      expect(parsedContent.claudeCodeExecution.summary).toBe('Operation blocked');
    });

    it('should handle malformed existing report', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      const fileReferences = {
        comments: [],
        operationReports: [],
      };

      outputManager.updateOperationReport('Failed', fileReferences, 'Operation failed');

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      const parsedContent = JSON.parse(writtenContent);

      expect(parsedContent.claudeCodeExecution.status).toBe('Failed');
    });
  });

  describe('writeOperationReports', () => {
    it('should write multiple operation report files', () => {
      const reports = [
        { filename: 'operation-report-Start-001.md', content: 'Start report content' },
        { filename: 'operation-report-Finished-002.md', content: 'Finished report content' },
      ];

      const writtenFiles = outputManager.writeOperationReports(reports);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'operation-report-Start-001.md'),
        'Start report content',
        'utf8'
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(workingFolder, 'operation-report-Finished-002.md'),
        'Finished report content',
        'utf8'
      );
      expect(writtenFiles).toEqual([
        'operation-report-Start-001.md',
        'operation-report-Finished-002.md',
      ]);
    });

    it('should handle empty reports array', () => {
      const writtenFiles = outputManager.writeOperationReports([]);

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
      expect(writtenFiles).toHaveLength(0);
    });
  });

  describe('generateOperationReportFilename', () => {
    it('should generate first report filename when no existing reports', () => {
      mockFs.readdirSync.mockReturnValue([] as any);

      const filename = outputManager['generateOperationReportFilename']('Test');

      expect(filename).toBe('operation-report-Test-001.md');
    });

    it('should increment sequence number based on existing reports', () => {
      mockFs.readdirSync.mockReturnValue([
        'operation-report-Test-001.md',
        'operation-report-Test-002.md',
        'operation-report-Test-003.md',
      ] as any);

      const filename = outputManager['generateOperationReportFilename']('Test');

      expect(filename).toBe('operation-report-Test-004.md');
    });

    it('should handle mixed action names', () => {
      mockFs.readdirSync.mockReturnValue([
        'operation-report-Start-001.md',
        'operation-report-Test-001.md',
        'operation-report-Test-002.md',
      ] as any);

      const filename = outputManager['generateOperationReportFilename']('Test');

      expect(filename).toBe('operation-report-Test-003.md');
    });

    it('should handle non-sequential existing numbers', () => {
      mockFs.readdirSync.mockReturnValue([
        'operation-report-Test-001.md',
        'operation-report-Test-005.md',
        'operation-report-Test-003.md',
      ] as any);

      const filename = outputManager['generateOperationReportFilename']('Test');

      expect(filename).toBe('operation-report-Test-006.md');
    });
  });
});
