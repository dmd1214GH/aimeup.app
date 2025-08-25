#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigLoader } from './config';
import { LinearClient } from './linear-client';
import { WorkingFolderManager } from './working-folder';
import { OperationLogger } from './operation-logger';
import { PromptAssembler } from './prompt-assembler';
import { ClaudeInvoker } from './claude-invoker';
import { OutputManager } from './output-manager';
import { uploadCommand } from './commands/upload';

/**
 * Runs a Linear/ClaudeCode operation
 */
export async function runOperation(operation: string, issueId: string, options: any) {
  let workingFolderPath: string | undefined;

  try {
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig();

    // Get operation mapping from CLI operation name
    const operationMapping = configLoader.getOperationByCliName(operation, config);
    if (!operationMapping) {
      const validOperations = Object.values(config['lc-runner-operations'])
        .map((op) => op.operationName)
        .join(', ');
      console.error(`Error: Invalid operation '${operation}'.`);
      console.error(`Valid operations are: ${validOperations}`);
      process.exit(1);
    }

    // Validate issue ID prefix
    if (!configLoader.validateIssuePrefix(issueId, config)) {
      console.error(`Error: Issue ID '${issueId}' does not match configured prefix.`);
      console.error(`Expected prefix: ${config.linear.issuePrefix}`);
      process.exit(1);
    }

    // Validate prompt files exist
    try {
      configLoader.validatePromptFiles(config);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }

    // Get the workroot from config - use ConfigLoader's repo root finding logic
    const repoRoot = configLoader['repoRoot'];
    const workroot = path.join(repoRoot, '.linear-watcher', 'work');

    // Create WorkingFolder first (so we have a place to log issues)
    const folderManager = new WorkingFolderManager(workroot);
    workingFolderPath = folderManager.createWorkingFolder(issueId, operation);
    console.log(`Created working folder: ${workingFolderPath}`);

    const folderName = folderManager.generateFolderName(issueId, operation);

    // Initialize Linear client and validate issue status
    const linearClient = new LinearClient(config.linear);
    let issueStatus = false;
    let validationError: string | null = null;

    try {
      issueStatus = await linearClient.validateIssueStatus(
        issueId,
        operationMapping.linearIssueStatus
      );
    } catch (error) {
      // Handle validation errors (e.g., network issues, API errors)
      validationError = error instanceof Error ? error.message : 'Unknown validation error';
      issueStatus = false;
    }

    if (!issueStatus) {
      const errorMessage =
        validationError ||
        `Issue ${issueId} is not in the required status '${operationMapping.linearIssueStatus}' for operation '${operation}'.`;

      // Log the validation failure
      const logger = new OperationLogger(workroot);
      const failureLogEntry = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation,
        status: validationError ? 'Blocked - Validation Error' : 'Blocked - Wrong Status',
        folderPath: folderName,
      };
      logger.appendLogEntry(issueId, failureLogEntry);

      console.error(`Error: ${errorMessage}`);
      console.log(`Operation marked as blocked in: ${workingFolderPath}`);
      process.exit(1);
    }

    // Append to operation log
    const logger = new OperationLogger(workroot);
    const logEntry = {
      timestamp: OperationLogger.getCurrentTimestamp(),
      operation,
      status: 'Started',
      folderPath: folderName,
    };
    logger.appendLogEntry(issueId, logEntry);
    console.log(`Appended entry to operation log`);

    // Extract issue body from Linear
    console.log(`Extracting issue body from Linear...`);
    let issueBody = '';

    try {
      const issue = await linearClient.getIssue(issueId);

      // Format the full issue content with metadata
      const fullIssueContent = `# ${issue.title}

${issue.description}

## Metadata
- URL: ${issue.url}
- Identifier: ${issue.identifier}
- Status: ${issue.status}
- Priority: ${issue.priority ? `Priority ${issue.priority}` : 'No priority'}
- Assignee: ${issue.assignee || 'Unassigned'}
- Created: ${issue.createdAt}
- Updated: ${issue.updatedAt}
`;

      // Save to original-issue.md
      const originalIssuePath = path.join(workingFolderPath, 'original-issue.md');
      fs.writeFileSync(originalIssuePath, fullIssueContent, 'utf8');
      console.log(`Saved original issue to: ${originalIssuePath}`);

      // Create exact copy as updated-issue.md
      const updatedIssuePath = path.join(workingFolderPath, 'updated-issue.md');
      fs.writeFileSync(updatedIssuePath, fullIssueContent, 'utf8');
      console.log(`Created working copy at: ${updatedIssuePath}`);

      // Store for use in prompt
      issueBody = fullIssueContent;

      // Log successful extraction
      const extractionLogEntry = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation,
        status: 'Issue Extracted',
        folderPath: folderName,
      };
      logger.appendLogEntry(issueId, extractionLogEntry);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to extract issue from Linear: ${errorMessage}`);

      // Log extraction failure
      const failureLogEntry = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation,
        status: 'Issue Extraction Failed',
        folderPath: folderName,
        error: errorMessage,
      };
      logger.appendLogEntry(issueId, failureLogEntry);

      // Continue with empty issue body to maintain backwards compatibility
      console.warn('Continuing with empty issue body...');
    }

    // Assemble master prompt
    const promptAssembler = new PromptAssembler();
    const generalPromptPath = path.join(
      repoRoot,
      '.linear-watcher',
      'prompts',
      config.generalPrompt
    );
    const operationPromptPath = path.join(
      repoRoot,
      '.linear-watcher',
      'prompts',
      operationMapping.promptFile
    );
    const masterPromptPath = path.join(workingFolderPath, 'master-prompt.md');

    const replacements = {
      issueId,
      operation,
      workingFolder: workingFolderPath,
    };

    promptAssembler.assembleMasterPrompt(
      generalPromptPath,
      operationPromptPath,
      replacements,
      masterPromptPath
    );
    console.log(`Assembled master prompt at: ${masterPromptPath}`);

    // Invoke ClaudeCode in headless mode (unless disabled)
    if (!options.claude) {
      console.log(`\nSkipping ClaudeCode invocation (--no-claude flag set)`);
    } else {
      console.log(
        `\nInvoking ClaudeCode${options.headed ? ' in headed/interactive mode' : ' in headless mode'}...`
      );
      const claudeInvoker = new ClaudeInvoker();

      // Check if ClaudeCode is available
      if (!claudeInvoker.isClaudeCodeAvailable()) {
        console.warn('ClaudeCode CLI not found. Skipping automatic invocation.');
        console.log('To enable automatic invocation, ensure ClaudeCode CLI is installed.');

        // Update operation log
        const skipEntry = {
          timestamp: OperationLogger.getCurrentTimestamp(),
          operation,
          status: 'ClaudeCode Skipped - CLI Not Found',
          folderPath: folderName,
        };
        logger.appendLogEntry(issueId, skipEntry);
      } else {
        try {
          // Log ClaudeCode invocation start
          const invocationStartEntry = {
            timestamp: OperationLogger.getCurrentTimestamp(),
            operation,
            status: 'ClaudeCode Invocation Started',
            folderPath: folderName,
          };
          logger.appendLogEntry(issueId, invocationStartEntry);

          // Invoke ClaudeCode with optional timeout
          const timeoutMs = options.claudeTimeout
            ? parseInt(options.claudeTimeout, 10) * 60 * 1000
            : undefined;
          const invocationResult = await claudeInvoker.invokeClaudeCode(
            masterPromptPath,
            timeoutMs,
            options.headed,
            !options.seekPermissions // Skip permissions by default, unless --seek-permissions is used
          );

          if (invocationResult.success) {
            console.log('ClaudeCode execution completed successfully.');

            // Wait a moment for files to be fully written to disk
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Debug: List files BEFORE creating OutputManager
            console.log(`DEBUG: Checking for operation reports in: ${workingFolderPath}`);
            const filesInFolder = fs.readdirSync(workingFolderPath);
            const reportFiles = filesInFolder.filter(f => f.startsWith('operation-report-') && f.endsWith('.md'));
            if (reportFiles.length > 0) {
              console.log(`DEBUG: Found ${reportFiles.length} operation report file(s): ${reportFiles.join(', ')}`);
            } else {
              console.log(`DEBUG: No operation report files found!`);
              console.log(`DEBUG: All files in folder: ${filesInFolder.join(', ')}`);
            }

            // Create output manager to check for operation reports
            const outputManager = new OutputManager(workingFolderPath);

            // Get status from operation-report files written by Claude
            const operationStatus = outputManager.getLatestOperationStatus();
            console.log(`DEBUG: OutputManager.getLatestOperationStatus() returned: ${operationStatus}`);

            // Determine the final status
            let finalStatus: 'Completed' | 'Blocked' | 'Failed';
            if (operationStatus !== 'Unknown') {
              finalStatus = operationStatus;
            } else {
              // Fallback: if no operation report found, assume success based on exit code
              finalStatus = 'Completed';
              console.log('No operation-report found, assuming success based on exit code.');
            }

            // Log ClaudeCode completion
            const completionStatus =
              finalStatus === 'Completed'
                ? 'ClaudeCode Completed'
                : finalStatus === 'Blocked'
                  ? 'ClaudeCode Blocked'
                  : 'ClaudeCode Failed';

            const claudeCompletionEntry = {
              timestamp: OperationLogger.getCurrentTimestamp(),
              operation,
              status: completionStatus,
              folderPath: folderName,
            };
            logger.appendLogEntry(issueId, claudeCompletionEntry);

            console.log(`ClaudeCode status: ${finalStatus}`);
            
            // Auto-upload to Linear if operation completed or was blocked
            if (finalStatus === 'Completed' || finalStatus === 'Blocked') {
              console.log('\nAutomatically uploading results to Linear...');
              try {
                await uploadCommand(issueId, operation, workingFolderPath);
                console.log('Upload to Linear completed successfully!');
              } catch (uploadError) {
                console.error('Failed to upload to Linear:', uploadError instanceof Error ? uploadError.message : 'Unknown error');
                console.log(`You can manually upload later using: pnpm lc-runner ${operation} ${issueId} --upload-only ${folderName}`);
              }
            }
          } else {
            console.error('ClaudeCode execution failed.');
            if (invocationResult.stderr) {
              console.error('Error output:', invocationResult.stderr);
            }

            // Log failure
            const failureEntry = {
              timestamp: OperationLogger.getCurrentTimestamp(),
              operation,
              status: 'ClaudeCode Failed',
              folderPath: folderName,
              error: invocationResult.stderr || 'Unknown error',
            };
            logger.appendLogEntry(issueId, failureEntry);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error invoking ClaudeCode: ${errorMessage}`);

          // Log error
          const errorEntry = {
            timestamp: OperationLogger.getCurrentTimestamp(),
            operation,
            status: 'ClaudeCode Error',
            folderPath: folderName,
            error: errorMessage,
          };
          logger.appendLogEntry(issueId, errorEntry);
        }
      }
    }

    // Update operation log with completion
    const completionEntry = {
      timestamp: OperationLogger.getCurrentTimestamp(),
      operation,
      status: 'Completed',
      folderPath: folderName,
    };
    logger.appendLogEntry(issueId, completionEntry);

    // Success message
    console.log(`\nOperation completed successfully!`);
    console.log(`Issue: ${issueId}`);
    console.log(`Operation: ${operation}`);
    console.log(`Working folder: ${workingFolderPath}`);
    console.log(`Master prompt: ${masterPromptPath}`);
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

// Legacy CLI support - only run if executed directly
if (require.main === module) {
  const program = new Command();

  program
    .name('lc-runner')
    .description('Linear/ClaudeCode runner CLI for AI-assisted development')
    .version('0.0.1')
    .argument('<operation>', 'The operation name to execute')
    .argument('<issueId>', 'The Linear issue ID')
    .option('--no-claude', 'Skip ClaudeCode invocation')
    .option(
      '--claude-timeout <minutes>',
      'ClaudeCode timeout in minutes (no timeout if not specified)'
    )
    .option('--headed', 'Run Claude in headed/interactive mode for debugging')
    .option(
      '--seek-permissions',
      'Seek permission prompts in headed mode (default: skip permissions)'
    )
    .action(runOperation);

  // Parse arguments
  program.parse(process.argv);

  // Show help if no arguments provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(1);
  }
}
