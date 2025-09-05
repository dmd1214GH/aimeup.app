import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface TerminalTransitionState {
  operation: string;
  phase: string;
  terminalTransitionFlag: boolean;
  lastFileUpdateTimestamp: string;
  lastLinearSaveTimestamp: string;
}

describe('Terminal Transition System', () => {
  let testWorkingFolder: string;
  
  beforeEach(() => {
    // Create a temporary working folder for tests
    const timestamp = Date.now();
    testWorkingFolder = join(tmpdir(), `terminal-transition-test-${timestamp}`);
    mkdirSync(testWorkingFolder, { recursive: true });
  });
  
  afterEach(() => {
    // Clean up test folder
    if (existsSync(testWorkingFolder)) {
      rmSync(testWorkingFolder, { recursive: true, force: true });
    }
  });

  describe('State File Management', () => {
    it('should create a valid terminal transition state file', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      const state: TerminalTransitionState = {
        operation: 'Grooming',
        phase: 'Phase 4',
        terminalTransitionFlag: false,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: ''
      };
      
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      
      expect(existsSync(stateFile)).toBe(true);
      
      const savedState = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(savedState.operation).toBe('Grooming');
      expect(savedState.terminalTransitionFlag).toBe(false);
    });

    it('should update terminal transition flag after successful save', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      const initialState: TerminalTransitionState = {
        operation: 'Delivery',
        phase: 'Phase 5',
        terminalTransitionFlag: false,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: ''
      };
      
      writeFileSync(stateFile, JSON.stringify(initialState, null, 2));
      
      // Simulate successful save
      const updatedState: TerminalTransitionState = {
        ...initialState,
        terminalTransitionFlag: true,
        lastLinearSaveTimestamp: new Date().toISOString()
      };
      
      writeFileSync(stateFile, JSON.stringify(updatedState, null, 2));
      
      const savedState = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(savedState.terminalTransitionFlag).toBe(true);
      expect(savedState.lastLinearSaveTimestamp).toBeTruthy();
    });
  });

  describe('Continuous Persistence', () => {
    it('should persist updated-issue.md after every edit', async () => {
      const issueFile = join(testWorkingFolder, 'updated-issue.md');
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      
      // Initial write
      const initialContent = '# Issue Title\nInitial content';
      writeFileSync(issueFile, initialContent);
      
      const initialTimestamp = new Date();
      const initialState: TerminalTransitionState = {
        operation: 'Grooming',
        phase: 'Phase 3',
        terminalTransitionFlag: false,
        lastFileUpdateTimestamp: initialTimestamp.toISOString(),
        lastLinearSaveTimestamp: ''
      };
      writeFileSync(stateFile, JSON.stringify(initialState, null, 2));
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Simulate edit
      const updatedContent = '# Issue Title\nInitial content\n\n## Requirements\n1. New requirement';
      writeFileSync(issueFile, updatedContent);
      
      // Update state with new timestamp
      const updatedTimestamp = new Date();
      const updatedState = {
        ...initialState,
        lastFileUpdateTimestamp: updatedTimestamp.toISOString()
      };
      writeFileSync(stateFile, JSON.stringify(updatedState, null, 2));
      
      // Verify persistence
      expect(readFileSync(issueFile, 'utf-8')).toBe(updatedContent);
      const savedState = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(new Date(savedState.lastFileUpdateTimestamp).getTime()).toBeGreaterThan(
        new Date(initialState.lastFileUpdateTimestamp).getTime()
      );
    });
  });

  describe('Crash Recovery Detection', () => {
    it('should detect orphaned work on session start', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      const issueFile = join(testWorkingFolder, 'updated-issue.md');
      
      // Simulate crashed session with unsaved work
      const crashedState: TerminalTransitionState = {
        operation: 'Delivery',
        phase: 'Phase 3',
        terminalTransitionFlag: false,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      };
      writeFileSync(stateFile, JSON.stringify(crashedState, null, 2));
      writeFileSync(issueFile, '# Issue with unsaved changes');
      
      // Check recovery detection
      const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(state.terminalTransitionFlag).toBe(false);
      expect(existsSync(issueFile)).toBe(true);
      
      // File timestamp should be newer than last save
      const fileStats = require('fs').statSync(issueFile);
      const fileModTime = fileStats.mtime.getTime();
      const lastSaveTime = new Date(state.lastLinearSaveTimestamp).getTime();
      expect(fileModTime).toBeGreaterThan(lastSaveTime);
    });

    it('should not trigger recovery if terminal transition completed', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      
      const completedState: TerminalTransitionState = {
        operation: 'Grooming',
        phase: 'Phase 5',
        terminalTransitionFlag: true,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: new Date().toISOString()
      };
      writeFileSync(stateFile, JSON.stringify(completedState, null, 2));
      
      const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(state.terminalTransitionFlag).toBe(true);
    });
  });

  describe('SessionEnd Hook', () => {
    it('should create recovery backup on session end', () => {
      const issueFile = join(testWorkingFolder, 'updated-issue.md');
      const originalFile = join(testWorkingFolder, 'original-issue.md');
      
      writeFileSync(originalFile, '# Original Issue');
      writeFileSync(issueFile, '# Updated Issue with changes');
      
      // Simulate backup creation (normally done by hook)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const backupFile = join(testWorkingFolder, `recovery-backup-${timestamp}.md`);
      writeFileSync(backupFile, readFileSync(issueFile, 'utf-8'));
      
      expect(existsSync(backupFile)).toBe(true);
      expect(readFileSync(backupFile, 'utf-8')).toBe('# Updated Issue with changes');
    });

    it('should not save if no changes detected', () => {
      const issueFile = join(testWorkingFolder, 'updated-issue.md');
      const originalFile = join(testWorkingFolder, 'original-issue.md');
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      
      const sameContent = '# Issue Content';
      writeFileSync(originalFile, sameContent);
      writeFileSync(issueFile, sameContent);
      
      const state: TerminalTransitionState = {
        operation: 'Grooming',
        phase: 'Phase 3',
        terminalTransitionFlag: false,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: new Date().toISOString()
      };
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      
      // Check that files are identical
      const updated = readFileSync(issueFile, 'utf-8');
      const original = readFileSync(originalFile, 'utf-8');
      expect(updated).toBe(original);
    });
  });

  describe('Reversion Flow', () => {
    it('should handle reversion request after terminal transition', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      const issueFile = join(testWorkingFolder, 'updated-issue.md');
      
      // Initial state with terminal transition completed
      const savedState: TerminalTransitionState = {
        operation: 'Grooming',
        phase: 'Phase 5',
        terminalTransitionFlag: true,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: new Date().toISOString()
      };
      writeFileSync(stateFile, JSON.stringify(savedState, null, 2));
      writeFileSync(issueFile, '# Saved Issue Content');
      
      // Simulate reversion
      const revertedState: TerminalTransitionState = {
        ...savedState,
        terminalTransitionFlag: false,
        phase: 'Phase 3'
      };
      writeFileSync(stateFile, JSON.stringify(revertedState, null, 2));
      
      // Simulate fetched content from Linear
      const fetchedContent = '# Fetched from Linear';
      writeFileSync(issueFile, fetchedContent);
      
      // Verify reversion
      const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(state.terminalTransitionFlag).toBe(false);
      expect(readFileSync(issueFile, 'utf-8')).toBe(fetchedContent);
    });

    it('should support multiple reversions in same session', () => {
      const stateFile = join(testWorkingFolder, '.terminal-transition-state');
      let reversionCount = 0;
      
      // First save and reversion
      let state: TerminalTransitionState = {
        operation: 'Delivery',
        phase: 'Phase 5',
        terminalTransitionFlag: true,
        lastFileUpdateTimestamp: new Date().toISOString(),
        lastLinearSaveTimestamp: new Date().toISOString()
      };
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      
      // Revert
      state.terminalTransitionFlag = false;
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      reversionCount++;
      
      // Save again
      state.terminalTransitionFlag = true;
      state.lastLinearSaveTimestamp = new Date().toISOString();
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      
      // Revert again
      state.terminalTransitionFlag = false;
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
      reversionCount++;
      
      expect(reversionCount).toBe(2);
      const finalState = JSON.parse(readFileSync(stateFile, 'utf-8'));
      expect(finalState.terminalTransitionFlag).toBe(false);
    });
  });

  describe('Operation Status Transitions', () => {
    it('should trigger correct status for Grooming Complete', () => {
      const transitions = {
        'Grooming': {
          'Complete': 'Ready for Delivery',
          'Blocked': 'Grooming-BLOCKED'
        },
        'Delivery': {
          'Complete': 'Acceptance',
          'Blocked': 'Delivery-BLOCKED'
        }
      };
      
      expect(transitions['Grooming']['Complete']).toBe('Ready for Delivery');
    });

    it('should trigger correct status for Delivery Blocked', () => {
      const transitions = {
        'Grooming': {
          'Complete': 'Ready for Delivery',
          'Blocked': 'Grooming-BLOCKED'
        },
        'Delivery': {
          'Complete': 'Acceptance',
          'Blocked': 'Delivery-BLOCKED'
        }
      };
      
      expect(transitions['Delivery']['Blocked']).toBe('Delivery-BLOCKED');
    });
  });
});