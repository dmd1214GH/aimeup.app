#!/usr/bin/env node

/**
 * Deploy prompts from source to .linear-watcher/prompts
 * This script copies prompt files from packages/aime-aidev/assets/prompts/
 * to the .linear-watcher/prompts/ directory
 */

const fs = require('fs');
const path = require('path');

// Find repository root (contains pnpm-workspace.yaml)
function findRepoRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== '/') {
    if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  throw new Error('Could not find repository root (no pnpm-workspace.yaml found)');
}

function main() {
  try {
    const repoRoot = findRepoRoot(process.cwd());
    console.log(`Repository root: ${repoRoot}`);

    const sourceDir = path.join(repoRoot, 'packages', 'aime-aidev', 'assets', 'prompts');
    const targetDir = path.join(repoRoot, '.linear-watcher', 'prompts');

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created target directory: ${targetDir}`);
    }

    // Get all .md files from source directory
    const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.md'));

    if (files.length === 0) {
      console.warn('No markdown files found in source directory');
      return;
    }

    console.log(`\nDeploying ${files.length} prompt files:`);

    // Copy each file
    files.forEach((file) => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      // Read source file
      const content = fs.readFileSync(sourcePath, 'utf8');

      // Write to target
      fs.writeFileSync(targetPath, content, 'utf8');

      console.log(`  ✓ ${file}`);
    });

    console.log('\n✅ Prompt deployment complete!');
  } catch (error) {
    console.error('Error deploying prompts:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { findRepoRoot, main };
