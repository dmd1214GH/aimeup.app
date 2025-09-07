#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigLoader } from './config';
import { uploadCommand } from './commands/upload';
import { runOperation } from './lc-runner';
import { linearApiCommand } from './commands/linear-api';

const program = new Command();

// Add linear-api subcommand
program
  .command('linear-api <action> [args...]')
  .description('Execute Linear API operations')
  .action(async (action: string, args: string[]) => {
    await linearApiCommand(action, args);
  });

// Main program definition
program
  .name('lc-runner')
  .description('Linear/ClaudeCode runner CLI for AI-assisted development')
  .version('0.0.1')
  .argument('<operation>', 'The operation name (e.g., Deliver, Task, Review)')
  .argument('<issueId>', 'The Linear issue ID (e.g., AM-25)')
  .option('--no-claude', 'Skip ClaudeCode invocation')
  .option('--claude-timeout <minutes>', 'ClaudeCode timeout in minutes')
  .option('--headed', 'Run Claude in headed/interactive mode')
  .option('--seek-permissions', 'Seek permission prompts in headed mode')
  .option('--test-mcp-failure', 'Test MCP failure handling by simulating MCP unavailability')
  .option(
    '--upload-only <folderTag>',
    'Upload existing results from working folder (e.g., op-Deliver-20250824060442)'
  )
  .option('--list-uploads [folderTag]', 'List available working folders for upload')
  .option('--dry-run', 'With --upload-only, perform validation without uploading')
  .action(async (operation: string, issueId: string, options) => {
    try {
      // Load configuration
      const configLoader = new ConfigLoader();
      const config = configLoader.loadConfig();

      // Handle --list-uploads
      if (options.listUploads !== undefined) {
        // Validate issue prefix
        if (!configLoader.validateIssuePrefix(issueId, config)) {
          console.error(
            `Error: Issue ID '${issueId}' does not match configured prefix: ${config.linear.issuePrefix}`
          );
          process.exit(1);
        }

        const repoRoot = configLoader['repoRoot'];
        const workroot = path.join(repoRoot, '.linear-watcher', 'work');
        const issueWorkFolder = path.join(workroot, `lcr-${issueId}`);

        const folderTag = typeof options.listUploads === 'string' ? options.listUploads : undefined;
        await listUploads(issueId, issueWorkFolder, folderTag);
        return;
      }

      // Validate issue prefix
      if (!configLoader.validateIssuePrefix(issueId, config)) {
        console.error(
          `Error: Issue ID '${issueId}' does not match configured prefix: ${config.linear.issuePrefix}`
        );
        process.exit(1);
      }

      // Get workroot
      const repoRoot = configLoader['repoRoot'];
      const workroot = path.join(repoRoot, '.linear-watcher', 'work');
      const issueWorkFolder = path.join(workroot, `lcr-${issueId}`);

      // Handle --upload-only
      if (options.uploadOnly) {
        await handleUploadOnly(
          operation,
          issueId,
          issueWorkFolder,
          options.uploadOnly,
          options.dryRun || false
        );
        return;
      }

      // Normal operation mode - run the operation
      await runOperation(operation, issueId, options);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Lists available working folders for upload
 */
async function listUploads(
  issueId: string,
  issueWorkFolder: string,
  folderTag?: string
): Promise<void> {
  console.log(`\nAvailable working folders for issue ${issueId}:\n`);

  if (!fs.existsSync(issueWorkFolder)) {
    console.log('No working folders found for this issue.');
    return;
  }

  const folders = fs
    .readdirSync(issueWorkFolder)
    .filter((f) => f.startsWith('op-'))
    .sort();

  if (folders.length === 0) {
    console.log('No operation folders found.');
    return;
  }

  // If specific folder tag provided, show details for that folder
  if (folderTag) {
    const folder = folders.find((f) => f === folderTag || f.includes(folderTag));
    if (!folder) {
      console.error(`Folder tag '${folderTag}' not found.`);
      console.log('\nAvailable folders:');
      folders.forEach((f) => console.log(`  - ${f}`));
      return;
    }

    const folderPath = path.join(issueWorkFolder, folder);
    console.log(`Folder: ${folder}`);
    console.log(`Path: ${folderPath}`);

    // Check for required files
    const requiredFiles = ['original-issue.md', 'updated-issue.md'];
    const operationReports = fs
      .readdirSync(folderPath)
      .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'));

    console.log('\nContents:');
    requiredFiles.forEach((file) => {
      const exists = fs.existsSync(path.join(folderPath, file));
      console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    });

    if (operationReports.length > 0) {
      console.log(`  ✓ ${operationReports.length} operation report(s):`);
      operationReports.forEach((report) => {
        console.log(`    - ${report}`);
      });
    } else {
      console.log('  ✗ No operation reports found');
    }

    // Get last modified time
    const stats = fs.statSync(folderPath);
    console.log(`\nLast modified: ${stats.mtime.toLocaleString()}`);
  } else {
    // List all folders with basic info
    folders.forEach((folder) => {
      const folderPath = path.join(issueWorkFolder, folder);
      const stats = fs.statSync(folderPath);

      // Check if it has the required files for upload
      const hasOriginal = fs.existsSync(path.join(folderPath, 'original-issue.md'));
      const hasUpdated = fs.existsSync(path.join(folderPath, 'updated-issue.md'));
      const reports = fs
        .readdirSync(folderPath)
        .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'));

      const status = hasOriginal && hasUpdated && reports.length > 0 ? '✓' : '⚠';
      console.log(`${status} ${folder} (${stats.mtime.toLocaleString()})`);
    });

    console.log('\nUse --list-uploads <folderTag> to see details for a specific folder');
    console.log('Example: pnpm lc-runner Deliver AM-25 --list-uploads op-Deliver-20250824060442');
  }
}

/**
 * Handles the --upload-only option
 */
async function handleUploadOnly(
  operation: string,
  issueId: string,
  issueWorkFolder: string,
  folderTag: string,
  dryRun: boolean
): Promise<void> {
  // Find the working folder
  if (!fs.existsSync(issueWorkFolder)) {
    console.error(`Error: No working folders found for issue ${issueId}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(issueWorkFolder).filter((f) => f.startsWith('op-'));
  const targetFolder = folders.find((f) => f === folderTag || f.includes(folderTag));

  if (!targetFolder) {
    console.error(`Error: Working folder '${folderTag}' not found for issue ${issueId}`);
    console.log('\nAvailable folders:');
    folders.forEach((f) => console.log(`  - ${f}`));
    console.log('\nUse --list-uploads to see all available folders');
    process.exit(1);
  }

  const workingFolderPath = path.join(issueWorkFolder, targetFolder);

  // Validate the folder has required files
  const requiredFiles = ['original-issue.md', 'updated-issue.md'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(workingFolderPath, file))) {
      console.error(`Error: Required file '${file}' not found in working folder`);
      process.exit(1);
    }
  }

  // Check for operation reports
  const reports = fs
    .readdirSync(workingFolderPath)
    .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'));

  if (reports.length === 0) {
    console.error('Error: No operation reports found in working folder');
    console.error('Cannot upload without at least one operation report');
    process.exit(1);
  }

  console.log(`\nUploading from: ${targetFolder}`);
  console.log(`Full path: ${workingFolderPath}`);

  if (dryRun) {
    console.log('\n[DRY RUN MODE] - Validation only, no actual upload\n');
  }

  // Run the upload command
  try {
    await uploadCommand(issueId, operation, workingFolderPath, { dryRun });
  } catch (error) {
    console.error('Upload failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Process arguments with default arguments from config
function processArgumentsWithDefaults(): string[] {
  const args = process.argv.slice(0, 2); // Keep node and script path
  const userArgs = process.argv.slice(2); // Get user-provided arguments

  // If no arguments or help requested, return as-is
  if (userArgs.length === 0 || userArgs.includes('--help') || userArgs.includes('-h')) {
    return process.argv;
  }

  // First two non-option arguments should be operation and issueId
  let operation: string | undefined;
  let issueId: string | undefined;

  for (const arg of userArgs) {
    if (!arg.startsWith('-')) {
      if (!operation) {
        operation = arg;
      } else if (!issueId) {
        issueId = arg;
        break;
      }
    }
  }

  // If we have operation and issueId, check for default arguments
  if (operation && issueId) {
    try {
      const configLoader = new ConfigLoader();
      const config = configLoader.loadConfig();

      // Find operation config by name
      const operationConfig = Object.values(config['lc-runner-operations']).find(
        (op: any) => op.operationName === operation
      );

      if (operationConfig && operationConfig.defaultArguments) {
        // Parse default arguments
        const defaultArgs = operationConfig.defaultArguments
          .split(/\s+/)
          .filter((arg) => arg.length > 0);

        // Reconstruct arguments: operation, issueId, defaults, then user options
        const userOptions = userArgs.filter((arg) => arg !== operation && arg !== issueId);

        // Merge defaults with user options (user options override defaults)
        const finalArgs = [...args, operation, issueId];

        // Add default arguments that aren't already specified by user
        for (const defaultArg of defaultArgs) {
          if (!userOptions.includes(defaultArg)) {
            finalArgs.push(defaultArg);
          }
        }

        // Add remaining user options
        finalArgs.push(...userOptions);

        return finalArgs;
      }
    } catch {
      // If config loading fails, just use original arguments
      // The error will be properly reported when the action runs
    }
  }

  return process.argv;
}

// Parse arguments with defaults
const processedArgs = processArgumentsWithDefaults();
program.parse(processedArgs);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}
