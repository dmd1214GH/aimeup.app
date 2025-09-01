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
    // Use provided path or default to claude in PATH
    // Don't use hardcoded host paths that won't work in Docker
    this.claudePath = claudePath || 'claude';

    // Only check file existence if a specific path was provided
    if (claudePath && !fs.existsSync(this.claudePath)) {
      // Fall back to PATH if provided path doesn't exist
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

    // Read prompt content for size reporting
    const promptContent = fs.readFileSync(masterPromptPath, 'utf8');

    // Common setup
    console.log('Using direct file reference (optimization: no temp file created)');
    const readFileInstruction = `Please read and execute the instructions in ${masterPromptPath}`;

    // Build command arguments based on mode
    const args: string[] = [];

    if (!headed) {
      args.push('--print');
    }

    if (skipPermissions) {
      args.push('--dangerously-skip-permissions');
    }

    if (!headed && process.env.VERBOSE) {
      args.push('--verbose');
    }

    // Add the file read instruction to args
    args.push(readFileInstruction);

    // Mode-specific logging
    if (headed) {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║     Running Claude in HEADED/INTERACTIVE mode         ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('This allows you to see what Claude is doing in real-time.');
      console.log('Prompt file:', masterPromptPath);
      console.log('Prompt size:', promptContent.length, 'characters');
      console.log('\nStarting Claude with piped prompt content...');
      console.log('You will see the Claude interface directly.');
      console.log('─'.repeat(60));
      console.log(
        `Running Claude with flags: ${skipPermissions ? '--dangerously-skip-permissions' : '(no flags)'}`
      );
      console.log('Note: Type "exit" or press Ctrl+D when tasks are complete.');
    } else {
      console.log(`\n╔════════════════════════════════════════════════════════╗`);
      console.log(`║     Starting Claude in HEADLESS mode (automated)      ║`);
      console.log(`╚════════════════════════════════════════════════════════╝`);
      console.log(`Prompt file: ${masterPromptPath} (${promptContent.length} characters)`);
      console.log(`Using flags: ${args.slice(0, -1).join(' ')}`); // Don't show the instruction in flags
      if (timeoutMs) {
        console.log(`Timeout: ${timeoutMs / 60000} minutes`);
      } else {
        console.log(`Timeout: None (will run until completion)`);
      }
      console.log(`Claude reading prompt from: ${masterPromptPath}`);
      console.log(`─`.repeat(60));
    }

    // Spawn ClaudeCode process with appropriate stdio configuration
    const claudeProcess = spawn(this.claudePath, args, {
      stdio: headed ? 'inherit' : ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
      shell: false,
    });

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let processExited = false;
      let timeoutHandle: NodeJS.Timeout | undefined;

      // Set timeout if provided (headless only)
      if (!headed && timeoutMs) {
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

      // Handle stdout/stderr for headless mode
      if (!headed) {
        claudeProcess.stdout?.on('data', (data) => {
          const chunk = data.toString();
          stdout += chunk;
          process.stdout.write(chunk);
        });

        claudeProcess.stderr?.on('data', (data) => {
          const chunk = data.toString();
          stderr += chunk;
          process.stderr.write(chunk);
        });

        // Close stdin as we're passing prompt via file instruction
        claudeProcess.stdin?.end();
      }

      // Handle process completion
      claudeProcess.on('close', (code) => {
        processExited = true;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        console.log(`─`.repeat(60));

        // Handle null exit code (process was killed or terminated abnormally)
        if (code === null) {
          console.log(`Claude process terminated abnormally (exit code: null)`);
          console.log(`This may happen if the process was killed or crashed`);
          resolve({
            exitCode: 1,
            stdout: headed ? 'Interactive mode - output shown in terminal' : stdout,
            stderr: headed
              ? 'Process terminated abnormally with null exit code'
              : stderr || 'Process terminated abnormally with null exit code',
            success: false,
          });
        } else {
          console.log(`Claude process exited with code ${code}`);
          resolve({
            exitCode: code || 0,
            stdout: headed ? 'Interactive mode - output shown in terminal' : stdout,
            stderr: headed ? (code !== 0 ? `Process exited with code ${code}` : '') : stderr,
            success: code === 0,
          });
        }
      });

      // Handle process errors
      claudeProcess.on('error', (error) => {
        processExited = true;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        if (headed) {
          console.error('─'.repeat(60));
          console.error('Claude process error:', error.message);
        } else {
          console.error(`[ClaudeInvoker] Process error: ${error.message}`);
        }

        resolve({
          exitCode: 1,
          stdout: headed ? '' : stdout,
          stderr: headed ? error.message : `Failed to spawn ClaudeCode process: ${error.message}`,
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
