import { LinearClient } from '../src/linear-client';
import { LinearApiService } from '../src/linear-api-service';
import type { LinearConfig } from '../src/types';

// Mock the LinearApiService
jest.mock('../src/linear-api-service');

describe('LinearClient', () => {
  let client: LinearClient;
  let mockApiService: jest.Mocked<LinearApiService>;
  const mockConfig: LinearConfig = {
    apiUrl: 'https://api.linear.app',
    apiKeyEnvVar: 'LINEAR_API_KEY',
    issuePrefix: 'AM',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock LinearApiService
    mockApiService = {
      isConfigured: jest.fn().mockReturnValue(true),
      validateIssueStatus: jest.fn(),
      getIssueBody: jest.fn(),
      getIssueStatus: jest.fn(),
      checkConnection: jest.fn(),
      addComment: jest.fn(),
      updateIssueStatus: jest.fn(),
    } as any;

    (LinearApiService as jest.MockedClass<typeof LinearApiService>).mockImplementation(
      () => mockApiService
    );

    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    client = new LinearClient(mockConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with configured API key', () => {
      expect(LinearApiService).toHaveBeenCalledWith('LINEAR_API_KEY');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn when API key is not configured', () => {
      mockApiService.isConfigured.mockReturnValue(false);
      new LinearClient(mockConfig);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Linear API key not found')
      );
    });
  });

  describe('validateIssueStatus', () => {
    it('should validate issue status successfully', async () => {
      mockApiService.validateIssueStatus.mockResolvedValue(true);

      const result = await client.validateIssueStatus('AM-20', 'In Progress');

      expect(result).toBe(true);
      expect(mockApiService.validateIssueStatus).toHaveBeenCalledWith('AM-20', 'In Progress');
    });

    it('should return true when API key is missing (backwards compatibility)', async () => {
      const error: any = new Error('API key missing');
      error.code = 'API_KEY_MISSING';
      mockApiService.validateIssueStatus.mockRejectedValue(error);

      const result = await client.validateIssueStatus('AM-20', 'In Progress');

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Skipping validation'));
    });

    it('should re-throw other errors', async () => {
      const error: any = new Error('Network error');
      error.code = 'CONNECTION_ERROR';
      mockApiService.validateIssueStatus.mockRejectedValue(error);

      await expect(client.validateIssueStatus('AM-20', 'In Progress')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getIssue', () => {
    it('should fetch issue details', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-20',
        title: 'Test Issue',
        description: 'Test description',
        status: 'In Progress',
        priority: 1,
        assignee: 'John Doe',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        url: 'https://linear.app/issue',
      };

      mockApiService.getIssueBody.mockResolvedValue(mockIssue);

      const result = await client.getIssue('AM-20');

      expect(result).toEqual(mockIssue);
      expect(mockApiService.getIssueBody).toHaveBeenCalledWith('AM-20');
    });

    it('should return placeholder when API key is missing', async () => {
      const error: any = new Error('API key missing');
      error.code = 'API_KEY_MISSING';
      mockApiService.getIssueBody.mockRejectedValue(error);

      const result = await client.getIssue('AM-20');

      expect(result.identifier).toBe('AM-20');
      expect(result.title).toBe('Placeholder Issue');
      expect(result.description).toContain('configure LINEAR_API_KEY');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Using placeholder'));
    });

    it('should re-throw other errors', async () => {
      const error: any = new Error('Issue not found');
      error.code = 'ISSUE_NOT_FOUND';
      mockApiService.getIssueBody.mockRejectedValue(error);

      await expect(client.getIssue('AM-20')).rejects.toThrow('Issue not found');
    });
  });

  describe('getIssueBody', () => {
    it('should return just the issue description', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-20',
        title: 'Test Issue',
        description: 'This is the issue body content',
        status: 'In Progress',
        priority: 1,
        assignee: 'John Doe',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        url: 'https://linear.app/issue',
      };

      mockApiService.getIssueBody.mockResolvedValue(mockIssue);

      const result = await client.getIssueBody('AM-20');

      expect(result).toBe('This is the issue body content');
    });
  });

  describe('getIssueStatus', () => {
    it('should fetch issue status', async () => {
      mockApiService.getIssueStatus.mockResolvedValue('In Review');

      const result = await client.getIssueStatus('AM-20');

      expect(result).toBe('In Review');
      expect(mockApiService.getIssueStatus).toHaveBeenCalledWith('AM-20');
    });

    it('should return Unknown when API key is missing', async () => {
      const error: any = new Error('API key missing');
      error.code = 'API_KEY_MISSING';
      mockApiService.getIssueStatus.mockRejectedValue(error);

      const result = await client.getIssueStatus('AM-20');

      expect(result).toBe('Unknown');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Cannot fetch status'));
    });
  });

  describe('updateIssueStatus', () => {
    it('should update issue status successfully', async () => {
      mockApiService.updateIssueStatus.mockResolvedValue(undefined);

      await client.updateIssueStatus('AM-20', 'Done');

      expect(mockApiService.updateIssueStatus).toHaveBeenCalledWith('AM-20', 'Done');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Successfully updated'));
    });

    it('should skip update when API key is missing', async () => {
      const error: any = new Error('API key missing');
      error.code = 'API_KEY_MISSING';
      mockApiService.updateIssueStatus.mockRejectedValue(error);

      await client.updateIssueStatus('AM-20', 'Done');

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Skipping status update'));
    });

    it('should log error but not throw for other failures', async () => {
      const error: any = new Error('Update failed');
      error.code = 'UNKNOWN_ERROR';
      mockApiService.updateIssueStatus.mockRejectedValue(error);

      await client.updateIssueStatus('AM-20', 'Done');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to update'));
    });
  });

  describe('addComment', () => {
    it('should add comment successfully', async () => {
      mockApiService.addComment.mockResolvedValue(undefined);

      await client.addComment('AM-20', 'Test comment');

      expect(mockApiService.addComment).toHaveBeenCalledWith('AM-20', 'Test comment');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Successfully added comment')
      );
    });

    it('should skip comment when API key is missing', async () => {
      const error: any = new Error('API key missing');
      error.code = 'API_KEY_MISSING';
      mockApiService.addComment.mockRejectedValue(error);

      await client.addComment('AM-20', 'Test comment');

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Skipping comment'));
    });

    it('should log error but not throw for other failures', async () => {
      const error: any = new Error('Comment failed');
      error.code = 'UNKNOWN_ERROR';
      mockApiService.addComment.mockRejectedValue(error);

      await client.addComment('AM-20', 'Test comment');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to add comment'));
    });
  });

  describe('checkConnection', () => {
    it('should check connection successfully', async () => {
      mockApiService.checkConnection.mockResolvedValue(true);

      const result = await client.checkConnection();

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Successfully connected'));
    });

    it('should return false on connection failure', async () => {
      mockApiService.checkConnection.mockResolvedValue(false);

      const result = await client.checkConnection();

      expect(result).toBe(false);
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Successfully connected')
      );
    });

    it('should handle exceptions gracefully', async () => {
      mockApiService.checkConnection.mockRejectedValue(new Error('Connection error'));

      const result = await client.checkConnection();

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('connection check failed'));
    });
  });
});
