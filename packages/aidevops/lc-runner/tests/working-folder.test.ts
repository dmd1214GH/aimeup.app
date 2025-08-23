import * as fs from 'fs';
import { WorkingFolderManager } from '../src/working-folder';

// Mock fs module
jest.mock('fs');

describe('WorkingFolderManager', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const workroot = '/test/workroot';
  let manager: WorkingFolderManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new WorkingFolderManager(workroot);

    // Mock Date to have consistent timestamps in tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-22T10:30:45'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('generateFolderName', () => {
    it('should generate folder name with correct pattern', () => {
      const folderName = manager.generateFolderName('AM-19', 'Delivery');
      expect(folderName).toBe('lcr-AM-19/op-Delivery-20250822103045');
    });

    it('should generate unique timestamps for different times', () => {
      const folderName1 = manager.generateFolderName('AM-19', 'Delivery');

      // Advance time by 1 second
      jest.setSystemTime(new Date('2025-08-22T10:30:46'));
      const folderName2 = manager.generateFolderName('AM-19', 'Delivery');

      expect(folderName1).not.toBe(folderName2);
      expect(folderName1).toBe('lcr-AM-19/op-Delivery-20250822103045');
      expect(folderName2).toBe('lcr-AM-19/op-Delivery-20250822103046');
    });
  });

  describe('createWorkingFolder', () => {
    it('should create working folder with parent directory', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => undefined);

      const result = manager.createWorkingFolder('AM-19', 'Delivery');

      expect(result).toBe('/test/workroot/lcr-AM-19/op-Delivery-20250822103045');

      // Should check and create parent directory
      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/workroot/lcr-AM-19');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/workroot/lcr-AM-19', {
        recursive: true,
      });

      // Should check and create operation folder
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/op-Delivery-20250822103045'
      );
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/op-Delivery-20250822103045',
        { recursive: true }
      );
    });

    it('should handle existing parent folder', () => {
      mockFs.existsSync
        .mockReturnValueOnce(true) // Parent folder exists
        .mockReturnValueOnce(false); // Operation folder doesn't exist
      mockFs.mkdirSync.mockImplementation(() => undefined);

      const result = manager.createWorkingFolder('AM-19', 'Delivery');

      expect(result).toBe('/test/workroot/lcr-AM-19/op-Delivery-20250822103045');

      // Should not try to create parent directory since it exists
      expect(mockFs.mkdirSync).not.toHaveBeenCalledWith('/test/workroot/lcr-AM-19', {
        recursive: true,
      });

      // Should create operation folder
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/op-Delivery-20250822103045',
        { recursive: true }
      );
    });

    it('should handle filesystem errors with clear message', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        manager.createWorkingFolder('AM-19', 'Delivery');
      }).toThrow(
        'Failed to create working folder at /test/workroot/lcr-AM-19/op-Delivery-20250822103045: Permission denied'
      );
    });

    it('should handle non-Error exceptions', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw 'Unknown error';
      });

      expect(() => {
        manager.createWorkingFolder('AM-19', 'Delivery');
      }).toThrow(
        'Failed to create working folder at /test/workroot/lcr-AM-19/op-Delivery-20250822103045'
      );
    });
  });

  describe('getWorkingFolderPath', () => {
    it('should return the correct absolute path', () => {
      const path = manager.getWorkingFolderPath('AM-19', 'Delivery');
      expect(path).toBe('/test/workroot/lcr-AM-19/op-Delivery-20250822103045');
    });
  });

  describe('workingFolderExists', () => {
    it('should return true when folder exists', () => {
      mockFs.existsSync.mockReturnValue(true);

      const exists = manager.workingFolderExists('AM-19', 'Delivery');

      expect(exists).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/op-Delivery-20250822103045'
      );
    });

    it('should return false when folder does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const exists = manager.workingFolderExists('AM-19', 'Delivery');

      expect(exists).toBe(false);
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        '/test/workroot/lcr-AM-19/op-Delivery-20250822103045'
      );
    });
  });

  describe('timestamp formatting', () => {
    it('should format timestamp correctly for various dates', () => {
      const testCases = [
        { date: new Date('2025-01-01T00:00:00'), expected: '20250101000000' },
        { date: new Date('2025-12-31T23:59:59'), expected: '20251231235959' },
        { date: new Date('2025-02-14T14:30:25'), expected: '20250214143025' },
      ];

      testCases.forEach(({ date, expected }) => {
        jest.setSystemTime(date);
        const newManager = new WorkingFolderManager(workroot);
        const folderName = newManager.generateFolderName('TEST-1', 'Op');
        expect(folderName).toBe(`lcr-TEST-1/op-Op-${expected}`);
      });
    });
  });
});
