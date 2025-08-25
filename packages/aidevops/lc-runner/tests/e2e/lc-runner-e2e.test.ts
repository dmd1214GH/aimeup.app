/**
 * End-to-end tests for lc-runner
 *
 * These tests exercise the complete flow from CLI invocation through
 * Linear API interaction, Claude execution, and result upload.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

describe.skip('lc-runner E2E Tests', () => {
  let testWorkspace: string;
  let originalEnv: NodeJS.ProcessEnv;
  let mockLinearServer: MockLinearAPIServer;
  let mockClaudePath: string;

  beforeAll(async () => {
    // Save original environment
    originalEnv = { ...process.env };

    // Create test workspace
    testWorkspace = path.join(os.tmpdir(), `lc-runner-e2e-${uuidv4()}`);
    fs.mkdirSync(testWorkspace, { recursive: true });

    // Start mock Linear API server
    mockLinearServer = new MockLinearAPIServer();
    await mockLinearServer.start();

    // Create mock Claude executable
    mockClaudePath = await createMockClaude(testWorkspace);

    // Set test environment
    process.env.LINEAR_API_KEY = 'test-api-key';
    process.env.LINEAR_API_URL = `http://localhost:${mockLinearServer.port}/graphql`;
    process.env.PATH = `${path.dirname(mockClaudePath)}:${process.env.PATH}`;
  });

  afterAll(async () => {
    // Restore environment
    process.env = originalEnv;

    // Cleanup
    await mockLinearServer.stop();
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Reset mock server state
    mockLinearServer.reset();
  });

  describe('Delivery Operation', () => {
    it('should complete full delivery flow successfully', async () => {
      // Setup mock responses
      mockLinearServer.setIssueResponse('AM-25', {
        id: 'issue-id-25',
        identifier: 'AM-25',
        title: 'Test Issue for Delivery',
        description: 'This is a test issue description',
        state: { name: 'In Progress' },
        comments: [],
      });

      // Execute lc-runner
      const result = await runLcRunner(['Deliver', 'AM-25'], testWorkspace);

      // Assertions
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Fetching issue AM-25 from Linear');
      expect(result.stdout).toContain('Operation completed successfully');

      // Verify Linear API was called
      const apiCalls = mockLinearServer.getCallLog();
      expect(apiCalls).toContainEqual(
        expect.objectContaining({
          operation: 'IssueQuery',
          variables: expect.objectContaining({ id: 'AM-25' }),
        })
      );

      // Verify working folder was created
      const workFolders = fs.readdirSync(
        path.join(testWorkspace, '.linear-watcher', 'work', 'lcr-AM-25')
      );
      expect(workFolders.length).toBeGreaterThan(0);

      // Verify Claude was invoked
      const claudeInvocations = await getMockClaudeInvocations(testWorkspace);
      expect(claudeInvocations).toHaveLength(1);
      expect(claudeInvocations[0].prompt).toContain('AM-25');
    });

    it('should handle Claude execution failure', async () => {
      mockLinearServer.setIssueResponse('AM-26', {
        id: 'issue-id-26',
        identifier: 'AM-26',
        title: 'Test Issue with Claude Failure',
        description: 'This test will fail Claude execution',
        state: { name: 'In Progress' },
        comments: [],
      });

      // Configure mock Claude to fail
      await configureMockClaude(testWorkspace, { shouldFail: true });

      const result = await runLcRunner(['Deliver', 'AM-26'], testWorkspace);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Claude execution failed');

      // Verify failure report was created
      const failureReports = fs
        .readdirSync(path.join(testWorkspace, '.linear-watcher', 'work', 'lcr-AM-26'))
        .filter((f) => f.includes('failure-report'));
      expect(failureReports.length).toBeGreaterThan(0);
    });

    it('should handle upload-only mode', async () => {
      // Create pre-existing work folder with results
      const workFolder = await createMockWorkFolder(testWorkspace, 'AM-27', {
        operation: 'Deliver',
        hasResults: true,
      });

      mockLinearServer.setIssueResponse('AM-27', {
        id: 'issue-id-27',
        identifier: 'AM-27',
        title: 'Test Upload Only',
        description: 'Testing upload-only mode',
        state: { name: 'In Progress' },
        comments: [],
      });

      const result = await runLcRunner(
        ['Deliver', 'AM-27', '--upload-only', workFolder.tag],
        testWorkspace
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Upload completed successfully');

      // Verify Linear update was called
      const updateCalls = mockLinearServer
        .getCallLog()
        .filter((call) => call.operation === 'UpdateIssue');
      expect(updateCalls).toHaveLength(1);

      // Verify Claude was NOT invoked
      const claudeInvocations = await getMockClaudeInvocations(testWorkspace);
      expect(claudeInvocations).toHaveLength(0);
    });
  });

  describe('Task Operation', () => {
    it('should handle task operation with blocking status', async () => {
      mockLinearServer.setIssueResponse('AM-28', {
        id: 'issue-id-28',
        identifier: 'AM-28',
        title: 'Task with Blocking Questions',
        description: 'This task will be blocked',
        state: { name: 'Todo' },
        comments: [],
      });

      // Configure mock Claude to return blocked status
      await configureMockClaude(testWorkspace, {
        responseType: 'blocked',
        blockingQuestions: ['What is the API format?', 'Which database to use?'],
      });

      const result = await runLcRunner(['Task', 'AM-28'], testWorkspace);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Operation status: Blocked');

      // Verify Linear was updated with blocked status
      const updateCalls = mockLinearServer
        .getCallLog()
        .filter((call) => call.operation === 'UpdateIssue');
      expect(updateCalls[0].variables.status).toBe('Task-blocked');
    });
  });

  describe('Error Handling', () => {
    it('should handle Linear API connection failure', async () => {
      // Stop the mock server to simulate connection failure
      await mockLinearServer.stop();

      const result = await runLcRunner(['Deliver', 'AM-29'], testWorkspace);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Failed to connect to Linear API');

      // Restart for other tests
      await mockLinearServer.start();
    });

    it('should validate issue prefix', async () => {
      const result = await runLcRunner(['Deliver', 'WRONG-123'], testWorkspace);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('does not match configured prefix');
    });

    it('should handle missing Claude executable', async () => {
      // Temporarily rename Claude executable
      const tempPath = `${mockClaudePath}.bak`;
      fs.renameSync(mockClaudePath, tempPath);

      mockLinearServer.setIssueResponse('AM-30', {
        id: 'issue-id-30',
        identifier: 'AM-30',
        title: 'Test Missing Claude',
        description: 'Testing missing Claude executable',
        state: { name: 'In Progress' },
        comments: [],
      });

      const result = await runLcRunner(['Deliver', 'AM-30'], testWorkspace);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('claude: command not found');

      // Restore Claude executable
      fs.renameSync(tempPath, mockClaudePath);
    });
  });
});

// Helper Functions

class MockLinearAPIServer {
  private server: any;
  public port: number = 0;
  private responses: Map<string, any> = new Map();
  private callLog: any[] = [];

  async start() {
    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/graphql', (req: any, res: any) => {
      this.callLog.push(req.body);

      const { query, variables } = req.body;

      // Parse query to determine operation
      if (query.includes('query GetIssue')) {
        const issueId = variables.id;
        const response = this.responses.get(issueId);
        if (response) {
          res.json({ data: { issue: response } });
        } else {
          res.status(404).json({ errors: [{ message: 'Issue not found' }] });
        }
      } else if (query.includes('mutation UpdateIssue')) {
        res.json({ data: { issueUpdate: { success: true } } });
      } else {
        res.json({ data: {} });
      }
    });

    return new Promise<void>((resolve) => {
      this.server = app.listen(0, () => {
        this.port = this.server.address().port;
        resolve();
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise<void>((resolve) => {
        this.server.close(() => resolve());
      });
    }
  }

  reset() {
    this.responses.clear();
    this.callLog = [];
  }

  setIssueResponse(issueId: string, response: any) {
    this.responses.set(issueId, response);
  }

  getCallLog() {
    return this.callLog;
  }
}

async function createMockClaude(workspace: string): Promise<string> {
  const claudePath = path.join(workspace, 'mock-claude');

  const script = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read configuration
const configPath = path.join('${workspace}', 'claude-config.json');
const config = fs.existsSync(configPath) 
  ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
  : { shouldFail: false };

// Log invocation
const logPath = path.join('${workspace}', 'claude-invocations.json');
const invocations = fs.existsSync(logPath) 
  ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
  : [];

let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  invocations.push({ 
    timestamp: new Date().toISOString(), 
    prompt,
    args: process.argv.slice(2)
  });
  fs.writeFileSync(logPath, JSON.stringify(invocations, null, 2));

  if (config.shouldFail) {
    console.error('Claude execution failed');
    process.exit(1);
  }

  // Generate response based on config
  const response = generateResponse(prompt, config);
  console.log(response);
  process.exit(0);
});

function generateResponse(prompt, config) {
  if (config.responseType === 'blocked') {
    return \`## operation-report-json
\\\`\\\`\\\`json
{
  "operation": "Task",
  "action": "Blocked",
  "operationStatus": "Blocked",
  "summary": "Blocked due to questions"
}
\\\`\\\`\\\`

## Blocking Questions
\${config.blockingQuestions?.join('\\n') || '- Need clarification'}\`;
  }

  return \`## operation-report-json
\\\`\\\`\\\`json
{
  "operation": "Deliver",
  "action": "Finished",
  "operationStatus": "Complete",
  "summary": "Operation completed successfully"
}
\\\`\\\`\\\`

## Updated Issue
Task completed successfully.

## Comment 1
Operation has been completed.\`;
}
`;

  fs.writeFileSync(claudePath, script);
  fs.chmodSync(claudePath, 0o755);

  return claudePath;
}

async function configureMockClaude(workspace: string, config: any) {
  const configPath = path.join(workspace, 'claude-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function getMockClaudeInvocations(workspace: string) {
  const logPath = path.join(workspace, 'claude-invocations.json');
  if (!fs.existsSync(logPath)) return [];
  return JSON.parse(fs.readFileSync(logPath, 'utf8'));
}

async function createMockWorkFolder(workspace: string, issueId: string, options: any) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const tag = `op-${options.operation}-${timestamp}`;
  const folderPath = path.join(workspace, '.linear-watcher', 'work', `lcr-${issueId}`, tag);

  fs.mkdirSync(folderPath, { recursive: true });

  if (options.hasResults) {
    // Create mock result files
    fs.writeFileSync(path.join(folderPath, 'updated-issue.md'), '# Updated Issue\nTest content');
    fs.writeFileSync(
      path.join(folderPath, 'operation-report.md'),
      '## Operation Report\nTest report'
    );
  }

  return { path: folderPath, tag };
}

async function runLcRunner(
  args: string[],
  workspace: string
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const cliPath = path.join(__dirname, '../../src/cli.ts');
    const child = spawn('ts-node', [cliPath, ...args], {
      cwd: workspace,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => (stdout += data.toString()));
    child.stderr.on('data', (data) => (stderr += data.toString()));

    child.on('close', (exitCode) => {
      resolve({ exitCode: exitCode || 0, stdout, stderr });
    });
  });
}
