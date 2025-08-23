#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigLoader } from './config';
import { LinearClient } from './linear-client';

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

      // Get operation mapping from CLI operation name
      const operationMapping = configLoader.getOperationByCliName(operation, config);
      if (!operationMapping) {
        const validOperations = Object.values(config['lc-runner-operations'])
          .map((op) => op.operationName)
          .join(', ');
        console.error(`Error: Invalid operation '${operation}'.`);
        console.error(`Valid operations are: ${validOperations}`);
        process.exit(1);
      }

      // Validate issue ID prefix
      if (!configLoader.validateIssuePrefix(issueId, config)) {
        console.error(`Error: Issue ID '${issueId}' does not match configured prefix.`);
        console.error(`Expected prefix: ${config.linear.issuePrefix}`);
        process.exit(1);
      }

      // Validate prompt files exist
      try {
        configLoader.validatePromptFiles(config);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }

      // Load prompts (for future use when implementing actual operations)
      configLoader.loadPrompt(config.generalPrompt);
      configLoader.loadPrompt(operationMapping.promptFile);

      // Initialize Linear client and validate issue status
      const linearClient = new LinearClient(config.linear);
      const issueStatus = linearClient.validateIssueStatus(
        issueId,
        operationMapping.linearIssueStatus
      );

      if (!issueStatus) {
        console.error(
          `Error: Issue ${issueId} is not in the required status '${operationMapping.linearIssueStatus}' for operation '${operation}'.`
        );
        process.exit(1);
      }

      // Success - return Hello World message with operation details
      console.log(`Hello World (${issueId} : ${operation})`);
      console.log(`Operation mapping found: ${operationMapping.linearIssueStatus}`);
      console.log(`Prompts loaded successfully`);
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
