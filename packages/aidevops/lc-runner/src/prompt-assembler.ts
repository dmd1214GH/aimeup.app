import * as fs from 'fs';
import * as path from 'path';

export interface PromptReplacements {
  issueId: string;
  operation: string;
  workingFolder: string;
}

export interface TestOptions {
  testMcpFailure?: boolean;
}

export class PromptAssembler {
  /**
   * Assemble the master prompt from general and operation-specific prompts
   */
  assembleMasterPrompt(
    generalPromptPath: string,
    operationPromptPath: string,
    replacements: PromptReplacements,
    outputPath: string,
    testOptions?: TestOptions
  ): void {
    try {
      // Load general prompt
      const generalPrompt = this.loadPromptFile(generalPromptPath);

      // Load operation-specific prompt
      const operationPrompt = this.loadPromptFile(operationPromptPath);

      // Validate only operation prompt format (general prompt can have any structure)
      this.validatePromptFormat(operationPrompt, operationPromptPath);

      // Perform replacements in general prompt
      let processedGeneralPrompt = this.performReplacements(generalPrompt, replacements);

      // Inject MCP save instructions for updated-issue.md
      processedGeneralPrompt = this.injectMcpSaveInstructions(processedGeneralPrompt, replacements);

      // Inject test instructions if test options are provided
      if (testOptions?.testMcpFailure) {
        processedGeneralPrompt = this.injectMcpFailureTest(
          processedGeneralPrompt,
          replacements.issueId
        );
      }

      // Combine prompts - NEVER append issue body
      const masterPrompt = processedGeneralPrompt + '\n' + operationPrompt;

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write master prompt to file
      fs.writeFileSync(outputPath, masterPrompt, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to assemble master prompt: ${error.message}`);
      }
      throw new Error('Failed to assemble master prompt');
    }
  }

  /**
   * Load a prompt file from disk
   */
  loadPromptFile(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${filePath}`);
    }

    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read prompt file ${filePath}: ${error.message}`);
      }
      throw new Error(`Failed to read prompt file ${filePath}`);
    }
  }

  /**
   * Perform string replacements in the prompt
   */
  performReplacements(prompt: string, replacements: PromptReplacements): string {
    let result = prompt;
    result = result.replace(/<ArgIssueId>/g, replacements.issueId);
    result = result.replace(/<ArgOperation>/g, replacements.operation);
    result = result.replace(/<ArgWorkingFolder>/g, replacements.workingFolder);
    return result;
  }

  /**
   * Validate prompt format (exactly one ## at start, no # headings)
   */
  validatePromptFormat(prompt: string, filePath: string): void {
    const lines = prompt.split('\n');
    let level2HeadingCount = 0;
    let level2HeadingLine = -1;
    let level1HeadingLine = -1;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for code block markers
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip lines inside code blocks
      if (inCodeBlock) {
        continue;
      }

      // Check for level-1 heading (#)
      if (line.match(/^#\s+/)) {
        level1HeadingLine = i + 1;
        break; // Stop on first level-1 heading found
      }

      // Check for level-2 heading (##)
      if (line.match(/^##\s+/)) {
        if (level2HeadingCount === 0) {
          level2HeadingLine = i + 1;
        }
        level2HeadingCount++;
      }
    }

    // Check for level-1 headings
    if (level1HeadingLine !== -1) {
      throw new Error(
        `Prompt format error in ${filePath}: ` +
          `Level-1 heading (#) found at line ${level1HeadingLine}. ` +
          `Operation prompts must not contain level-1 headings.`
      );
    }

    // Check for exactly one level-2 heading at the start
    if (level2HeadingCount === 0) {
      throw new Error(
        `Prompt format error in ${filePath}: ` +
          `No level-2 heading (##) found. ` +
          `Operation prompts must start with exactly one level-2 heading.`
      );
    }

    if (level2HeadingCount > 1) {
      throw new Error(
        `Prompt format error in ${filePath}: ` +
          `Multiple level-2 headings (##) found (${level2HeadingCount} total). ` +
          `Operation prompts must have exactly one level-2 heading at the start.`
      );
    }

    // Check that the level-2 heading is at the start (allowing for empty lines)
    let firstNonEmptyLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        firstNonEmptyLine = i + 1;
        break;
      }
    }

    if (level2HeadingLine !== firstNonEmptyLine) {
      throw new Error(
        `Prompt format error in ${filePath}: ` +
          `Level-2 heading (##) found at line ${level2HeadingLine} but should be at the start. ` +
          `First non-empty line is ${firstNonEmptyLine}.`
      );
    }
  }

  /**
   * Check if a master prompt file exists
   */
  masterPromptExists(outputPath: string): boolean {
    return fs.existsSync(outputPath);
  }

  /**
   * Inject MCP save instructions for updated-issue.md
   */
  private injectMcpSaveInstructions(prompt: string, replacements: PromptReplacements): string {
    const saveInstructions = `
#### MCP Integration for Issue Content Saving
**IMPORTANT**: In addition to posting operation reports to Linear, you MUST also save the updated issue content when appropriate:

1. **Save Triggers**: Save the updated issue content to Linear in these situations:
   - When the operator explicitly requests "save to Linear" or similar command during the operation
   - Automatically at operation completion (when creating the Finished operation report with status Complete or Blocked)

2. **Content Extraction Process**:
   - Read the complete content of \`<ArgWorkingFolder>/updated-issue.md\`
   - Extract the title from the first \`#\` heading line
   - Extract the body by removing:
     - The first \`#\` heading line (title)
     - The \`## Metadata\` section at the end (if present)
   - Preserve all other markdown formatting

3. **Idempotent Updates**:
   - Before saving, check if the content has actually changed
   - Compare the extracted title and body with what was in \`original-issue.md\`
   - Skip the MCP update if content is identical (to avoid unnecessary API calls)
   - Log skipped updates in the operation report

4. **MCP Tool Usage**:
   - Use the \`mcp__linear__update_issue\` tool with:
     - \`id\`: The issue ID (${replacements.issueId})
     - \`title\`: The extracted title (if changed from original)
     - \`description\`: The cleaned body content
   - Handle the response and include status in operation reports

5. **Error Handling**:
   - If MCP save fails, log the error but continue the operation
   - Append failures to \`issue-operation-log.md\` in the parent directory
   - Log format: \`- [<timestamp>] MCP Save Failure: Failed to save updated content for ${replacements.issueId}. Error: <error-details>\`
   - Include save status in the operation report payload:
     - \`### MCP Save Status\`: Success/Failed/Skipped (identical content)
     - Include error details if failed

6. **Operation Report Integration**:
   - In the Finished operation report, always include an \`mcpSaveStatus\` field in the JSON
   - Possible values: "success", "failed", "skipped", "not-triggered"
   - Include details in the payload section if save was attempted
`;

    // Insert save instructions after the existing MCP Integration section
    const mcpMarker = '#### MCP Integration for Operation Reports';
    const insertionPoint = prompt.indexOf(mcpMarker);

    if (insertionPoint !== -1) {
      // Find the end of the MCP Integration section
      const afterMarker = prompt.indexOf('\n', insertionPoint);
      const nextSectionRegex = /\n####? /;
      const remainingPrompt = prompt.substring(afterMarker);
      const nextSectionMatch = remainingPrompt.search(nextSectionRegex);

      if (nextSectionMatch !== -1) {
        const endOfSection = afterMarker + nextSectionMatch;
        return (
          prompt.substring(0, endOfSection) +
          '\n' +
          saveInstructions +
          prompt.substring(endOfSection)
        );
      } else {
        // No next section found, append at end
        return prompt + '\n' + saveInstructions;
      }
    } else {
      // Fallback: insert before Failures section
      const failuresMarker = '#### Failures';
      const failuresIndex = prompt.indexOf(failuresMarker);

      if (failuresIndex !== -1) {
        return (
          prompt.substring(0, failuresIndex) +
          saveInstructions +
          '\n' +
          prompt.substring(failuresIndex)
        );
      } else {
        // Last resort: append to end
        return prompt + '\n' + saveInstructions;
      }
    }
  }

  /**
   * Inject MCP failure test instructions into the prompt
   */
  private injectMcpFailureTest(prompt: string, issueId: string): string {
    const testInstructions = `
## TEST MODE: MCP Failure Simulation
**IMPORTANT**: This operation is running in MCP failure test mode.

When you attempt to post operation reports to Linear via MCP:
1. For ALL operation reports, simulate MCP failures by:
   - Attempting to post to issue ID "INVALID-TEST-999" instead of "${issueId}"
   - This will cause ALL MCP tool calls to fail
   - Log each failure to the parent directory's issue-operation-log.md file following the standard format
   - Use format: \`- [<timestamp>] MCP Failure: Failed to post <operation-action> report for ${issueId}/<operation>. Error: Issue INVALID-TEST-999 not found\`
2. After logging each failure, continue with the operation normally
3. Complete the entire operation despite ALL MCP failures
4. Never use the correct issue ID "${issueId}" when test mode is active

This test validates that MCP failures are handled gracefully without blocking operations.
`;

    // Insert test instructions after the MCP Integration section in the prompt
    const mcpIntegrationMarker = '#### MCP Integration for Operation Reports';
    const insertionPoint = prompt.indexOf(mcpIntegrationMarker);

    if (insertionPoint !== -1) {
      // Find the end of the MCP Integration section (next #### or ###)
      const afterMarker = prompt.indexOf('\n', insertionPoint);
      const nextSectionRegex = /\n####? /;
      const remainingPrompt = prompt.substring(afterMarker);
      const nextSectionMatch = remainingPrompt.search(nextSectionRegex);

      if (nextSectionMatch !== -1) {
        const endOfSection = afterMarker + nextSectionMatch;
        return (
          prompt.substring(0, endOfSection) +
          '\n' +
          testInstructions +
          prompt.substring(endOfSection)
        );
      } else {
        // No next section found, append at the end of MCP section
        return prompt + '\n' + testInstructions;
      }
    } else {
      // If no MCP Integration marker found, insert before Operation Step 1
      const operationStepMarker = '### Operation Step 1:';
      const operationStepIndex = prompt.indexOf(operationStepMarker);

      if (operationStepIndex !== -1) {
        return (
          prompt.substring(0, operationStepIndex) +
          testInstructions +
          '\n' +
          prompt.substring(operationStepIndex)
        );
      } else {
        // Fallback: append to end of prompt
        return prompt + '\n' + testInstructions;
      }
    }
  }
}
