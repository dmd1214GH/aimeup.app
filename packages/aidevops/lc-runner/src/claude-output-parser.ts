export interface ParsedClaudeOutput {
  status: 'Completed' | 'Blocked' | 'Failed';
  updatedIssueContent?: string;
  comments: string[];
  blockingQuestions: string[];
  contextDump?: string;
  operationReport?: {
    issueId: string;
    operation: string;
    action: string;
    workingFolder: string;
    operationStatus: string;
    timestamp: string;
    summary: string;
  };
}

export class ClaudeOutputParser {
  /**
   * Parses the ClaudeCode output to extract structured data
   * @param output The raw output from ClaudeCode
   * @returns Parsed structured data
   */
  parseOutput(output: string): ParsedClaudeOutput {
    const result: ParsedClaudeOutput = {
      status: 'Failed',
      comments: [],
      blockingQuestions: [],
    };

    if (!output || output.trim().length === 0) {
      return result;
    }

    // Try to extract operation report JSON
    const operationReportMatch = output.match(
      /## operation-report-json\s*```json\s*([\s\S]*?)\s*```/
    );
    if (operationReportMatch) {
      try {
        const reportJson = JSON.parse(operationReportMatch[1]);
        result.operationReport = reportJson;

        // Determine status from operation report
        if (reportJson.operationStatus === 'Complete') {
          result.status = 'Completed';
        } else if (reportJson.operationStatus === 'Blocked') {
          result.status = 'Blocked';
        } else if (reportJson.operationStatus === 'Failed') {
          result.status = 'Failed';
        }
      } catch (e) {
        console.warn('Failed to parse operation report JSON:', e);
      }
    }

    // Extract updated issue content (between specific markers if present)
    const updatedIssueMatch = output.match(/## Updated Issue Content\s*([\s\S]*?)(?=##|$)/);
    if (updatedIssueMatch) {
      result.updatedIssueContent = updatedIssueMatch[1].trim();
    }

    // Extract comments (marked sections)
    const commentMatches = output.matchAll(/## Comment \d+\s*([\s\S]*?)(?=##|$)/g);
    for (const match of commentMatches) {
      if (match[1]) {
        result.comments.push(match[1].trim());
      }
    }

    // Extract blocking questions
    const blockingQuestionsMatch = output.match(/## Blocking Questions?\s*([\s\S]*?)(?=##|$)/);
    if (blockingQuestionsMatch) {
      const questions = blockingQuestionsMatch[1]
        .split('\n')
        .filter((line) => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^[-\d]+\.?\s*/, '').trim())
        .filter((q) => q.length > 0);
      result.blockingQuestions = questions;
    }

    // Extract context dump
    const contextDumpMatch = output.match(/## Context Dump\s*([\s\S]*?)(?=##|$)/);
    if (contextDumpMatch) {
      result.contextDump = contextDumpMatch[1].trim();
    }

    // If no explicit status found, try to infer from content
    if (result.status === 'Failed') {
      if (result.blockingQuestions.length > 0) {
        result.status = 'Blocked';
      } else if (result.updatedIssueContent || result.comments.length > 0) {
        result.status = 'Completed';
      }
    }

    // Alternative parsing: Look for task list completion markers
    if (!result.updatedIssueContent && output.includes('## Task list')) {
      const taskListMatch = output.match(/## Task list.*?\n([\s\S]*?)(?=##|$)/);
      if (taskListMatch) {
        // Check if all tasks are marked as complete
        const taskLines = taskListMatch[1]
          .split('\n')
          .filter((line) => line.trim().match(/^\d+\.\s*\(/));
        const completedTasks = taskLines.filter((line) => line.includes('(X)'));
        const blockedTasks = taskLines.filter((line) => line.includes('(-)'));

        if (taskLines.length > 0) {
          if (completedTasks.length === taskLines.length) {
            result.status = 'Completed';
          } else if (blockedTasks.length > 0) {
            result.status = 'Blocked';
          }

          // Include the entire output as updated issue if it contains a task list
          result.updatedIssueContent = output;
        }
      }
    }

    // Fallback: if output contains substantial content, consider it at least partially successful
    if (!result.updatedIssueContent && output.length > 100) {
      result.updatedIssueContent = output;
    }

    return result;
  }

  /**
   * Extracts operation reports from the output (can be multiple)
   * @param output The raw output from ClaudeCode
   * @returns Array of operation report file contents
   */
  extractOperationReports(output: string): Array<{ filename: string; content: string }> {
    const reports: Array<{ filename: string; content: string }> = [];

    // Match all operation report sections
    const reportMatches = output.matchAll(
      /operation-report-(\w+)-(\d+)\.md[\s\S]*?(## operation-report-json[\s\S]*?)(?=operation-report-|$)/g
    );

    for (const match of reportMatches) {
      const action = match[1];
      const sequence = match[2].padStart(3, '0');
      const content = match[3].trim();

      reports.push({
        filename: `operation-report-${action}-${sequence}.md`,
        content: content,
      });
    }

    // If no reports found in that format, try to extract from the parsed output
    if (reports.length === 0 && output.includes('## operation-report-json')) {
      const parsed = this.parseOutput(output);
      if (parsed.operationReport) {
        const action = parsed.operationReport.action || 'Unknown';
        reports.push({
          filename: `operation-report-${action}-001.md`,
          content: this.formatOperationReport(parsed.operationReport),
        });
      }
    }

    return reports;
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
