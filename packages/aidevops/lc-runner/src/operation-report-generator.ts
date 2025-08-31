import * as fs from 'fs';
import * as path from 'path';

export type OperationStatus = 'InProgress' | 'Failed' | 'Blocked' | 'Complete';

export interface OperationReportData {
  issueId: string;
  operation: string;
  action: string;
  workingFolder: string;
  operationStatus: OperationStatus;
  timestamp?: string;
  summary: string;
  payload?: string;
  mcpSaveStatus?: 'success' | 'failed' | 'skipped' | 'not-triggered';
}

/**
 * Generates operation report files with the specified naming convention
 * and JSON metadata structure matching ClaudeCode format
 */
export class OperationReportGenerator {
  private workingFolder: string;

  constructor(workingFolder: string) {
    this.workingFolder = workingFolder;
  }

  /**
   * Generates an operation report file
   * @param data The operation report data
   * @returns The filename of the generated report
   */
  generateReport(data: OperationReportData): string {
    // Validate required fields
    this.validateReportData(data);

    // Generate filename
    const filename = this.generateFilename(data.action);

    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = this.getCurrentTimestamp();
    }

    // Format the report content
    const content = this.formatReportContent(data);

    // Write the file
    const filePath = path.join(this.workingFolder, filename);
    fs.writeFileSync(filePath, content, 'utf8');

    return filename;
  }

  /**
   * Generates a unique filename for the operation report
   * @param action The action name
   * @returns The generated filename
   */
  private generateFilename(action: string): string {
    // Sanitize action name for filename
    const sanitizedAction = action.replace(/[^a-zA-Z0-9-]/g, '');

    // Find existing operation reports to determine the next sequence number
    const files = fs.existsSync(this.workingFolder) ? fs.readdirSync(this.workingFolder) : [];

    const reportFiles = files.filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'));

    // Extract all sequence numbers
    const sequences = reportFiles
      .map((f) => {
        const match = f.match(/operation-report-[^-]+-(\d{3})\.md/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    // Get next sequence number
    const nextSequence = sequences.length > 0 ? Math.max(...sequences) + 1 : 1;

    return `operation-report-${sanitizedAction}-${nextSequence.toString().padStart(3, '0')}.md`;
  }

  /**
   * Formats the operation report content as markdown
   * @param data The operation report data
   * @returns The formatted markdown content
   */
  private formatReportContent(data: OperationReportData): string {
    const jsonData: any = {
      issueId: data.issueId,
      operation: data.operation,
      action: data.action,
      workingFolder: data.workingFolder,
      operationStatus: data.operationStatus,
      timestamp: data.timestamp,
      summary: data.summary,
    };

    // Include mcpSaveStatus if present (typically for Finished reports)
    if (data.mcpSaveStatus) {
      jsonData.mcpSaveStatus = data.mcpSaveStatus;
    }

    let content = `## operation-report-json
\`\`\`json
${JSON.stringify(jsonData, null, 2)}
\`\`\`

## Operation Report Payload
`;

    if (data.payload) {
      content += data.payload;
    } else {
      content += `- ${data.summary}`;
    }

    return content;
  }

  /**
   * Validates that all required fields are present in the report data
   * @param data The operation report data to validate
   * @throws Error if validation fails
   */
  private validateReportData(data: OperationReportData): void {
    const requiredFields: (keyof OperationReportData)[] = [
      'issueId',
      'operation',
      'action',
      'workingFolder',
      'operationStatus',
      'summary',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate operationStatus is a valid value
    const validStatuses: OperationStatus[] = ['InProgress', 'Failed', 'Blocked', 'Complete'];
    if (!validStatuses.includes(data.operationStatus)) {
      throw new Error(`Invalid operationStatus: ${data.operationStatus}`);
    }
  }

  /**
   * Gets the current timestamp in the correct timezone format
   * @returns ISO string with timezone offset
   */
  private getCurrentTimestamp(): string {
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

    // Format: YYYY-MM-DDTHH:mm:ss+/-HH:mm
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
  }

  /**
   * Reads all operation reports from the working folder
   * @returns Array of report filenames sorted by sequence
   */
  getAllReports(): string[] {
    if (!fs.existsSync(this.workingFolder)) {
      return [];
    }

    const files = fs.readdirSync(this.workingFolder);
    return files
      .filter((f) => f.startsWith('operation-report-') && f.endsWith('.md'))
      .sort((a, b) => {
        // Extract sequence numbers from filenames
        const matchA = a.match(/operation-report-[^-]+-(\d{3})\.md/);
        const matchB = b.match(/operation-report-[^-]+-(\d{3})\.md/);

        const seqA = matchA ? parseInt(matchA[1], 10) : 0;
        const seqB = matchB ? parseInt(matchB[1], 10) : 0;

        return seqA - seqB;
      });
  }

  /**
   * Reads and parses an operation report file
   * @param filename The report filename
   * @returns The parsed report data or null if parsing fails
   */
  readReport(filename: string): OperationReportData | null {
    const filePath = path.join(this.workingFolder, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract JSON from the report
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        return null;
      }

      const reportData = JSON.parse(jsonMatch[1]) as OperationReportData;

      // Extract payload if present
      const payloadMatch = content.match(/## Operation Report Payload\s*([\s\S]*?)$/);
      if (payloadMatch) {
        reportData.payload = payloadMatch[1].trim();
      }

      return reportData;
    } catch (error) {
      console.warn(`Failed to parse operation report ${filename}:`, error);
      return null;
    }
  }

  /**
   * Gets the latest operation report's status
   * @returns The status of the latest report or null if no reports exist
   */
  getLatestReportStatus(): OperationStatus | null {
    const reports = this.getAllReports();

    if (reports.length === 0) {
      return null;
    }

    const latestReport = reports[reports.length - 1];
    const reportData = this.readReport(latestReport);

    return reportData ? reportData.operationStatus : null;
  }
}
