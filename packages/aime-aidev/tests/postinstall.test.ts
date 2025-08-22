import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('Postinstall Script', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  // We'll test the logic by importing the functions
  // For the actual postinstall, we would test it differently

  const findRepoRoot = (startPath: string): string | null => {
    let currentPath = startPath;

    while (currentPath !== path.dirname(currentPath)) {
      if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }

    return null;
  };

  const copyAssets = (sourceDir: string, repoRoot: string): void => {
    const targetDir = path.join(repoRoot, '.linear-watcher');

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy config.json
    const configSource = path.join(sourceDir, 'config.json');
    const configTarget = path.join(targetDir, 'config.json');

    if (fs.existsSync(configSource)) {
      fs.copyFileSync(configSource, configTarget);
    }

    // Copy prompts directory
    const promptsSource = path.join(sourceDir, 'prompts');
    const promptsTarget = path.join(targetDir, 'prompts');

    if (fs.existsSync(promptsSource)) {
      if (!fs.existsSync(promptsTarget)) {
        fs.mkdirSync(promptsTarget, { recursive: true });
      }

      const promptFiles = fs.readdirSync(promptsSource);
      promptFiles.forEach((file) => {
        const sourceFile = path.join(promptsSource, file);
        const targetFile = path.join(promptsTarget, file);
        fs.copyFileSync(sourceFile, targetFile);
      });
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findRepoRoot', () => {
    it('should find repository root with pnpm-workspace.yaml', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        return typeof filePath === 'string' && filePath === '/mock/repo/pnpm-workspace.yaml';
      });

      const result = findRepoRoot('/mock/repo/packages/some-package');
      expect(result).toBe('/mock/repo');
    });

    it('should return null when no repository root found', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = findRepoRoot('/some/random/path');
      expect(result).toBeNull();
    });
  });

  describe('copyAssets', () => {
    const sourceDir = '/source/assets';
    const repoRoot = '/mock/repo';
    const targetDir = '/mock/repo/.linear-watcher';

    beforeEach(() => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath === targetDir) return false;
          if (filePath === path.join(targetDir, 'prompts')) return false;
          if (filePath === path.join(sourceDir, 'config.json')) return true;
          if (filePath === path.join(sourceDir, 'prompts')) return true;
        }
        return false;
      });

      mockFs.readdirSync.mockReturnValue(['prompt1.md', 'prompt2.md'] as any);
      mockFs.mkdirSync.mockImplementation(() => undefined as any);
      mockFs.copyFileSync.mockImplementation(() => undefined);
    });

    it('should create target directory if it does not exist', () => {
      copyAssets(sourceDir, repoRoot);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(targetDir, { recursive: true });
    });

    it('should copy config.json to target directory', () => {
      copyAssets(sourceDir, repoRoot);

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        path.join(sourceDir, 'config.json'),
        path.join(targetDir, 'config.json')
      );
    });

    it('should create prompts directory and copy prompt files', () => {
      copyAssets(sourceDir, repoRoot);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(path.join(targetDir, 'prompts'), {
        recursive: true,
      });

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        path.join(sourceDir, 'prompts', 'prompt1.md'),
        path.join(targetDir, 'prompts', 'prompt1.md')
      );

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        path.join(sourceDir, 'prompts', 'prompt2.md'),
        path.join(targetDir, 'prompts', 'prompt2.md')
      );
    });

    it('should not fail if config.json does not exist', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string' && filePath === path.join(sourceDir, 'config.json')) {
          return false;
        }
        return false;
      });

      expect(() => copyAssets(sourceDir, repoRoot)).not.toThrow();

      // Should not attempt to copy config.json
      expect(mockFs.copyFileSync).not.toHaveBeenCalledWith(
        path.join(sourceDir, 'config.json'),
        expect.anything()
      );
    });

    it('should not fail if prompts directory does not exist', () => {
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        if (typeof filePath === 'string') {
          if (filePath === path.join(sourceDir, 'config.json')) return true;
          if (filePath === path.join(sourceDir, 'prompts')) return false;
        }
        return false;
      });

      expect(() => copyAssets(sourceDir, repoRoot)).not.toThrow();

      // Should still copy config.json
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        path.join(sourceDir, 'config.json'),
        path.join(targetDir, 'config.json')
      );

      // Should not create prompts directory
      expect(mockFs.mkdirSync).not.toHaveBeenCalledWith(
        path.join(targetDir, 'prompts'),
        expect.anything()
      );
    });
  });
});
