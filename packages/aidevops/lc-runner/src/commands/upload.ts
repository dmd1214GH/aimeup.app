import * as path from 'path';
import * as fs from 'fs';
import { ConfigLoader } from '../config';
import { LinearClient } from '../linear-client';
import { UploadOrchestrator } from '../upload-orchestrator';
import { OperationLogger } from '../operation-logger';

export interface UploadCommandOptions {
  dryRun?: boolean;
}

/**
 * Removes any UploadPrecheck operation reports from the working folder
 * These are artifacts from previous upload attempts and should not affect new uploads
 */
function cleanupUploadPrecheckReports(workingFolder: string): void {
  if (!fs.existsSync(workingFolder)) {
    return;
  }

  const files = fs.readdirSync(workingFolder);
  const precheckReports = files.filter(
    (f) => f.startsWith('operation-report-UploadPrecheck-') && f.endsWith('.md')
  );

  if (precheckReports.length > 0) {
    console.log(
      `Cleaning up ${precheckReports.length} UploadPrecheck report(s) from previous attempts...`
    );
    precheckReports.forEach((report) => {
      const filePath = path.join(workingFolder, report);
      try {
        fs.unlinkSync(filePath);
        console.log(`  ✓ Removed ${report}`);
      } catch (error) {
        console.warn(
          `  ⚠ Failed to remove ${report}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }
}

/**
 * Executes the upload command to push operation results to Linear
 */
export async function uploadCommand(
  issueId: string,
  operation: string,
  workingFolder?: string,
  options: UploadCommandOptions = {}
): Promise<void> {
  try {
    console.log('Starting Linear upload process...');
    console.log(`Issue: ${issueId}`);
    console.log(`Operation: ${operation}`);

    // Load configuration
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig();

    // Validate issue ID prefix
    if (!configLoader.validateIssuePrefix(issueId, config)) {
      throw new Error(
        `Issue ID '${issueId}' does not match configured prefix: ${config.linear.issuePrefix}`
      );
    }

    // Get the workroot from config
    const repoRoot = configLoader['repoRoot'];
    const workroot = path.join(repoRoot, '.linear-watcher', 'work');

    // Determine working folder
    let resolvedWorkingFolder: string;
    if (workingFolder) {
      // Use provided working folder
      resolvedWorkingFolder = path.resolve(workingFolder);
      if (!fs.existsSync(resolvedWorkingFolder)) {
        throw new Error(`Working folder does not exist: ${resolvedWorkingFolder}`);
      }
    } else {
      // Find the latest working folder for this issue and operation
      const issueFolder = path.join(workroot, `lcr-${issueId}`);
      if (!fs.existsSync(issueFolder)) {
        throw new Error(`No working folders found for issue ${issueId}`);
      }

      // Find folders matching the operation pattern
      const folders = fs
        .readdirSync(issueFolder)
        .filter((f) => f.startsWith(`op-${operation}-`))
        .sort()
        .reverse(); // Get most recent first

      if (folders.length === 0) {
        throw new Error(
          `No working folders found for operation '${operation}' on issue ${issueId}`
        );
      }

      resolvedWorkingFolder = path.join(issueFolder, folders[0]);
      console.log(`Using working folder: ${resolvedWorkingFolder}`);
    }

    // Clean up any UploadPrecheck reports before running validation
    cleanupUploadPrecheckReports(resolvedWorkingFolder);

    // Check for required files
    const requiredFiles = ['original-issue.md', 'updated-issue.md'];
    for (const file of requiredFiles) {
      const filePath = path.join(resolvedWorkingFolder, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    if (options.dryRun) {
      console.log('\n[DRY RUN MODE] - No actual uploads will be performed\n');

      // Perform validation only
      const orchestrator = new UploadOrchestrator(workroot, resolvedWorkingFolder);
      const linearClient = new LinearClient(config.linear);

      const validationResult = await new (require('../upload-validator').UploadValidator)(
        resolvedWorkingFolder
      ).validate({
        issueId,
        operation,
        workingFolder: resolvedWorkingFolder,
        config,
        linearClient,
      });

      if (validationResult.isValid) {
        console.log('✅ Pre-upload validation passed');
        console.log('\nAssets ready for upload:');
        console.log(`  - Updated issue: ${validationResult.assets.updatedIssue ? 'Yes' : 'No'}`);
        console.log(`  - Operation reports: ${validationResult.assets.operationReports.length}`);
        validationResult.assets.operationReports.forEach((report: string) => {
          console.log(`    - ${report}`);
        });
        console.log(`  - Terminal status: ${validationResult.assets.terminalStatus || 'None'}`);
      } else {
        console.error('❌ Pre-upload validation failed:');
        validationResult.errors.forEach((error: string) => {
          console.error(`  - ${error}`);
        });
      }

      return;
    }

    // Initialize Linear client
    const linearClient = new LinearClient(config.linear);

    // Check Linear connection
    const connected = await linearClient.checkConnection();
    if (!connected) {
      console.warn('Warning: Could not connect to Linear API. Uploads may fail.');
    }

    // Create upload orchestrator and perform upload
    const orchestrator = new UploadOrchestrator(workroot, resolvedWorkingFolder);
    const uploadResult = await orchestrator.upload({
      issueId,
      operation,
      workingFolder: resolvedWorkingFolder,
      config,
      linearClient,
    });

    // Display results
    console.log('\n' + '='.repeat(60));
    if (uploadResult.success) {
      console.log('✅ UPLOAD COMPLETED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log('\nUploaded assets:');

      if (uploadResult.uploadedAssets.comments.length > 0) {
        console.log(`  Comments (${uploadResult.uploadedAssets.comments.length}):`);
        uploadResult.uploadedAssets.comments.forEach((comment) => {
          console.log(`    ✓ ${comment}`);
        });
      }

      if (uploadResult.uploadedAssets.issueBody) {
        console.log('  Issue body: ✓ Updated');
      }

      if (uploadResult.uploadedAssets.statusUpdate) {
        console.log('  Issue status: ✓ Updated');
      }
    } else {
      console.log('❌ UPLOAD FAILED');
      console.log('='.repeat(60));

      if (uploadResult.errors.length > 0) {
        console.log('\nErrors:');
        uploadResult.errors.forEach((error) => {
          console.log(`  - ${error}`);
        });
      }

      if (uploadResult.failureReportFilename) {
        console.log(`\nFailure report generated: ${uploadResult.failureReportFilename}`);
      }

      // Exit with error code
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ UPLOAD COMMAND ERROR');
    console.error('='.repeat(60));
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

/**
 * Lists available working folders for upload
 * @deprecated Use --list-uploads option instead
 */
export async function listWorkingFolders(issueId?: string): Promise<void> {
  try {
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig();
    const repoRoot = configLoader['repoRoot'];
    const workroot = path.join(repoRoot, '.linear-watcher', 'work');

    if (!fs.existsSync(workroot)) {
      console.log('No working folders found.');
      return;
    }

    console.log('Available working folders:\n');

    if (issueId) {
      // List folders for specific issue
      const issueFolder = path.join(workroot, `lcr-${issueId}`);
      if (!fs.existsSync(issueFolder)) {
        console.log(`No working folders found for issue ${issueId}`);
        return;
      }

      const folders = fs
        .readdirSync(issueFolder)
        .filter((f) => f.startsWith('op-'))
        .sort();

      console.log(`Issue ${issueId}:`);
      folders.forEach((folder) => {
        const fullPath = path.join(issueFolder, folder);
        const stats = fs.statSync(fullPath);
        console.log(`  ${folder} (${stats.mtime.toLocaleString()})`);
      });
    } else {
      // List all issue folders
      const issueFolders = fs
        .readdirSync(workroot)
        .filter((f) => f.startsWith('lcr-'))
        .sort();

      issueFolders.forEach((issueFolder) => {
        const issueId = issueFolder.replace('lcr-', '');
        const issuePath = path.join(workroot, issueFolder);

        const opFolders = fs
          .readdirSync(issuePath)
          .filter((f) => f.startsWith('op-'))
          .sort();

        if (opFolders.length > 0) {
          console.log(`Issue ${issueId}:`);
          opFolders.forEach((folder) => {
            const fullPath = path.join(issuePath, folder);
            const stats = fs.statSync(fullPath);
            console.log(`  ${folder} (${stats.mtime.toLocaleString()})`);
          });
          console.log();
        }
      });
    }
  } catch (error) {
    console.error(
      'Error listing working folders:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}
