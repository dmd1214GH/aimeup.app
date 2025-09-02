import { cleanIssueBody, cleanCommentContent } from '../src/content-cleaner';

describe('content-cleaner', () => {
  describe('cleanIssueBody', () => {
    it('should remove single metadata section at end of content', () => {
      const input = `# My Issue Title

This is the issue description.

## Requirements
- Requirement 1
- Requirement 2

## Metadata
- URL: https://linear.app/team/issue/ID-123
- Status: In Progress
- Priority: High`;

      const expected = `This is the issue description.

## Requirements
- Requirement 1
- Requirement 2`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should remove multiple metadata sections', () => {
      const input = `# Issue Title

Description here.

## Metadata
- URL: https://linear.app/team/issue/ID-123
- Status: In Progress

## Process Flow
Some process details

## Metadata
- URL: https://linear.app/team/issue/ID-123
- Identifier: ID-123
- Status: Delivery-ai

## Metadata
- URL: https://linear.app/team/issue/ID-123
- Status: Delivery-ai`;

      const expected = `Description here.

## Process Flow
Some process details`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should remove metadata sections from middle of content', () => {
      const input = `# Title

Introduction.

## Metadata
- Some metadata

## Requirements
- Requirement 1

## Another Section
More content`;

      const expected = `Introduction.

## Requirements
- Requirement 1

## Another Section
More content`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should remove all title headers (first and duplicates)', () => {
      const input = `# Clean Up lc-runner Upload Results

# Clean Up lc-runner Upload Results

# Clean Up lc-runner Upload Results

Remove unnecessary metadata from uploads.

## Requirements
- Remove metadata section`;

      const expected = `Remove unnecessary metadata from uploads.

## Requirements
- Remove metadata section`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should preserve non-metadata content and formatting', () => {
      const input = `# Issue Title

## Description
This is a **bold** description with *italic* text.

### Subsection
- Bullet 1
- Bullet 2
  - Nested bullet

\`\`\`typescript
const code = "example";
\`\`\`

## Acceptance Criteria
- [ ] Checkbox 1
- [x] Checkbox 2

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`;

      const expected = `## Description
This is a **bold** description with *italic* text.

### Subsection
- Bullet 1
- Bullet 2
  - Nested bullet

\`\`\`typescript
const code = "example";
\`\`\`

## Acceptance Criteria
- [ ] Checkbox 1
- [x] Checkbox 2

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should handle empty content', () => {
      expect(cleanIssueBody('')).toBe('');
    });

    it('should handle content with no metadata', () => {
      const input = `# Issue Title

Regular content without any metadata sections.

## Requirements
- Requirement 1`;

      const expected = `Regular content without any metadata sections.

## Requirements
- Requirement 1`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should handle malformed metadata sections', () => {
      const input = `# Title

##Metadata (no space)
Should not be removed

## Metadata
Properly formatted - should be removed`;

      const expected = `##Metadata (no space)
Should not be removed`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should handle metadata with various content types', () => {
      const input = `# Title

Content before.

## Metadata

* URL: [AM-34](https://linear.app/aimeup/issue/AM-34)
* Identifier: [AM-34](https://linear.app/aimeup/issue/AM-34)
* Status: Grooming
* Priority: No priority
* Assignee: Doug Danoff
* Created: 2025-08-25T06:43:22.101Z
* Updated: 2025-08-25T06:44:47.574Z

## Next Section
More content`;

      const expected = `Content before.

## Next Section
More content`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should remove duplicate headers with different markdown levels', () => {
      const input = `# Main Title

## Main Title

### Main Title

Content here.`;

      const expected = `## Main Title

### Main Title

Content here.`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should trim excessive whitespace at the end', () => {
      const input = `# Title

Content.

## Metadata
- Some metadata


`;

      const expected = `Content.`;

      expect(cleanIssueBody(input)).toBe(expected);
    });

    it('should handle null/undefined gracefully', () => {
      expect(cleanIssueBody(null as any)).toBe(null);
      expect(cleanIssueBody(undefined as any)).toBe(undefined);
    });
  });

  describe('cleanCommentContent', () => {
    it('should remove standard operation header format', () => {
      const input = `# Operation Log for AM-34

## Operation Report
- Status: Complete
- Details: Task completed successfully`;

      const expected = `## Operation Report
- Status: Complete
- Details: Task completed successfully`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should preserve content after header removal', () => {
      const input = `# Operation Log for ISSUE-123

## Summary
The operation completed with the following results:

### Tasks Completed
- Task 1: Done
- Task 2: Done

### Notes
All tests passed.`;

      const expected = `## Summary
The operation completed with the following results:

### Tasks Completed
- Task 1: Done
- Task 2: Done

### Notes
All tests passed.`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should handle comments without headers', () => {
      const input = `## Operation Report
- Status: Complete
- No header to remove`;

      expect(cleanCommentContent(input)).toBe(input);
    });

    it('should handle empty content', () => {
      expect(cleanCommentContent('')).toBe('');
    });

    it('should handle multiple headers (edge case)', () => {
      const input = `# Operation Log for AM-34
# Operation Log for AM-35

Content here`;

      const expected = `Content here`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should handle partial headers that should not be removed', () => {
      const input = `# Different Header
# Operation Summary (not "Log for")

Content remains`;

      const expected = `# Different Header
# Operation Summary (not "Log for")

Content remains`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should be case-insensitive for operation header', () => {
      const input = `# operation log for AM-34

Content`;

      const expected = `Content`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should handle headers with extra whitespace', () => {
      const input = `#   Operation   Log   for   AM-34  

Content`;

      const expected = `Content`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should trim trailing whitespace', () => {
      const input = `# Operation Log for AM-34

Content


`;

      const expected = `Content`;

      expect(cleanCommentContent(input)).toBe(expected);
    });

    it('should handle null/undefined gracefully', () => {
      expect(cleanCommentContent(null as any)).toBe(null);
      expect(cleanCommentContent(undefined as any)).toBe(undefined);
    });

    it('should not remove operation headers that appear in code blocks', () => {
      const input = `\`\`\`
# Operation Log for AM-34
\`\`\`

This code block should remain intact`;

      expect(cleanCommentContent(input)).toBe(input);
    });
  });
});
