import { LinearApiService } from '../linear-api-service';

/**
 * CLI command handler for Linear API operations
 * This provides a command-line interface to LinearApiService methods
 * that can be called from subagents via Bash
 */

interface CliResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function outputJson(response: CliResponse): void {
  console.log(JSON.stringify(response, null, 2));
}

export async function linearApiCommand(action: string, args: string[]): Promise<void> {
  const service = new LinearApiService();

  if (!service.isConfigured()) {
    outputJson({
      success: false,
      error: 'LINEAR_API_KEY environment variable is not set',
    });
    process.exit(1);
  }

  try {
    switch (action) {
      case 'create-issue': {
        // Parse JSON input from args[0]
        if (!args[0]) {
          throw new Error('Missing JSON input for create-issue');
        }
        const input = JSON.parse(args[0]);
        const result = await service.createIssue(input);
        outputJson({ success: true, data: result });
        break;
      }

      case 'create-relation': {
        // Parse JSON input from args[0]
        if (!args[0]) {
          throw new Error('Missing JSON input for create-relation');
        }
        const input = JSON.parse(args[0]);
        await service.createIssueRelation(input);
        outputJson({ success: true });
        break;
      }

      case 'get-children': {
        // Parent issue ID from args[0]
        if (!args[0]) {
          throw new Error('Missing parent issue ID');
        }
        const children = await service.getChildIssues(args[0]);
        outputJson({ success: true, data: children });
        break;
      }

      case 'get-metadata': {
        // Issue ID from args[0]
        if (!args[0]) {
          throw new Error('Missing issue ID');
        }
        const metadata = await service.getIssueMetadata(args[0]);
        outputJson({ success: true, data: metadata });
        break;
      }

      case 'get-issue': {
        // Issue ID from args[0]
        if (!args[0]) {
          throw new Error('Missing issue ID');
        }
        const issue = await service.getIssueBody(args[0]);
        outputJson({ success: true, data: issue });
        break;
      }

      case 'update-issue': {
        // Issue ID from args[0], new body from args[1]
        if (!args[0] || !args[1]) {
          throw new Error('Missing issue ID or body');
        }
        await service.updateIssueBody(args[0], args[1]);
        outputJson({ success: true });
        break;
      }

      case 'add-comment': {
        // Issue ID from args[0], comment from args[1]
        if (!args[0] || !args[1]) {
          throw new Error('Missing issue ID or comment');
        }
        await service.addComment(args[0], args[1]);
        outputJson({ success: true });
        break;
      }

      case 'update-status': {
        // Issue ID from args[0], new status from args[1]
        if (!args[0] || !args[1]) {
          throw new Error('Missing issue ID or status');
        }
        await service.updateIssueStatus(args[0], args[1]);
        outputJson({ success: true });
        break;
      }

      default:
        outputJson({
          success: false,
          error: `Unknown action: ${action}. Available actions: create-issue, create-relation, get-children, get-metadata, get-issue, update-issue, add-comment, update-status`,
        });
        process.exit(1);
    }
  } catch (error) {
    outputJson({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}