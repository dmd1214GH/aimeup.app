import { ClaudeOutputParser } from '../src/claude-output-parser';

describe('ClaudeOutputParser', () => {
  let parser: ClaudeOutputParser;

  beforeEach(() => {
    parser = new ClaudeOutputParser();
  });

  describe('parseOutput', () => {
    it('should parse completed status from operation report JSON', () => {
      const output = `
# Task Operation Finished
\`\`\`json
{
  "issueId": "AM-21",
  "operation": "Task",
  "action": "Finished",
  "workingFolder": "/path/to/folder",
  "operationStatus": "Complete",
  "timestamp": "2025-08-23T10:00:00Z",
  "summary": "Task completed successfully"
}
\`\`\`
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Completed');
      expect(result.operationReport).toBeDefined();
      expect(result.operationReport?.operationStatus).toBe('Complete');
    });

    it('should parse blocked status from operation report JSON', () => {
      const output = `
# Task Operation Blocked
\`\`\`json
{
  "operationStatus": "Blocked",
  "summary": "Task blocked due to missing requirements"
}
\`\`\`
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Blocked');
    });

    it('should extract updated issue content', () => {
      const output = `
## Updated Issue Content
This is the updated issue content
with multiple lines
`;
      const result = parser.parseOutput(output);

      expect(result.updatedIssueContent).toBe(
        'This is the updated issue content\nwith multiple lines'
      );
    });

    it('should extract multiple comments', () => {
      const output = `
## Comment 1
First comment content

## Comment 2
Second comment content
`;
      const result = parser.parseOutput(output);

      expect(result.comments).toHaveLength(2);
      expect(result.comments[0]).toBe('First comment content');
      expect(result.comments[1]).toBe('Second comment content');
    });

    it('should extract blocking questions', () => {
      const output = `
## Blocking Questions
- What is the expected behavior?
- Should we use library X or Y?
1. How should errors be handled?
`;
      const result = parser.parseOutput(output);

      expect(result.blockingQuestions).toHaveLength(3);
      expect(result.blockingQuestions[0]).toBe('What is the expected behavior?');
      expect(result.blockingQuestions[1]).toBe('Should we use library X or Y?');
      expect(result.blockingQuestions[2]).toBe('How should errors be handled?');
    });

    it('should extract context dump', () => {
      const output = `
## Context Dump
Context information here
with multiple lines
`;
      const result = parser.parseOutput(output);

      expect(result.contextDump).toBe('Context information here\nwith multiple lines');
    });

    it('should infer blocked status from blocking questions', () => {
      const output = `
## Blocking Questions
- Question 1
- Question 2
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Blocked');
      expect(result.blockingQuestions).toHaveLength(2);
    });

    it('should parse task list completion status', () => {
      const output = `
## Task list

1. (X) Task 1 completed
2. (X) Task 2 completed
3. (X) Task 3 completed
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Completed');
      expect(result.updatedIssueContent).toContain('Task list');
    });

    it('should parse task list with blocked tasks', () => {
      const output = `
## Task list

1. (X) Task 1 completed
2. (-) Task 2 blocked
3. () Task 3 not started
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Blocked');
    });

    it('should handle empty output', () => {
      const result = parser.parseOutput('');

      expect(result.status).toBe('Failed');
      expect(result.comments).toHaveLength(0);
      expect(result.blockingQuestions).toHaveLength(0);
    });

    it('should handle malformed JSON in operation report', () => {
      const output = `
# Deliver Operation Start
\`\`\`json
{ invalid json }
\`\`\`
`;
      const result = parser.parseOutput(output);

      expect(result.status).toBe('Failed');
      expect(result.operationReport).toBeUndefined();
    });
  });

  describe('extractOperationReports', () => {
    it('should extract multiple operation reports', () => {
      const output = `
operation-report-Start-001.md
# Groom Operation Start
\`\`\`json
{"action": "Start"}
\`\`\`

operation-report-Finished-002.md
# Groom Operation Finished
\`\`\`json
{"action": "Finished"}
\`\`\`
`;
      const reports = parser.extractOperationReports(output);

      expect(reports).toHaveLength(2);
      expect(reports[0].filename).toBe('operation-report-Start-001.md');
      expect(reports[1].filename).toBe('operation-report-Finished-002.md');
    });

    it('should extract single report from parsed output if no explicit reports found', () => {
      const output = `
# Test Operation Test
\`\`\`json
{
  "action": "Test",
  "summary": "Test report"
}
\`\`\`
`;
      const reports = parser.extractOperationReports(output);

      expect(reports).toHaveLength(1);
      expect(reports[0].filename).toBe('operation-report-Test-001.md');
      expect(reports[0].content).toContain('"action": "Test"');
    });

    it('should return empty array if no reports found', () => {
      const output = 'Some output without operation reports';
      const reports = parser.extractOperationReports(output);

      expect(reports).toHaveLength(0);
    });
  });
});
