import { LinearApiService } from '../src/linear-api-service';
import { linearApiCommand } from '../src/commands/linear-api';
import * as child_process from 'child_process';
import { promisify } from 'util';

const exec = promisify(child_process.exec);

// Mock the LinearApiService
jest.mock('../src/linear-api-service');

describe('Breakout Integration Tests', () => {
  let mockService: jest.Mocked<LinearApiService>;
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  let consoleOutput: string[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, LINEAR_API_KEY: 'test-key' };
    consoleOutput = [];
    console.log = jest.fn((output) => {
      consoleOutput.push(output);
    });

    // Create mock service
    mockService = {
      isConfigured: jest.fn().mockReturnValue(true),
      createIssue: jest.fn(),
      createIssueRelation: jest.fn(),
      getChildIssues: jest.fn(),
      getIssueMetadata: jest.fn(),
      getIssueBody: jest.fn(),
      updateIssueBody: jest.fn(),
      addComment: jest.fn(),
      updateIssueStatus: jest.fn(),
    } as any;

    // Mock the constructor
    (LinearApiService as jest.MockedClass<typeof LinearApiService>).mockImplementation(
      () => mockService
    );
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
  });

  describe('CLI Command Integration', () => {
    it('should create issue via CLI command', async () => {
      const mockCreatedIssue = {
        id: 'sub-issue-id',
        identifier: 'AM-101',
        url: 'https://linear.app/team/issue/AM-101',
        title: 'Breakout Sub-Issue',
      };

      mockService.createIssue.mockResolvedValue(mockCreatedIssue);

      const input = {
        title: 'Breakout Sub-Issue',
        description: 'Sub-issue description',
        teamId: 'team-123',
        parentId: 'parent-id',
        labelIds: ['label-1'],
        priority: 2,
      };

      await linearApiCommand('create-issue', [JSON.stringify(input)]);

      expect(mockService.createIssue).toHaveBeenCalledWith(input);
      expect(consoleOutput[0]).toContain('"success": true');
      expect(consoleOutput[0]).toContain('"identifier": "AM-101"');
    });

    it('should get child issues via CLI command', async () => {
      const mockChildren = [
        {
          id: 'child-1',
          identifier: 'AM-102',
          title: 'Child Issue 1',
          url: 'https://linear.app/team/issue/AM-102',
        },
        {
          id: 'child-2',
          identifier: 'AM-103',
          title: 'Child Issue 2',
          url: 'https://linear.app/team/issue/AM-103',
        },
      ];

      mockService.getChildIssues.mockResolvedValue(mockChildren);

      await linearApiCommand('get-children', ['AM-100']);

      expect(mockService.getChildIssues).toHaveBeenCalledWith('AM-100');
      expect(consoleOutput[0]).toContain('"success": true');
      expect(consoleOutput[0]).toContain('AM-102');
      expect(consoleOutput[0]).toContain('AM-103');
    });

    it('should get issue metadata via CLI command', async () => {
      const mockMetadata = {
        teamId: 'team-123',
        labelIds: ['label-1', 'label-2'],
        projectId: 'project-123',
        priority: 2,
        assigneeId: 'user-123',
      };

      mockService.getIssueMetadata.mockResolvedValue(mockMetadata);

      await linearApiCommand('get-metadata', ['AM-100']);

      expect(mockService.getIssueMetadata).toHaveBeenCalledWith('AM-100');
      expect(consoleOutput[0]).toContain('"success": true');
      expect(consoleOutput[0]).toContain('"teamId": "team-123"');
      expect(consoleOutput[0]).toContain('"priority": 2');
    });

    it('should create issue relation via CLI command', async () => {
      mockService.createIssueRelation.mockResolvedValue(undefined);

      const input = {
        issueId: 'issue-1',
        relatedIssueId: 'issue-2',
        type: 'blocks' as const,
      };

      await linearApiCommand('create-relation', [JSON.stringify(input)]);

      expect(mockService.createIssueRelation).toHaveBeenCalledWith(input);
      expect(consoleOutput[0]).toContain('"success": true');
    });

    it('should handle errors gracefully', async () => {
      mockService.createIssue.mockRejectedValue(new Error('API Error'));

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      const input = {
        title: 'Test Issue',
        teamId: 'team-123',
      };

      try {
        await linearApiCommand('create-issue', [JSON.stringify(input)]);
      } catch (error: any) {
        expect(error.message).toBe('Process exit');
      }

      expect(consoleOutput[0]).toContain('"success": false');
      expect(consoleOutput[0]).toContain('"error": "API Error"');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should handle missing API key', async () => {
      mockService.isConfigured.mockReturnValue(false);

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      try {
        await linearApiCommand('get-children', ['AM-100']);
      } catch (error: any) {
        expect(error.message).toBe('Process exit');
      }

      expect(consoleOutput[0]).toContain('"success": false');
      expect(consoleOutput[0]).toContain('LINEAR_API_KEY environment variable is not set');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe('Breakout Workflow Simulation', () => {
    it('should simulate complete breakout workflow', async () => {
      // Step 1: Get parent metadata
      const parentMetadata = {
        teamId: 'team-aimeup',
        labelIds: ['grooming', 'feature'],
        projectId: 'project-lcrunner',
        priority: 2,
        assigneeId: 'user-doug',
      };
      mockService.getIssueMetadata.mockResolvedValue(parentMetadata);

      // Step 2: Check for existing children
      mockService.getChildIssues.mockResolvedValue([]);

      // Step 3: Create sub-issues
      const subIssue1 = {
        id: 'sub-1',
        identifier: 'AM-201',
        url: 'https://linear.app/aimeup/issue/AM-201',
        title: 'Implement API endpoint',
      };
      const subIssue2 = {
        id: 'sub-2',
        identifier: 'AM-202',
        url: 'https://linear.app/aimeup/issue/AM-202',
        title: 'Add UI components',
      };
      mockService.createIssue
        .mockResolvedValueOnce(subIssue1)
        .mockResolvedValueOnce(subIssue2);

      // Step 4: Create blocking relationship
      mockService.createIssueRelation.mockResolvedValue(undefined);

      // Simulate the workflow
      await linearApiCommand('get-metadata', ['AM-100']);
      const metadataOutput = JSON.parse(consoleOutput[0]);
      expect(metadataOutput.success).toBe(true);
      expect(metadataOutput.data.teamId).toBe('team-aimeup');

      consoleOutput = [];
      await linearApiCommand('get-children', ['AM-100']);
      const childrenOutput = JSON.parse(consoleOutput[0]);
      expect(childrenOutput.success).toBe(true);
      expect(childrenOutput.data).toEqual([]);

      // Create first sub-issue
      consoleOutput = [];
      await linearApiCommand('create-issue', [
        JSON.stringify({
          title: 'Implement API endpoint',
          teamId: parentMetadata.teamId,
          parentId: 'AM-100',
          labelIds: parentMetadata.labelIds,
          priority: parentMetadata.priority,
        }),
      ]);
      const issue1Output = JSON.parse(consoleOutput[0]);
      expect(issue1Output.success).toBe(true);
      expect(issue1Output.data.identifier).toBe('AM-201');

      // Create second sub-issue
      consoleOutput = [];
      await linearApiCommand('create-issue', [
        JSON.stringify({
          title: 'Add UI components',
          teamId: parentMetadata.teamId,
          parentId: 'AM-100',
          labelIds: parentMetadata.labelIds,
          priority: parentMetadata.priority,
        }),
      ]);
      const issue2Output = JSON.parse(consoleOutput[0]);
      expect(issue2Output.success).toBe(true);
      expect(issue2Output.data.identifier).toBe('AM-202');

      // Create blocking relationship
      consoleOutput = [];
      await linearApiCommand('create-relation', [
        JSON.stringify({
          issueId: 'sub-2',
          relatedIssueId: 'sub-1',
          type: 'blocks',
        }),
      ]);
      const relationOutput = JSON.parse(consoleOutput[0]);
      expect(relationOutput.success).toBe(true);
    });

    it('should handle duplicate detection', async () => {
      // Existing children with one matching title
      const existingChildren = [
        {
          id: 'existing-1',
          identifier: 'AM-150',
          title: 'Existing Task',
          url: 'https://linear.app/aimeup/issue/AM-150',
        },
      ];
      mockService.getChildIssues.mockResolvedValue(existingChildren);

      await linearApiCommand('get-children', ['AM-100']);
      const output = JSON.parse(consoleOutput[0]);
      
      expect(output.success).toBe(true);
      expect(output.data).toHaveLength(1);
      expect(output.data[0].title).toBe('Existing Task');
      
      // Should update existing instead of creating new
      mockService.updateIssueBody.mockResolvedValue(undefined);
      
      consoleOutput = [];
      await linearApiCommand('update-issue', ['AM-150', 'Updated content for existing task']);
      
      expect(mockService.updateIssueBody).toHaveBeenCalledWith('AM-150', 'Updated content for existing task');
      const updateOutput = JSON.parse(consoleOutput[0]);
      expect(updateOutput.success).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid JSON input', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      try {
        await linearApiCommand('create-issue', ['invalid json']);
      } catch (error: any) {
        expect(error.message).toBe('Process exit');
      }

      expect(consoleOutput[0]).toContain('"success": false');
      expect(consoleOutput[0]).toContain('Unexpected token');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should handle unknown action', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      try {
        await linearApiCommand('unknown-action', ['test']);
      } catch (error: any) {
        expect(error.message).toBe('Process exit');
      }

      expect(consoleOutput[0]).toContain('"success": false');
      expect(consoleOutput[0]).toContain('Unknown action: unknown-action');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    it('should handle missing arguments', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      try {
        await linearApiCommand('get-children', []);
      } catch (error: any) {
        expect(error.message).toBe('Process exit');
      }

      expect(consoleOutput[0]).toContain('"success": false');
      expect(consoleOutput[0]).toContain('Missing parent issue ID');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });
});