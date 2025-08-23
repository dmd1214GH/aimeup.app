import * as fs from 'fs';
import * as path from 'path';
import type { Config, OperationMapping } from './types';
import { ConfigSchema } from './types';

export class ConfigLoader {
  private configPath: string;
  private promptsPath: string;
  private repoRoot: string;

  constructor() {
    const repoRoot = this.findRepoRoot();
    if (!repoRoot) {
      throw new Error('Unable to find repository root (no pnpm-workspace.yaml found)');
    }
    this.repoRoot = repoRoot;
    this.configPath = path.join(repoRoot, '.linear-watcher', 'config.json');
    this.promptsPath = path.join(repoRoot, '.linear-watcher', 'prompts');
  }

  private findRepoRoot(): string | null {
    let currentPath = process.cwd();

    while (currentPath !== path.dirname(currentPath)) {
      if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  public loadConfig(): Config {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(
        `Configuration file not found: ${this.configPath}\nPlease ensure @aimeup/aime-aidev is installed.`
      );
    }

    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      const configData = JSON.parse(configContent);

      // Validate configuration with Zod
      const validatedConfig = ConfigSchema.parse(configData);
      return validatedConfig;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${this.configPath}`);
      }
      if (error instanceof Error) {
        throw new Error(`Configuration validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  public validateOperation(operationName: string, config: Config): boolean {
    const operations = config['lc-runner-operations'];
    return Object.values(operations).some((op) => op.operationName === operationName);
  }

  public validateIssuePrefix(issueId: string, config: Config): boolean {
    return issueId.startsWith(config.linear.issuePrefix);
  }

  public getOperationByCliName(cliOperationName: string, config: Config): OperationMapping | null {
    const operations = config['lc-runner-operations'];
    for (const operation of Object.values(operations)) {
      if (operation.operationName === cliOperationName) {
        return operation;
      }
    }
    return null;
  }

  public validatePromptFiles(config: Config): void {
    // Check general prompt
    const generalPromptPath = path.join(this.promptsPath, config.generalPrompt);
    if (!fs.existsSync(generalPromptPath)) {
      throw new Error(`General prompt file not found: ${generalPromptPath}`);
    }

    // Check operation-specific prompts
    const operations = config['lc-runner-operations'];
    for (const [operationKey, operation] of Object.entries(operations)) {
      const promptPath = path.join(this.promptsPath, operation.promptFile);
      if (!fs.existsSync(promptPath)) {
        throw new Error(`Prompt file not found for operation ${operationKey}: ${promptPath}`);
      }
    }
  }

  public loadPrompt(promptFile: string): string {
    const promptPath = path.join(this.promptsPath, promptFile);
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found: ${promptPath}`);
    }
    return fs.readFileSync(promptPath, 'utf-8');
  }
}
