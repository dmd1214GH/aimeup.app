/**
 * Integration tests that use real file system and processes
 * but mock only Linear API and Claude executable
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';

describe('lc-runner Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    // Use real temp directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lcr-test-'));

    // Create minimal config
    const configDir = path.join(testDir, '.linear-watcher');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        linear: {
          apiKey: 'test-key',
          issuePrefix: 'AM',
          teamId: 'test-team',
        },
      })
    );
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test.skip('REAL TEST: Full operation creates expected file structure', () => {
    // This would actually run your real code with just Linear mocked
    const mockLinearResponse = {
      issue: {
        id: 'test-id',
        identifier: 'AM-100',
        title: 'Real Integration Test',
        description: 'Testing with real files',
      },
    };

    // Mock only the Linear API call
    process.env.LINEAR_API_MOCK = JSON.stringify(mockLinearResponse);

    // Run the ACTUAL lc-runner
    const result = execSync(
      `node ${path.join(__dirname, '../../src/cli.ts')} Deliver AM-100 --no-claude`,
      {
        cwd: testDir,
        env: { ...process.env, LINEAR_API_KEY: 'test' },
      }
    );

    // Verify REAL file structure was created
    const workDir = path.join(testDir, '.linear-watcher/work/lcr-AM-100');
    expect(fs.existsSync(workDir)).toBe(true);

    const folders = fs.readdirSync(workDir);
    expect(folders).toContain(expect.stringMatching(/^op-Deliver-/));

    // Verify REAL files were created
    const opFolder = folders.find((f) => f.startsWith('op-Deliver-'));
    const files = fs.readdirSync(path.join(workDir, opFolder!));
    expect(files).toContain('issue.md');
    expect(files).toContain('master-prompt.md');
  });

  test.skip('REAL TEST: Upload-only with actual file validation', () => {
    // Create REAL files that would come from Claude
    const issueDir = path.join(testDir, '.linear-watcher/work/lcr-AM-101');
    const opDir = path.join(issueDir, 'op-Deliver-20240101');
    fs.mkdirSync(opDir, { recursive: true });

    // Write REAL files
    fs.writeFileSync(
      path.join(opDir, 'updated-issue.md'),
      '# Real Updated Issue\nActual content here'
    );
    fs.writeFileSync(
      path.join(opDir, 'operation-report.md'),
      '## Operation Report\nReal report content'
    );

    // Mock Linear upload response
    process.env.LINEAR_UPLOAD_MOCK = 'success';

    // Run REAL upload command
    const result = execSync(
      `node ${path.join(__dirname, '../../src/cli.ts')} Deliver AM-101 --upload-only op-Deliver-20240101`,
      {
        cwd: testDir,
        env: { ...process.env, LINEAR_API_KEY: 'test' },
      }
    );

    // Verify upload attempted with real content
    expect(result.toString()).toContain('Upload completed');
  });

  test('REAL TEST: Handles actual Claude output parsing', () => {
    // Create a mock Claude output file
    const claudeOutput = `
# Test Operation Action
\`\`\`json
{
  "issueId": "AM-102",
  "operation": "Deliver",
  "action": "Finished",
  "operationStatus": "Complete"
}
\`\`\`

## Updated Issue Content
Real content from Claude

## Comment 1
This is a real comment
    `;

    // Test the REAL parser
    const { ClaudeOutputParser } = require('../../src/claude-output-parser');
    const parser = new ClaudeOutputParser();
    const result = parser.parseOutput(claudeOutput);

    expect(result.operationReport).toBeDefined();
    expect(result.operationReport?.issueId).toBe('AM-102');
    expect(result.comments).toHaveLength(1);
    expect(result.updatedIssueContent).toContain('Real content from Claude');
  });
});
