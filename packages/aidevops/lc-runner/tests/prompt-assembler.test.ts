import * as fs from 'fs';
import { PromptAssembler } from '../src/prompt-assembler';
import type { PromptReplacements } from '../src/prompt-assembler';

// Mock fs module
jest.mock('fs');

describe('PromptAssembler', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  let assembler: PromptAssembler;

  beforeEach(() => {
    jest.clearAllMocks();
    assembler = new PromptAssembler();
  });

  describe('assembleMasterPrompt', () => {
    const generalPromptPath = '/prompts/general.md';
    const operationPromptPath = '/prompts/operation.md';
    const outputPath = '/output/master-prompt.md';
    const replacements: PromptReplacements = {
      issueId: 'AM-19',
      operation: 'Delivery',
      workingFolder: '/work/lcr-AM-19/op-Delivery-123',
    };

    it('should assemble master prompt with replacements', () => {
      // Include MCP instructions in the template as they are now part of the general prompt
      const generalContent =
        '## General Prompt\n' +
        'Issue: <ArgIssueId>\n' +
        'Operation: <ArgOperation>\n' +
        'Folder: <ArgWorkingFolder>\n' +
        '#### MCP Integration for Issue Content Saving\n' +
        'MCP save instructions are included in template\n';

      const operationContent = '## Operation Instructions\n' + 'Specific instructions here\n';

      mockFs.existsSync
        .mockReturnValueOnce(true) // general prompt exists
        .mockReturnValueOnce(true) // operation prompt exists
        .mockReturnValueOnce(true); // output dir exists
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check that replacements were made
      expect(writtenContent).toContain('Issue: AM-19');
      expect(writtenContent).toContain('Operation: Delivery');
      expect(writtenContent).toContain('Folder: /work/lcr-AM-19/op-Delivery-123');
      expect(writtenContent).toContain('## Operation Instructions');
      expect(writtenContent).toContain('Specific instructions here');

      // Check that MCP save instructions from template are preserved
      expect(writtenContent).toContain('MCP Integration for Issue Content Saving');
    });

    it('should create output directory if missing', () => {
      const generalContent = '## General\nGeneral: <ArgIssueId>';
      const operationContent = '## Operation\nContent';

      mockFs.existsSync
        .mockReturnValueOnce(true) // general prompt exists
        .mockReturnValueOnce(true) // operation prompt exists
        .mockReturnValueOnce(false); // output dir doesn't exist
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath
      );

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/output', { recursive: true });
    });

    it('should handle missing prompt files', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        assembler.assembleMasterPrompt(
          generalPromptPath,
          operationPromptPath,
          replacements,
          outputPath
        );
      }).toThrow('Prompt file not found: /prompts/general.md');
    });
  });

  describe('loadPromptFile', () => {
    it('should load prompt file content', () => {
      const content = '## Test Prompt\nContent here';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(content);

      const result = assembler.loadPromptFile('/test/prompt.md');

      expect(result).toBe(content);
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/test/prompt.md', 'utf8');
    });

    it('should throw error for missing file', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        assembler.loadPromptFile('/missing/prompt.md');
      }).toThrow('Prompt file not found: /missing/prompt.md');
    });

    it('should handle read errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        assembler.loadPromptFile('/test/prompt.md');
      }).toThrow('Failed to read prompt file /test/prompt.md: Permission denied');
    });
  });

  describe('performReplacements', () => {
    it('should replace all placeholders', () => {
      const prompt =
        'Issue: <ArgIssueId>\n' +
        'Op: <ArgOperation>\n' +
        'Folder: <ArgWorkingFolder>\n' +
        'Again: <ArgIssueId>';

      const replacements: PromptReplacements = {
        issueId: 'TEST-1',
        operation: 'TestOp',
        workingFolder: '/test/folder',
      };

      const result = assembler.performReplacements(prompt, replacements);

      expect(result).toBe(
        'Issue: TEST-1\n' + 'Op: TestOp\n' + 'Folder: /test/folder\n' + 'Again: TEST-1'
      );
    });

    it('should handle prompts without placeholders', () => {
      const prompt = 'No placeholders here';
      const replacements: PromptReplacements = {
        issueId: 'TEST-1',
        operation: 'TestOp',
        workingFolder: '/test/folder',
      };

      const result = assembler.performReplacements(prompt, replacements);

      expect(result).toBe('No placeholders here');
    });
  });

  describe('validatePromptFormat', () => {
    it('should accept valid prompt with one ## at start', () => {
      const validPrompt = '## Valid Prompt\nContent here\nMore content';

      expect(() => {
        assembler.validatePromptFormat(validPrompt, 'test.md');
      }).not.toThrow();
    });

    it('should accept prompt with empty lines before ##', () => {
      const validPrompt = '\n\n## Valid Prompt\nContent';

      expect(() => {
        assembler.validatePromptFormat(validPrompt, 'test.md');
      }).not.toThrow();
    });

    it('should reject prompt with level-1 heading', () => {
      const invalidPrompt = '## Valid Start\n# Invalid Heading\nContent';

      expect(() => {
        assembler.validatePromptFormat(invalidPrompt, 'test.md');
      }).toThrow(
        'Prompt format error in test.md: ' +
          'Level-1 heading (#) found at line 2. ' +
          'Operation prompts must not contain level-1 headings.'
      );
    });

    it('should reject prompt with no level-2 heading', () => {
      const invalidPrompt = 'Just content\nNo headings here';

      expect(() => {
        assembler.validatePromptFormat(invalidPrompt, 'test.md');
      }).toThrow(
        'Prompt format error in test.md: ' +
          'No level-2 heading (##) found. ' +
          'Operation prompts must start with exactly one level-2 heading.'
      );
    });

    it('should reject prompt with multiple level-2 headings', () => {
      const invalidPrompt = '## First Heading\nContent\n## Second Heading\nMore';

      expect(() => {
        assembler.validatePromptFormat(invalidPrompt, 'test.md');
      }).toThrow(
        'Prompt format error in test.md: ' +
          'Multiple level-2 headings (##) found (2 total). ' +
          'Operation prompts must have exactly one level-2 heading at the start.'
      );
    });

    it('should reject prompt with ## not at start', () => {
      const invalidPrompt = 'Some content first\n## Heading Not At Start\nMore';

      expect(() => {
        assembler.validatePromptFormat(invalidPrompt, 'test.md');
      }).toThrow(
        'Prompt format error in test.md: ' +
          'Level-2 heading (##) found at line 2 but should be at the start. ' +
          'First non-empty line is 1.'
      );
    });
  });

  describe('masterPromptExists', () => {
    it('should return true when file exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const exists = assembler.masterPromptExists('/output/master.md');

      expect(exists).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/output/master.md');
    });

    it('should return false when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const exists = assembler.masterPromptExists('/output/master.md');

      expect(exists).toBe(false);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/output/master.md');
    });
  });

  describe('MCP save instructions', () => {
    const generalPromptPath = '/prompts/general.md';
    const operationPromptPath = '/prompts/operation.md';
    const outputPath = '/output/master-prompt.md';
    const replacements: PromptReplacements = {
      issueId: 'AM-54',
      operation: 'Delivery',
      workingFolder: '/work/lcr-AM-54/op-Delivery-123',
    };

    it('should preserve MCP save instructions from general prompt template', () => {
      // MCP instructions are now in the template, not injected
      const generalContent =
        '## General Prompt\n' +
        '#### MCP Integration for Operation Reports\n' +
        'MCP report instructions here\n' +
        '#### MCP Integration for Issue Content Saving\n' +
        'Save Triggers: save to Linear\n' +
        'mcp__linear__update_issue with <ArgIssueId>\n' +
        '#### Failures\n' +
        'Failure instructions here\n';

      const operationContent = '## Operation Instructions\n' + 'Specific instructions here\n';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check that MCP save instructions from template are preserved
      expect(writtenContent).toContain('MCP Integration for Issue Content Saving');
      expect(writtenContent).toContain('mcp__linear__update_issue');
      expect(writtenContent).toContain('AM-54'); // Should be replaced from <ArgIssueId>
    });

    it('should include MCP save status in operation completion instructions', () => {
      // Include MCP save instructions in template
      const generalContent =
        '## General Prompt\n' +
        '#### MCP Integration for Operation Reports\n' +
        'MCP report instructions here\n' +
        '#### MCP Integration for Issue Content Saving\n' +
        'Automatically at operation completion\n' +
        'mcpSaveStatus field in JSON\n';

      const operationContent = '## Operation Instructions\n' + 'Content here\n';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check for operation completion save trigger from template
      expect(writtenContent).toContain('Automatically at operation completion');
      expect(writtenContent).toContain('mcpSaveStatus');
    });

    it('should include operator command detection instructions', () => {
      // Include MCP save instructions with operator command detection in template
      const generalContent =
        '## General Prompt\n' +
        '#### MCP Integration for Operation Reports\n' +
        'Content here\n' +
        '#### MCP Integration for Issue Content Saving\n' +
        'When the operator explicitly requests "save to Linear"\n';

      const operationContent = '## Operation\nContent';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check for operator command detection from template
      expect(writtenContent).toContain('save to Linear');
      expect(writtenContent).toContain('operator explicitly requests');
    });
  });

  describe('MCP failure test mode', () => {
    const generalPromptPath = '/prompts/general.md';
    const operationPromptPath = '/prompts/operation.md';
    const outputPath = '/output/master-prompt.md';
    const replacements: PromptReplacements = {
      issueId: 'AM-54',
      operation: 'Delivery',
      workingFolder: '/work/lcr-AM-54/op-Delivery-123',
    };

    it('should inject MCP failure test instructions when testMcpFailure is true', () => {
      const generalContent =
        '## General Prompt\n' +
        '#### MCP Integration for Operation Reports\n' +
        'MCP instructions\n' +
        '### Operation Step 1:\n' +
        'Steps here\n';

      const operationContent = '## Operation\nContent';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath,
        { testMcpFailure: true }
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check that test mode instructions are present
      expect(writtenContent).toContain('TEST MODE: MCP Failure Simulation');
      expect(writtenContent).toContain('INVALID-TEST-999');
      expect(writtenContent).toContain('simulate MCP failures');
    });

    it('should not inject test instructions when testMcpFailure is false', () => {
      const generalContent = '## General Prompt\nContent here\n';
      const operationContent = '## Operation\nContent';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValueOnce(generalContent).mockReturnValueOnce(operationContent);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      assembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        outputPath,
        { testMcpFailure: false }
      );

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check that test mode instructions are NOT present
      expect(writtenContent).not.toContain('TEST MODE: MCP Failure Simulation');
      expect(writtenContent).not.toContain('INVALID-TEST-999');
    });
  });
});
