import * as fs from 'fs';
import * as path from 'path';
import type { LinearClient } from './linear-client';
import { UploadValidator } from './upload-validator';
import { OperationLogger } from './operation-logger';
import { cleanIssueBody, cleanCommentContent } from './content-cleaner';
import type { Config } from './types';

export interface UploadOptions {
  issueId: string;
  operation: string;
  workingFolder: string;
  config: Config;
  linearClient: LinearClient;
}

export interface UploadResult {
  success: boolean;
  uploadedAssets: {
    comments: string[];
    issueBody: boolean;
    statusUpdate: boolean;
  };
  errors: string[];
  failureReportFilename?: string;
}

// interface UploadAsset {
//   type: 'comment' | 'issueBody' | 'statusUpdate';
//   filename?: string;
//   content?: string;
//   status?: string;
// }

/**
 * Orchestrates the upload of operation results to Linear
 */
export class UploadOrchestrator {
  private validator: UploadValidator;
  private operationLogger: OperationLogger;
  private failedUploads: string[] = [];

  constructor(workroot: string, workingFolder: string) {
    this.validator = new UploadValidator(workingFolder);
    this.operationLogger = new OperationLogger(workroot);
  }

  /**
   * Performs the complete upload process to Linear
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const result: UploadResult = {
      success: false,
      uploadedAssets: {
        comments: [],
        issueBody: false,
        statusUpdate: false,
      },
      errors: [],
    };

    try {
      // Step 1: Perform pre-upload validation
      console.log('Performing pre-upload validation...');
      const validationResult = await this.validator.validate({
        issueId: options.issueId,
        operation: options.operation,
        workingFolder: options.workingFolder,
        config: options.config,
        linearClient: options.linearClient,
      });

      if (!validationResult.isValid) {
        console.error('Pre-upload validation failed:');
        validationResult.errors.forEach((error) => console.error(`  - ${error}`));

        // Don't generate UploadPrecheck reports anymore - just fail with errors
        result.errors = validationResult.errors;
        return result;
      }

      console.log('Pre-upload validation passed');

      // Step 2: Log start of upload
      this.logUploadStart(options);

      // Step 3: Upload operation reports as comments
      // SUPPRESSED: Comment uploads are now handled by Claude Code MCP integration
      // This code is preserved for potential future reactivation
      // To re-enable: uncomment the code block below
      const suppressCommentUploads = true; // Hard-coded suppression

      let uploadedComments: string[] = [];
      let allCommentsUploaded = true;

      if (!suppressCommentUploads) {
        console.log('Uploading operation reports as comments...');
        uploadedComments = await this.uploadOperationReports(
          options,
          validationResult.assets.operationReports
        );
        result.uploadedAssets.comments = uploadedComments;

        // Track if any comments failed
        allCommentsUploaded =
          uploadedComments.length === validationResult.assets.operationReports.length;
        if (!allCommentsUploaded) {
          result.errors.push(
            `Failed to upload ${validationResult.assets.operationReports.length - uploadedComments.length} comment(s)`
          );
        }
      } else {
        console.log('Comment uploads suppressed - handled by Claude Code MCP integration');
        // Mark all comments as "uploaded" for compatibility
        uploadedComments = validationResult.assets.operationReports;
        result.uploadedAssets.comments = uploadedComments;
      }

      // Step 4: Skip issue body update - handled by Claude Code MCP integration
      console.log('✓ Issue body update handled by Claude Code MCP integration');
      console.log('  Skipping redundant upload to avoid duplication');
      result.uploadedAssets.issueBody = true;
      const bodyUpdated = true;

      // Step 5: Skip status update - this is handled by lc-issue-saver during operations
      // Status transitions should happen when operations complete, not during upload
      console.log('Status updates are now handled by lc-issue-saver during operations');

      // Only mark as success if ALL uploads succeeded
      result.success = allCommentsUploaded && bodyUpdated;

      // Step 6: Log upload completion
      this.logUploadCompletion(options, result);

      console.log('Upload completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Upload failed: ${errorMessage}`);
      result.errors.push(errorMessage);

      // Try to generate and upload failure report
      await this.handleUploadFailure(options, result);
    }

    return result;
  }

  /**
   * Uploads operation reports as Linear comments
   */
  private async uploadOperationReports(
    options: UploadOptions,
    reportFilenames: string[]
  ): Promise<string[]> {
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const filename of reportFilenames) {
      try {
        const reportPath = path.join(options.workingFolder, filename);
        const content = fs.readFileSync(reportPath, 'utf8');
        const cleanedContent = cleanCommentContent(content);

        const success = await options.linearClient.addComment(options.issueId, cleanedContent);
        if (success) {
          uploaded.push(filename);
          console.log(`  ✓ Uploaded ${filename}`);
        } else {
          failed.push(filename);
          console.error(`  ✗ Failed to upload ${filename}`);
        }
      } catch (error) {
        failed.push(filename);
        console.error(
          `  ✗ Failed to upload ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Store failed uploads in the result
    if (failed.length > 0) {
      this.failedUploads = failed;
    }

    return uploaded;
  }

  /**
   * Updates the Linear issue body with updated-issue.md content
   */
  private async updateIssueBody(options: UploadOptions): Promise<boolean> {
    try {
      const updatedIssuePath = path.join(options.workingFolder, 'updated-issue.md');
      const content = fs.readFileSync(updatedIssuePath, 'utf8');
      const cleanedContent = cleanIssueBody(content);

      const success = await options.linearClient.updateIssueBody(options.issueId, cleanedContent);
      if (success) {
        console.log('  ✓ Issue body updated');
        return true;
      } else {
        console.error('  ✗ Failed to update issue body');
        return false;
      }
    } catch (error) {
      console.error(
        `  ✗ Failed to update issue body: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }

  /**
   * Updates the Linear issue status based on operation result
   */
  private async updateIssueStatus(
    options: UploadOptions,
    terminalStatus: 'Failed' | 'Blocked' | 'Complete'
  ): Promise<boolean> {
    try {
      const operationConfig = options.config.operations[options.operation];
      if (!operationConfig) {
        console.warn(`  ! No status mapping found for operation '${options.operation}'`);
        return false;
      }

      let targetStatus: string | undefined;

      if (terminalStatus === 'Complete') {
        targetStatus = operationConfig.linearIssueStatusSuccess;
      } else if (terminalStatus === 'Blocked' || terminalStatus === 'Failed') {
        targetStatus = operationConfig.linearIssueStatusBlocked;
      }

      if (!targetStatus) {
        console.warn(`  ! No target status configured for ${terminalStatus}`);
        return false;
      }

      const success = await options.linearClient.updateIssueStatus(options.issueId, targetStatus);
      if (success) {
        console.log(`  ✓ Issue status updated to '${targetStatus}'`);
        return true;
      } else {
        console.error(`  ✗ Failed to update issue status to '${targetStatus}'`);
        return false;
      }
    } catch (error) {
      console.error(
        `  ✗ Failed to update issue status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  }

  /**
   * Uploads a failure report as a Linear comment
   */
  private async uploadFailureReport(
    options: UploadOptions,
    failureReportFilename: string
  ): Promise<void> {
    try {
      const reportPath = path.join(options.workingFolder, failureReportFilename);
      const content = fs.readFileSync(reportPath, 'utf8');
      const cleanedContent = cleanCommentContent(content);

      await options.linearClient.addComment(options.issueId, cleanedContent);
      console.log(`Uploaded failure report: ${failureReportFilename}`);
    } catch (error) {
      console.error(
        `Failed to upload failure report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates issue to blocked status
   */
  private async updateIssueStatusToBlocked(options: UploadOptions): Promise<void> {
    try {
      const operationConfig = options.config.operations[options.operation];
      if (!operationConfig?.linearIssueStatusBlocked) {
        console.warn('No blocked status configured');
        return;
      }

      await options.linearClient.updateIssueStatus(
        options.issueId,
        operationConfig.linearIssueStatusBlocked
      );
      console.log(`Issue status updated to '${operationConfig.linearIssueStatusBlocked}'`);
    } catch (error) {
      console.error(
        `Failed to update issue to blocked status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handles upload failure by generating and uploading failure report
   */
  private async handleUploadFailure(options: UploadOptions, result: UploadResult): Promise<void> {
    try {
      // Log the failure but don't generate operation reports anymore
      // Operation reports are now handled by lc-issue-saver subagent during operations
      console.error('Upload to Linear failed');
      console.error('Errors:', result.errors);
      
      // Note: Operation report generation has been removed.
      // The lc-issue-saver subagent handles all reporting during operations.
      // This method is retained for logging purposes only.
    } catch (error) {
      console.error(
        `Failed to handle upload failure: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Formats the payload for an upload failure report
   */
  private formatUploadFailurePayload(result: UploadResult): string {
    let payload = '### Upload Report\n\n';

    // Comments upload status
    if (result.uploadedAssets.comments.length > 0) {
      payload += `✅ Uploaded ${result.uploadedAssets.comments.length} comment(s):\n`;
      result.uploadedAssets.comments.forEach((comment) => {
        payload += `  - ${comment}\n`;
      });
    } else {
      payload += '❌ No comments uploaded\n';
    }

    // Issue body update status
    payload += result.uploadedAssets.issueBody
      ? '✅ Issue body updated\n'
      : '❌ Issue body not updated\n';

    // Status update
    payload += result.uploadedAssets.statusUpdate
      ? '✅ Issue status updated\n'
      : '❌ Issue status not updated\n';

    // Errors
    if (result.errors.length > 0) {
      payload += '\n### Errors\n';
      result.errors.forEach((error) => {
        payload += `- ${error}\n`;
      });
    }

    return payload;
  }

  /**
   * Logs the start of upload operation
   */
  private logUploadStart(options: UploadOptions): void {
    try {
      const logEntry: any = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation: `${options.operation} - Upload Start`,
        status: 'Starting upload to Linear',
        folderPath: options.workingFolder,
      };

      this.operationLogger.appendLogEntry(options.issueId, logEntry);
    } catch (error) {
      console.warn(
        `Failed to log upload start: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Logs the completion of upload operation
   */
  private logUploadCompletion(options: UploadOptions, result: UploadResult): void {
    try {
      const logEntry: any = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation: `${options.operation} - Upload Complete`,
        status: result.success ? 'Success' : 'Failed',
        folderPath: options.workingFolder,
        outputFiles: {
          comments: result.uploadedAssets.comments,
          updatedIssue: result.uploadedAssets.issueBody ? 'updated-issue.md' : undefined,
          operationReports: [],
          contextDump: undefined,
        },
      };

      if (!result.success && result.errors.length > 0) {
        logEntry.error = result.errors.join('; ');
      }

      this.operationLogger.appendLogEntry(options.issueId, logEntry);
    } catch (error) {
      console.warn(
        `Failed to log upload completion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
