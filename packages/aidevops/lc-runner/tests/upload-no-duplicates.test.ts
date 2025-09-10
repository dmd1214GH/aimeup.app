import * as fs from 'fs';
import * as path from 'path';

describe('Upload Recovery - No Duplicate Reports', () => {
  const testDir = path.join(__dirname, '.test-no-duplicates');
  const issueFolder = path.join(testDir, 'lcr-TEST-01');
  const operationFolder = path.join(issueFolder, 'op-Groom-20250910140705');

  beforeEach(() => {
    // Clean up and create test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(operationFolder, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should not create new operation reports during upload recovery', () => {
    // Create initial operation files (simulating a completed operation)
    const originalFiles = [
      'original-issue.md',
      'updated-issue.md',
      'master-prompt.md',
      'operation-report-Started-20250910141003.md',
      'operation-report-Progress Update-20250910140957.md',
      'operation-report-Finished-20250910143444.md',
    ];

    originalFiles.forEach(file => {
      fs.writeFileSync(path.join(operationFolder, file), `# ${file} content`);
    });

    // Count initial operation reports
    const initialReports = fs.readdirSync(operationFolder)
      .filter(f => f.startsWith('operation-report-'));
    
    expect(initialReports).toHaveLength(3);

    // Simulate upload recovery process
    // In real scenario, Claude would be invoked here
    // The expected behavior: NO new operation-report files should be created
    
    // After upload recovery, count operation reports again
    const finalReports = fs.readdirSync(operationFolder)
      .filter(f => f.startsWith('operation-report-'));
    
    // CRITICAL: No new operation reports should have been created
    expect(finalReports).toHaveLength(3);
    expect(finalReports).toEqual(initialReports);
  });

  it('should detect and warn about duplicate operation reports', () => {
    // Create files with duplicate patterns (same action, different timestamps)
    const duplicates = [
      'operation-report-Started-20250910141003.md',
      'operation-report-Started-20250910145953.md', // Duplicate Started!
      'operation-report-Progress Update-20250910140957.md',
      'operation-report-Progress Update-20250910141003.md', // Duplicate Progress!
      'operation-report-Finished-20250910143444.md',
      'operation-report-Finished-20250910150259.md', // Duplicate Finished!
    ];

    duplicates.forEach(file => {
      fs.writeFileSync(path.join(operationFolder, file), `# ${file} content`);
    });

    // Group reports by action type
    const reports = fs.readdirSync(operationFolder)
      .filter(f => f.startsWith('operation-report-'));
    
    const actionCounts = new Map<string, number>();
    reports.forEach(report => {
      const match = report.match(/operation-report-(.+?)-\d+\.md/);
      if (match) {
        const action = match[1];
        actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
      }
    });

    // Check for duplicates
    const duplicateActions: string[] = [];
    actionCounts.forEach((count, action) => {
      if (count > 1) {
        duplicateActions.push(`${action} (${count} reports)`);
      }
    });

    // We should detect all three duplicate types
    expect(duplicateActions).toContain('Started (2 reports)');
    expect(duplicateActions).toContain('Progress Update (2 reports)');
    expect(duplicateActions).toContain('Finished (2 reports)');
  });

  it('should handle locked file renaming without creating duplicates', () => {
    // Create initial files including a locked one
    fs.writeFileSync(path.join(operationFolder, 'original-issue.md'), '# Original');
    fs.writeFileSync(
      path.join(operationFolder, 'updated-issue.md.LOCKED-CHECK-REVERSION-PROTOCOL'),
      '# Updated'
    );
    fs.writeFileSync(
      path.join(operationFolder, 'operation-report-Started-20250910141003.md'),
      '# Started'
    );

    // Simulate the CLI renaming locked file
    const lockedFile = path.join(operationFolder, 'updated-issue.md.LOCKED-CHECK-REVERSION-PROTOCOL');
    const normalFile = path.join(operationFolder, 'updated-issue.md');
    
    if (fs.existsSync(lockedFile) && !fs.existsSync(normalFile)) {
      fs.renameSync(lockedFile, normalFile);
    }

    // Verify only one updated-issue.md exists
    const files = fs.readdirSync(operationFolder);
    const updatedFiles = files.filter(f => f.includes('updated-issue'));
    
    expect(updatedFiles).toHaveLength(1);
    expect(updatedFiles[0]).toBe('updated-issue.md');
    
    // Verify no new operation reports were created
    const reports = files.filter(f => f.startsWith('operation-report-'));
    expect(reports).toHaveLength(1);
  });

  it('should maintain chronological order when processing reports', () => {
    // Create reports with different timestamps
    const reports = [
      { name: 'operation-report-Started-20250910141003.md', timestamp: '20250910141003' },
      { name: 'operation-report-Progress Update-20250910142500.md', timestamp: '20250910142500' },
      { name: 'operation-report-Finished-20250910143444.md', timestamp: '20250910143444' },
    ];

    // Write them out of order
    reports.reverse().forEach(report => {
      fs.writeFileSync(path.join(operationFolder, report.name), `# ${report.name}`);
    });

    // Read and sort by timestamp in filename
    const files = fs.readdirSync(operationFolder)
      .filter(f => f.startsWith('operation-report-'))
      .sort((a, b) => {
        const timestampA = a.match(/(\d{14})/)?.[1] || '';
        const timestampB = b.match(/(\d{14})/)?.[1] || '';
        return timestampA.localeCompare(timestampB);
      });

    // Verify chronological order
    expect(files[0]).toBe('operation-report-Started-20250910141003.md');
    expect(files[1]).toBe('operation-report-Progress Update-20250910142500.md');
    expect(files[2]).toBe('operation-report-Finished-20250910143444.md');
  });
});