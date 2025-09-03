import { ClaudeOutputParser } from '../../src/claude-output-parser';
import { UploadOrchestrator } from '../../src/upload-orchestrator';
import { cleanIssueBody } from '../../src/content-cleaner';

describe('Checkbox preservation through delivery pipeline', () => {
  let parser: ClaudeOutputParser;
  let orchestrator: UploadOrchestrator;

  beforeEach(() => {
    parser = new ClaudeOutputParser();
    // Mock Linear API for upload orchestrator
    orchestrator = new UploadOrchestrator('/test', '/test/working');
  });

  it('should preserve unchecked checkboxes through parsing', () => {
    const claudeOutput = `# Test Operation Report

## Updated Issue Content
# Issue Title

Acceptance Criteria:
- [ ] This should remain unchecked
- [ ] This too should stay unchecked

Task List:
1. (X) Completed task
2. () Pending task

## Comment 1
This is a comment section`;

    const result = parser.parseOutput(claudeOutput);
    expect(result.updatedIssueContent).toContain('# Issue Title');
    expect(result.updatedIssueContent).toContain('- [ ] This should remain unchecked');
    expect(result.updatedIssueContent).toContain('- [ ] This too should stay unchecked');
    expect(result.updatedIssueContent).not.toContain('- [x]');
    expect(result.updatedIssueContent).not.toContain('- [X]');
  });

  it('should preserve checkbox states through content cleaning', () => {
    const issueContent = `# Issue Title

## Requirements
Test requirements

## Acceptance Criteria
- [ ] Unchecked criterion 1
- [ ] Unchecked criterion 2
- [x] This was already checked (should stay)
- [ ] Unchecked criterion 3

## Task List
1. (X) Completed task
2. () Pending task

## Metadata
Should be removed`;

    const cleanedBody = cleanIssueBody(issueContent);

    // Verify unchecked boxes remain unchecked
    expect(cleanedBody).toContain('- [ ] Unchecked criterion 1');
    expect(cleanedBody).toContain('- [ ] Unchecked criterion 2');
    expect(cleanedBody).toContain('- [ ] Unchecked criterion 3');

    // Verify checked box remains checked
    expect(cleanedBody).toContain('- [x] This was already checked');

    // Verify metadata removed but checkboxes preserved
    expect(cleanedBody).not.toContain('## Metadata');
  });

  it('should handle mixed checkbox and task list states', () => {
    const content = `# Bug Fix Issue

## Task List
1. (X) First task completed
2. (O) Second task in progress
3. () Third task pending
4. (-) Fourth task blocked

## Acceptance Criteria
- [ ] All tests pass
- [ ] No regressions introduced
- [ ] Documentation updated

## Done Criteria
- [x] Already completed item
- [ ] Still pending item`;

    const cleaned = cleanIssueBody(content);

    // Task list format preserved
    expect(cleaned).toContain('1. (X) First task completed');
    expect(cleaned).toContain('2. (O) Second task in progress');
    expect(cleaned).toContain('3. () Third task pending');
    expect(cleaned).toContain('4. (-) Fourth task blocked');

    // Checkboxes preserved
    expect(cleaned).toContain('- [ ] All tests pass');
    expect(cleaned).toContain('- [ ] No regressions introduced');
    expect(cleaned).toContain('- [x] Already completed item');
    expect(cleaned).toContain('- [ ] Still pending item');
  });

  it('should not modify checkboxes when preparing for upload', async () => {
    const issueWithCheckboxes = `# Test Issue

## Acceptance Criteria
- [ ] Criterion 1 unchecked
- [ ] Criterion 2 unchecked
- [ ] Criterion 3 unchecked

## Task List  
1. (X) Task 1 complete
2. () Task 2 pending`;

    // Simulate upload preparation
    const uploadData = {
      issueId: 'AM-67',
      updatedIssue: issueWithCheckboxes,
      operationReports: [],
      comments: [],
    };

    // Verify checkbox preservation in upload data
    expect(uploadData.updatedIssue).toContain('- [ ] Criterion 1 unchecked');
    expect(uploadData.updatedIssue).toContain('- [ ] Criterion 2 unchecked');
    expect(uploadData.updatedIssue).toContain('- [ ] Criterion 3 unchecked');

    // Ensure no checkbox modification
    expect(uploadData.updatedIssue).not.toContain('- [x] Criterion');
    expect(uploadData.updatedIssue).not.toContain('- [X] Criterion');
  });

  it('should validate checkbox preservation end-to-end', () => {
    const fullIssueContent = `# Fix Checkbox Bug

## Requirements
* Ensure checkboxes remain unchecked

## Task List for AM-67
1. () Test task 1
2. () Test task 2

## Acceptance Criteria
- [ ] This checkbox should remain UNCHECKED in Linear after delivery
- [ ] This second checkbox should also remain UNCHECKED in Linear
- [ ] All acceptance criteria appear as unchecked boxes in Linear
- [ ] The bug is either reproduced or confirmed as fixed

## Metadata
- URL: https://linear.app/test
- Identifier: AM-67`;

    // Step 1: Clean the content
    const cleaned = cleanIssueBody(fullIssueContent);

    // Step 2: Verify all checkboxes preserved
    const checkboxLines = cleaned.split('\n').filter((line: string) => line.includes('[ ]'));
    expect(checkboxLines).toHaveLength(4);
    expect(checkboxLines[0]).toContain('This checkbox should remain UNCHECKED');
    expect(checkboxLines[1]).toContain('This second checkbox should also remain UNCHECKED');
    expect(checkboxLines[2]).toContain('All acceptance criteria appear as unchecked boxes');
    expect(checkboxLines[3]).toContain('The bug is either reproduced or confirmed as fixed');

    // Step 3: Ensure no checked boxes introduced
    expect(cleaned).not.toContain('[x]');
    expect(cleaned).not.toContain('[X]');

    // Step 4: Verify metadata removed but content preserved
    expect(cleaned).not.toContain('## Metadata');
    expect(cleaned).toContain('## Acceptance Criteria');
  });
});
