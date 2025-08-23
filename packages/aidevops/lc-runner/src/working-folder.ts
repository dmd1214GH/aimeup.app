import * as fs from 'fs';
import * as path from 'path';

export class WorkingFolderManager {
  private workroot: string;

  constructor(workroot: string) {
    this.workroot = workroot;
  }

  /**
   * Generate folder name with pattern lcr-<issue-id>/op-<operation>-YYYYMMDDHHMMSS
   */
  generateFolderName(issueId: string, operation: string): string {
    const timestamp = this.getTimestamp();
    const issueFolderName = `lcr-${issueId}`;
    const operationFolderName = `op-${operation}-${timestamp}`;
    return path.join(issueFolderName, operationFolderName);
  }

  /**
   * Create the working folder for the operation
   */
  createWorkingFolder(issueId: string, operation: string): string {
    const folderName = this.generateFolderName(issueId, operation);
    const fullPath = path.join(this.workroot, folderName);

    try {
      // Ensure parent lcr-<issue-id> folder exists
      const parentPath = path.join(this.workroot, `lcr-${issueId}`);
      if (!fs.existsSync(parentPath)) {
        fs.mkdirSync(parentPath, { recursive: true });
      }

      // Create the operation folder
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      return fullPath;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create working folder at ${fullPath}: ${error.message}`);
      }
      throw new Error(`Failed to create working folder at ${fullPath}`);
    }
  }

  /**
   * Get the absolute path for a working folder
   */
  getWorkingFolderPath(issueId: string, operation: string): string {
    const folderName = this.generateFolderName(issueId, operation);
    return path.join(this.workroot, folderName);
  }

  /**
   * Check if working folder exists
   */
  workingFolderExists(issueId: string, operation: string): boolean {
    const fullPath = this.getWorkingFolderPath(issueId, operation);
    return fs.existsSync(fullPath);
  }

  /**
   * Generate timestamp in format YYYYMMDDHHMMSS
   */
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
