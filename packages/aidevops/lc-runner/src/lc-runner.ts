#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { ConfigLoader } from './config';
import { LinearClient } from './linear-client';
import { WorkingFolderManager } from './working-folder';
import { OperationLogger } from './operation-logger';
import { PromptAssembler } from './prompt-assembler';
import { OperationReporter } from './operation-reporter';

const program = new Command();

program
  .name('lc-runner')
  .description('Linear/ClaudeCode runner CLI for AI-assisted development')
  .version('0.0.1')
  .argument('<operation>', 'The operation name to execute')
  .argument('<issueId>', 'The Linear issue ID')
  .action((operation: string, issueId: string) => {
    let workingFolderPath: string | undefined;
    let reporter: OperationReporter | undefined;

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

      // Get the workroot from config - use ConfigLoader's repo root finding logic
      const repoRoot = configLoader['repoRoot'];
      const workroot = path.join(repoRoot, '.linear-watcher', 'work');

      // Create WorkingFolder
      const folderManager = new WorkingFolderManager(workroot);
      workingFolderPath = folderManager.createWorkingFolder(issueId, operation);
      console.log(`Created working folder: ${workingFolderPath}`);

      // Create initial operation report
      reporter = new OperationReporter(workingFolderPath);
      const folderName = folderManager.generateFolderName(issueId, operation);
      reporter.createInitialReport(issueId, operation, folderName);
      console.log(`Created initial operation report`);

      // Append to operation log
      const logger = new OperationLogger(workroot);
      const logEntry = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation,
        status: 'Started',
        folderPath: folderName,
      };
      logger.appendLogEntry(issueId, logEntry);
      console.log(`Appended entry to operation log`);

      // Assemble master prompt
      const promptAssembler = new PromptAssembler();
      const generalPromptPath = path.join(
        repoRoot,
        '.linear-watcher',
        'prompts',
        config.generalPrompt
      );
      const operationPromptPath = path.join(
        repoRoot,
        '.linear-watcher',
        'prompts',
        operationMapping.promptFile
      );
      const masterPromptPath = path.join(workingFolderPath, 'master-prompt.md');

      const replacements = {
        issueId,
        operation,
        workingFolder: workingFolderPath,
      };

      promptAssembler.assembleMasterPrompt(
        generalPromptPath,
        operationPromptPath,
        replacements,
        masterPromptPath
      );
      console.log(`Assembled master prompt at: ${masterPromptPath}`);

      // Update report to completed
      reporter.updateReport('Completed', 'Successfully initialized working folder and prompts', {
        updatedIssue: 'updated-issue.md',
        commentFiles: [],
        contextDump: 'context-dump.md',
      });

      // Update operation log with completion
      const completionEntry = {
        timestamp: OperationLogger.getCurrentTimestamp(),
        operation,
        status: 'Completed',
        folderPath: folderName,
      };
      logger.appendLogEntry(issueId, completionEntry);

      // Success message
      console.log(`\nOperation initialized successfully!`);
      console.log(`Issue: ${issueId}`);
      console.log(`Operation: ${operation}`);
      console.log(`Working folder: ${workingFolderPath}`);
      console.log(`Master prompt: ${masterPromptPath}`);
      process.exit(0);
    } catch (error) {
      // Update report to failed if reporter exists
      if (reporter && workingFolderPath) {
        try {
          reporter.updateReport('Failed', error instanceof Error ? error.message : 'Unknown error');
        } catch {
          // Ignore errors updating report
        }
      }

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
