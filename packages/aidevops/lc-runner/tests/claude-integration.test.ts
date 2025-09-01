import { ClaudeInvoker } from '../src/claude-invoker';
import { ClaudeOutputParser } from '../src/claude-output-parser';
import { OutputManager } from '../src/output-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

jest.mock('child_process');

describe('ClaudeCode Integration Tests', () => {
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
  let tempDir: string;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Complete ClaudeCode workflow - Completed status', () => {
    it('should handle complete workflow from invocation to file writing', async () => {
      // Setup master prompt
      const masterPromptPath = path.join(tempDir, 'master-prompt.md');
      fs.writeFileSync(masterPromptPath, 'Test prompt content');

      // Mock ClaudeCode execution
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };
      mockSpawn.mockReturnValue(mockProcess);

      // Create invoker
      const invoker = new ClaudeInvoker();
      const invocationPromise = invoker.invokeClaudeCode(masterPromptPath);

      // Simulate ClaudeCode response with completed task
      const claudeOutput = `
# Test Operation Action
\`\`\`json
{
  "issueId": "AM-21",
  "operation": "Task",
  "action": "Finished",
  "workingFolder": "${tempDir}",
  "operationStatus": "Complete",
  "timestamp": "2025-08-23T10:00:00Z",
  "summary": "Successfully generated task list"
}
\`\`\`

## Updated Issue Content
# Task AM-21

## Task list
1. (X) Task 1 - Completed
2. (X) Task 2 - Completed
3. (X) Task 3 - Completed

All tasks have been completed successfully.

## Comment 1
The task list has been successfully generated and all items are marked as complete.
`;

      mockProcess.stdout.emit('data', claudeOutput);
      mockProcess.emit('close', 0);

      const invocationResult = await invocationPromise;

      // Parse the output
      const parser = new ClaudeOutputParser();
      const parsedOutput = parser.parseOutput(invocationResult.stdout);

      // Write output files
      const outputManager = new OutputManager(tempDir);
      const fileReferences = outputManager.writeOutputFiles(parsedOutput);

      // Verify invocation result
      expect(invocationResult.success).toBe(true);
      expect(invocationResult.exitCode).toBe(0);

      // Verify parsed output
      expect(parsedOutput.status).toBe('Completed');
      expect(parsedOutput.updatedIssueContent).toContain('Task');
      expect(parsedOutput.comments).toHaveLength(1);
      expect(parsedOutput.operationReport).toBeDefined();

      // Verify files were written
      expect(fileReferences.updatedIssue).toBe('updated-issue.md');
      expect(fileReferences.comments).toEqual(['comment-001.md']);

      // Verify actual file contents (basic check - detailed content is tested in unit tests)
      const updatedIssue = fs.readFileSync(path.join(tempDir, 'updated-issue.md'), 'utf8');
      expect(updatedIssue).toContain('Task');

      const comment = fs.readFileSync(path.join(tempDir, 'comment-001.md'), 'utf8');
      expect(comment.length).toBeGreaterThan(0);

      // Update operation report
      outputManager.updateOperationReport(
        parsedOutput.status,
        fileReferences,
        'ClaudeCode completed successfully'
      );

      const reportPath = path.join(tempDir, 'operation-report.json');
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      expect(report.claudeCodeExecution.status).toBe('Completed');
    });
  });

  describe('Complete ClaudeCode workflow - Blocked status', () => {
    it('should handle blocked workflow with blocking questions', async () => {
      // Setup master prompt
      const masterPromptPath = path.join(tempDir, 'master-prompt.md');
      fs.writeFileSync(masterPromptPath, 'Test prompt content');

      // Mock ClaudeCode execution
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };
      mockSpawn.mockReturnValue(mockProcess);

      // Create invoker
      const invoker = new ClaudeInvoker();
      const invocationPromise = invoker.invokeClaudeCode(masterPromptPath);

      // Simulate ClaudeCode response with blocked status
      const claudeOutput = `
# Test Operation Action
\`\`\`json
{
  "issueId": "AM-21",
  "operation": "Task",
  "action": "Blocked",
  "workingFolder": "${tempDir}",
  "operationStatus": "Blocked",
  "timestamp": "2025-08-23T10:00:00Z",
  "summary": "Task blocked due to unclear requirements"
}
\`\`\`

## Task list
1. (X) Task 1 - Completed
2. (-) Task 2 - BLOCKED: Missing API specification
3. () Task 3 - Not started

## Blocking Questions
- What is the expected format for the API response?
- Should we use REST or GraphQL for the API?
- How should authentication be handled?

## Comment 1
The task cannot be completed due to missing specifications. Please provide clarification on the blocking questions.
`;

      mockProcess.stdout.emit('data', claudeOutput);
      mockProcess.emit('close', 0);

      const invocationResult = await invocationPromise;

      // Parse the output
      const parser = new ClaudeOutputParser();
      const parsedOutput = parser.parseOutput(invocationResult.stdout);

      // Write output files
      const outputManager = new OutputManager(tempDir);
      const fileReferences = outputManager.writeOutputFiles(parsedOutput);

      // Verify parsed output
      expect(parsedOutput.status).toBe('Blocked');
      expect(parsedOutput.blockingQuestions).toHaveLength(3);
      expect(parsedOutput.blockingQuestions[0]).toContain('API response');
      expect(parsedOutput.comments).toHaveLength(1);

      // Verify files were written
      expect(fileReferences.comments).toEqual(['comment-001.md']);

      // Extract and write operation reports
      const operationReports = parser.extractOperationReports(invocationResult.stdout);
      const reportFiles = outputManager.writeOperationReports(operationReports);
      expect(reportFiles).toHaveLength(1);
    });
  });

  describe('ClaudeCode execution failure', () => {
    it('should handle ClaudeCode execution failure gracefully', async () => {
      // Setup master prompt
      const masterPromptPath = path.join(tempDir, 'master-prompt.md');
      fs.writeFileSync(masterPromptPath, 'Test prompt content');

      // Mock ClaudeCode execution failure
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };
      mockSpawn.mockReturnValue(mockProcess);

      // Create invoker
      const invoker = new ClaudeInvoker();
      const invocationPromise = invoker.invokeClaudeCode(masterPromptPath);

      // Simulate ClaudeCode error
      mockProcess.stderr.emit('data', 'ClaudeCode error: Invalid input format');
      mockProcess.emit('close', 1);

      const invocationResult = await invocationPromise;

      // Verify failure handling
      expect(invocationResult.success).toBe(false);
      expect(invocationResult.exitCode).toBe(1);
      expect(invocationResult.stderr).toContain('Invalid input format');

      // Parse the (empty) output
      const parser = new ClaudeOutputParser();
      const parsedOutput = parser.parseOutput(invocationResult.stdout);

      expect(parsedOutput.status).toBe('Failed');
      expect(parsedOutput.comments).toHaveLength(0);

      // Write output files (should handle empty output gracefully)
      const outputManager = new OutputManager(tempDir);
      const fileReferences = outputManager.writeOutputFiles(parsedOutput);

      expect(fileReferences.updatedIssue).toBeUndefined();
      expect(fileReferences.comments).toHaveLength(0);
    });
  });

  describe('Multiple operation reports', () => {
    it('should handle multiple operation reports in output', async () => {
      const claudeOutput = `
operation-report-Start-001.md
# Test Operation Action
\`\`\`json
{
  "action": "Start",
  "operationStatus": "InProgress"
}
\`\`\`

Some processing happens here...

operation-report-Finished-002.md
# Test Operation Action
\`\`\`json
{
  "action": "Finished",
  "operationStatus": "Complete"
}
\`\`\`
`;

      const parser = new ClaudeOutputParser();
      const reports = parser.extractOperationReports(claudeOutput);

      expect(reports).toHaveLength(2);
      expect(reports[0].filename).toBe('operation-report-Start-001.md');
      expect(reports[1].filename).toBe('operation-report-Finished-002.md');

      // Write the reports
      const outputManager = new OutputManager(tempDir);
      const writtenFiles = outputManager.writeOperationReports(reports);

      expect(writtenFiles).toHaveLength(2);

      // Verify files were actually written
      expect(fs.existsSync(path.join(tempDir, 'operation-report-Start-001.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'operation-report-Finished-002.md'))).toBe(true);
    });
  });

  describe('Context dump handling', () => {
    it('should write context dump when present', () => {
      const claudeOutput = `
## Context Dump
Current state information:
- Issue ID: AM-21
- Operation: Task
- Status: Completed
- Working folder: ${tempDir}

Additional context and state information...
`;

      const parser = new ClaudeOutputParser();
      const parsedOutput = parser.parseOutput(claudeOutput);

      expect(parsedOutput.contextDump).toBeDefined();
      expect(parsedOutput.contextDump).toContain('Current state information');

      const outputManager = new OutputManager(tempDir);
      const fileReferences = outputManager.writeOutputFiles(parsedOutput);

      expect(fileReferences.contextDump).toBe('context-dump.md');

      const contextDump = fs.readFileSync(path.join(tempDir, 'context-dump.md'), 'utf8');
      expect(contextDump).toContain('Issue ID: AM-21');
    });
  });
});
