import * as fs from 'fs';
import * as path from 'path';

export interface PromptReplacements {
  issueId: string;
  operation: string;
  workingFolder: string;
}

export class PromptAssembler {
  /**
   * Assemble the master prompt from general and operation-specific prompts
   */
  assembleMasterPrompt(
    generalPromptPath: string,
    operationPromptPath: string,
    replacements: PromptReplacements,
    outputPath: string
  ): void {
    try {
      // Load general prompt
      const generalPrompt = this.loadPromptFile(generalPromptPath);

      // Load operation-specific prompt
      const operationPrompt = this.loadPromptFile(operationPromptPath);

      // Validate only operation prompt format (general prompt can have any structure)
      this.validatePromptFormat(operationPrompt, operationPromptPath);

      // Perform replacements in general prompt
      const processedGeneralPrompt = this.performReplacements(generalPrompt, replacements);

      // Combine prompts
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
}
