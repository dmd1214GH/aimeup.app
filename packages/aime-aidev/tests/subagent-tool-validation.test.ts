import * as fs from 'fs';
import * as path from 'path';

/**
 * Test to ensure subagents don't have forbidden tools that could cause issues
 * Critical: Subagents CANNOT have the Task tool as they cannot invoke other subagents
 */

describe('Subagent Tool Validation', () => {
  const claudeAgentsDir = path.join(__dirname, '../assets/claude-agents');
  const FORBIDDEN_TOOLS = ['Task']; // Tools that subagents must NOT have

  it('should exist and contain subagent definitions', () => {
    expect(fs.existsSync(claudeAgentsDir)).toBe(true);
    const files = fs.readdirSync(claudeAgentsDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
  });

  describe('Tool Restrictions', () => {
    const agentFiles = fs.readdirSync(claudeAgentsDir).filter((f) => f.endsWith('.md'));

    agentFiles.forEach((file) => {
      it(`${file} should not have forbidden tools`, () => {
        const filePath = path.join(claudeAgentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract YAML frontmatter
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
        expect(yamlMatch).toBeTruthy();

        if (yamlMatch) {
          // Parse YAML manually - simple parsing for our needs
          const frontmatter: any = {};
          yamlMatch[1].split('\n').forEach((line) => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              frontmatter[match[1]] = match[2].replace(/['"]/g, '');
            }
          });

          // Check if tools field exists
          if (frontmatter.tools) {
            const tools = frontmatter.tools.split(',').map((t: string) => t.trim());

            // Check for forbidden tools
            FORBIDDEN_TOOLS.forEach((forbiddenTool) => {
              expect(tools).not.toContain(forbiddenTool);

              // Also check case variations
              const found = tools.some(
                (tool: string) => tool.toLowerCase() === forbiddenTool.toLowerCase()
              );
              expect(found).toBe(false);
            });
          }
        }
      });

      it(`${file} should not reference invoking other subagents in content`, () => {
        const filePath = path.join(claudeAgentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for patterns that suggest trying to invoke other subagents
        const suspiciousPatterns = [
          /invoke.*lc-operation-reporter.*subagent/i,
          /call.*lc-.*subagent/i,
          /Task tool.*invoke/i,
          /invoke.*Task tool/i,
          /spawn.*subagent/i,
          /create.*subagent.*task/i,
        ];

        suspiciousPatterns.forEach((pattern) => {
          const matches = content.match(pattern);
          if (matches) {
            // Allow references in comments or documentation about NOT doing this
            const lineWithMatch = content.split('\n').find((line) => pattern.test(line));
            const isWarning =
              lineWithMatch &&
              (lineWithMatch.includes('cannot') ||
                lineWithMatch.includes('must not') ||
                lineWithMatch.includes('do not') ||
                lineWithMatch.includes('Note:') ||
                lineWithMatch.includes('Warning:'));

            if (!isWarning) {
              fail(
                `${file} contains suspicious pattern suggesting subagent invocation: "${matches[0]}"`
              );
            }
          }
        });
      });
    });
  });

  describe('Required Tool Validation', () => {
    it('lc-operation-reporter should have mcp__linear__add_comment tool', () => {
      const reporterPath = path.join(claudeAgentsDir, 'lc-operation-reporter.md');
      const content = fs.readFileSync(reporterPath, 'utf-8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (yamlMatch) {
        // Parse YAML manually
        const frontmatter: any = {};
        yamlMatch[1].split('\n').forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            frontmatter[match[1]] = match[2].replace(/['"]/g, '');
          }
        });
        expect(frontmatter.tools).toContain('mcp__linear__add_comment');
      }
    });

    it('aimequal-runner should have Bash tool', () => {
      const runnerPath = path.join(claudeAgentsDir, 'aimequal-runner.md');
      if (fs.existsSync(runnerPath)) {
        const content = fs.readFileSync(runnerPath, 'utf-8');
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (yamlMatch) {
          // Parse YAML manually - simple parsing for our needs
          const frontmatter: any = {};
          yamlMatch[1].split('\n').forEach((line) => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              frontmatter[match[1]] = match[2].replace(/['"]/g, '');
            }
          });
          expect(frontmatter.tools).toContain('Bash');
        }
      }
    });
  });

  describe('Documentation Consistency', () => {
    it('all subagents should have proper structure', () => {
      const agentFiles = fs.readdirSync(claudeAgentsDir).filter((f) => f.endsWith('.md'));

      agentFiles.forEach((file) => {
        const filePath = path.join(claudeAgentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for basic structure
        expect(content).toContain('---'); // Has YAML frontmatter
        expect(content.length).toBeGreaterThan(100); // Has actual content
      });
    });
  });
});
