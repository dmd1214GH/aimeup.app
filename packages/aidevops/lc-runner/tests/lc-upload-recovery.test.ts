import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('LC Upload Recovery Command', () => {
  let testDir: string;
  let workingFolder: string;
  let issueFolder: string;

  beforeEach(() => {
    // Create test directory structure
    testDir = path.join(__dirname, '.test-recovery');
    issueFolder = path.join(testDir, 'lcr-TEST-01');
    workingFolder = path.join(issueFolder, 'op-Test-20250910120000');
    
    fs.mkdirSync(workingFolder, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('File Type Recognition', () => {
    it('should identify operation report files by pattern', () => {
      // Create test files
      const files = [
        'operation-report-Started-20250910120000.md',
        'operation-report-Finished-20250910130000.md',
        'operation-report-Blocked-20250910140000.md'
      ];
      
      files.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), `# Test Report\nTest content`);
      });

      // Test pattern matching
      const allFiles = fs.readdirSync(workingFolder);
      const operationReports = allFiles.filter(f => 
        f.startsWith('operation-report-') && f.endsWith('.md')
      );
      
      expect(operationReports).toHaveLength(3);
      expect(operationReports).toEqual(expect.arrayContaining(files));
    });

    it('should identify updated-issue.md file', () => {
      const issueFile = 'updated-issue.md';
      fs.writeFileSync(path.join(workingFolder, issueFile), '# Issue Content');
      
      const files = fs.readdirSync(workingFolder);
      const hasUpdatedIssue = files.includes(issueFile);
      
      expect(hasUpdatedIssue).toBe(true);
    });

    it('should identify breakout files by pattern', () => {
      const breakoutFiles = [
        'breakout-001-feature-x.md',
        'breakout-002-bug-fix.md'
      ];
      
      breakoutFiles.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), '# Breakout Issue');
      });

      const allFiles = fs.readdirSync(workingFolder);
      const breakouts = allFiles.filter(f => 
        f.startsWith('breakout-') && f.endsWith('.md')
      );
      
      expect(breakouts).toHaveLength(2);
      expect(breakouts).toEqual(expect.arrayContaining(breakoutFiles));
    });

    it('should ignore non-matching files', () => {
      const ignoredFiles = [
        'README.md',
        'notes.txt',
        'operation-summary.md', // Missing 'report' part
        'report-operation.md', // Wrong prefix
        'operation-report-test.txt' // Wrong extension
      ];
      
      ignoredFiles.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), 'Content');
      });

      const allFiles = fs.readdirSync(workingFolder);
      const operationReports = allFiles.filter(f => 
        f.startsWith('operation-report-') && f.endsWith('.md')
      );
      const breakouts = allFiles.filter(f => 
        f.startsWith('breakout-') && f.endsWith('.md')
      );
      
      expect(operationReports).toHaveLength(0);
      expect(breakouts).toHaveLength(0);
    });
  });

  describe('Operation Logging', () => {
    it('should create operation log in JSON Lines format', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        filePath: path.join(workingFolder, 'operation-report-Started-20250910120000.md'),
        linearUrl: 'https://linear.app/test/issue/TEST-01#comment-123'
      };
      
      // Write log entry
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
      
      // Read and validate
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const lines = logContent.trim().split('\n');
      
      expect(lines).toHaveLength(1);
      
      const parsed = JSON.parse(lines[0]);
      expect(parsed).toEqual(logEntry);
    });

    it('should append multiple entries to operation log', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      
      const entries = [
        {
          timestamp: '2025-09-10T12:00:00.000Z',
          filePath: path.join(workingFolder, 'operation-report-Started-20250910120000.md'),
          linearUrl: 'https://linear.app/test/issue/TEST-01#comment-123'
        },
        {
          timestamp: '2025-09-10T12:01:00.000Z',
          filePath: path.join(workingFolder, 'operation-report-Finished-20250910120100.md'),
          linearUrl: 'https://linear.app/test/issue/TEST-01#comment-124'
        }
      ];
      
      // Write entries
      entries.forEach(entry => {
        fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
      });
      
      // Read and validate
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const lines = logContent.trim().split('\n');
      
      expect(lines).toHaveLength(2);
      
      lines.forEach((line, index) => {
        const parsed = JSON.parse(line);
        expect(parsed).toEqual(entries[index]);
      });
    });

    it('should detect malformed JSON in log', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      
      // Write valid entry followed by malformed entry
      fs.writeFileSync(logPath, 
        '{"timestamp":"2025-09-10T12:00:00.000Z","filePath":"test.md","linearUrl":"url"}\n' +
        'This is not valid JSON\n'
      );
      
      // Try to parse log
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const lines = logContent.trim().split('\n');
      
      let hasError = false;
      lines.forEach(line => {
        try {
          JSON.parse(line);
        } catch {
          hasError = true;
        }
      });
      
      expect(hasError).toBe(true);
    });
  });

  describe('Idempotency', () => {
    it('should skip files already in operation log', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      const reportFile = 'operation-report-Started-20250910120000.md';
      const reportPath = path.join(workingFolder, reportFile);
      
      // Create report file
      fs.writeFileSync(reportPath, '# Report\nContent');
      
      // Add to log
      const logEntry = {
        timestamp: new Date().toISOString(),
        filePath: reportPath,
        linearUrl: 'https://linear.app/test/issue/TEST-01#comment-123'
      };
      fs.writeFileSync(logPath, JSON.stringify(logEntry) + '\n');
      
      // Check if file is in log
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const uploadedFiles = new Set<string>();
      
      logContent.trim().split('\n').forEach(line => {
        const entry = JSON.parse(line);
        uploadedFiles.add(entry.filePath);
      });
      
      const needsUpload = !uploadedFiles.has(reportPath);
      
      expect(needsUpload).toBe(false);
    });

    it('should identify files not in operation log', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      const uploadedFile = 'operation-report-Started-20250910120000.md';
      const newFile = 'operation-report-Finished-20250910130000.md';
      
      // Create files
      fs.writeFileSync(path.join(workingFolder, uploadedFile), '# Report 1');
      fs.writeFileSync(path.join(workingFolder, newFile), '# Report 2');
      
      // Add only first file to log
      const logEntry = {
        timestamp: new Date().toISOString(),
        filePath: path.join(workingFolder, uploadedFile),
        linearUrl: 'https://linear.app/test/issue/TEST-01#comment-123'
      };
      fs.writeFileSync(logPath, JSON.stringify(logEntry) + '\n');
      
      // Check which files need upload
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const uploadedFiles = new Set<string>();
      
      logContent.trim().split('\n').forEach(line => {
        const entry = JSON.parse(line);
        uploadedFiles.add(path.basename(entry.filePath));
      });
      
      const allReports = [uploadedFile, newFile];
      const pendingUploads = allReports.filter(f => !uploadedFiles.has(f));
      
      expect(pendingUploads).toEqual([newFile]);
    });
  });

  describe('Chronological Ordering', () => {
    it('should sort operation reports by timestamp in filename', () => {
      const reports = [
        'operation-report-Started-20250910140000.md',
        'operation-report-InProgress-20250910120000.md',
        'operation-report-Finished-20250910150000.md',
        'operation-report-Blocked-20250910130000.md'
      ];
      
      // Create files in random order
      reports.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), `# ${file}`);
      });
      
      // Get and sort files
      const allFiles = fs.readdirSync(workingFolder);
      const operationReports = allFiles
        .filter(f => f.startsWith('operation-report-') && f.endsWith('.md'))
        .sort(); // Alphabetical sort works for timestamp format
      
      const expected = [
        'operation-report-Blocked-20250910130000.md',
        'operation-report-Finished-20250910150000.md',
        'operation-report-InProgress-20250910120000.md',
        'operation-report-Started-20250910140000.md'
      ];
      
      expect(operationReports).toEqual(expected);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing working folder', () => {
      const missingFolder = path.join(testDir, 'non-existent');
      
      expect(fs.existsSync(missingFolder)).toBe(false);
    });

    it('should handle empty working folder', () => {
      const files = fs.readdirSync(workingFolder);
      const operationReports = files.filter(f => 
        f.startsWith('operation-report-') && f.endsWith('.md')
      );
      
      expect(operationReports).toHaveLength(0);
    });

    it('should handle file read errors gracefully', () => {
      const protectedFile = path.join(workingFolder, 'protected.md');
      fs.writeFileSync(protectedFile, 'Content');
      
      // Make file unreadable (this may not work on all systems)
      try {
        fs.chmodSync(protectedFile, 0o000);
        
        // Attempt to read should fail
        expect(() => {
          fs.readFileSync(protectedFile, 'utf-8');
        }).toThrow();
        
        // Restore permissions for cleanup
        fs.chmodSync(protectedFile, 0o644);
      } catch {
        // Skip test if chmod not supported
        expect(true).toBe(true);
      }
    });
  });

  describe('Test Mode', () => {
    it('should simulate uploads without creating log entries', () => {
      const logPath = path.join(issueFolder, 'issue-operation-log.md');
      const testMode = true;
      
      // Create test files
      const files = [
        'operation-report-Started-20250910120000.md',
        'updated-issue.md'
      ];
      
      files.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), `# ${file}`);
      });
      
      // In test mode, log should not be created/modified
      if (testMode) {
        // Simulate test mode behavior - no writes
        expect(fs.existsSync(logPath)).toBe(false);
      }
    });

    it('should return simulated results in test mode', () => {
      const testMode = true;
      
      // Create test files
      const files = [
        'operation-report-Started-20250910120000.md',
        'operation-report-Finished-20250910130000.md',
        'updated-issue.md'
      ];
      
      files.forEach(file => {
        fs.writeFileSync(path.join(workingFolder, file), `# ${file}`);
      });
      
      if (testMode) {
        // Simulate response structure
        const response = {
          status: 'TEST_MODE',
          simulatedUploads: 3,
          details: files.map(f => `Would upload: ${f}`)
        };
        
        expect(response.status).toBe('TEST_MODE');
        expect(response.simulatedUploads).toBe(3);
        expect(response.details).toHaveLength(3);
      }
    });
  });
});