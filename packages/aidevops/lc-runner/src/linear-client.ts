import type { LinearConfig } from './types';
import { LinearApiService, type IssueDetails, type LinearApiError } from './linear-api-service';

/**
 * LinearClient provides Linear API integration using the Linear SDK.
 */
export class LinearClient {
  private config: LinearConfig;
  private apiService: LinearApiService;

  constructor(config: LinearConfig) {
    this.config = config;
    this.apiService = new LinearApiService(config.apiKeyEnvVar);

    // Check if API key is configured
    if (!this.apiService.isConfigured()) {
      console.warn(
        `Warning: Linear API key not found in environment variable '${config.apiKeyEnvVar}'.`
      );
    }
  }

  /**
   * Validates that an issue is in the expected status.
   *
   * @param issueId - The Linear issue ID
   * @param expectedStatus - The expected status for the operation
   * @returns true if validation passes
   * @throws LinearApiError if API call fails
   */
  public async validateIssueStatus(issueId: string, expectedStatus: string): Promise<boolean> {
    try {
      return await this.apiService.validateIssueStatus(issueId, expectedStatus);
    } catch (error) {
      const apiError = error as LinearApiError;
      if (apiError.code === 'API_KEY_MISSING') {
        // For backwards compatibility, log warning and return true if no API key
        console.warn(`[Linear API] Skipping validation - ${apiError.message}`);
        return true;
      }
      // Re-throw other errors for proper handling
      throw error;
    }
  }

  /**
   * Updates an issue's status after an operation completes.
   *
   * @param issueId - The Linear issue ID
   * @param newStatus - The new status to set
   */
  public async updateIssueStatus(issueId: string, newStatus: string): Promise<void> {
    try {
      await this.apiService.updateIssueStatus(issueId, newStatus);
      console.log(`Successfully updated issue ${issueId} to status '${newStatus}'`);
    } catch (error) {
      const apiError = error as LinearApiError;
      if (apiError.code === 'API_KEY_MISSING') {
        console.warn(`[Linear API] Skipping status update - ${apiError.message}`);
        return;
      }
      console.error(`Failed to update issue status: ${apiError.message}`);
      // Don't re-throw to avoid breaking the operation flow
    }
  }

  /**
   * Fetches full issue details from Linear including body content.
   *
   * @param issueId - The Linear issue ID
   * @returns Issue details with full body content
   * @throws LinearApiError if API call fails
   */
  public async getIssue(issueId: string): Promise<IssueDetails> {
    try {
      return await this.apiService.getIssueBody(issueId);
    } catch (error) {
      const apiError = error as LinearApiError;
      if (apiError.code === 'API_KEY_MISSING') {
        // Return a placeholder for backwards compatibility
        console.warn(`[Linear API] Using placeholder - ${apiError.message}`);
        return {
          id: issueId,
          identifier: issueId,
          title: 'Placeholder Issue',
          description:
            'This is a placeholder issue object - configure LINEAR_API_KEY to fetch real data',
          status: 'Unknown',
          priority: null,
          assignee: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          url: '#',
        };
      }
      throw error;
    }
  }

  /**
   * Gets just the issue body/description content.
   *
   * @param issueId - The Linear issue ID
   * @returns The issue body content
   * @throws LinearApiError if API call fails
   */
  public async getIssueBody(issueId: string): Promise<string> {
    const issue = await this.getIssue(issueId);
    return issue.description;
  }

  /**
   * Gets the current status of an issue.
   *
   * @param issueId - The Linear issue ID
   * @returns The current status name
   * @throws LinearApiError if API call fails
   */
  public async getIssueStatus(issueId: string): Promise<string> {
    try {
      return await this.apiService.getIssueStatus(issueId);
    } catch (error) {
      const apiError = error as LinearApiError;
      if (apiError.code === 'API_KEY_MISSING') {
        console.warn(`[Linear API] Cannot fetch status - ${apiError.message}`);
        return 'Unknown';
      }
      throw error;
    }
  }

  /**
   * Adds a comment to a Linear issue.
   *
   * @param issueId - The Linear issue ID
   * @param comment - The comment text to add
   */
  public async addComment(issueId: string, comment: string): Promise<void> {
    try {
      await this.apiService.addComment(issueId, comment);
      console.log(`Successfully added comment to issue ${issueId}`);
    } catch (error) {
      const apiError = error as LinearApiError;
      if (apiError.code === 'API_KEY_MISSING') {
        console.warn(`[Linear API] Skipping comment - ${apiError.message}`);
        return;
      }
      console.error(`Failed to add comment: ${apiError.message}`);
      // Don't re-throw to avoid breaking the operation flow
    }
  }

  /**
   * Checks if the Linear API is accessible.
   *
   * @returns true if API is accessible
   */
  public async checkConnection(): Promise<boolean> {
    try {
      const connected = await this.apiService.checkConnection();
      if (connected) {
        console.log(`Successfully connected to Linear API`);
      }
      return connected;
    } catch {
      console.warn(`Linear API connection check failed`);
      return false;
    }
  }
}
