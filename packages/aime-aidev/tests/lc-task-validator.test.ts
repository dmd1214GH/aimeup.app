import * as fs from 'fs';
import * as path from 'path';

describe('LC Task Validator Tests', () => {
  const validatorPath = path.join(__dirname, '../assets/claude-agents/lc-task-validator.md');

  describe('Agent File Structure', () => {
    it('should exist at the correct location', () => {
      expect(fs.existsSync(validatorPath)).toBe(true);
    });

    it('should have correct YAML frontmatter', () => {
      const content = fs.readFileSync(validatorPath, 'utf-8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      expect(yamlMatch).toBeTruthy();

      if (yamlMatch) {
        const frontmatter: any = {};
        yamlMatch[1].split('\n').forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            frontmatter[match[1]] = match[2].replace(/['"]/g, '');
          }
        });

        expect(frontmatter.name).toBe('lc-task-validator');
        expect(frontmatter.description).toContain('validation agent');
        expect(frontmatter.description).toContain('quality standards');
        expect(frontmatter.model).toBe('opus');
      }
    });

    it('should have only read-only tools configured', () => {
      const content = fs.readFileSync(validatorPath, 'utf-8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (yamlMatch) {
        const frontmatter: any = {};
        yamlMatch[1].split('\n').forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            frontmatter[match[1]] = match[2].replace(/['"]/g, '');
          }
        });

        const tools = frontmatter.tools.split(',').map((t: string) => t.trim());

        // Should have exactly these read-only tools
        expect(tools).toContain('Read');
        expect(tools).toContain('Glob');
        expect(tools).toContain('Grep');
        expect(tools.length).toBe(3);

        // Should NOT have write tools
        expect(tools).not.toContain('Write');
        expect(tools).not.toContain('Edit');
        expect(tools).not.toContain('MultiEdit');
        expect(tools).not.toContain('Task');
      }
    });
  });

  describe('Validation Logic Documentation', () => {
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(validatorPath, 'utf-8');
    });

    it('should document all 8 success criteria', () => {
      const criteria = [
        'Requirements Clarity',
        'Complete Coverage',
        'Standards Compliance',
        'Testing Included',
        'Scope Adherence',
        'No Blockers',
        'Self-Contained Tasks',
        'Verifiable Results',
      ];

      criteria.forEach((criterion) => {
        expect(content).toContain(criterion);
      });
    });

    it('should include file path validation logic', () => {
      expect(content).toContain('Validate File Paths');
      expect(content).toContain('Glob tool');
      expect(content).toContain('Grep tool');
      expect(content).toContain('verify referenced files exist');
    });

    it('should specify JSON response format', () => {
      expect(content).toContain('isValid');
      expect(content).toContain('criteriaResults');
      expect(content).toContain('issues');
      expect(content).toContain('taskId');
      expect(content).toContain('problem');
      expect(content).toContain('suggestion');
      expect(content).toContain('severity');
    });

    it('should define severity levels', () => {
      expect(content).toContain('Critical');
      expect(content).toContain('Major');
      expect(content).toContain('Minor');
    });
  });

  describe('Input Parameter Compatibility', () => {
    let validatorContent: string;

    beforeAll(() => {
      validatorContent = fs.readFileSync(validatorPath, 'utf-8');
    });

    it('should accept identical parameters as lc-issue-tasker', () => {
      // Both should document the same parameters
      expect(validatorContent).toContain('issueId');
      expect(validatorContent).toContain('workingFolder');
      expect(validatorContent).toContain('validationFeedback');

      // Should read from same file location
      expect(validatorContent).toContain('<workingFolder>/updated-issue.md');
    });

    it('should mirror repository root detection logic', () => {
      expect(validatorContent).toContain('repository root');
      expect(validatorContent).toContain('workingFolder path');
      expect(validatorContent).toContain('.linear-watcher/work/');
    });
  });

  describe('Example Validation Issues', () => {
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(validatorPath, 'utf-8');
    });

    it('should provide example validation issues', () => {
      // Check for example JSON structures
      expect(content).toContain('"taskId":');
      expect(content).toContain('"problem":');
      expect(content).toContain('"suggestion":');
      expect(content).toContain('"severity":');
    });

    it('should include actionable suggestions in examples', () => {
      // Examples should have concrete suggestions
      expect(content.toLowerCase()).toContain('add');
      expect(content.toLowerCase()).toContain('verify');
      expect(content).toContain('packages/');
    });
  });

  describe('Read-Only Operation Enforcement', () => {
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(validatorPath, 'utf-8');
    });

    it('should emphasize read-only operation', () => {
      expect(content).toContain('read-only');
      expect(content).toContain('no file modification');
      expect(content).toContain('cannot modify');
    });

    it('should not mention any write operations', () => {
      // Should not contain instructions to write or modify files
      expect(content).not.toContain('write the file');
      expect(content).not.toContain('update the file');
      expect(content).not.toContain('create the file');
      expect(content).not.toContain('modify the file');
    });
  });

  describe('Integration with lc-issue-tasker', () => {
    let content: string;

    beforeAll(() => {
      content = fs.readFileSync(validatorPath, 'utf-8');
    });

    it('should format output for direct consumption by lc-issue-tasker', () => {
      expect(content).toContain('direct consumption');
      expect(content).toContain('lc-issue-tasker');
      expect(content).toContain('JSON');
    });

    it('should return structured validation results', () => {
      expect(content).toContain('pass/fail status');
      expect(content).toContain('no confidence scores');
    });
  });
});
