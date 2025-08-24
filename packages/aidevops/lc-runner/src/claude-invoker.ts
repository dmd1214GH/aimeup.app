import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';

export interface ClaudeInvocationResult {
  exitCode?: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

export class ClaudeInvoker {
  private claudePath: string;

  constructor(claudePath?: string) {
    // Use provided path or default to the standard location
    this.claudePath = claudePath || '/Users/dougdanoff/.claude/local/claude';

    // Also check if it's available in PATH
    if (!fs.existsSync(this.claudePath)) {
      // Try to find claude in PATH
      this.claudePath = 'claude';
    }
  }

  /**
   * Invokes ClaudeCode CLI in headless or headed mode
   * @param masterPromptPath Path to the master prompt file
   * @param timeoutMs Optional timeout in milliseconds (no timeout if undefined)
   * @param headed Optional flag to run in headed/interactive mode for debugging
   * @param skipPermissions Optional flag to skip permission prompts (default: true in headed mode)
   * @returns Promise resolving to invocation result
   */
  async invokeClaudeCode(
    masterPromptPath: string,
    timeoutMs?: number,
    headed: boolean = false,
    skipPermissions: boolean = true
  ): Promise<ClaudeInvocationResult> {
    // Validate master prompt file exists
    if (!fs.existsSync(masterPromptPath)) {
      return Promise.resolve({
        exitCode: 1,
        stdout: '',
        stderr: `Master prompt file not found: ${masterPromptPath}`,
        success: false,
      });
    }

    // If in headed mode, run interactively but pipe the prompt content
    if (headed) {
      const promptContent = fs.readFileSync(masterPromptPath, 'utf8');

      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║     Running Claude in HEADED/INTERACTIVE mode         ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('This allows you to see what Claude is doing in real-time.');
      console.log('Prompt file:', masterPromptPath);
      console.log('Prompt size:', promptContent.length, 'characters');
      console.log('\nStarting Claude with piped prompt content...');
      console.log('You will see the Claude interface directly.');
      console.log('─'.repeat(60));

      // Build command arguments WITHOUT --print for interactive mode
      const args = [];
      if (skipPermissions) {
        args.push('--dangerously-skip-permissions');
      }

      console.log(
        `Running Claude with flags: ${skipPermissions ? '--dangerously-skip-permissions' : '(no flags)'}`
      );
      console.log('Note: Type "exit" or press Ctrl+D when tasks are complete.');

      // Run Claude interactively and pipe the prompt content
      const claudeProcess = spawn(this.claudePath, args, {
        stdio: ['pipe', 'inherit', 'inherit'], // pipe stdin, inherit stdout/stderr for TTY
        env: { ...process.env },
        shell: false,
      });

      // Write the prompt content to stdin
      console.log('Piping prompt content to Claude...');
      claudeProcess.stdin.write(promptContent);
      claudeProcess.stdin.end();

      return new Promise((resolve) => {
        claudeProcess.on('close', (code) => {
          console.log('─'.repeat(60));
          console.log(`Claude process exited with code ${code}`);
          resolve({
            exitCode: code || 0,
            stdout: 'Interactive mode - output shown in terminal',
            stderr: code !== 0 ? `Process exited with code ${code}` : '',
            success: code === 0,
          });
        });

        claudeProcess.on('error', (error) => {
          console.error('─'.repeat(60));
          console.error('Claude process error:', error.message);
          resolve({
            stdout: '',
            stderr: error.message,
            success: false,
          });
        });
      });
    }

    // Original headless mode with --print flag
    return new Promise((resolve) => {
      // Read the master prompt content
      const promptContent = fs.readFileSync(masterPromptPath, 'utf8');

      // Build args for headless mode
      const args = ['--print'];
      if (skipPermissions) {
        args.push('--dangerously-skip-permissions');
      }
      // Add verbose flag to potentially see more output
      if (process.env.VERBOSE) {
        args.push('--verbose');
      }

      console.log(`\n╔════════════════════════════════════════════════════════╗`);
      console.log(`║     Starting Claude in HEADLESS mode (automated)      ║`);
      console.log(`╚════════════════════════════════════════════════════════╝`);
      console.log(`Prompt size: ${promptContent.length} characters`);
      console.log(`Using flags: ${args.join(' ')}`);
      if (timeoutMs) {
        console.log(`Timeout: ${timeoutMs / 60000} minutes`);
      } else {
        console.log(`Timeout: None (will run until completion)`);
      }

      // Spawn ClaudeCode process with --print flag for headless mode
      const claudeProcess = spawn(this.claudePath, args, {
        stdio: ['pipe', 'pipe', 'pipe'], // Explicitly set stdio for pipes
        env: { ...process.env },
        shell: false,
      });

      let stdout = '';
      let stderr = '';
      let processExited = false;

      // Set timeout if provided
      let timeoutHandle: NodeJS.Timeout | undefined;
      if (timeoutMs) {
        timeoutHandle = setTimeout(() => {
          if (!processExited) {
            console.error(`\nClaudeCode timed out after ${timeoutMs / 60000} minutes`);
            claudeProcess.kill('SIGTERM');
            resolve({
              exitCode: 1,
              stdout,
              stderr: stderr + `\nProcess timed out after ${timeoutMs / 60000} minutes`,
              success: false,
            });
          }
        }, timeoutMs);
      }

      // Capture stdout and stream to console in real-time
      claudeProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        // Stream output to console in real-time
        process.stdout.write(chunk);
      });

      // Capture stderr and show errors
      claudeProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        // Show errors in real-time
        process.stderr.write(chunk);
      });

      // Write the prompt content to stdin
      console.log(`Sending prompt to Claude...`);
      console.log(`─`.repeat(60));
      claudeProcess.stdin.write(promptContent);
      claudeProcess.stdin.end();

      // Handle process completion
      claudeProcess.on('close', (code) => {
        processExited = true;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        console.log(`─`.repeat(60));
        console.log(`Claude process exited with code ${code}`);
        resolve({
          exitCode: code || 0,
          stdout,
          stderr,
          success: code === 0,
        });
      });

      // Handle process errors
      claudeProcess.on('error', (error) => {
        processExited = true;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        console.error(`[ClaudeInvoker] Process error: ${error.message}`);
        resolve({
          exitCode: 1,
          stdout,
          stderr: `Failed to spawn ClaudeCode process: ${error.message}`,
          success: false,
        });
      });
    });
  }

  /**
   * Checks if ClaudeCode CLI is available
   * @returns true if ClaudeCode CLI can be executed
   */
  isClaudeCodeAvailable(): boolean {
    try {
      // Try to check if the claude command exists
      if (this.claudePath === 'claude') {
        // It's in PATH, try to execute with --version
        const result = spawnSync(this.claudePath, ['--version'], {
          encoding: 'utf8',
          shell: false,
        });
        return result.status === 0;
      } else {
        // Check if the file exists
        return fs.existsSync(this.claudePath);
      }
    } catch {
      return false;
    }
  }
}
