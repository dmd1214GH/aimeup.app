#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigLoader } from './config';

const program = new Command();

program
  .name('lc-runner')
  .description('Linear/ClaudeCode runner CLI for AI-assisted development')
  .version('0.0.1')
  .argument('<operation>', 'The operation name to execute')
  .argument('<issueId>', 'The Linear issue ID')
  .action((operation: string, issueId: string) => {
    try {
      const configLoader = new ConfigLoader();
      const config = configLoader.loadConfig();

      // Validate operation
      if (!configLoader.validateOperation(operation, config)) {
        const validOperations = config.operations.map((op) => op.name).join(', ');
        console.error(`Error: Invalid operation '${operation}'.`);
        console.error(`Valid operations are: ${validOperations}`);
        process.exit(1);
      }

      // Validate issue ID prefix
      if (!configLoader.validateIssuePrefix(issueId, config)) {
        const validPrefixes = config.issuePrefixes.join(', ');
        console.error(`Error: Issue ID '${issueId}' does not match any configured prefix.`);
        console.error(`Valid prefixes are: ${validPrefixes}`);
        process.exit(1);
      }

      // Success - return Hello World message
      console.log(`Hello World (${issueId} : ${operation})`);
      process.exit(0);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}
