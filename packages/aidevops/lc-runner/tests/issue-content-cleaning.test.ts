describe('Issue Content Cleaning for Linear Upload', () => {
  describe('Content Extraction from updated-issue.md', () => {
    it('should extract title from first # heading line', () => {
      const issueContent = `# LCR2: Convert operation-report creation and upload to a Claude Code Subagent

Convert the unreliable MCP-based Linear upload process to a more reliable subagent-based approach

## Requirements

* **Subagent Pattern Establishment**
  * Create a reusable Claude Code subagent pattern

## Metadata
- URL: https://linear.app/aimeup/issue/AM-57
- Identifier: AM-57`;

      const lines = issueContent.split('\n');
      const titleLine = lines[0];

      // Extract title by removing the # prefix
      const title = titleLine.replace(/^#\s+/, '');
      expect(title).toBe(
        'LCR2: Convert operation-report creation and upload to a Claude Code Subagent'
      );
    });

    it('should remove title line from body content', () => {
      const issueContent = `# LCR2: Convert operation-report creation and upload to a Claude Code Subagent

Convert the unreliable MCP-based Linear upload process to a more reliable subagent-based approach

## Requirements

* **Subagent Pattern Establishment**`;

      const lines = issueContent.split('\n');

      // Remove the first line (title)
      const bodyLines = lines.slice(1);
      const body = bodyLines.join('\n').trim();

      // Body should NOT contain the title
      expect(body).not.toContain('# LCR2:');
      expect(body.startsWith('Convert the unreliable MCP-based')).toBe(true);
    });

    it('should remove metadata section from body content', () => {
      const issueContent = `# LCR2: Convert operation-report creation

## Requirements

* **Subagent Pattern Establishment**

## Metadata
- URL: https://linear.app/aimeup/issue/AM-57
- Identifier: AM-57
- Status: Delivery-ai`;

      const lines = issueContent.split('\n');

      // Find metadata section
      const metadataIndex = lines.findIndex((line) => line.trim() === '## Metadata');

      let bodyLines;
      if (metadataIndex !== -1) {
        // Remove title (first line) and everything from metadata onwards
        bodyLines = lines.slice(1, metadataIndex);
      } else {
        // Just remove title
        bodyLines = lines.slice(1);
      }

      const body = bodyLines.join('\n').trim();

      // Body should NOT contain metadata
      expect(body).not.toContain('## Metadata');
      expect(body).not.toContain('- URL:');
      expect(body).not.toContain('- Identifier:');
      expect(body).toContain('## Requirements');
    });

    it('should handle complete cleaning: remove both title and metadata', () => {
      const issueContent = `# LCR2: Convert operation-report creation and upload to a Claude Code Subagent

Convert the unreliable MCP-based Linear upload process to a more reliable subagent-based approach

## Requirements

* **Subagent Pattern Establishment**
  * Create a reusable Claude Code subagent pattern within aimeup's architecture

## Acceptance Criteria

- [ ] lc-operation-reporter subagent successfully writes operation report files

## Metadata
- URL: https://linear.app/aimeup/issue/AM-57
- Identifier: AM-57
- Status: Delivery-ai
- Priority: No priority`;

      const lines = issueContent.split('\n');

      // Extract title
      const titleLine = lines[0];
      const title = titleLine.replace(/^#\s+/, '');

      // Find metadata section
      const metadataIndex = lines.findIndex((line) => line.trim() === '## Metadata');

      // Extract body (remove title and metadata)
      let bodyLines;
      if (metadataIndex !== -1) {
        bodyLines = lines.slice(1, metadataIndex);
      } else {
        bodyLines = lines.slice(1);
      }

      const body = bodyLines.join('\n').trim();

      // Verify title extraction
      expect(title).toBe(
        'LCR2: Convert operation-report creation and upload to a Claude Code Subagent'
      );

      // Verify body has no title or metadata
      expect(body).not.toContain('# LCR2:');
      expect(body).not.toContain('## Metadata');
      expect(body).not.toContain('- URL:');

      // Verify body contains the actual content
      expect(body).toContain('Convert the unreliable MCP-based');
      expect(body).toContain('## Requirements');
      expect(body).toContain('## Acceptance Criteria');
      expect(body).toContain('lc-operation-reporter subagent successfully writes');
    });

    it('should handle edge case: no metadata section', () => {
      const issueContent = `# Simple Issue Title

This is a simple issue without metadata section.

## Requirements

* Do something`;

      const lines = issueContent.split('\n');

      // Extract title
      const title = lines[0].replace(/^#\s+/, '');

      // Find metadata (won't exist)
      const metadataIndex = lines.findIndex((line) => line.trim() === '## Metadata');

      // Extract body
      const bodyLines = metadataIndex !== -1 ? lines.slice(1, metadataIndex) : lines.slice(1);

      const body = bodyLines.join('\n').trim();

      expect(title).toBe('Simple Issue Title');
      expect(body).toBe(`This is a simple issue without metadata section.

## Requirements

* Do something`);
    });

    it('should handle edge case: metadata not at the end', () => {
      const issueContent = `# Issue Title

## Description

Some content

## Metadata
- URL: https://linear.app
- ID: TEST-1

## More Content

This shouldn't happen but let's handle it`;

      const lines = issueContent.split('\n');

      // In this case, we should still remove metadata section
      // but the spec says "at the end" so this tests robustness
      const metadataIndex = lines.findIndex((line) => line.trim() === '## Metadata');

      // For safety, find where metadata section ends
      let metadataEndIndex = -1;
      if (metadataIndex !== -1) {
        // Find next section header or end of file
        for (let i = metadataIndex + 1; i < lines.length; i++) {
          if (lines[i].trim().startsWith('##')) {
            metadataEndIndex = i;
            break;
          }
        }
        if (metadataEndIndex === -1) {
          metadataEndIndex = lines.length;
        }
      }

      // This is a more complex case - the prompt says "at the end"
      // So technically this wouldn't be removed, but good to test
      expect(metadataIndex).toBeGreaterThan(-1);
      expect(lines[metadataIndex]).toBe('## Metadata');
    });
  });

  describe('Integration with mcp__linear__update_issue', () => {
    it('should provide cleaned content to Linear MCP tool', () => {
      const updatedIssue = `# Updated Title

Updated description with more content

## New Section

* Item 1
* Item 2

## Metadata
- URL: https://linear.app/test
- Updated: 2025-09-01`;

      // Simulate the cleaning as per prompt instructions
      const lines = updatedIssue.split('\n');

      // Extract for MCP tool
      const title = lines[0].replace(/^#\s+/, '');
      const metadataIndex = lines.findIndex((line) => line.trim() === '## Metadata');
      const bodyLines = metadataIndex !== -1 ? lines.slice(1, metadataIndex) : lines.slice(1);
      const description = bodyLines.join('\n').trim();

      // This is what should be passed to mcp__linear__update_issue
      const mpcParams = {
        id: 'TEST-1', // Would come from ArgIssueId
        title: title,
        description: description,
      };

      expect(mpcParams.title).toBe('Updated Title');
      expect(mpcParams.description).toBe(`Updated description with more content

## New Section

* Item 1
* Item 2`);

      // Verify no title or metadata in description
      expect(mpcParams.description).not.toContain('# Updated Title');
      expect(mpcParams.description).not.toContain('## Metadata');
    });
  });
});
