import * as fs from 'fs';
import * as path from 'path';
import type { ParsedClaudeOutput } from './claude-output-parser';

export interface OutputFileReferences {
  updatedIssue?: string;
  comments: string[];
  contextDump?: string;
  operationReports: string[];
}

export class OutputManager {
  private workingFolder: string;

  constructor(workingFolder: string) {
    this.workingFolder = workingFolder;
  }

  /**
   * Reads the status from the latest operation-report file in the working folder
   * @returns The operation status or 'Unknown' if not found
   */
  getLatestOperationStatus(): 'Completed' | 'Blocked' | 'Failed' | 'Unknown' {
    try {
      // Find all operation-report files
      const files = fs.readdirSync(this.workingFolder);
      const reportFiles = files
        .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'))
        .sort((a, b) => {
          // Extract the sequence number from filenames like operation-report-Action-XXX.md
          const seqA = parseInt(a.match(/(\d+)\.md$/)?.[1] || '0', 10);
          const seqB = parseInt(b.match(/(\d+)\.md$/)?.[1] || '0', 10);
          return seqB - seqA; // Descending order (highest number first)
        });

      if (reportFiles.length === 0) {
        return 'Unknown';
      }

      // Read the most recent report file (highest sequence number)
      const latestReport = reportFiles[0];
      const reportPath = path.join(this.workingFolder, latestReport);
      const content = fs.readFileSync(reportPath, 'utf8');

      // Extract JSON from the report
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const reportJson = JSON.parse(jsonMatch[1]);
          const status = reportJson.operationStatus || reportJson.status;

          // Map status to our expected values
          if (status === 'Complete' || status === 'Completed') {
            return 'Completed';
          } else if (status === 'Blocked') {
            return 'Blocked';
          } else if (status === 'Failed') {
            return 'Failed';
          }
        } catch (e) {
          console.warn('Failed to parse operation report JSON:', e);
        }
      }

      return 'Unknown';
    } catch (error) {
      console.warn('Error reading operation status:', error);
      return 'Unknown';
    }
  }

  /**
   * Writes all ClaudeCode outputs to the working folder
   * @param parsedOutput The parsed ClaudeCode output
   * @returns References to all written files
   */
  writeOutputFiles(parsedOutput: ParsedClaudeOutput): OutputFileReferences {
    const references: OutputFileReferences = {
      comments: [],
      operationReports: [],
    };

    // Write updated issue content (overwrite existing)
    if (parsedOutput.updatedIssueContent) {
      const updatedIssuePath = path.join(this.workingFolder, 'updated-issue.md');
      fs.writeFileSync(updatedIssuePath, parsedOutput.updatedIssueContent, 'utf8');
      references.updatedIssue = 'updated-issue.md';
    }

    // Write comments as numbered files
    parsedOutput.comments.forEach((comment, index) => {
      const commentNum = (index + 1).toString().padStart(3, '0');
      const commentFilename = `comment-${commentNum}.md`;
      const commentPath = path.join(this.workingFolder, commentFilename);
      fs.writeFileSync(commentPath, comment, 'utf8');
      references.comments.push(commentFilename);
    });

    // Write context dump
    if (parsedOutput.contextDump) {
      const contextDumpPath = path.join(this.workingFolder, 'context-dump.md');
      fs.writeFileSync(contextDumpPath, parsedOutput.contextDump, 'utf8');
      references.contextDump = 'context-dump.md';
    }

    // Write operation report if present
    if (parsedOutput.operationReport) {
      const reportFilename = this.generateOperationReportFilename(
        parsedOutput.operationReport.action || 'Unknown'
      );
      const reportPath = path.join(this.workingFolder, reportFilename);
      const reportContent = this.formatOperationReport(parsedOutput.operationReport);
      fs.writeFileSync(reportPath, reportContent, 'utf8');
      references.operationReports.push(reportFilename);
    }

    return references;
  }

  /**
   * Updates the operation-report.json file with ClaudeCode execution results
   * @param status The final status of the operation
   * @param fileReferences References to generated files
   * @param summary A summary of the operation
   */
  updateOperationReport(
    status: 'Completed' | 'Blocked' | 'Failed',
    fileReferences: OutputFileReferences,
    summary: string
  ): void {
    const reportPath = path.join(this.workingFolder, 'operation-report.json');

    // Read existing report if it exists
    let report: any = {};
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf8');
      try {
        report = JSON.parse(content);
      } catch {
        // If parsing fails, start with empty object
        report = {};
      }
    }

    // Update report with ClaudeCode execution results
    report.claudeCodeExecution = {
      status,
      timestamp: new Date().toISOString(),
      summary,
      outputFiles: fileReferences,
    };

    // Write updated report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  }

  /**
   * Writes operation report files extracted from ClaudeCode output
   * @param reports Array of report objects with filename and content
   * @returns Array of written filenames
   */
  writeOperationReports(reports: Array<{ filename: string; content: string }>): string[] {
    const writtenFiles: string[] = [];

    for (const report of reports) {
      const reportPath = path.join(this.workingFolder, report.filename);
      fs.writeFileSync(reportPath, report.content, 'utf8');
      writtenFiles.push(report.filename);
    }

    return writtenFiles;
  }

  /**
   * Generates a unique operation report filename
   * @param action The action name for the report
   * @returns A unique filename
   */
  private generateOperationReportFilename(action: string): string {
    // Find existing operation reports to determine the next sequence number
    const files = fs.readdirSync(this.workingFolder);
    const reportFiles = files.filter((f) => f.startsWith(`operation-report-${action}-`));

    let sequence = 1;
    if (reportFiles.length > 0) {
      // Extract sequence numbers and find the highest
      const sequences = reportFiles
        .map((f) => {
          const match = f.match(/operation-report-\w+-(\d+)\.md/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));

      if (sequences.length > 0) {
        sequence = Math.max(...sequences) + 1;
      }
    }

    return `operation-report-${action}-${sequence.toString().padStart(3, '0')}.md`;
  }

  /**
   * Formats an operation report object into markdown
   */
  private formatOperationReport(report: any): string {
    return `## operation-report-json
\`\`\`json
${JSON.stringify(report, null, 2)}
\`\`\`
## Operation Report Payload
${report.summary || 'No additional details'}`;
  }
}
