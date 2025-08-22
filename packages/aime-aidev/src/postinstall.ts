#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

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

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  // Copy config.json
  const configSource = path.join(sourceDir, 'config.json');
  const configTarget = path.join(targetDir, 'config.json');

  if (fs.existsSync(configSource)) {
    fs.copyFileSync(configSource, configTarget);
    console.log(`Copied config.json to ${configTarget}`);
  }

  // Copy prompts directory
  const promptsSource = path.join(sourceDir, 'prompts');
  const promptsTarget = path.join(targetDir, 'prompts');

  if (fs.existsSync(promptsSource)) {
    if (!fs.existsSync(promptsTarget)) {
      fs.mkdirSync(promptsTarget, { recursive: true });
    }

    const promptFiles = fs.readdirSync(promptsSource);
    promptFiles.forEach((file) => {
      const sourceFile = path.join(promptsSource, file);
      const targetFile = path.join(promptsTarget, file);
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Copied prompt file: ${file}`);
    });
  }

  console.log('AI Dev assets installation complete');
}

// Run postinstall
if (require.main === module) {
  try {
    copyAssets();
  } catch (error) {
    console.error('Error during postinstall:', error);
    process.exit(1);
  }
}
