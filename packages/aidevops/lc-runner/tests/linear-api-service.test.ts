import { LinearApiService } from '../src/linear-api-service';
import { LinearClient } from '@linear/sdk';

// Mock the Linear SDK
jest.mock('@linear/sdk');

describe('LinearApiService', () => {
  let service: LinearApiService;
  let mockClient: jest.Mocked<LinearClient>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.LINEAR_API_KEY = 'test-api-key';

    // Create a mock LinearClient instance
    mockClient = {
      issue: jest.fn(),
      viewer: jest.fn().mockResolvedValue({ id: 'user-id' }),
      createComment: jest.fn(),
    } as any;

    // Mock the LinearClient constructor
    (LinearClient as jest.MockedClass<typeof LinearClient>).mockImplementation(() => mockClient);

    service = new LinearApiService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create service without API key', () => {
      delete process.env.LINEAR_API_KEY;
      const serviceWithoutKey = new LinearApiService();
      expect(serviceWithoutKey.isConfigured()).toBe(false);
    });

    it('should create service with API key', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should use custom environment variable', () => {
      process.env.CUSTOM_LINEAR_KEY = 'custom-key';
      const customService = new LinearApiService('CUSTOM_LINEAR_KEY');
      expect(customService.isConfigured()).toBe(true);
    });
  });

  describe('getIssueBody', () => {
    it('should fetch and format issue details', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-20',
        title: 'Test Issue',
        description: 'Test description',
        priority: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        url: 'https://linear.app/issue',
        state: Promise.resolve({ name: 'In Progress' }),
        assignee: Promise.resolve({ name: 'John Doe' }),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const result = await service.getIssueBody('AM-20');

      expect(result).toEqual({
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
      });
      expect(mockClient.issue).toHaveBeenCalledWith('AM-20');
    });

    it('should handle missing description', async () => {
      const mockIssue = {
        id: 'issue-id',
        identifier: 'AM-20',
        title: 'Test Issue',
        description: null,
        priority: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        url: 'https://linear.app/issue',
        state: Promise.resolve({ name: 'Todo' }),
        assignee: Promise.resolve(null),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const result = await service.getIssueBody('AM-20');

      expect(result.description).toBe('');
      expect(result.priority).toBeNull();
      expect(result.assignee).toBeNull();
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.LINEAR_API_KEY;
      const serviceWithoutKey = new LinearApiService();

      await expect(serviceWithoutKey.getIssueBody('AM-20')).rejects.toThrow(
        'Linear API key not configured'
      );
    });

    it('should throw error when issue not found', async () => {
      mockClient.issue.mockResolvedValue(null as any);

      await expect(service.getIssueBody('AM-999')).rejects.toThrow(
        'Issue AM-999 not found in Linear'
      );
    });
  });

  describe('getIssueStatus', () => {
    it('should fetch issue status', async () => {
      const mockIssue = {
        state: Promise.resolve({ name: 'In Review' }),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const status = await service.getIssueStatus('AM-20');
      expect(status).toBe('In Review');
    });

    it('should return Unknown for missing state', async () => {
      const mockIssue = {
        state: Promise.resolve(null),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const status = await service.getIssueStatus('AM-20');
      expect(status).toBe('Unknown');
    });
  });

  describe('validateIssueStatus', () => {
    it('should return true when status matches', async () => {
      const mockIssue = {
        state: Promise.resolve({ name: 'In Progress' }),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const isValid = await service.validateIssueStatus('AM-20', 'In Progress');
      expect(isValid).toBe(true);
    });

    it('should return false when status does not match', async () => {
      const mockIssue = {
        state: Promise.resolve({ name: 'Todo' }),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      const isValid = await service.validateIssueStatus('AM-20', 'In Progress');
      expect(isValid).toBe(false);
    });
  });

  describe('checkConnection', () => {
    it('should return true when connection is successful', async () => {
      const connected = await service.checkConnection();
      expect(connected).toBe(true);
    });

    it('should return false when connection fails', async () => {
      // Create a new service instance with a mock that throws
      const failingMockClient = {
        issue: jest.fn(),
        viewer: null,
        createComment: jest.fn(),
      } as any;

      (LinearClient as jest.MockedClass<typeof LinearClient>).mockImplementationOnce(
        () => failingMockClient
      );

      const failingService = new LinearApiService();
      const connected = await failingService.checkConnection();
      expect(connected).toBe(false);
    });

    it('should return false when API key is missing', async () => {
      delete process.env.LINEAR_API_KEY;
      const serviceWithoutKey = new LinearApiService();

      const connected = await serviceWithoutKey.checkConnection();
      expect(connected).toBe(false);
    });
  });

  describe('addComment', () => {
    it('should add comment to issue', async () => {
      const mockIssue = {
        id: 'issue-id',
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);
      mockClient.createComment.mockResolvedValue({} as any);

      await service.addComment('AM-20', 'Test comment');

      expect(mockClient.createComment).toHaveBeenCalledWith({
        issueId: 'issue-id',
        body: 'Test comment',
      });
    });

    it('should throw error when issue not found', async () => {
      mockClient.issue.mockResolvedValue(null as any);

      await expect(service.addComment('AM-999', 'Test')).rejects.toThrow(
        'Issue AM-999 not found in Linear'
      );
    });
  });

  describe('updateIssueStatus', () => {
    it('should update issue status', async () => {
      const mockIssue = {
        id: 'issue-id',
        team: Promise.resolve({
          states: () => ({
            nodes: [
              { id: 'state-1', name: 'Todo' },
              { id: 'state-2', name: 'In Progress' },
              { id: 'state-3', name: 'Done' },
            ],
          }),
        }),
        update: jest.fn().mockResolvedValue({}),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      await service.updateIssueStatus('AM-20', 'Done');

      expect(mockIssue.update).toHaveBeenCalledWith({
        stateId: 'state-3',
      });
    });

    it('should throw error when status not found in workflow', async () => {
      const mockIssue = {
        id: 'issue-id',
        team: Promise.resolve({
          states: () => ({
            nodes: [
              { id: 'state-1', name: 'Todo' },
              { id: 'state-2', name: 'In Progress' },
            ],
          }),
        }),
        update: jest.fn(),
      };

      mockClient.issue.mockResolvedValue(mockIssue as any);

      await expect(service.updateIssueStatus('AM-20', 'Invalid Status')).rejects.toThrow(
        "Status 'Invalid Status' not found in team workflow"
      );
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized');
      mockClient.issue.mockRejectedValue(authError);

      try {
        await service.getIssueBody('AM-20');
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('AUTHENTICATION_ERROR');
        expect(error.message).toContain('Unauthorized');
      }
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      mockClient.issue.mockRejectedValue(networkError);

      try {
        await service.getIssueBody('AM-20');
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('CONNECTION_ERROR');
        expect(error.message).toContain('Network');
      }
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Something went wrong');
      mockClient.issue.mockRejectedValue(unknownError);

      try {
        await service.getIssueBody('AM-20');
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('UNKNOWN_ERROR');
        expect(error.message).toContain('Something went wrong');
      }
    });
  });
});
