import { LinearClient as LinearSDKClient } from '@linear/sdk';
import { writeFileSync, existsSync, statSync, mkdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import * as lockfile from 'proper-lockfile';

interface StateMappings {
  stateUUIDs: Record<string, string>;
  _metadata?: {
    fetchedAt: string;
    teams: string[];
  };
  _comment?: string;
}

export interface RefreshOptions {
  apiKey?: string;
  outputPath?: string;
  staleThresholdMinutes?: number;
  lockTimeout?: number;
}

export class StateMappingRefresher {
  private client: LinearSDKClient | null = null;
  private outputPath: string;
  private staleThresholdMinutes: number;
  private lockTimeout: number;
  private apiKey: string | undefined;

  constructor(options: RefreshOptions = {}) {
    this.apiKey = options.apiKey || process.env.LINEAR_API_KEY;
    this.outputPath = options.outputPath || join(process.cwd(), '.linear-watcher', 'state-mappings.json');
    this.staleThresholdMinutes = options.staleThresholdMinutes || 90;
    this.lockTimeout = options.lockTimeout || 10000; // 10 seconds in milliseconds

    if (this.apiKey) {
      this.client = new LinearSDKClient({
        apiKey: this.apiKey,
      });
    }
  }

  /**
   * Check if the state mappings file needs refresh
   */
  needsRefresh(): boolean {
    if (!existsSync(this.outputPath)) {
      console.log('[StateMappingRefresher] State mappings file does not exist - refresh needed');
      return true;
    }

    const stats = statSync(this.outputPath);
    const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);

    if (ageMinutes > this.staleThresholdMinutes) {
      console.log(`[StateMappingRefresher] State mappings file is ${Math.round(ageMinutes)} minutes old (threshold: ${this.staleThresholdMinutes}) - refresh needed`);
      return true;
    }

    console.log(`[StateMappingRefresher] State mappings file is ${Math.round(ageMinutes)} minutes old - no refresh needed`);
    return false;
  }

  /**
   * Fetch all workflow states from Linear API
   */
  async fetchWorkflowStates(): Promise<StateMappings> {
    if (!this.client) {
      throw new Error('[StateMappingRefresher] Linear API key not configured');
    }

    console.log('[StateMappingRefresher] Fetching all workflow states from Linear API...');

    try {
      // Fetch all teams to get all workflow states
      const teamsResult = await this.client.teams();
      const teams = teamsResult.nodes;
      
      const stateUUIDs: Record<string, string> = {};
      const teamNames: string[] = [];

      for (const team of teams) {
        teamNames.push(team.name);
        
        // Get all states for this team
        const states = await team.states();
        
        for (const state of states.nodes) {
          // Store mapping: state name -> UUID
          // If duplicate names exist across teams, last one wins (consistent with shell script)
          stateUUIDs[state.name] = state.id;
        }
      }

      const mappings: StateMappings = {
        stateUUIDs,
        _metadata: {
          fetchedAt: new Date().toISOString(),
          teams: teamNames,
        },
        _comment: 'Auto-generated state UUID mappings for Linear issues. Do not edit manually.',
      };

      console.log(`[StateMappingRefresher] Fetched ${Object.keys(stateUUIDs).length} workflow states from ${teamNames.length} teams`);
      
      return mappings;
    } catch (error) {
      console.error('[StateMappingRefresher] Failed to fetch workflow states:', error);
      throw error;
    }
  }

  /**
   * Write state mappings to file with atomic replacement
   */
  private async writeToFile(mappings: StateMappings): Promise<void> {
    const dir = dirname(this.outputPath);
    
    // Ensure directory exists
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Write to temporary file first
    const tempPath = `${this.outputPath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(mappings, null, 2));

    // Atomically replace the original file
    renameSync(tempPath, this.outputPath);
    
    console.log(`[StateMappingRefresher] State mappings written to ${this.outputPath}`);
  }

  /**
   * Refresh state mappings with file locking for thread-safety
   */
  async refresh(force: boolean = false): Promise<boolean> {
    // Check if refresh is needed
    if (!force && !this.needsRefresh()) {
      return false;
    }

    // Ensure directory exists for lock file
    const dir = dirname(this.outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Create a lock file path
    const lockFilePath = `${this.outputPath}.lock`;
    
    // Create lock file if it doesn't exist
    if (!existsSync(lockFilePath)) {
      writeFileSync(lockFilePath, '');
    }

    let release: (() => void) | null = null;

    try {
      // Try to acquire lock with timeout
      console.log('[StateMappingRefresher] Attempting to acquire file lock...');
      
      release = await lockfile.lock(lockFilePath, {
        retries: {
          retries: Math.floor(this.lockTimeout / 1000), // Convert to seconds
          factor: 1,
          minTimeout: 1000,
          maxTimeout: 1000,
        },
        stale: this.lockTimeout * 2, // Consider lock stale after 2x timeout
      });

      console.log('[StateMappingRefresher] Lock acquired, fetching state mappings...');

      // Double-check if refresh is still needed (another process might have done it)
      if (!force && !this.needsRefresh()) {
        console.log('[StateMappingRefresher] Another process already refreshed the mappings');
        return false;
      }

      // Fetch new mappings
      const mappings = await this.fetchWorkflowStates();
      
      // Write to file
      await this.writeToFile(mappings);
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('lock')) {
        console.warn('[StateMappingRefresher] Could not acquire lock within timeout - proceeding without refresh');
        return false;
      }
      
      console.error('[StateMappingRefresher] Failed to refresh state mappings:', error);
      // Non-fatal: continue with existing mappings
      return false;
    } finally {
      // Always release lock if acquired
      if (release) {
        try {
          await release();
          console.log('[StateMappingRefresher] Lock released');
        } catch (e) {
          console.warn('[StateMappingRefresher] Failed to release lock:', e);
        }
      }
    }
  }

  /**
   * Get the current mappings path
   */
  getMappingsPath(): string {
    return this.outputPath;
  }

  /**
   * Check if the refresher is configured (has API key)
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}