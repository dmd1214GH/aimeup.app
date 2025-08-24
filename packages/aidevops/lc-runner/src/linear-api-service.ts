import { LinearClient as LinearSDKClient } from '@linear/sdk';

export interface IssueDetails {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: string;
  priority: number | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface LinearApiError extends Error {
  code:
    | 'API_KEY_MISSING'
    | 'CONNECTION_ERROR'
    | 'ISSUE_NOT_FOUND'
    | 'AUTHENTICATION_ERROR'
    | 'UNKNOWN_ERROR';
}

export class LinearApiService {
  private client: LinearSDKClient | null = null;
  private apiKey: string | undefined;

  constructor(apiKeyEnvVar: string = 'LINEAR_API_KEY') {
    this.apiKey = process.env[apiKeyEnvVar];

    if (this.apiKey) {
      this.client = new LinearSDKClient({
        apiKey: this.apiKey,
      });
    }
  }

  private ensureClient(): LinearSDKClient {
    if (!this.client) {
      const error = new Error(
        'Linear API key not configured. Please set the LINEAR_API_KEY environment variable.'
      ) as LinearApiError;
      error.code = 'API_KEY_MISSING';
      throw error;
    }
    return this.client;
  }

  /**
   * Fetches the full issue body and metadata from Linear
   */
  async getIssueBody(issueId: string): Promise<IssueDetails> {
    try {
      const client = this.ensureClient();

      // Fetch issue by identifier (e.g., "AM-20")
      const issue = await client.issue(issueId);

      if (!issue) {
        const error = new Error(`Issue ${issueId} not found in Linear`) as LinearApiError;
        error.code = 'ISSUE_NOT_FOUND';
        throw error;
      }

      // Fetch related data
      const [state, assignee] = await Promise.all([issue.state, issue.assignee]);

      return {
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description || '',
        status: state?.name || 'Unknown',
        priority: issue.priority,
        assignee: assignee?.name || null,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        url: issue.url,
      };
    } catch (error) {
      if ((error as LinearApiError).code) {
        throw error;
      }

      const apiError = new Error(
        `Failed to fetch issue from Linear: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as LinearApiError;

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        apiError.code = 'AUTHENTICATION_ERROR';
      } else if (error instanceof Error && error.message.includes('Network')) {
        apiError.code = 'CONNECTION_ERROR';
      } else {
        apiError.code = 'UNKNOWN_ERROR';
      }

      throw apiError;
    }
  }

  /**
   * Gets the current status of an issue
   */
  async getIssueStatus(issueId: string): Promise<string> {
    try {
      const client = this.ensureClient();
      const issue = await client.issue(issueId);

      if (!issue) {
        const error = new Error(`Issue ${issueId} not found in Linear`) as LinearApiError;
        error.code = 'ISSUE_NOT_FOUND';
        throw error;
      }

      const state = await issue.state;
      return state?.name || 'Unknown';
    } catch (error) {
      if ((error as LinearApiError).code) {
        throw error;
      }

      const apiError = new Error(
        `Failed to fetch issue status: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as LinearApiError;
      apiError.code = 'UNKNOWN_ERROR';
      throw apiError;
    }
  }

  /**
   * Validates that an issue exists and is in the expected status
   */
  async validateIssueStatus(issueId: string, expectedStatus: string): Promise<boolean> {
    const status = await this.getIssueStatus(issueId);
    return status === expectedStatus;
  }

  /**
   * Checks if the Linear API is accessible with current credentials
   */
  async checkConnection(): Promise<boolean> {
    try {
      const client = this.ensureClient();
      // Try to fetch the viewer (current user) as a connection test
      const viewer = await client.viewer;
      return viewer !== null;
    } catch {
      return false;
    }
  }

  /**
   * Adds a comment to an issue
   */
  async addComment(issueId: string, comment: string): Promise<void> {
    try {
      const client = this.ensureClient();
      const issue = await client.issue(issueId);

      if (!issue) {
        const error = new Error(`Issue ${issueId} not found in Linear`) as LinearApiError;
        error.code = 'ISSUE_NOT_FOUND';
        throw error;
      }

      await client.createComment({
        issueId: issue.id,
        body: comment,
      });
    } catch (error) {
      if ((error as LinearApiError).code) {
        throw error;
      }

      const apiError = new Error(
        `Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as LinearApiError;
      apiError.code = 'UNKNOWN_ERROR';
      throw apiError;
    }
  }

  /**
   * Updates issue status
   */
  async updateIssueStatus(issueId: string, newStatusName: string): Promise<void> {
    try {
      const client = this.ensureClient();
      const issue = await client.issue(issueId);

      if (!issue) {
        const error = new Error(`Issue ${issueId} not found in Linear`) as LinearApiError;
        error.code = 'ISSUE_NOT_FOUND';
        throw error;
      }

      // Get the team's workflow states to find the target state ID
      const team = await issue.team;
      if (!team) {
        throw new Error('Issue does not belong to a team');
      }

      const states = await team.states();
      const targetState = states.nodes.find((state) => state.name === newStatusName);

      if (!targetState) {
        throw new Error(`Status '${newStatusName}' not found in team workflow`);
      }

      await issue.update({
        stateId: targetState.id,
      });
    } catch (error) {
      if ((error as LinearApiError).code) {
        throw error;
      }

      const apiError = new Error(
        `Failed to update issue status: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as LinearApiError;
      apiError.code = 'UNKNOWN_ERROR';
      throw apiError;
    }
  }

  /**
   * Updates the issue body/description
   */
  async updateIssueBody(issueId: string, newBody: string): Promise<void> {
    try {
      const client = this.ensureClient();
      const issue = await client.issue(issueId);

      if (!issue) {
        const error = new Error(`Issue ${issueId} not found in Linear`) as LinearApiError;
        error.code = 'ISSUE_NOT_FOUND';
        throw error;
      }

      await issue.update({
        description: newBody,
      });
    } catch (error) {
      if ((error as LinearApiError).code) {
        throw error;
      }

      const apiError = new Error(
        `Failed to update issue body: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as LinearApiError;
      apiError.code = 'UNKNOWN_ERROR';
      throw apiError;
    }
  }

  /**
   * Returns whether the API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
