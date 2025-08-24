#!/usr/bin/env node

import { Command } from 'commander';
import { uploadCommand, listWorkingFolders } from './commands/upload';

const program = new Command();

// Main program definition
program
  .name('lc-runner')
  .description('Linear/ClaudeCode runner CLI for AI-assisted development')
  .version('0.0.1');

// Upload command
program
  .command('upload <issueId> <operation> [workingFolder]')
  .description('Upload operation results to Linear')
  .option('--dry-run', 'Perform validation only without uploading')
  .action(
    async (issueId: string, operation: string, workingFolder: string | undefined, options) => {
      await uploadCommand(issueId, operation, workingFolder, options);
    }
  );

// List command for available working folders
program
  .command('list [issueId]')
  .description('List available working folders for upload')
  .action(async (issueId: string | undefined) => {
    await listWorkingFolders(issueId);
  });

// Legacy operation execution (default action for backwards compatibility)
program
  .argument('[operation]', 'The operation name to execute')
  .argument('[issueId]', 'The Linear issue ID')
  .argument('[workingFolder]', 'Working folder path (required with --upload-only)')
  .option('--no-claude', 'Skip ClaudeCode invocation')
  .option('--claude-timeout <minutes>', 'ClaudeCode timeout in minutes')
  .option('--headed', 'Run Claude in headed/interactive mode')
  .option('--seek-permissions', 'Seek permission prompts in headed mode')
  .option('--upload-only', 'Only upload existing results to Linear (requires workingFolder)')
  .action(
    async (
      operation: string | undefined,
      issueId: string | undefined,
      workingFolder: string | undefined,
      options
    ) => {
      // Handle upload-only mode
      if (options.uploadOnly) {
        if (!operation || !issueId || !workingFolder) {
          console.error(
            'Error: --upload-only requires all three arguments: <operation> <issueId> <workingFolder>'
          );
          console.error(
            'Example: pnpm lc-runner Deliver AM-25 /path/to/working/folder --upload-only'
          );
          process.exit(1);
        }

        // Import and run the upload command directly
        const { uploadCommand } = await import('./commands/upload');
        await uploadCommand(issueId, operation, workingFolder, {});
        return;
      }

      // Normal operation mode
      if (operation && issueId && !workingFolder) {
        // Import and run the legacy command
        const { runOperation } = await import('./lc-runner');
        await runOperation(operation, issueId, options);
      } else if (!operation || !issueId) {
        // Show help if insufficient arguments
        program.outputHelp();
        process.exit(1);
      } else {
        console.error('Error: Working folder should only be provided with --upload-only flag');
        process.exit(1);
      }
    }
  );

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}
