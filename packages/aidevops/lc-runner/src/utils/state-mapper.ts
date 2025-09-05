import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface StateMappings {
  stateUUIDs: Record<string, string>;
  _metadata?: {
    fetchedAt: string;
    teams: string[];
  };
  _comment?: string;
}

export class StateMapper {
  private mappings: StateMappings | null = null;
  private mappingsPath: string;

  constructor(configPath?: string) {
    this.mappingsPath = configPath || join(__dirname, '../../config/state-mappings.json');
    this.loadMappings();
  }

  private loadMappings(): void {
    try {
      if (existsSync(this.mappingsPath)) {
        const content = readFileSync(this.mappingsPath, 'utf-8');
        this.mappings = JSON.parse(content);
        console.log(`[StateMapper] Loaded ${Object.keys(this.mappings?.stateUUIDs || {}).length} state mappings`);
      } else {
        console.warn(`[StateMapper] State mappings file not found at ${this.mappingsPath}`);
        console.warn('[StateMapper] Run fetch-state-uuids.sh to generate mappings');
      }
    } catch (error) {
      console.error('[StateMapper] Failed to load state mappings:', error);
    }
  }

  /**
   * Get UUID for a given state name
   */
  getStateUUID(stateName: string): string | null {
    if (!this.mappings?.stateUUIDs) {
      console.warn('[StateMapper] No mappings available');
      return null;
    }

    const uuid = this.mappings.stateUUIDs[stateName];
    if (!uuid) {
      console.warn(`[StateMapper] No UUID found for state: ${stateName}`);
      console.warn('[StateMapper] Available states:', Object.keys(this.mappings.stateUUIDs));
      return null;
    }

    return uuid;
  }

  /**
   * Get state name for a given UUID
   */
  getStateName(uuid: string): string | null {
    if (!this.mappings?.stateUUIDs) {
      return null;
    }

    for (const [name, id] of Object.entries(this.mappings.stateUUIDs)) {
      if (id === uuid) {
        return name;
      }
    }

    return null;
  }

  /**
   * List all available state mappings
   */
  getAllStates(): Record<string, string> {
    return this.mappings?.stateUUIDs || {};
  }

  /**
   * Check if a state name exists in mappings
   */
  hasState(stateName: string): boolean {
    return Boolean(this.mappings?.stateUUIDs?.[stateName]);
  }

  /**
   * Update issue status using Linear API directly
   * Note: This requires LINEAR_API_KEY to be set
   */
  async updateIssueStatus(issueId: string, stateName: string): Promise<boolean> {
    const uuid = this.getStateUUID(stateName);
    if (!uuid) {
      console.error(`[StateMapper] Cannot update status: No UUID for state "${stateName}"`);
      return false;
    }

    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.error('[StateMapper] LINEAR_API_KEY not set');
      return false;
    }

    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateIssueState($id: String!, $stateId: String!) {
              issueUpdate(id: $id, input: { stateId: $stateId }) {
                success
                issue {
                  identifier
                  state {
                    name
                  }
                }
              }
            }
          `,
          variables: {
            id: issueId,
            stateId: uuid
          }
        })
      });

      const result: any = await response.json();
      
      if (result.data?.issueUpdate?.success) {
        console.log(`[StateMapper] Successfully updated ${issueId} to ${stateName}`);
        return true;
      } else {
        console.error(`[StateMapper] Failed to update status:`, result.errors);
        return false;
      }
    } catch (error) {
      console.error(`[StateMapper] Error updating status:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const stateMapper = new StateMapper();