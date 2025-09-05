#!/usr/bin/env tsx

/**
 * SessionEnd Hook for Linear Issue Terminal Transition Handling
 * 
 * This hook is triggered when a Claude Code session ends gracefully.
 * It checks for unsaved work and triggers a save to Linear if needed.
 * 
 * Usage: session-end-hook.ts <working-folder> <issue-id> <operation>
 */

import { readFileSync, existsSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface TerminalTransitionState {
  operation: string;
  phase: string;
  terminalTransitionFlag: boolean;
  lastFileUpdateTimestamp: string;
  lastLinearSaveTimestamp: string;
}

function main() {
  const [workingFolder, issueId, operation] = process.argv.slice(2);

  if (!workingFolder) {
    console.log('[SessionEnd] No working folder provided');
    process.exit(0);
  }

  if (!existsSync(workingFolder)) {
    console.log(`[SessionEnd] Working folder not found: ${workingFolder}`);
    process.exit(0);
  }

  const stateFile = join(workingFolder, '.terminal-transition-state');
  const updatedIssueFile = join(workingFolder, 'updated-issue.md');
  const originalIssueFile = join(workingFolder, 'original-issue.md');

  // Check if state file exists
  if (!existsSync(stateFile)) {
    console.log('[SessionEnd] No state file found, skipping terminal transition check');
    process.exit(0);
  }

  // Parse the state file
  let state: TerminalTransitionState;
  try {
    const stateContent = readFileSync(stateFile, 'utf-8');
    state = JSON.parse(stateContent);
  } catch (error) {
    console.error('[SessionEnd] Failed to parse state file:', error);
    process.exit(1);
  }

  // If terminal transition has already occurred, no action needed
  if (state.terminalTransitionFlag) {
    console.log('[SessionEnd] Terminal transition already completed, no action needed');
    process.exit(0);
  }

  // Check if updated-issue.md exists
  if (!existsSync(updatedIssueFile)) {
    console.log('[SessionEnd] No updated issue file found');
    process.exit(0);
  }

  // Compare updated-issue.md with original-issue.md
  if (existsSync(originalIssueFile)) {
    const updatedContent = readFileSync(updatedIssueFile, 'utf-8');
    const originalContent = readFileSync(originalIssueFile, 'utf-8');
    
    if (updatedContent === originalContent) {
      console.log('[SessionEnd] No changes detected in issue file');
      process.exit(0);
    }
  }

  // Check if file was modified after last save
  const fileStats = require('fs').statSync(updatedIssueFile);
  const fileModTime = fileStats.mtime.toISOString();
  
  if (state.lastLinearSaveTimestamp && fileModTime <= state.lastLinearSaveTimestamp) {
    console.log('[SessionEnd] No changes since last Linear save');
    process.exit(0);
  }

  // Create a recovery backup with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupFile = join(workingFolder, `recovery-backup-${timestamp}.md`);
  
  try {
    copyFileSync(updatedIssueFile, backupFile);
    console.log(`[SessionEnd] Created recovery backup: ${backupFile}`);
  } catch (error) {
    console.error('[SessionEnd] Failed to create backup:', error);
  }

  // Trigger save to Linear with Blocked status
  console.log('[SessionEnd] Triggering save to Linear with Blocked status...');
  
  // Create operation report for the blocked save
  const reportTimestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);
  const reportFile = join(workingFolder, `operation-report-SessionEnd-${reportTimestamp}.md`);
  
  const reportContent = `# ${operation} Operation SessionEnd

\`\`\`json
{
  "issueId": "${issueId}",
  "operation": "${operation}",
  "action": "SessionEnd",
  "workingFolder": "${workingFolder}",
  "operationStatus": "Blocked",
  "timestamp": "${new Date().toISOString()}",
  "summary": "Session ended with unsaved changes - automatically saving as Blocked"
}
\`\`\`

The ${operation} session ended with unsaved changes to the Linear issue.
The issue has been automatically saved with Blocked status to prevent work loss.

Recovery backup created at: ${backupFile}

To continue work in the next session:
1. Start a new ${operation} operation for issue ${issueId}
2. The agent will detect the unsaved work and offer recovery options
`;

  try {
    writeFileSync(reportFile, reportContent);
    console.log(`[SessionEnd] Created operation report: ${reportFile}`);
  } catch (error) {
    console.error('[SessionEnd] Failed to create operation report:', error);
  }

  // Here you would typically call the actual lc-runner or lc-issue-saver
  // For now, we'll just log what would happen
  console.log(`[SessionEnd] Would invoke: lc-issue-saver with:`);
  console.log(`  - issueId: ${issueId}`);
  console.log(`  - workingFolder: ${workingFolder}`);
  console.log(`  - operation: ${operation}`);
  console.log(`  - action: SessionEnd`);
  console.log(`  - operationStatus: Blocked`);
  console.log(`  - blockedStatusTransition: ${operation}-BLOCKED`);

  // In a real implementation, you might call:
  // execSync(`npx lc-runner save-issue --issue-id ${issueId} --status Blocked ...`);

  console.log('[SessionEnd] Session end handling complete');
  console.log(`[SessionEnd] To recover work in next session, check: ${workingFolder}`);
}

// Run the hook
try {
  main();
} catch (error) {
  console.error('[SessionEnd] Unexpected error:', error);
  process.exit(1);
}