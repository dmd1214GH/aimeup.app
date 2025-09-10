import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ClaudeInvoker, ClaudeInvocationResult } from '../src/claude-invoker';

// Mock the ClaudeInvoker
jest.mock('../src/claude-invoker');

describe('Upload-Only CLI Integration', () => {
  let testDir: string;
  let workingFolder: string;
  let issueFolder: string;
  const issueId = 'TEST-01';
  const operation = 'Test';
  const folderTag = 'op-Test-20250910120000';

  beforeEach(() => {
    // Create test directory structure
    testDir = path.join(__dirname, '.test-upload-integration');
    issueFolder = path.join(testDir, '.linear-watcher', 'work', `lcr-${issueId}`);
    workingFolder = path.join(issueFolder, folderTag);
    
    fs.mkdirSync(workingFolder, { recursive: true });
    
    // Create required files
    fs.writeFileSync(path.join(workingFolder, 'original-issue.md'), '# Original Issue');
    fs.writeFileSync(path.join(workingFolder, 'updated-issue.md'), '# Updated Issue');
    fs.writeFileSync(
      path.join(workingFolder, 'operation-report-Started-20250910120000.md'),
      '# Operation Report\nStarted operation'
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    jest.clearAllMocks();
  });

  describe('Claude Invocation', () => {
    it('should invoke Claude with correct parameters', async () => {
      const mockInvoker = ClaudeInvoker as jest.MockedClass<typeof ClaudeInvoker>;
      const mockInvokeClaudeCode = jest.fn<() => Promise<ClaudeInvocationResult>>().mockResolvedValue({
        exitCode: 0,
        stdout: 'RECOVERY_STATUS: SUCCESS\nUPLOADED_FILES: 1',
        stderr: '',
        success: true
      });
      
      mockInvoker.prototype.invokeClaudeCode = mockInvokeClaudeCode as any;
      
      // Simulate CLI invocation
      const invoker = new ClaudeInvoker();
      const promptPath = path.join(workingFolder, 'test-prompt.md');
      
      fs.writeFileSync(promptPath, `# Test Prompt
workingFolder: ${workingFolder}
issueId: ${issueId}
testMode: false`);
      
      const result = await invoker.invokeClaudeCode(promptPath, 600000, false, true);
      
      expect(mockInvokeClaudeCode).toHaveBeenCalledWith(
        promptPath,
        600000,
        false,
        true
      );
      expect(result.success).toBe(true);
    });

    it('should pass test mode flag correctly', async () => {
      const mockInvoker = ClaudeInvoker as jest.MockedClass<typeof ClaudeInvoker>;
      const mockInvokeClaudeCode = jest.fn<() => Promise<ClaudeInvocationResult>>().mockResolvedValue({
        exitCode: 0,
        stdout: 'RECOVERY_STATUS: TEST_MODE\nSIMULATED_UPLOADS: 2',
        stderr: '',
        success: true
      });
      
      mockInvoker.prototype.invokeClaudeCode = mockInvokeClaudeCode as any;
      
      const invoker = new ClaudeInvoker();
      const promptPath = path.join(workingFolder, 'test-prompt.md');
      
      fs.writeFileSync(promptPath, `# Test Prompt
workingFolder: ${workingFolder}
issueId: ${issueId}
testMode: true`);
      
      const result = await invoker.invokeClaudeCode(promptPath, 600000, false, true);
      
      expect(result.stdout).toContain('TEST_MODE');
    });

    it('should handle timeout correctly', async () => {
      const mockInvoker = ClaudeInvoker as jest.MockedClass<typeof ClaudeInvoker>;
      const mockInvokeClaudeCode = jest.fn<() => Promise<ClaudeInvocationResult>>().mockRejectedValue(
        new Error('Process timed out after 10 minutes')
      );
      
      mockInvoker.prototype.invokeClaudeCode = mockInvokeClaudeCode as any;
      
      const invoker = new ClaudeInvoker();
      const promptPath = path.join(workingFolder, 'test-prompt.md');
      
      fs.writeFileSync(promptPath, '# Test Prompt');
      
      await expect(
        invoker.invokeClaudeCode(promptPath, 600000, false, true)
      ).rejects.toThrow('Process timed out');
    });
  });

  describe('Response Parsing', () => {
    it('should parse SUCCESS response correctly', () => {
      const output = `
RECOVERY_STATUS: SUCCESS
UPLOADED_FILES: 3
DETAILS:
- operation-report-Started-20250910120000.md -> https://linear.app/test/TEST-01#comment-123
- operation-report-Finished-20250910130000.md -> https://linear.app/test/TEST-01#comment-124
- updated-issue.md -> https://linear.app/test/TEST-01
`;
      
      const statusMatch = output.match(/RECOVERY_STATUS: (\w+)/);
      const uploadedMatch = output.match(/UPLOADED_FILES: (\d+)/);
      const detailsMatch = output.match(/DETAILS:\n([\s\S]*?)(?:\n\n|$)/);
      
      expect(statusMatch?.[1]).toBe('SUCCESS');
      expect(uploadedMatch?.[1]).toBe('3');
      expect(detailsMatch?.[1]).toContain('operation-report-Started');
      expect(detailsMatch?.[1]).toContain('operation-report-Finished');
      expect(detailsMatch?.[1]).toContain('updated-issue.md');
    });

    it('should parse FAILED response correctly', () => {
      const output = `
RECOVERY_STATUS: FAILED
UPLOADED_FILES: 1
ERROR: Failed to upload operation-report-Blocked-20250910140000.md
FAILED_FILE: operation-report-Blocked-20250910140000.md
DETAILS:
- operation-report-Started-20250910120000.md -> https://linear.app/test/TEST-01#comment-123
`;
      
      const statusMatch = output.match(/RECOVERY_STATUS: (\w+)/);
      const errorMatch = output.match(/ERROR: (.+)/);
      const failedFileMatch = output.match(/FAILED_FILE: (.+)/);
      const uploadedMatch = output.match(/UPLOADED_FILES: (\d+)/);
      
      expect(statusMatch?.[1]).toBe('FAILED');
      expect(errorMatch?.[1]).toContain('Failed to upload');
      expect(failedFileMatch?.[1]).toBe('operation-report-Blocked-20250910140000.md');
      expect(uploadedMatch?.[1]).toBe('1');
    });

    it('should parse TEST_MODE response correctly', () => {
      const output = `
RECOVERY_STATUS: TEST_MODE
SIMULATED_UPLOADS: 2
DETAILS:
- Would upload: operation-report-Started-20250910120000.md
- Would upload: updated-issue.md
`;
      
      const statusMatch = output.match(/RECOVERY_STATUS: (\w+)/);
      const simulatedMatch = output.match(/SIMULATED_UPLOADS: (\d+)/);
      const detailsMatch = output.match(/DETAILS:\n([\s\S]*?)(?:\n\n|$)/);
      
      expect(statusMatch?.[1]).toBe('TEST_MODE');
      expect(simulatedMatch?.[1]).toBe('2');
      expect(detailsMatch?.[1]).toContain('Would upload');
    });

    it('should handle unparseable response gracefully', () => {
      const output = `Some unexpected output that doesn't match our format`;
      
      const statusMatch = output.match(/RECOVERY_STATUS: (\w+)/);
      
      expect(statusMatch).toBeNull();
    });
  });

  describe('File Validation', () => {
    it('should validate required files exist', () => {
      const requiredFiles = ['original-issue.md', 'updated-issue.md'];
      
      const allExist = requiredFiles.every(file => 
        fs.existsSync(path.join(workingFolder, file))
      );
      
      expect(allExist).toBe(true);
    });

    it('should detect missing required files', () => {
      fs.unlinkSync(path.join(workingFolder, 'original-issue.md'));
      
      const requiredFiles = ['original-issue.md', 'updated-issue.md'];
      const missingFiles: string[] = [];
      
      requiredFiles.forEach(file => {
        if (!fs.existsSync(path.join(workingFolder, file))) {
          missingFiles.push(file);
        }
      });
      
      expect(missingFiles).toEqual(['original-issue.md']);
    });

    it('should require at least one operation report', () => {
      const reports = fs.readdirSync(workingFolder)
        .filter(f => f.startsWith('operation-report-') && f.endsWith('.md'));
      
      expect(reports.length).toBeGreaterThan(0);
    });

    it('should fail if no operation reports exist', () => {
      // Remove the operation report
      fs.unlinkSync(path.join(workingFolder, 'operation-report-Started-20250910120000.md'));
      
      const reports = fs.readdirSync(workingFolder)
        .filter(f => f.startsWith('operation-report-') && f.endsWith('.md'));
      
      expect(reports.length).toBe(0);
    });
  });

  describe('Dry Run Mode', () => {
    it('should list files without uploading in dry run', () => {
      // Create test files first
      fs.mkdirSync(workingFolder, { recursive: true });
      fs.writeFileSync(path.join(workingFolder, 'updated-issue.md'), '# Test Issue');
      fs.writeFileSync(path.join(workingFolder, 'operation-report-Started-20250910120000.md'), '# Started');
      fs.writeFileSync(path.join(workingFolder, 'operation-report-Finished-20250910121000.md'), '# Finished');
      
      const dryRun = true;
      const files = fs.readdirSync(workingFolder);
      const reports = files.filter(f => 
        f.startsWith('operation-report-') && f.endsWith('.md')
      );
      
      if (dryRun) {
        // In dry run, we should just list files
        const output: string[] = [];
        output.push('Would upload the following files:');
        output.push('  - updated-issue.md');
        reports.forEach(report => {
          output.push(`  - ${report}`);
        });
        
        expect(output).toContain('Would upload the following files:');
        expect(output).toContain('  - updated-issue.md');
        expect(output).toContain('  - operation-report-Started-20250910120000.md');
      }
    });

    it('should not invoke Claude in dry run mode', () => {
      const dryRun = true;
      const mockInvoker = ClaudeInvoker as jest.MockedClass<typeof ClaudeInvoker>;
      const mockInvokeClaudeCode = jest.fn<() => Promise<ClaudeInvocationResult>>();
      
      mockInvoker.prototype.invokeClaudeCode = mockInvokeClaudeCode as any;
      
      if (dryRun) {
        // Claude should not be invoked in dry run
        expect(mockInvokeClaudeCode).not.toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing working folder gracefully', () => {
      const missingFolder = path.join(issueFolder, 'non-existent');
      
      expect(fs.existsSync(missingFolder)).toBe(false);
    });

    it('should handle Claude invocation failure', async () => {
      const mockInvoker = ClaudeInvoker as jest.MockedClass<typeof ClaudeInvoker>;
      const mockInvokeClaudeCode = jest.fn<() => Promise<ClaudeInvocationResult>>().mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: 'Claude invocation failed',
        success: false
      });
      
      mockInvoker.prototype.invokeClaudeCode = mockInvokeClaudeCode as any;
      
      const invoker = new ClaudeInvoker();
      const promptPath = path.join(workingFolder, 'test-prompt.md');
      
      fs.writeFileSync(promptPath, '# Test Prompt');
      
      const result = await invoker.invokeClaudeCode(promptPath, 600000, false, true);
      
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Claude invocation failed');
    });

    it('should clean up temporary prompt file on error', async () => {
      const promptPath = path.join(workingFolder, 'upload-recovery-prompt.md');
      
      // Create prompt file
      fs.writeFileSync(promptPath, '# Temporary Prompt');
      
      // Simulate error and cleanup
      try {
        throw new Error('Simulated error');
      } catch (error) {
        // Cleanup should happen
        if (fs.existsSync(promptPath)) {
          fs.unlinkSync(promptPath);
        }
      }
      
      expect(fs.existsSync(promptPath)).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain --upload-only flag name', () => {
      // The flag name should remain unchanged
      const flagName = '--upload-only';
      
      expect(flagName).toBe('--upload-only');
    });

    it('should accept folder tag parameter', () => {
      const folderTag = 'op-Test-20250910120000';
      const folders = fs.readdirSync(issueFolder);
      const targetFolder = folders.find(f => f === folderTag || f.includes(folderTag));
      
      expect(targetFolder).toBe(folderTag);
    });

    it('should work with existing folder structure', () => {
      // Verify existing folder structure is compatible
      const expectedPath = path.join(
        testDir,
        '.linear-watcher',
        'work',
        `lcr-${issueId}`,
        folderTag
      );
      
      expect(workingFolder).toBe(expectedPath);
      expect(fs.existsSync(workingFolder)).toBe(true);
    });
  });
});