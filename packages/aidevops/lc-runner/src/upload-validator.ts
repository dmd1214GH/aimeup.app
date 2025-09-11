import * as fs from 'fs';
import * as path from 'path';
import type { LinearClient } from './linear-client';
import type { Config } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  assets: {
    updatedIssue: boolean;
    operationReports: string[];
    hasTerminalStatus: boolean;
    terminalStatus?: 'Failed' | 'Blocked' | 'Complete';
  };
}

export interface ValidationOptions {
  issueId: string;
  operation: string;
  workingFolder: string;
  config: Config;
  linearClient?: LinearClient;
}

/**
 * Validates pre-upload conditions for Linear integration
 */
export class UploadValidator {
  private workingFolder: string;

  constructor(workingFolder: string) {
    this.workingFolder = workingFolder;
  }

  /**
   * Performs all pre-upload validation checks
   * @param options Validation options
   * @returns Validation result with details
   */
  async validate(options: ValidationOptions): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      assets: {
        updatedIssue: false,
        operationReports: [],
        hasTerminalStatus: false,
      },
    };

    // Check 1: Verify updated-issue.md exists and differs from original-issue.md
    const issueCheck = this.checkIssueFiles();
    if (!issueCheck.isValid) {
      result.isValid = false;
      result.errors.push(...issueCheck.errors);
    } else {
      result.assets.updatedIssue = true;
    }

    // Check 2: Validate presence of operation report files
    const reportCheck = this.checkOperationReports();
    if (!reportCheck.isValid) {
      result.isValid = false;
      result.errors.push(...reportCheck.errors);
    } else {
      result.assets.operationReports = reportCheck.reports;
    }

    // Check 3: Verify highest sequence report has terminal status
    const statusCheck = this.checkTerminalStatus();
    if (!statusCheck.isValid) {
      result.isValid = false;
      result.errors.push(...statusCheck.errors);
    } else {
      result.assets.hasTerminalStatus = true;
      result.assets.terminalStatus = statusCheck.status;
    }

    // Check 4: Verify Linear issue status matches expected (if Linear client provided)
    if (options.linearClient) {
      const linearCheck = await this.checkLinearIssueStatus(
        options.issueId,
        options.operation,
        options.config,
        options.linearClient
      );
      if (!linearCheck.isValid) {
        result.isValid = false;
        result.errors.push(...linearCheck.errors);
      }
    }

    return result;
  }

  /**
   * Checks if updated-issue.md exists and differs from original-issue.md
   */
  private checkIssueFiles(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const originalPath = path.join(this.workingFolder, 'original-issue.md');
    const updatedPath = path.join(this.workingFolder, 'updated-issue.md');

    // Check if original issue exists
    if (!fs.existsSync(originalPath)) {
      errors.push('original-issue.md not found in working folder');
      return { isValid: false, errors };
    }

    // Check if updated issue exists
    if (!fs.existsSync(updatedPath)) {
      errors.push('updated-issue.md not found in working folder');
      return { isValid: false, errors };
    }

    // Check if they differ
    try {
      const originalContent = fs.readFileSync(originalPath, 'utf8');
      const updatedContent = fs.readFileSync(updatedPath, 'utf8');

      if (originalContent === updatedContent) {
        errors.push('updated-issue.md is identical to original-issue.md - no changes made');
        return { isValid: false, errors };
      }
    } catch (error) {
      errors.push(
        `Failed to read issue files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Checks for presence of operation report files
   */
  private checkOperationReports(): { isValid: boolean; errors: string[]; reports: string[] } {
    const errors: string[] = [];
    // Get all operation report files directly
    const files = fs.readdirSync(this.workingFolder);
    const reports = files
      .filter(f => f.startsWith('operation-report-') && f.endsWith('.md'))
      .sort();

    if (reports.length === 0) {
      errors.push('No operation-report-*.md files found in working folder');
      return { isValid: false, errors, reports: [] };
    }

    return { isValid: true, errors: [], reports };
  }

  /**
   * Checks if the highest sequence report has a terminal status
   */
  private checkTerminalStatus(): {
    isValid: boolean;
    errors: string[];
    status?: 'Failed' | 'Blocked' | 'Complete';
  } {
    const errors: string[] = [];
    
    // Get all operation report files directly
    const files = fs.readdirSync(this.workingFolder);
    const reports = files
      .filter(f => f.startsWith('operation-report-') && f.endsWith('.md'))
      .sort();

    if (reports.length === 0) {
      errors.push('Cannot check terminal status - no operation reports found');
      return { isValid: false, errors };
    }

    // Get the highest sequence report (last in sorted array)
    const latestReport = reports[reports.length - 1];
    const reportPath = path.join(this.workingFolder, latestReport);
    const content = fs.readFileSync(reportPath, 'utf-8');
    
    // Parse the operation status from the report content
    const statusMatch = content.match(/operationStatus:\s*(\w+)/i);
    const operationStatus = statusMatch ? statusMatch[1] : 'Unknown';
    
    const reportData = {
      operationStatus
    };

    if (!reportData) {
      errors.push(`Failed to parse latest operation report: ${latestReport}`);
      return { isValid: false, errors };
    }

    const terminalStatuses = ['Failed', 'Blocked', 'Complete'];
    if (!terminalStatuses.includes(reportData.operationStatus)) {
      errors.push(
        `Latest operation report (${latestReport}) does not have terminal status. ` +
          `Found: ${reportData.operationStatus}, Expected: Failed, Blocked, or Complete`
      );
      return { isValid: false, errors };
    }

    // Only Blocked or Complete statuses are allowed to proceed with upload
    const uploadableStatuses = ['Blocked', 'Complete'];
    if (!uploadableStatuses.includes(reportData.operationStatus)) {
      errors.push(
        `Latest operation report (${latestReport}) has status '${reportData.operationStatus}' which cannot be uploaded. ` +
          `Only 'Blocked' or 'Complete' statuses can be uploaded to Linear.`
      );
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      status: reportData.operationStatus as 'Failed' | 'Blocked' | 'Complete',
    };
  }

  /**
   * Checks if Linear issue is in expected status for the operation
   */
  private async checkLinearIssueStatus(
    issueId: string,
    operation: string,
    config: Config,
    linearClient: LinearClient
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Find the expected status for this operation
      const operationConfig = config.operations[operation];
      if (!operationConfig) {
        errors.push(`Operation '${operation}' not found in config.json`);
        return { isValid: false, errors };
      }

      const expectedStatus = operationConfig.linearIssueStatus;
      if (!expectedStatus) {
        // No status requirement configured, skip check
        return { isValid: true, errors: [] };
      }

      // Get current issue status from Linear
      const currentStatus = await linearClient.getIssueStatus(issueId);

      if (currentStatus !== expectedStatus) {
        errors.push(
          `Linear issue ${issueId} is not in expected status for operation '${operation}'. ` +
            `Current: '${currentStatus}', Expected: '${expectedStatus}'. ` +
            `Issue may have been modified during operation.`
        );
        return { isValid: false, errors };
      }
    } catch (error) {
      // Don't fail validation for API errors, just warn
      console.warn(
        `Warning: Could not verify Linear issue status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Generates an UploadPrecheck failure report
   */
  generatePrecheckFailureReport(
    options: ValidationOptions,
    validationResult: ValidationResult
  ): string {
    const reportData = {
      issueId: options.issueId,
      operation: options.operation,
      action: 'UploadPrecheck',
      workingFolder: options.workingFolder,
      operationStatus: 'Failed' as const,
      summary: 'Pre-upload validation failed',
      payload: this.formatPrecheckFailurePayload(validationResult),
    };

    // Note: Report generation has been removed. 
    // The lc-issue-saver subagent handles all reporting during operations.
    // This method now returns an empty string for compatibility.
    return '';
  }

  /**
   * Formats the payload for a precheck failure report
   */
  private formatPrecheckFailurePayload(result: ValidationResult): string {
    let payload = '### Precheck Failures\n\n';

    result.errors.forEach((error) => {
      payload += `- ❌ ${error}\n`;
    });

    payload += '\n### Assets Pending Upload\n\n';

    // Updated issue status
    if (result.assets.updatedIssue) {
      payload += '- ✅ updated-issue.md (ready for upload)\n';
    } else {
      payload += '- ❌ updated-issue.md (missing or unchanged)\n';
    }

    // Operation reports
    if (result.assets.operationReports.length > 0) {
      payload += `- ✅ ${result.assets.operationReports.length} operation report(s) found:\n`;
      result.assets.operationReports.forEach((report) => {
        payload += `  - ${report}\n`;
      });
    } else {
      payload += '- ❌ No operation reports found\n';
    }

    // Terminal status
    if (result.assets.hasTerminalStatus) {
      payload += `- ✅ Terminal status: ${result.assets.terminalStatus}\n`;
    } else {
      payload += '- ❌ No terminal status in latest report\n';
    }

    return payload;
  }
}
