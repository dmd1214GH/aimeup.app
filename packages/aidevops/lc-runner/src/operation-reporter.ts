import * as fs from 'fs';
import * as path from 'path';

export interface OperationReport {
  issueId: string;
  operation: string;
  workingFolder: string;
  operationStatus: 'Inprog' | 'Completed' | 'Blocked' | 'Failed';
  'start-timestamp': string;
  'end-timestamp': string | null;
  summary: string;
  outputs: {
    updatedIssue?: string;
    commentFiles?: string[];
    contextDump?: string;
  };
}

export class OperationReporter {
  private reportPath: string;

  constructor(workingFolderPath: string) {
    this.reportPath = path.join(workingFolderPath, 'operation-report.json');
  }

  /**
   * Create initial report with Inprog status
   */
  createInitialReport(issueId: string, operation: string, workingFolder: string): void {
    const report: OperationReport = {
      issueId,
      operation,
      workingFolder,
      operationStatus: 'Inprog',
      'start-timestamp': new Date().toISOString(),
      'end-timestamp': null,
      summary: 'Operation in progress',
      outputs: {},
    };

    this.saveReport(report);
  }

  /**
   * Update report with final status and outputs
   */
  updateReport(
    status: 'Completed' | 'Blocked' | 'Failed',
    summary: string,
    outputs?: OperationReport['outputs']
  ): void {
    const existingReport = this.loadReport();

    if (!existingReport) {
      throw new Error('Cannot update report: No existing report found');
    }

    const updatedReport: OperationReport = {
      ...existingReport,
      operationStatus: status,
      'end-timestamp': new Date().toISOString(),
      summary,
      outputs: outputs || existingReport.outputs,
    };

    this.saveReport(updatedReport);
  }

  /**
   * Load existing report from file
   */
  loadReport(): OperationReport | null {
    if (!fs.existsSync(this.reportPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.reportPath, 'utf8');
      return JSON.parse(content) as OperationReport;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load operation report: ${error.message}`);
      }
      throw new Error('Failed to load operation report');
    }
  }

  /**
   * Save report to file
   */
  private saveReport(report: OperationReport): void {
    try {
      const content = JSON.stringify(report, null, 2);
      fs.writeFileSync(this.reportPath, content, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save operation report: ${error.message}`);
      }
      throw new Error('Failed to save operation report');
    }
  }

  /**
   * Check if report exists
   */
  reportExists(): boolean {
    return fs.existsSync(this.reportPath);
  }

  /**
   * Get the report file path
   */
  getReportPath(): string {
    return this.reportPath;
  }
}
