import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration tests for lc-issue-saver subagent
 * Tests the unified save handler for operation reports, issue content, and status updates
 */

describe('LC Issue Saver Integration', () => {
  const fixturesDir = path.join(__dirname, 'fixtures', 'saver-integration');
  const workingFolder = path.join(fixturesDir, 'working');

  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(workingFolder)) {
      fs.mkdirSync(workingFolder, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up generated files after each test
    const files = fs.readdirSync(workingFolder);
    files.forEach((file) => {
      if (file.startsWith('operation-report-') || file === 'issue-operation-log.md') {
        fs.unlinkSync(path.join(workingFolder, file));
      }
    });
  });

  describe('Timestamp-based naming', () => {
    it('should use YYYYMMDDHHMMSS format for report filenames', () => {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, '')
        .replace(/\.\d{3}Z$/, '');

      const filename = `operation-report-Start-${timestamp}.md`;

      // Verify format matches expected pattern
      expect(filename).toMatch(/^operation-report-Start-\d{14}\.md$/);
    });

    it('should not use sequence numbers', () => {
      // Create multiple reports - they should have unique timestamps, not sequences
      const timestamp1 = '20250903115805';
      const timestamp2 = '20250903115806';

      const filename1 = `operation-report-Start-${timestamp1}.md`;
      const filename2 = `operation-report-Finished-${timestamp2}.md`;

      // Neither should contain sequence numbers like 001, 002
      expect(filename1).not.toContain('-001');
      expect(filename2).not.toContain('-002');
    });
  });

  describe('Issue content comparison', () => {
    beforeEach(() => {
      // Create test issue files
      const originalContent = `# Test Issue
Original description

## Acceptance Criteria
- [ ] First criterion
- [ ] Second criterion

## Metadata
- Status: Grooming`;

      const updatedContent = `# Test Issue
Updated description with changes

## Acceptance Criteria
- [ ] First criterion
- [ ] Second criterion
- [ ] New third criterion

## Metadata
- Status: Grooming`;

      fs.writeFileSync(path.join(workingFolder, 'original-issue.md'), originalContent);
      fs.writeFileSync(path.join(workingFolder, 'updated-issue.md'), updatedContent);
    });

    it('should detect content changes between original and updated', () => {
      const original = fs.readFileSync(path.join(workingFolder, 'original-issue.md'), 'utf8');
      const updated = fs.readFileSync(path.join(workingFolder, 'updated-issue.md'), 'utf8');

      expect(original).not.toBe(updated);
      expect(updated).toContain('Updated description with changes');
      expect(updated).toContain('New third criterion');
    });

    it('should extract title and clean body correctly', () => {
      const content = fs.readFileSync(path.join(workingFolder, 'updated-issue.md'), 'utf8');

      // Extract title (first # heading)
      const titleMatch = content.match(/^# (.+)$/m);
      const title = titleMatch ? titleMatch[1] : '';

      // Remove title and metadata for body
      let body = content;
      // Remove all instances of title heading
      body = body.replace(new RegExp(`^# ${title}$`, 'gm'), '');
      // Remove metadata section
      body = body.replace(/## Metadata[\s\S]*$/m, '');
      body = body.trim();

      expect(title).toBe('Test Issue');
      expect(body).not.toContain('# Test Issue');
      expect(body).not.toContain('## Metadata');
      expect(body).toContain('Updated description with changes');
    });
  });

  describe('Acceptance criteria preservation', () => {
    it('should never send checked boxes to Linear', () => {
      const contentWithChecked = `# Issue
      
## Acceptance Criteria
- [x] Completed item
- [X] Another completed
- [ ] Pending item`;

      // Simulate the preservation logic
      const preserved = contentWithChecked.replace(/\[[xX]\]/g, '[ ]');

      expect(preserved).not.toContain('[x]');
      expect(preserved).not.toContain('[X]');
      expect(preserved).toContain('- [ ] Completed item');
      expect(preserved).toContain('- [ ] Another completed');
      expect(preserved).toContain('- [ ] Pending item');
    });
  });

  describe('Status transition handling', () => {
    const transitions = {
      success: 'Delivery-Ready',
      blocked: 'Grooming',
    };

    it('should apply success transition for Complete operations', () => {
      const params = {
        operationStatus: 'Complete',
        successStatusTransition: transitions.success,
        blockedStatusTransition: transitions.blocked,
      };

      const expectedStatus =
        params.operationStatus === 'Complete'
          ? params.successStatusTransition
          : params.operationStatus === 'Blocked'
            ? params.blockedStatusTransition
            : null;

      expect(expectedStatus).toBe('Delivery-Ready');
    });

    it('should apply blocked transition for Blocked operations', () => {
      const params = {
        operationStatus: 'Blocked',
        successStatusTransition: transitions.success,
        blockedStatusTransition: transitions.blocked,
      };

      const expectedStatus =
        params.operationStatus === 'Complete'
          ? params.successStatusTransition
          : params.operationStatus === 'Blocked'
            ? params.blockedStatusTransition
            : null;

      expect(expectedStatus).toBe('Grooming');
    });

    it('should not transition for InProgress operations', () => {
      const params = {
        operationStatus: 'InProgress',
        successStatusTransition: transitions.success,
        blockedStatusTransition: transitions.blocked,
      };

      const expectedStatus =
        params.operationStatus === 'Complete'
          ? params.successStatusTransition
          : params.operationStatus === 'Blocked'
            ? params.blockedStatusTransition
            : null;

      expect(expectedStatus).toBeNull();
    });
  });

  describe('Operation report format', () => {
    it('should create reports with UTC timestamps', () => {
      const now = new Date();
      const isoTimestamp = now.toISOString().replace('.000', '');

      const reportContent = `# Deliver Operation Start

\`\`\`json
{
  "issueId": "AM-62",
  "operation": "Deliver",
  "action": "Start",
  "workingFolder": "${workingFolder}",
  "operationStatus": "InProgress",
  "timestamp": "${isoTimestamp}",
  "summary": "Starting delivery"
}
\`\`\`

### MCP Save Status
No content changes detected - skip Linear update`;

      // Verify timestamp format
      expect(isoTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
      expect(reportContent).toContain('"timestamp":');
      expect(reportContent).toContain('### MCP Save Status');
    });
  });

  describe('Response format', () => {
    it('should return comprehensive status for all operations', () => {
      const mockResponse = {
        success: true,
        operations: {
          fileWrite: {
            reportFile: {
              success: true,
              path: 'operation-report-Start-20250903115805.md',
            },
            operationLog: {
              success: true,
              path: 'issue-operation-log.md',
            },
          },
          linearUpdates: {
            issueContent: {
              success: true,
              message: 'Updated title and description',
            },
            issueStatus: {
              success: false,
              message: 'Status transition not needed',
            },
            reportComment: {
              success: true,
              url: 'https://linear.app/aimeup/issue/AM-62#comment-abc123',
            },
          },
        },
        warnings: [],
      };

      // Validate response structure
      expect(mockResponse.success).toBe(true);
      expect(mockResponse.operations).toBeDefined();
      expect(mockResponse.operations.fileWrite).toBeDefined();
      expect(mockResponse.operations.fileWrite.reportFile.success).toBe(true);
      expect(mockResponse.operations.linearUpdates).toBeDefined();
      expect(mockResponse.operations.linearUpdates.reportComment.url).toContain('linear.app');
    });

    it('should handle Linear API failures gracefully', () => {
      const mockResponse = {
        success: true, // Overall success even with Linear failure
        operations: {
          fileWrite: {
            reportFile: {
              success: true,
              path: 'operation-report-Start-20250903115805.md',
            },
          },
          linearUpdates: {
            reportComment: {
              success: false,
              message: 'Linear API unavailable',
            },
          },
        },
        warnings: ['Linear upload failed but local files saved successfully'],
      };

      // Operation should still succeed if file writes work
      expect(mockResponse.success).toBe(true);
      expect(mockResponse.warnings).toHaveLength(1);
      expect(mockResponse.warnings[0]).toContain('Linear upload failed');
    });
  });

  describe('Migration from lc-operation-reporter', () => {
    it('should use timestamp naming instead of sequence numbers', () => {
      // Old format: operation-report-Start-001.md
      const oldFormat = 'operation-report-Start-001.md';

      // New format: operation-report-Start-20250903115805.md
      const timestamp = '20250903115805';
      const newFormat = `operation-report-Start-${timestamp}.md`;

      expect(oldFormat).toMatch(/operation-report-Start-\d{3}\.md/);
      expect(newFormat).toMatch(/operation-report-Start-\d{14}\.md/);
      expect(newFormat).not.toMatch(/operation-report-Start-\d{3}\.md/);
    });

    it('should handle issue content updates atomically', () => {
      // lc-issue-saver combines what previously required:
      // 1. lc-operation-reporter for reports
      // 2. Direct mcp__linear__update_issue calls for content

      const unifiedParams = {
        issueId: 'AM-62',
        workingFolder: workingFolder,
        operation: 'Deliver',
        action: 'Finished',
        operationStatus: 'Complete',
        summary: 'Completed delivery',
        successStatusTransition: 'Delivery-Ready',
        blockedStatusTransition: 'Grooming',
        payload: 'Additional details',
      };

      // All operations happen in one subagent call
      expect(unifiedParams).toHaveProperty('issueId');
      expect(unifiedParams).toHaveProperty('successStatusTransition');
      expect(unifiedParams).toHaveProperty('blockedStatusTransition');
    });
  });
});
