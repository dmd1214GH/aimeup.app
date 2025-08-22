import * as fs from 'fs';
import * as path from 'path';
import type { Config } from './types';
import { ConfigSchema } from './types';

export class ConfigLoader {
  private configPath: string;

  constructor() {
    const repoRoot = this.findRepoRoot();
    if (!repoRoot) {
      throw new Error('Unable to find repository root (no pnpm-workspace.yaml found)');
    }
    this.configPath = path.join(repoRoot, '.linear-watcher', 'config.json');
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
    return config.operations.some((op) => op.name === operationName);
  }

  public validateIssuePrefix(issueId: string, config: Config): boolean {
    return config.issuePrefixes.some((prefix) => issueId.startsWith(prefix));
  }
}
