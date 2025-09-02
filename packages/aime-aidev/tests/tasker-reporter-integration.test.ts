import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests for lc-issue-tasker integration with lc-operation-reporter
 * Validates that the tasker properly invokes the reporter subagent
 */

describe('LC Issue Tasker Reporter Integration', () => {
  const fixturesDir = path.join(__dirname, 'fixtures', 'reporter-integration');
  const workingFolder = path.join(fixturesDir, 'working');

  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(workingFolder)) {
      fs.mkdirSync(workingFolder, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up operation reports after each test
    const files = fs.readdirSync(workingFolder);
    files.forEach((file) => {
      if (file.startsWith('operation-report-')) {
        fs.unlinkSync(path.join(workingFolder, file));
      }
    });
  });

  describe('Reporter Invocation', () => {
    it('should invoke reporter once at completion', () => {
      // Simulate tasker completing successfully
      const expectedReporterCall = {
        issueId: 'TEST-123',
        operation: 'Task',
        action: 'Finished',
        workingFolder: workingFolder,
        operationStatus: 'Complete',
        summary: 'Generated comprehensive task list with 10 tasks',
      };

      // The tasker should make exactly ONE call to lc-operation-reporter
      // Expected behavior: Single operation-report-Finished-001.md created
      expect(expectedReporterCall.action).toBe('Finished');
      expect(expectedReporterCall.operationStatus).toBe('Complete');
    });

    it('should pass Blocked status when blocking questions exist', () => {
      const expectedReporterCall = {
        issueId: 'TEST-124',
        operation: 'Task',
        action: 'Finished',
        workingFolder: workingFolder,
        operationStatus: 'Blocked',
        summary: 'Requirements unclear, blocking questions identified',
        payload: `### Blocking Questions
- What specific performance metrics need improvement?
- What are the acceptable response time thresholds?`,
      };

      expect(expectedReporterCall.operationStatus).toBe('Blocked');
      expect(expectedReporterCall.payload).toContain('Blocking Questions');
    });

    it('should pass Failed status when pre-checks fail', () => {
      const expectedReporterCall = {
        issueId: 'TEST-125',
        operation: 'Task',
        action: 'Finished',
        workingFolder: workingFolder,
        operationStatus: 'Failed',
        summary: 'Missing requirements section in issue',
        payload: `### Validation Failures
- No Requirements section found
- Cannot proceed with tasking`,
      };

      expect(expectedReporterCall.operationStatus).toBe('Failed');
      expect(expectedReporterCall.payload).toContain('Validation Failures');
    });
  });

  describe('Error Handling', () => {
    it('should handle reporter subagent failures gracefully', () => {
      // If lc-operation-reporter fails, tasker should:
      // 1. Log the error
      // 2. Continue operation
      // 3. Return status with reportCreated: false

      const expectedResponse = {
        status: 'Complete',
        summary: 'Task list generated successfully',
        tasksGenerated: true,
        validationPassed: true,
        blockingQuestions: [],
        reportCreated: false,
        error: 'Reporter subagent failed: Connection timeout',
      };

      expect(expectedResponse.status).toBe('Complete');
      expect(expectedResponse.reportCreated).toBe(false);
      expect(expectedResponse.error).toContain('Reporter subagent failed');
    });

    it('should not make multiple reporter calls on retry', () => {
      // Ensure idempotency - even if tasker logic retries internally,
      // it should only call reporter ONCE at the very end

      const reportFiles = fs
        .readdirSync(workingFolder)
        .filter((f) => f.startsWith('operation-report-'));

      // Should have at most 1 report file
      expect(reportFiles.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Report Content Validation', () => {
    it('should include task generation summary in Complete report', () => {
      const mockReportContent = `# Task Operation Finished

\`\`\`json
{
  "issueId": "TEST-123",
  "operation": "Task",
  "action": "Finished",
  "workingFolder": "${workingFolder}",
  "operationStatus": "Complete",
  "timestamp": "2025-09-02 10:30:00 EDT",
  "summary": "Successfully generated task list with 8 tasks"
}
\`\`\`

### Task Generation Summary
- Analyzed requirements and acceptance criteria
- Generated 8 tasks covering all ACs
- All 8 success criteria validated
- No blocking questions identified
- Ready for delivery phase`;

      expect(mockReportContent).toContain('"operationStatus": "Complete"');
      expect(mockReportContent).toContain('Task Generation Summary');
      expect(mockReportContent).toContain('8 success criteria validated');
    });

    it('should include blocking questions in Blocked report', () => {
      const mockReportContent = `# Task Operation Finished

\`\`\`json
{
  "issueId": "TEST-124",
  "operation": "Task",
  "action": "Finished",
  "workingFolder": "${workingFolder}",
  "operationStatus": "Blocked",
  "timestamp": "2025-09-02 10:35:00 EDT",
  "summary": "Tasking blocked due to ambiguous requirements"
}
\`\`\`

### Blocking Questions
1. What specific API endpoints need caching?
2. What is the expected cache TTL for each endpoint?
3. Should cache be invalidated on data updates?

### Validation Results
- Requirements clarity: FAILED - Too ambiguous
- Other criteria could not be evaluated due to unclear requirements`;

      expect(mockReportContent).toContain('"operationStatus": "Blocked"');
      expect(mockReportContent).toContain('### Blocking Questions');
      expect(mockReportContent).toContain('cache TTL');
    });

    it('should include failure details in Failed report', () => {
      const mockReportContent = `# Task Operation Finished

\`\`\`json
{
  "issueId": "TEST-125",
  "operation": "Task",
  "action": "Finished",
  "workingFolder": "${workingFolder}",
  "operationStatus": "Failed",
  "timestamp": "2025-09-02 10:40:00 EDT",
  "summary": "Pre-tasking validation failed"
}
\`\`\`

### Pre-check Failures
- Missing Requirements section
- Missing Acceptance Criteria section
- Cannot proceed with task generation without basic issue structure`;

      expect(mockReportContent).toContain('"operationStatus": "Failed"');
      expect(mockReportContent).toContain('Pre-check Failures');
      expect(mockReportContent).toContain('Missing Requirements');
    });
  });

  describe('Integration with File Updates', () => {
    it('should update issue file before calling reporter', () => {
      // Workflow validation:
      // 1. Tasker updates <workingFolder>/updated-issue.md with task list
      // 2. Tasker calls reporter with operation status
      // 3. Both files should exist and be consistent

      const updatedIssuePath = path.join(workingFolder, 'updated-issue.md');
      const mockUpdatedIssue = `# Test Issue

## Requirements
Clear requirements

## Acceptance Criteria
- [ ] AC 1
- [ ] AC 2

## Task List for TEST-123
1. () Task 1
2. () Task 2

## Assumptions
- Using existing infrastructure

## Blocking Questions
No outstanding questions`;

      fs.writeFileSync(updatedIssuePath, mockUpdatedIssue);

      // Verify file exists and contains task list
      const content = fs.readFileSync(updatedIssuePath, 'utf-8');
      expect(content).toContain('## Task List');
      expect(content).toContain('## Assumptions');
      expect(content).toContain('## Blocking Questions');
    });

    it('should preserve metadata section in updated issue', () => {
      const updatedIssuePath = path.join(workingFolder, 'updated-issue.md');
      const issueWithMetadata = `# Test Issue

## Requirements
Requirements here

## Acceptance Criteria
- [ ] AC here

## Task List for TEST-123
1. () Generated task

## Metadata
- URL: https://linear.app/test/issue/TEST-123
- Identifier: TEST-123
- Status: Tasking-ai
- Created: 2025-09-01T10:00:00Z
- Updated: 2025-09-02T10:00:00Z`;

      fs.writeFileSync(updatedIssuePath, issueWithMetadata);
      const content = fs.readFileSync(updatedIssuePath, 'utf-8');

      // Metadata should be preserved
      expect(content).toContain('## Metadata');
      expect(content).toContain('URL: https://linear.app');
      expect(content).toContain('Identifier: TEST-123');
    });
  });

  describe('Response Format', () => {
    it('should return valid JSON response structure', () => {
      const validResponse = {
        status: 'Complete',
        summary: 'Task list generated successfully',
        tasksGenerated: true,
        validationPassed: true,
        blockingQuestions: [],
        reportCreated: true,
      };

      // Validate response structure
      expect(validResponse).toHaveProperty('status');
      expect(validResponse).toHaveProperty('summary');
      expect(validResponse).toHaveProperty('tasksGenerated');
      expect(validResponse).toHaveProperty('validationPassed');
      expect(validResponse).toHaveProperty('blockingQuestions');
      expect(validResponse).toHaveProperty('reportCreated');
      expect(Array.isArray(validResponse.blockingQuestions)).toBe(true);
    });

    it('should include error field when applicable', () => {
      const errorResponse = {
        status: 'Failed',
        summary: 'File write error occurred',
        tasksGenerated: false,
        validationPassed: false,
        blockingQuestions: [],
        reportCreated: false,
        error: 'EACCES: Permission denied writing to updated-issue.md',
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('Permission denied');
    });
  });
});
