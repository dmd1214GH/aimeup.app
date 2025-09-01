import { ClaudeInvoker } from '../src/claude-invoker';
import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import { EventEmitter } from 'events';

jest.mock('fs');
jest.mock('child_process');

describe('ClaudeInvoker', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
  const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use provided claude path', () => {
      const customPath = '/custom/path/to/claude';
      mockFs.existsSync.mockReturnValue(true);

      const invoker = new ClaudeInvoker(customPath);
      expect(invoker['claudePath']).toBe(customPath);
    });

    it('should use claude in PATH when no path is provided', () => {
      const invoker = new ClaudeInvoker();
      expect(invoker['claudePath']).toBe('claude');
    });

    it('should fall back to claude in PATH if provided path does not exist', () => {
      const customPath = '/nonexistent/path/to/claude';
      mockFs.existsSync.mockReturnValue(false);

      const invoker = new ClaudeInvoker(customPath);
      expect(invoker['claudePath']).toBe('claude');
    });
  });

  describe('invokeClaudeCode', () => {
    it('should return error if master prompt file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const invoker = new ClaudeInvoker();
      const result = await invoker.invokeClaudeCode('/path/to/prompt.md');

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Master prompt file not found');
    });

    it('should successfully invoke ClaudeCode with --print flag', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('Test prompt content');
      // No temp file mocking needed - using direct file reference

      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      const invoker = new ClaudeInvoker();
      const resultPromise = invoker.invokeClaudeCode('/path/to/prompt.md');

      // Simulate ClaudeCode output
      mockProcess.stdout.emit('data', 'ClaudeCode output');
      mockProcess.emit('close', 0);

      const result = await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        [
          '--print',
          '--dangerously-skip-permissions',
          'Please read and execute the instructions in /path/to/prompt.md',
        ],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: expect.any(Object),
          shell: false,
        }
      );
      // stdin.end is called but content is passed via file now
      expect(mockProcess.stdin.end).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('ClaudeCode output');
    });

    it('should handle ClaudeCode execution failure', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('Test prompt content');
      // No temp file mocking needed - using direct file reference

      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      const invoker = new ClaudeInvoker();
      const resultPromise = invoker.invokeClaudeCode('/path/to/prompt.md');

      // Simulate ClaudeCode error
      mockProcess.stderr.emit('data', 'Error message');
      mockProcess.emit('close', 1);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('Error message');
    });

    it('should handle spawn error', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('Test prompt content');
      // No temp file mocking needed - using direct file reference

      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.stdin = {
        write: jest.fn(),
        end: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      const invoker = new ClaudeInvoker();
      const resultPromise = invoker.invokeClaudeCode('/path/to/prompt.md');

      // Simulate spawn error
      mockProcess.emit('error', new Error('Spawn failed'));

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Failed to spawn ClaudeCode process');
    });
  });

  describe('isClaudeCodeAvailable', () => {
    it('should return true if claude file exists at specified path', () => {
      mockFs.existsSync.mockReturnValue(true);

      const invoker = new ClaudeInvoker('/custom/path/to/claude');
      const available = invoker.isClaudeCodeAvailable();

      expect(available).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/custom/path/to/claude');
    });

    it('should return false if claude file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const invoker = new ClaudeInvoker('/custom/path/to/claude');
      const available = invoker.isClaudeCodeAvailable();

      expect(available).toBe(false);
    });

    it('should check version for claude in PATH', () => {
      mockSpawnSync.mockReturnValue({ status: 0 } as any);

      const invoker = new ClaudeInvoker();
      invoker['claudePath'] = 'claude';

      const available = invoker.isClaudeCodeAvailable();

      expect(available).toBe(true);
      expect(mockSpawnSync).toHaveBeenCalledWith('claude', ['--version'], {
        encoding: 'utf8',
        shell: false,
      });
    });
  });
});
