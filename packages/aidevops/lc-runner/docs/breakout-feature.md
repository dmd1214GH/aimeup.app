# Linear Sub-Issue Breakout Feature

## Overview

The Linear Sub-Issue Breakout feature enables automatic creation of Linear sub-issues from embedded "Breakout Issues" sections during the grooming operation. This streamlines the workflow by establishing proper parent-child relationships and handling duplicate detection automatically.

## Features

### Core Capabilities
- **Automatic Sub-Issue Creation**: Creates Linear sub-issues from `## Breakout Issues` sections
- **Selective Processing**: Choose specific issues to break out or process all at once
- **Duplicate Detection**: Updates existing issues instead of creating duplicates
- **Metadata Inheritance**: Sub-issues inherit team, labels, project, priority from parent
- **Relationship Management**: Establishes parent-child and blocking relationships
- **Content Transformation**: Replaces embedded issues with Linear issue IDs

### Integration Points
The breakout functionality is integrated at three key points in the grooming workflow:

1. **After Breakout Definition**: When breakout issues are created and defined
2. **Before Solution Design**: When transitioning from Requirements phase
3. **Before Delivery (Mandatory)**: Must resolve all breakouts before delivery

## Architecture

### Components

#### 1. LinearApiService Extensions
Located in: `/packages/aidevops/lc-runner/src/linear-api-service.ts`

New methods:
- `createIssue(data: IssueCreateData)`: Creates a new Linear issue
- `createIssueRelation(data: IssueRelationData)`: Creates issue relationships
- `getChildIssues(parentId: string)`: Retrieves child issues
- `getIssueMetadata(issueId: string)`: Gets issue metadata for inheritance

#### 2. CLI Wrapper
Located in: `/packages/aidevops/lc-runner/src/commands/linear-api.ts`

Provides command-line interface for subagents:
```bash
lc-runner linear-api <action> [args...]
```

Available actions:
- `create-issue`: Create a new issue with JSON input
- `create-relation`: Create issue relationship
- `get-children`: Get child issues of a parent
- `get-metadata`: Get issue metadata
- `get-issue`: Get full issue details
- `update-issue`: Update issue body
- `add-comment`: Add comment to issue
- `update-status`: Update issue status

#### 3. lc-breakout-handler Subagent
Located in: `/packages/aime-aidev/assets/claude-agents/lc-breakout-handler.md`

Responsibilities:
- Extract breakout issues from markdown
- Check for existing child issues
- Create or update sub-issues via CLI
- Establish relationships
- Update parent issue content

## Usage

### For Grooming Agents

When encountering breakout issues during grooming:

1. **Identify Breakout Issues**
   - Look for `## Breakout Issues` section
   - Each `### ` header defines a breakout issue

2. **Offer Breakout to User**
   ```
   "I've identified 3 well-defined breakout issues. Would you like to create them in Linear now?"
   ```

3. **Invoke lc-breakout-handler**
   ```javascript
   Task tool with:
   subagent_type: "lc-breakout-handler"
   prompt: "Please create sub-issues for:
     - issueId: AM-55
     - workingFolder: /path/to/working
     - selectedBreakouts: ['Task 1', 'Task 2'] or 'all'"
   ```

4. **Process Results**
   - Review created/updated issues
   - Confirm parent content updated
   - Report to user

### For CLI Users

Create a sub-issue manually:
```bash
lc-runner linear-api create-issue '{
  "title": "Sub-task title",
  "description": "Task description",
  "teamId": "team-123",
  "parentId": "AM-100",
  "labelIds": ["label1", "label2"],
  "priority": 2
}'
```

Check existing children:
```bash
lc-runner linear-api get-children "AM-100"
```

Get parent metadata:
```bash
lc-runner linear-api get-metadata "AM-100"
```

## Breakout Issue Format

Breakout issues should be structured in the parent issue as:

```markdown
## Breakout Issues

### First Sub-Issue Title
Description and requirements for the first sub-issue.
- Bullet points with details
- Additional requirements

### Second Sub-Issue Title  
Description for the second sub-issue.

Blocks: First Sub-Issue

### Third Sub-Issue Title
Independent task that can proceed in parallel.
```

## Workflow Example

### Input (Parent Issue)
```markdown
# Payment Processing Feature

## Requirements
1. Process credit card payments
2. Handle refunds
3. Generate receipts

## Breakout Issues

### Payment Gateway Integration
Implement Stripe payment gateway:
- Setup webhook endpoints
- Handle payment confirmations
- Process failed payments

### Refund System
Build refund processing:
- Admin refund interface
- Automated refund rules
- Refund notifications

### Receipt Generation
Create receipt system:
- PDF generation
- Email delivery
- Storage and retrieval
```

### Output (After Breakout)
```markdown
# Payment Processing Feature

## Requirements
1. Process credit card payments
2. Handle refunds
3. Generate receipts

## Breakout Issues
AM-101
AM-102
AM-103
```

Linear automatically renders these IDs as proper sub-issue cards with titles and status.

## Error Handling

### Duplicate Detection
When a child issue with the same title exists:
1. Issue is NOT created again
2. Existing issue is updated with new content
3. Operation report notes the update

### Missing Metadata
If parent issue lacks required metadata:
- TeamId is required (will fail without it)
- Other fields use defaults or omit

### API Failures
- Individual failures don't stop entire operation
- Failed issues reported in operation results
- User can retry specific failed issues

## Testing

### Unit Tests
Located in: `/packages/aidevops/lc-runner/tests/linear-api-service.test.ts`
- Tests all LinearApiService methods
- Covers success and error cases
- Mocks Linear SDK interactions

### Integration Tests
Located in: `/packages/aidevops/lc-runner/tests/breakout-integration.test.ts`
- Tests CLI command integration
- Simulates breakout workflow
- Tests duplicate detection

### End-to-End Tests
Located in: `/packages/aidevops/lc-runner/tests/breakout-e2e.test.ts`
- Complete workflow simulation
- File system operations
- Error scenario handling

## Configuration

### Environment Variables
- `LINEAR_API_KEY`: Required for Linear API access

### Status Transitions
Configured in `/packages/aime-aidev/assets/config.json`:
- `successStatusTransition`: Status when breakout completes
- `blockedStatusTransition`: Status when breakout is blocked

## Troubleshooting

### Common Issues

1. **"LINEAR_API_KEY not configured"**
   - Ensure environment variable is set
   - Check `.env` file or shell configuration

2. **"Issue does not belong to a team"**
   - Parent issue must have team assignment
   - Cannot create sub-issues without team context

3. **"Status not found in team workflow"**
   - Verify status names in config match Linear workflow
   - Check state-mappings.json is up to date

4. **Breakout not offered during grooming**
   - Ensure `## Breakout Issues` section exists
   - Check for proper `### ` headers for each breakout

## Future Enhancements

Potential improvements for future iterations:
- Batch API operations for performance
- Template support for common breakout patterns
- Automatic dependency detection from content
- Progress tracking for multi-issue creation
- Rollback capability for failed operations