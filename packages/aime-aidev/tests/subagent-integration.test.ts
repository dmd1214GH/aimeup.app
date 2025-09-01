import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('Subagent Integration', () => {
  const repoRoot = path.resolve(__dirname, '../../../');
  const claudeAgentsDir = path.join(repoRoot, '.claude', 'agents');
  const sourceAgentsDir = path.join(__dirname, '../assets/claude-agents');

  describe('Claude Agents Directory Structure', () => {
    it('should have claude-agents source directory', () => {
      expect(fs.existsSync(sourceAgentsDir)).toBe(true);
    });

    it('should contain lc-operation-reporter.md in source', () => {
      const reporterPath = path.join(sourceAgentsDir, 'lc-operation-reporter.md');
      expect(fs.existsSync(reporterPath)).toBe(true);
    });

    it('should have valid YAML frontmatter in lc-operation-reporter.md', () => {
      const reporterPath = path.join(sourceAgentsDir, 'lc-operation-reporter.md');
      const content = fs.readFileSync(reporterPath, 'utf-8');

      // Check for YAML frontmatter
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/name: lc-operation-reporter/);
      expect(content).toMatch(/description: ["'].*["']/);
      expect(content).toMatch(/tools: Write, Read, mcp__linear__add_comment/);
      expect(content).toMatch(/\n---\n/);
    });
  });

  describe('Postinstall Script Integration', () => {
    beforeAll(() => {
      // Run the build to ensure dist is up to date
      execSync('npm run build', { cwd: path.join(__dirname, '..') });
    });

    it('should copy agents to .claude/agents during postinstall', () => {
      // Run postinstall
      execSync('node dist/postinstall.js', { cwd: path.join(__dirname, '..') });

      // Check if agents were copied
      const targetAgentPath = path.join(claudeAgentsDir, 'lc-operation-reporter.md');
      expect(fs.existsSync(targetAgentPath)).toBe(true);
    });

    it('should make copied agent files read-only', () => {
      const targetAgentPath = path.join(claudeAgentsDir, 'lc-operation-reporter.md');

      if (fs.existsSync(targetAgentPath)) {
        const stats = fs.statSync(targetAgentPath);
        // Check if file is read-only (0o444 = r--r--r--)
        expect(stats.mode & 0o200).toBe(0); // Owner write bit should be 0
      }
    });

    it('should handle re-running postinstall idempotently', () => {
      // Run postinstall again
      expect(() => {
        execSync('node dist/postinstall.js', { cwd: path.join(__dirname, '..') });
      }).not.toThrow();

      // Verify agent still exists
      const targetAgentPath = path.join(claudeAgentsDir, 'lc-operation-reporter.md');
      expect(fs.existsSync(targetAgentPath)).toBe(true);
    });
  });

  describe('Subagent Content Validation', () => {
    it('should have all required sections in lc-operation-reporter', () => {
      const reporterPath = path.join(sourceAgentsDir, 'lc-operation-reporter.md');
      const content = fs.readFileSync(reporterPath, 'utf-8');

      // Check for required sections
      expect(content).toContain('## Your Responsibilities');
      expect(content).toContain('## Input Parameters');
      expect(content).toContain('## Report File Format');
      expect(content).toContain('## Processing Steps');
      expect(content).toContain('## Error Handling');
      expect(content).toContain('## Response Format');
    });

    it('should define all required input parameters', () => {
      const reporterPath = path.join(sourceAgentsDir, 'lc-operation-reporter.md');
      const content = fs.readFileSync(reporterPath, 'utf-8');

      // Check for all required parameters
      expect(content).toContain('`issueId`');
      expect(content).toContain('`operation`');
      expect(content).toContain('`action`');
      expect(content).toContain('`workingFolder`');
      expect(content).toContain('`operationStatus`');
      expect(content).toContain('`summary`');
      expect(content).toContain('`payload`');
    });

    it('should specify error handling for file write and upload failures', () => {
      const reporterPath = path.join(sourceAgentsDir, 'lc-operation-reporter.md');
      const content = fs.readFileSync(reporterPath, 'utf-8');

      // Check error handling specifications
      expect(content).toContain('File write failure');
      expect(content).toContain('FATAL error');
      expect(content).toContain('Linear upload failure');
      expect(content).toContain('partial success');
      expect(content).toContain('operation can continue');
    });
  });

  describe('Prompt Template Updates', () => {
    const promptsDir = path.join(__dirname, '../assets/prompts');

    it('should have updated lc-runner-general-prompt.md with subagent instructions', () => {
      const promptPath = path.join(promptsDir, 'lc-runner-general-prompt.md');
      const content = fs.readFileSync(promptPath, 'utf-8');

      // Check for subagent integration section
      expect(content).toContain('#### Subagent Integration for Operation Reports');
      expect(content).toContain('lc-operation-reporter subagent');
      expect(content).toContain('Use the Task tool');
      expect(content).toContain('subagent_type="general-purpose"');

      // Should not contain old MCP instructions
      expect(content).not.toContain('#### MCP Integration for Operation Reports');
    });

    it('should have updated operation step instructions to use subagent', () => {
      const promptPath = path.join(promptsDir, 'lc-runner-general-prompt.md');
      const content = fs.readFileSync(promptPath, 'utf-8');

      // Check Step 2 (Starting Operation Report)
      expect(content).toContain(
        'use the lc-operation-reporter subagent to create a Starting Operation Report'
      );

      // Check Step FINAL (Finished Operation Report)
      expect(content).toContain(
        'use the lc-operation-reporter subagent to create the Finished Operation Report'
      );
    });
  });
});
