#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function findRepoRoot(startPath: string): string | null {
  let currentPath = startPath;

  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

function copyAssets(): void {
  const repoRoot = findRepoRoot(process.cwd());

  if (!repoRoot) {
    console.error('Unable to find repository root (no pnpm-workspace.yaml found)');
    process.exit(1);
  }

  const targetDir = path.join(repoRoot, '.linear-watcher');
  const sourceDir = path.join(__dirname, 'assets');

  // Validate source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source assets directory not found: ${sourceDir}`);
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  // Copy config.json
  const configSource = path.join(sourceDir, 'config.json');
  const configTarget = path.join(targetDir, 'config.json');

  if (fs.existsSync(configSource)) {
    // Force remove existing file if it exists using rm -f (handles read-only files)
    if (fs.existsSync(configTarget)) {
      try {
        execSync(`rm -f "${configTarget}"`);
      } catch (rmError) {
        console.error(`Failed to remove existing config.json: ${rmError}`);
        process.exit(1);
      }
    }

    fs.copyFileSync(configSource, configTarget);
    // Make the file read-only to prevent accidental editing
    fs.chmodSync(configTarget, 0o444);
    console.log(`Copied config.json to ${configTarget} (read-only)`);
  } else {
    console.error(`Config file not found: ${configSource}`);
    process.exit(1);
  }

  // Copy prompts directory
  const promptsSource = path.join(sourceDir, 'prompts');
  const promptsTarget = path.join(targetDir, 'prompts');

  if (fs.existsSync(promptsSource)) {
    if (!fs.existsSync(promptsTarget)) {
      fs.mkdirSync(promptsTarget, { recursive: true });
    }

    const promptFiles = fs.readdirSync(promptsSource);
    let copiedCount = 0;
    promptFiles.forEach((file) => {
      if (file.endsWith('.md')) {
        const sourceFile = path.join(promptsSource, file);
        const targetFile = path.join(promptsTarget, file);

        // Force remove existing file if it exists using rm -f (handles read-only files)
        if (fs.existsSync(targetFile)) {
          try {
            execSync(`rm -f "${targetFile}"`);
          } catch (rmError) {
            console.error(`Failed to remove existing prompt file ${file}: ${rmError}`);
            process.exit(1);
          }
        }

        fs.copyFileSync(sourceFile, targetFile);
        // Make the file read-only to prevent accidental editing
        fs.chmodSync(targetFile, 0o444);
        console.log(`Copied prompt file: ${file} (read-only)`);
        copiedCount++;
      }
    });

    if (copiedCount === 0) {
      console.warn('Warning: No prompt files (.md) found to copy');
    }
  } else {
    console.error(`Prompts directory not found: ${promptsSource}`);
    process.exit(1);
  }

  // Copy claude-agents directory to .claude/agents
  const agentsSource = path.join(sourceDir, 'claude-agents');
  const claudeDir = path.join(repoRoot, '.claude');
  const agentsTarget = path.join(claudeDir, 'agents');

  if (fs.existsSync(agentsSource)) {
    // Create .claude directory if it doesn't exist
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
      console.log(`Created directory: ${claudeDir}`);
    }

    // Create agents directory if it doesn't exist
    if (!fs.existsSync(agentsTarget)) {
      fs.mkdirSync(agentsTarget, { recursive: true });
      console.log(`Created directory: ${agentsTarget}`);
    }

    const agentFiles = fs.readdirSync(agentsSource);
    let copiedAgentCount = 0;
    agentFiles.forEach((file) => {
      if (file.endsWith('.md')) {
        const sourceFile = path.join(agentsSource, file);
        const targetFile = path.join(agentsTarget, file);

        // Force remove existing file if it exists using rm -f (handles read-only files)
        if (fs.existsSync(targetFile)) {
          try {
            execSync(`rm -f "${targetFile}"`);
          } catch (rmError) {
            console.error(`Failed to remove existing agent file ${file}: ${rmError}`);
            process.exit(1);
          }
        }

        fs.copyFileSync(sourceFile, targetFile);
        // Make the file read-only to prevent accidental editing
        fs.chmodSync(targetFile, 0o444);
        console.log(`Copied agent file: ${file} to .claude/agents/ (read-only)`);
        copiedAgentCount++;
      }
    });

    if (copiedAgentCount === 0) {
      console.warn('Warning: No agent files (.md) found to copy');
    } else {
      console.log(`Successfully copied ${copiedAgentCount} agent(s) to .claude/agents/`);
    }
  } else {
    console.log('No claude-agents directory found, skipping agent installation');
  }

  // Copy claude-commands directory to .claude/commands
  const commandsSource = path.join(sourceDir, 'claude-commands');
  const commandsTarget = path.join(claudeDir, 'commands');

  if (fs.existsSync(commandsSource)) {
    // Create .claude directory if it doesn't exist
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
      console.log(`Created directory: ${claudeDir}`);
    }

    // Create commands directory if it doesn't exist
    if (!fs.existsSync(commandsTarget)) {
      fs.mkdirSync(commandsTarget, { recursive: true });
      console.log(`Created directory: ${commandsTarget}`);
    }

    const commandFiles = fs.readdirSync(commandsSource);
    let copiedCommandCount = 0;
    commandFiles.forEach((file) => {
      if (file.endsWith('.md')) {
        const sourceFile = path.join(commandsSource, file);
        const targetFile = path.join(commandsTarget, file);

        // Force remove existing file if it exists using rm -f (handles read-only files)
        if (fs.existsSync(targetFile)) {
          try {
            execSync(`rm -f "${targetFile}"`);
          } catch (rmError) {
            console.error(`Failed to remove existing command file ${file}: ${rmError}`);
            process.exit(1);
          }
        }

        fs.copyFileSync(sourceFile, targetFile);
        // Make the file read-only to prevent accidental editing
        fs.chmodSync(targetFile, 0o444);
        console.log(`Copied command file: ${file} to .claude/commands/ (read-only)`);
        copiedCommandCount++;
      }
    });

    if (copiedCommandCount === 0) {
      console.warn('Warning: No command files (.md) found to copy');
    } else {
      console.log(`Successfully copied ${copiedCommandCount} command(s) to .claude/commands/`);
    }
  } else {
    console.log('No claude-commands directory found, skipping command installation');
  }

  console.log('AI Dev assets installation complete');
}

// Export for testing
export { findRepoRoot, copyAssets };

// Run postinstall
if (require.main === module) {
  try {
    copyAssets();
  } catch (error) {
    console.error('Error during postinstall:', error);
    process.exit(1);
  }
}
