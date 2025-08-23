import * as fs from 'fs';
import { OperationLogger } from '../src/operation-logger';
import type { LogEntry } from '../src/operation-logger';

// Mock fs module
jest.mock('fs');

describe('OperationLogger', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const workroot = '/test/workroot';
  let logger: OperationLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = new OperationLogger(workroot);
  });

  describe('appendLogEntry', () => {
    it('should create log file with header when missing', () => {
      const entry: LogEntry = {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: 'Delivery',
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      };

      mockFs.existsSync
        .mockReturnValueOnce(true) // Parent directory exists
        .mockReturnValueOnce(false); // Log file doesn't exist
      mockFs.writeFileSync.mockImplementation(() => undefined);

      logger.appendLogEntry('AM-19', entry);

      const expectedPath = '/test/workroot/lcr-AM-19/issue-operation-log.md';
      const expectedContent =
        '# Operation Log for AM-19\n\n' +
        '## 2025-08-22T10:30:45.000Z\n' +
        '- **Operation**: Delivery\n' +
        '- **Status**: Started\n' +
        '- **Folder**: lcr-AM-19/op-Delivery-20250822103045\n\n';

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(expectedPath, expectedContent, 'utf8');
    });

    it('should append to existing log file', () => {
      const entry: LogEntry = {
        timestamp: '2025-08-22T11:00:00.000Z',
        operation: 'Task',
        status: 'Completed',
        folderPath: 'lcr-AM-19/op-Task-20250822110000',
      };

      mockFs.existsSync.mockReturnValue(true); // Both parent dir and log file exist
      mockFs.appendFileSync.mockImplementation(() => undefined);

      logger.appendLogEntry('AM-19', entry);

      const expectedPath = '/test/workroot/lcr-AM-19/issue-operation-log.md';
      const expectedContent =
        '## 2025-08-22T11:00:00.000Z\n' +
        '- **Operation**: Task\n' +
        '- **Status**: Completed\n' +
        '- **Folder**: lcr-AM-19/op-Task-20250822110000\n\n';

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(expectedPath, expectedContent, 'utf8');
    });

    it('should create parent directory if missing', () => {
      const entry: LogEntry = {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: 'Delivery',
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      };

      mockFs.existsSync
        .mockReturnValueOnce(false) // Parent directory doesn't exist
        .mockReturnValueOnce(false); // Log file doesn't exist
      mockFs.mkdirSync.mockImplementation(() => undefined);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      logger.appendLogEntry('AM-19', entry);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/workroot/lcr-AM-19', {
        recursive: true,
      });
    });

    it('should handle write failures with clear error message', () => {
      const entry: LogEntry = {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: 'Delivery',
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      };

      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        logger.appendLogEntry('AM-19', entry);
      }).toThrow(
        'Failed to append log entry to /test/workroot/lcr-AM-19/issue-operation-log.md: Permission denied'
      );
    });

    it('should handle non-Error exceptions', () => {
      const entry: LogEntry = {
        timestamp: '2025-08-22T10:30:45.000Z',
        operation: 'Delivery',
        status: 'Started',
        folderPath: 'lcr-AM-19/op-Delivery-20250822103045',
      };

      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {
        throw 'Unknown error';
      });

      expect(() => {
        logger.appendLogEntry('AM-19', entry);
      }).toThrow('Failed to append log entry to /test/workroot/lcr-AM-19/issue-operation-log.md');
    });
  });

  describe('readLog', () => {
    it('should return null when log file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = logger.readLog('AM-19');

      expect(result).toBeNull();
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/issue-operation-log.md'
      );
    });

    it('should read and return log file content', () => {
      const logContent = '# Operation Log for AM-19\n\n## Entry 1\n...';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(logContent);

      const result = logger.readLog('AM-19');

      expect(result).toBe(logContent);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/issue-operation-log.md',
        'utf8'
      );
    });

    it('should handle read failures with clear error message', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        logger.readLog('AM-19');
      }).toThrow(
        'Failed to read log file at /test/workroot/lcr-AM-19/issue-operation-log.md: Permission denied'
      );
    });
  });

  describe('logExists', () => {
    it('should return true when log file exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const exists = logger.logExists('AM-19');

      expect(exists).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/issue-operation-log.md'
      );
    });

    it('should return false when log file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const exists = logger.logExists('AM-19');

      expect(exists).toBe(false);
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/issue-operation-log.md'
      );
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return current ISO timestamp', () => {
      const mockDate = new Date('2025-08-22T15:45:30.123Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const timestamp = OperationLogger.getCurrentTimestamp();

      expect(timestamp).toBe('2025-08-22T15:45:30.123Z');

      jest.useRealTimers();
    });
  });

  describe('log entry formatting', () => {
    it('should format log entries correctly', () => {
      const entries: LogEntry[] = [
        {
          timestamp: '2025-08-22T10:00:00.000Z',
          operation: 'Tasking',
          status: 'Started',
          folderPath: 'lcr-AM-19/op-Tasking-20250822100000',
        },
        {
          timestamp: '2025-08-22T10:15:00.000Z',
          operation: 'Tasking',
          status: 'Completed',
          folderPath: 'lcr-AM-19/op-Tasking-20250822100000',
        },
      ];

      mockFs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockFs.writeFileSync.mockImplementation(() => undefined);

      logger.appendLogEntry('AM-19', entries[0]);

      const capturedContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      expect(capturedContent).toContain('# Operation Log for AM-19');
      expect(capturedContent).toContain('## 2025-08-22T10:00:00.000Z');
      expect(capturedContent).toContain('- **Operation**: Tasking');
      expect(capturedContent).toContain('- **Status**: Started');
      expect(capturedContent).toContain('- **Folder**: lcr-AM-19/op-Tasking-20250822100000');
    });
  });
});
