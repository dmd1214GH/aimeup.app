import * as fs from 'fs';
import * as path from 'path';

describe('Monorepo Structure Validation', () => {
  const rootPath = path.resolve(__dirname);

  // Define the complete expected structure based on actual folders
  const expectedStructure = {
    _docs: {
      subfolders: ['delivery', 'epics', 'guides', 'prompts', 'reference'],
    },
    _scripts: {
      subfolders: [],
    },
    apps: {
      subfolders: ['eatgpt'],
    },
    services: {
      subfolders: ['aimeup-service'],
    },
    packages: {
      subfolders: [
        'account',
        'chat',
        'config',
        'core',
        'core-react',
        'eatgpt',
        'helpers',
        'tokens',
      ],
    },
    configs: {
      subfolders: ['tsconfig', 'eslint', 'jest'],
    },
  };

  // Additional nested structure
  const nestedStructure = {
    'packages/core': ['aiapi', 'chatapi', 'menuapi', 'securityapi'],
    'packages/helpers': ['files', 'chatable', 'account', 'utility', 'openai'],
    'packages/eatgpt': ['nutrition', 'healthconnect'],
  };

  test('should have all required top-level folders', () => {
    for (const folder of Object.keys(expectedStructure)) {
      const folderPath = path.join(rootPath, folder);
      expect(fs.existsSync(folderPath)).toBe(true);
      expect(fs.statSync(folderPath).isDirectory()).toBe(true);
    }
  });

  test('should have all required subfolders', () => {
    for (const [parent, config] of Object.entries(expectedStructure)) {
      for (const subfolder of config.subfolders) {
        const subfolderPath = path.join(rootPath, parent, subfolder);
        if (!fs.existsSync(subfolderPath)) {
          throw new Error(`Missing required subfolder: ${parent}/${subfolder}`);
        }
        expect(fs.statSync(subfolderPath).isDirectory()).toBe(true);
      }
    }
  });

  test('should have all required nested subfolders', () => {
    for (const [parent, subfolders] of Object.entries(nestedStructure)) {
      for (const subfolder of subfolders) {
        const subfolderPath = path.join(rootPath, parent, subfolder);
        expect(fs.existsSync(subfolderPath)).toBe(true);
        expect(fs.statSync(subfolderPath).isDirectory()).toBe(true);
      }
    }
  });

  test('should not have unauthorized subfolders', () => {
    for (const [parent, config] of Object.entries(expectedStructure)) {
      const parentPath = path.join(rootPath, parent);
      if (!fs.existsSync(parentPath)) continue;

      const actualSubfolders = fs
        .readdirSync(parentPath, { withFileTypes: true })
        .filter((dirent) => {
          if (!dirent.isDirectory()) return false;
          const name = dirent.name;
          // Ignore dot-folders and node_modules
          if (name.startsWith('.')) return false;
          if (name === 'node_modules') return false;
          return true;
        })
        .map((dirent) => dirent.name);

      const unexpectedFolders = actualSubfolders.filter(
        (folder) => !config.subfolders.includes(folder)
      );

      if (unexpectedFolders.length > 0) {
        throw new Error(
          `Unauthorized folders in ${parent}: ${unexpectedFolders.join(', ')}. ` +
            `Only these are allowed: ${config.subfolders.join(', ')}`
        );
      }
    }
  });

  test('top-level should only contain the expected folders', () => {
    const actualFolders = fs
      .readdirSync(rootPath, { withFileTypes: true })
      .filter((dirent) => {
        if (!dirent.isDirectory()) return false;
        const name = dirent.name;
        // Ignore dot-folders, node_modules, and _reference
        if (name.startsWith('.')) return false;
        if (name === 'node_modules') return false;
        if (name === '_reference') return false;
        return true;
      })
      .map((dirent) => dirent.name)
      .sort();

    const expectedFolders = Object.keys(expectedStructure).sort();
    expect(actualFolders).toEqual(expectedFolders);
  });
});
