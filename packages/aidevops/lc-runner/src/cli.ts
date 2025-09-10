#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigLoader } from './config';
import { uploadCommand } from './commands/upload';
import { runOperation } from './lc-runner';
import { ClaudeInvoker } from './claude-invoker';

const program = new Command();

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
  .option('--upload-headed', 'With --upload-only, run Claude in headed mode for debugging')
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
          options.dryRun || false,
          options.testMcpFailure || false,
          options.uploadHeaded || false
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
      let exists = fs.existsSync(path.join(folderPath, file));
      // Also check for locked version of updated-issue.md
      if (!exists && file === 'updated-issue.md') {
        exists = fs.existsSync(path.join(folderPath, 'updated-issue.md.LOCKED-CHECK-REVERSION-PROTOCOL'));
        if (exists) {
          console.log(`  ✓ ${file} (locked)`);
          return;
        }
      }
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
      let hasUpdated = fs.existsSync(path.join(folderPath, 'updated-issue.md'));
      const hasLocked = fs.existsSync(path.join(folderPath, 'updated-issue.md.LOCKED-CHECK-REVERSION-PROTOCOL'));
      
      // Consider locked file as valid updated-issue.md
      if (!hasUpdated && hasLocked) {
        hasUpdated = true;
      }
      
      const reports = fs
        .readdirSync(folderPath)
        .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'));

      const status = hasOriginal && hasUpdated && reports.length > 0 ? '✓' : '⚠';
      const lockIndicator = hasLocked ? ' [LOCKED]' : '';
      console.log(`${status} ${folder}${lockIndicator} (${stats.mtime.toLocaleString()})`);
    });

    console.log('\nUse --list-uploads <folderTag> to see details for a specific folder');
    console.log('Example: pnpm lc-runner Deliver AM-25 --list-uploads op-Deliver-20250824060442');
  }
}

/**
 * Handles the --upload-only option using Claude invocation
 */
async function handleUploadOnly(
  operation: string,
  issueId: string,
  issueWorkFolder: string,
  folderTag: string,
  dryRun: boolean,
  testMode: boolean,
  headed: boolean = false
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
  // Check for locked version of updated-issue.md and rename if needed
  const lockedFileName = 'updated-issue.md.LOCKED-CHECK-REVERSION-PROTOCOL';
  const normalFileName = 'updated-issue.md';
  const lockedFilePath = path.join(workingFolderPath, lockedFileName);
  const normalFilePath = path.join(workingFolderPath, normalFileName);
  
  if (fs.existsSync(lockedFilePath) && !fs.existsSync(normalFilePath)) {
    // Rename the locked file back to normal name for upload processing
    console.log(`Found locked issue file, renaming for upload processing...`);
    fs.renameSync(lockedFilePath, normalFilePath);
    console.log(`  ✓ Renamed ${lockedFileName} to ${normalFileName}`);
  }
  
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
    // In dry run mode, just list what would be uploaded
    console.log('Would upload the following files:');
    console.log(`  - updated-issue.md`);
    reports.forEach((report) => {
      console.log(`  - ${report}`);
    });
    return;
  }

  // Get config for repo root
  const configLoader = new ConfigLoader();
  const repoRoot = configLoader['repoRoot'];
  
  // Check that the command file exists
  const commandFilePath = path.join(repoRoot, '.claude/commands/lc-upload-files.md');
  if (!fs.existsSync(commandFilePath)) {
    console.error(`Error: Command file not found at ${commandFilePath}`);
    console.error('Ensure the aime-aidev package postinstall has been run');
    process.exit(1);
  }
  
  // Create master prompt for upload recovery
  const masterPromptPath = path.join(workingFolderPath, 'upload-recovery-master-prompt.md');
  
  // Use the simpler approach - tell Claude to read the command file directly
  // This avoids embedding the entire content and lets us test if the "hanging" was real
  const masterPromptContent = `# Linear Upload Recovery Operation

## CRITICAL: This is an UPLOAD-ONLY Recovery Operation
**DO NOT START A NEW OPERATION OR CREATE NEW FILES**
- You are ONLY uploading EXISTING files from a PREVIOUS operation
- Do NOT create any new operation-report-*.md files
- Do NOT start a new grooming or delivery operation
- ONLY upload existing files that were already created

## Context
You are performing an upload recovery operation for failed Linear uploads.

## Instructions
Please read and execute the upload recovery instructions in: ${commandFilePath}

## Operation Parameters
Pass these parameters to the command:
- **workingFolder**: ${workingFolderPath}
- **issueId**: ${issueId}
- **operation**: ${operation}
- **testMode**: ${testMode}

## Expected Response
The command file will instruct you to return a structured response. Please follow its format exactly.`;

  fs.writeFileSync(masterPromptPath, masterPromptContent);
  console.log(`Created upload recovery master prompt at: ${masterPromptPath}`);

  try {
    // Use ClaudeInvoker to execute the recovery - exactly like lc-runner does
    const invoker = new ClaudeInvoker();
    console.log(`Invoking Claude to process upload recovery${headed ? ' (headed mode)' : ''}...`);
    
    const result = await invoker.invokeClaudeCode(
      masterPromptPath,
      600000, // 10 minute timeout
      headed,  // use the headed parameter
      true    // skip permissions
    );

    // Parse the structured response
    if (result.success) {
      const output = result.stdout;
      
      // Look for the structured response markers
      if (output.includes('RECOVERY_STATUS: SUCCESS')) {
        const uploadedMatch = output.match(/UPLOADED_FILES: (\d+)/);
        const uploadedCount = uploadedMatch ? uploadedMatch[1] : 'unknown';
        console.log(`\n✅ Upload recovery successful! Uploaded ${uploadedCount} file(s)`);
        
        // Extract and display details if available
        const detailsMatch = output.match(/DETAILS:\n([\s\S]*?)(?:\n\n|$)/);
        if (detailsMatch) {
          console.log('\nUploaded files:');
          console.log(detailsMatch[1]);
        }
      } else if (output.includes('RECOVERY_STATUS: FAILED')) {
        const errorMatch = output.match(/ERROR: (.+)/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Unknown error';
        console.error(`\n❌ Upload recovery failed: ${errorMsg}`);
        
        const failedFileMatch = output.match(/FAILED_FILE: (.+)/);
        if (failedFileMatch) {
          console.error(`Failed on file: ${failedFileMatch[1]}`);
        }
        
        process.exit(1);
      } else if (output.includes('RECOVERY_STATUS: TEST_MODE')) {
        const simulatedMatch = output.match(/SIMULATED_UPLOADS: (\d+)/);
        const simulatedCount = simulatedMatch ? simulatedMatch[1] : 'unknown';
        console.log(`\n🧪 Test mode: Would upload ${simulatedCount} file(s)`);
        
        // Extract and display details if available
        const detailsMatch = output.match(/DETAILS:\n([\s\S]*?)(?:\n\n|$)/);
        if (detailsMatch) {
          console.log('\nWould upload:');
          console.log(detailsMatch[1]);
        }
      } else {
        // Couldn't parse the response
        console.error('Warning: Could not parse Claude response. Check output above for details.');
      }
    } else {
      console.error('Upload recovery failed:', result.stderr || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    console.error('Upload failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    // Clean up the temporary master prompt file
    if (fs.existsSync(masterPromptPath)) {
      fs.unlinkSync(masterPromptPath);
    }
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
