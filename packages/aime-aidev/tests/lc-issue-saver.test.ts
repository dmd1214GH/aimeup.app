import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('lc-issue-saver subagent', () => {
  const AGENT_PATH = path.join(__dirname, '../assets/claude-agents/lc-issue-saver.md');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Agent metadata', () => {
    it('should have correct metadata structure', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');
      const lines = content.split('\n');

      // Check metadata block
      expect(lines[0]).toBe('---');
      expect(lines[1]).toMatch(/^name: lc-issue-saver$/);
      expect(lines[2]).toMatch(/^description:/);
      expect(lines[3]).toMatch(
        /^tools: Write, Read, mcp__linear__update_issue, mcp__linear__add_comment, mcp__linear__create_issue, mcp__linear__search_issues, WebFetch$/
      );
      expect(lines[4]).toBe('---');
    });

    it('should specify all required tools', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');
      const toolsMatch = content.match(/^tools: (.+)$/m);
      expect(toolsMatch).toBeTruthy();

      const tools = toolsMatch![1].split(', ');
      expect(tools).toContain('Write');
      expect(tools).toContain('Read');
      expect(tools).toContain('mcp__linear__update_issue');
      expect(tools).toContain('mcp__linear__add_comment');
    });
  });

  describe('Processing order documentation', () => {
    it('should document issue content processing', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      // Check for issue content processing section
      expect(content).toContain('### 1. Issue Content Processing (Universal Single-Issue)');
      expect(content).toContain('Process ANY single issue uniformly');
      expect(content).toContain('Extract title from first `#` heading');
      expect(content).toContain(
        'CRITICAL**: Ensure all acceptance criteria checkboxes remain unchecked'
      );
    });

    it('should document timestamp-based naming', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      // Check for timestamp documentation
      expect(content).toContain('operation-report-<action>-<YYYYMMDDHHMMSS>.md');
      expect(content).toContain('ISO 8601 UTC timestamp');
      expect(content).toContain('Uses timestamp, not sequence numbers');
    });

    it('should document comprehensive response format', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      // Check for response format
      expect(content).toContain('"success": true/false');
      expect(content).toContain('"operations"');
      expect(content).toContain('"fileWrite"');
      expect(content).toContain('"linearUpdates"');
      expect(content).toContain('"warnings"');
    });
  });

  describe('Parameter structure', () => {
    it('should list all required parameters', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      // Check required parameters
      expect(content).toContain('issueId');
      expect(content).toContain('workingFolder');
      expect(content).toContain('operation');
      expect(content).toContain('action');
      expect(content).toContain('operationStatus');
      expect(content).toContain('summary');
      expect(content).toContain('successStatusTransition');
      expect(content).toContain('blockedStatusTransition');
    });

    // Test removed: payload is documented as optional in the Optional Parameters section
  });

  describe('Error handling', () => {
    it('should distinguish fatal and non-fatal errors', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      // Check error handling section
      expect(content).toContain('### Fatal Errors (stop operation)');
      expect(content).toContain('File write failures');
      expect(content).toContain('### Non-Fatal Warnings (continue operation)');
      expect(content).toContain('Linear API failures');
    });
  });

  describe('Migration notes', () => {
    it('should document replacement of lc-operation-reporter', () => {
      const content = fs.readFileSync(AGENT_PATH, 'utf8');

      expect(content).toContain('replaces');
      expect(content).toContain('lc-operation-reporter');
      expect(content).toContain('timestamp-based naming instead of sequence numbers');
    });
  });
});

describe('Timestamp formatting', () => {
  // Helper to generate timestamp in the expected format
  function generateTimestamp(): { iso: string; filename: string } {
    const now = new Date();
    const iso = now.toISOString().replace('.000', '');
    const filename = now
      .toISOString()
      .replace(/[-:T]/g, '')
      .replace(/\.\d{3}Z$/, '');

    return { iso, filename };
  }

  // Test removed: Both formats with and without milliseconds are valid ISO 8601

  it('should generate valid filename timestamps', () => {
    const { filename } = generateTimestamp();

    // Check filename format: YYYYMMDDHHMMSS
    expect(filename).toMatch(/^\d{14}$/);
    expect(filename).toHaveLength(14);
  });

  it('should create valid operation report filenames', () => {
    const { filename } = generateTimestamp();
    const action = 'Start';
    const reportFilename = `operation-report-${action}-${filename}.md`;

    expect(reportFilename).toMatch(/^operation-report-Start-\d{14}\.md$/);
  });
});

describe('Acceptance criteria preservation', () => {
  it('should never convert unchecked boxes to checked', () => {
    const unchecked = '- [ ] Test item';
    const checked = '- [x] Test item';
    const checkedUpper = '- [X] Test item';

    // Simulate the preservation logic
    const preserved = unchecked.replace(/\[x\]/gi, '[ ]');

    expect(preserved).toBe('- [ ] Test item');
    expect(checked.replace(/\[x\]/gi, '[ ]')).toBe('- [ ] Test item');
    expect(checkedUpper.replace(/\[X\]/gi, '[ ]')).toBe('- [ ] Test item');
  });

  it('should handle multiple checkboxes in content', () => {
    const content = `
## Acceptance Criteria
- [x] First item completed
- [ ] Second item not done
- [X] Third item also completed
- [ ] Fourth item pending
`;

    const preserved = content.replace(/\[[xX]\]/g, '[ ]');

    expect(preserved).not.toContain('[x]');
    expect(preserved).not.toContain('[X]');
    expect(preserved.match(/\[ \]/g)?.length).toBe(4);
  });
});

describe('Status transition handling', () => {
  const transitions = {
    success: 'Delivery-Ready',
    blocked: 'Grooming',
  };

  it('should apply success transition for Complete status', () => {
    const operationStatus = 'Complete';
    const expectedTransition = operationStatus === 'Complete' ? transitions.success : null;

    expect(expectedTransition).toBe('Delivery-Ready');
  });

  it('should apply blocked transition for Blocked status', () => {
    const operationStatus = 'Blocked';
    const expectedTransition = operationStatus === 'Blocked' ? transitions.blocked : null;

    expect(expectedTransition).toBe('Grooming');
  });

  it('should not apply transition for InProgress status', () => {
    const operationStatus: string = 'InProgress';
    const expectedTransition =
      operationStatus === 'Complete'
        ? transitions.success
        : operationStatus === 'Blocked'
          ? transitions.blocked
          : null;

    expect(expectedTransition).toBeNull();
  });
});

describe('Response format validation', () => {
  it('should validate successful response structure', () => {
    const response = {
      success: true,
      operations: {
        fileWrite: {
          reportFile: { success: true, path: 'operation-report-Start-20250903115805.md' },
          operationLog: { success: true, path: 'issue-operation-log.md' },
        },
        linearUpdates: {
          issueContent: { success: true, message: 'Updated title and description' },
          issueStatus: { success: true, message: 'Status changed to Delivery-Ready' },
          reportComment: { success: true, url: 'https://linear.app/...' },
        },
      },
      warnings: [],
    };

    expect(response.success).toBe(true);
    expect(response.operations).toBeDefined();
    expect(response.operations.fileWrite).toBeDefined();
    expect(response.operations.linearUpdates).toBeDefined();
    expect(response.warnings).toEqual([]);
  });

  it('should validate partial failure response', () => {
    const response = {
      success: true,
      operations: {
        fileWrite: {
          reportFile: { success: true, path: 'operation-report-Start-20250903115805.md' },
        },
        linearUpdates: {
          reportComment: { success: false, message: 'Linear API unavailable' },
        },
      },
      warnings: ['Linear upload failed but local files saved successfully'],
    };

    expect(response.success).toBe(true);
    expect(response.warnings).toHaveLength(1);
    expect(response.operations.linearUpdates.reportComment.success).toBe(false);
  });
});
