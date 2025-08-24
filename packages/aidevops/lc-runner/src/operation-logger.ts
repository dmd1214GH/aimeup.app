import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: string;
  operation: string;
  status: string;
  folderPath: string;
  error?: string;
  outputFiles?: {
    updatedIssue?: string;
    comments: string[];
    contextDump?: string;
    operationReports: string[];
  };
}

export class OperationLogger {
  private workroot: string;

  constructor(workroot: string) {
    this.workroot = workroot;
  }

  /**
   * Append a log entry to the issue operation log
   */
  appendLogEntry(issueId: string, entry: LogEntry): void {
    const logFilePath = this.getLogFilePath(issueId);

    try {
      // Ensure the parent directory exists
      const parentDir = path.dirname(logFilePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // Create the log entry markdown
      const logEntry = this.formatLogEntry(entry);

      // Append to the log file (create if doesn't exist)
      if (!fs.existsSync(logFilePath)) {
        // Create file with header
        const header = `# Operation Log for ${issueId}\n\n`;
        fs.writeFileSync(logFilePath, header + logEntry, 'utf8');
      } else {
        // Append to existing file
        fs.appendFileSync(logFilePath, logEntry, 'utf8');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to append log entry to ${logFilePath}: ${error.message}`);
      }
      throw new Error(`Failed to append log entry to ${logFilePath}`);
    }
  }

  /**
   * Read the operation log for an issue
   */
  readLog(issueId: string): string | null {
    const logFilePath = this.getLogFilePath(issueId);

    if (!fs.existsSync(logFilePath)) {
      return null;
    }

    try {
      return fs.readFileSync(logFilePath, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read log file at ${logFilePath}: ${error.message}`);
      }
      throw new Error(`Failed to read log file at ${logFilePath}`);
    }
  }

  /**
   * Check if a log file exists for an issue
   */
  logExists(issueId: string): boolean {
    const logFilePath = this.getLogFilePath(issueId);
    return fs.existsSync(logFilePath);
  }

  /**
   * Get the path to the log file for an issue
   */
  private getLogFilePath(issueId: string): string {
    return path.join(this.workroot, `lcr-${issueId}`, 'issue-operation-log.md');
  }

  /**
   * Format a log entry as markdown
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, operation, status, folderPath, error, outputFiles } = entry;
    let markdown =
      `## ${timestamp}\n` +
      `- **Operation**: ${operation}\n` +
      `- **Status**: ${status}\n` +
      `- **Folder**: ${folderPath}\n`;

    if (error) {
      markdown += `- **Error**: ${error}\n`;
    }

    if (outputFiles) {
      markdown += `- **Output Files**:\n`;
      if (outputFiles.updatedIssue) {
        markdown += `  - Updated Issue: ${outputFiles.updatedIssue}\n`;
      }
      if (outputFiles.comments.length > 0) {
        markdown += `  - Comments: ${outputFiles.comments.join(', ')}\n`;
      }
      if (outputFiles.contextDump) {
        markdown += `  - Context Dump: ${outputFiles.contextDump}\n`;
      }
      if (outputFiles.operationReports.length > 0) {
        markdown += `  - Operation Reports: ${outputFiles.operationReports.join(', ')}\n`;
      }
    }

    markdown += '\n';
    return markdown;
  }

  /**
   * Get the current ISO timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}
