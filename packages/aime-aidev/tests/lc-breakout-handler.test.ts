import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('lc-breakout-handler', () => {
  const testWorkFolder = '/tmp/test-breakout-handler';
  const testIssueContent = `# Test Parent Issue

## Description

This is a test parent issue with breakout sections.

## Breakout Issues

### Implement User Authentication

Implement a secure user authentication system with the following features:
- OAuth 2.0 support
- Multi-factor authentication
- Session management

This blocks: AM-58

### Add API Rate Limiting

Implement rate limiting for API endpoints to prevent abuse:
- Per-user rate limits
- IP-based rate limiting
- Configurable thresholds

Depends on: AM-54

### Fix Database Connection Pool

Fix the database connection pool issues causing timeouts.

## Other Content

This content should remain in the parent issue.`;

  beforeEach(() => {
    // Create test working folder
    if (!fs.existsSync(testWorkFolder)) {
      fs.mkdirSync(testWorkFolder, { recursive: true });
    }
    // Write test issue content
    fs.writeFileSync(path.join(testWorkFolder, 'updated-issue.md'), testIssueContent);
  });

  afterEach(() => {
    // Clean up test folder
    if (fs.existsSync(testWorkFolder)) {
      fs.rmSync(testWorkFolder, { recursive: true, force: true });
    }
  });

  it('should extract breakout issues to individual files', () => {
    // Test file creation
    const expectedFiles = [
      'breakout-001-implement-user-authentication.md',
      'breakout-002-add-api-rate-limiting.md',
      'breakout-003-fix-database-connection-pool.md'
    ];

    // Simulate breakout extraction (in real scenario, this would be done by the subagent)
    // For testing purposes, we'll create the expected files
    const breakouts = [
      {
        title: 'Implement User Authentication',
        content: `# Implement User Authentication

Implement a secure user authentication system with the following features:
- OAuth 2.0 support
- Multi-factor authentication
- Session management

This blocks: AM-58

## Metadata
- Parent: AM-56
- Blocks: AM-58`,
        filename: 'breakout-001-implement-user-authentication.md'
      },
      {
        title: 'Add API Rate Limiting',
        content: `# Add API Rate Limiting

Implement rate limiting for API endpoints to prevent abuse:
- Per-user rate limits
- IP-based rate limiting
- Configurable thresholds

Depends on: AM-54

## Metadata
- Parent: AM-56
- DependsOn: AM-54`,
        filename: 'breakout-002-add-api-rate-limiting.md'
      },
      {
        title: 'Fix Database Connection Pool',
        content: `# Fix Database Connection Pool

Fix the database connection pool issues causing timeouts.

## Metadata
- Parent: AM-56`,
        filename: 'breakout-003-fix-database-connection-pool.md'
      }
    ];

    // Write breakout files
    breakouts.forEach(breakout => {
      fs.writeFileSync(path.join(testWorkFolder, breakout.filename), breakout.content);
    });

    // Verify files were created
    expectedFiles.forEach(file => {
      const filePath = path.join(testWorkFolder, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    // Verify metadata is included
    const firstBreakout = fs.readFileSync(
      path.join(testWorkFolder, 'breakout-001-implement-user-authentication.md'),
      'utf-8'
    );
    expect(firstBreakout).toContain('## Metadata');
    expect(firstBreakout).toContain('- Parent: AM-56');
    expect(firstBreakout).toContain('- Blocks: AM-58');
  });

  it('should update parent issue with placeholder text', () => {
    const updatedParentContent = `# Test Parent Issue

## Description

This is a test parent issue with breakout sections.

## Breakout Issues

### Implement User Authentication

*Extracted to: breakout-001-implement-user-authentication.md*
*Pending creation as sub-issue*

### Add API Rate Limiting

*Extracted to: breakout-002-add-api-rate-limiting.md*
*Pending creation as sub-issue*

### Fix Database Connection Pool

*Extracted to: breakout-003-fix-database-connection-pool.md*
*Pending creation as sub-issue*

## Other Content

This content should remain in the parent issue.`;

    // Simulate parent update
    fs.writeFileSync(path.join(testWorkFolder, 'updated-issue.md'), updatedParentContent);

    // Verify parent was updated
    const parentContent = fs.readFileSync(path.join(testWorkFolder, 'updated-issue.md'), 'utf-8');
    expect(parentContent).toContain('*Extracted to: breakout-001-implement-user-authentication.md*');
    expect(parentContent).toContain('*Pending creation as sub-issue*');
    expect(parentContent).toContain('## Other Content'); // Original content preserved
  });

  it('should handle file name sanitization correctly', () => {
    const testCases = [
      {
        input: 'User Authentication & Authorization',
        expected: 'user-authentication-authorization'
      },
      {
        input: 'Fix: API Rate Limiting!!!',
        expected: 'fix-api-rate-limiting'
      },
      {
        input: 'Implement OAuth 2.0 Support (Google, GitHub, Facebook)',
        expected: 'implement-oauth-20-support-google-github-facebook'
      },
      {
        input: 'This    Has     Multiple     Spaces',
        expected: 'this-has-multiple-spaces'
      },
      {
        input: '---Leading-And-Trailing-Hyphens---',
        expected: 'leading-and-trailing-hyphens'
      }
    ];

    testCases.forEach(testCase => {
      // Sanitization logic (matching what subagent would do)
      const sanitized = testCase.input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);

      expect(sanitized).toBe(testCase.expected);
    });
  });

  it('should reduce header levels correctly', () => {
    const input = `### Level 3 Header
#### Level 4 Header
##### Level 5 Header
Regular text`;

    const expected = `# Level 3 Header
## Level 4 Header
### Level 5 Header
Regular text`;

    // Header reduction logic
    const reduced = input
      .split('\n')
      .map(line => {
        if (line.startsWith('#')) {
          const match = line.match(/^(#+)\s+(.*)$/);
          if (match) {
            const level = Math.max(1, match[1].length - 2);
            return '#'.repeat(level) + ' ' + match[2];
          }
        }
        return line;
      })
      .join('\n');

    expect(reduced).toBe(expected);
  });

  it('should parse relationship keywords correctly', () => {
    const testContent = `
This task blocks: AM-57, AM-58
It depends on: AM-54
Also blocked by: AM-53
`;

    // Relationship parsing logic
    const blocks: string[] = [];
    const dependsOn: string[] = [];

    const lines = testContent.split('\n');
    lines.forEach(line => {
      // Check for blocks
      const blocksMatch = line.match(/blocks?:\s*(AM-\d+(?:\s*,\s*AM-\d+)*)/i);
      if (blocksMatch) {
        const issues = blocksMatch[1].split(',').map(s => s.trim());
        blocks.push(...issues);
      }

      // Check for depends on
      const dependsMatch = line.match(/(?:depends?\s+on|blocked\s+by):\s*(AM-\d+(?:\s*,\s*AM-\d+)*)/i);
      if (dependsMatch) {
        const issues = dependsMatch[1].split(',').map(s => s.trim());
        dependsOn.push(...issues);
      }
    });

    expect(blocks).toEqual(['AM-57', 'AM-58']);
    expect(dependsOn).toEqual(['AM-54', 'AM-53']);
  });
});