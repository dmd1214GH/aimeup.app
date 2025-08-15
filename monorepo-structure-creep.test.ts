import * as fs from 'fs';
import * as path from 'path';

describe('Monorepo Structure Creep Prevention', () => {
  const rootPath = path.resolve(__dirname);
  const allowedFolders = ['_docs', '_scripts', 'apps', 'services', 'packages', 'configs'];

  test('should not contain additional structural-level folders beyond allowed list', () => {
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
      .map((dirent) => dirent.name);

    const unexpectedFolders = actualFolders.filter((folder) => !allowedFolders.includes(folder));

    if (unexpectedFolders.length > 0) {
      throw new Error(
        `Unexpected folders found at monorepo root: ${unexpectedFolders.join(', ')}. ` +
          `Only these folders are allowed: ${allowedFolders.join(', ')}`
      );
    }

    expect(unexpectedFolders).toEqual([]);
  });

  test('should not have more folders than allowed', () => {
    const actualFolderCount = fs.readdirSync(rootPath, { withFileTypes: true }).filter((dirent) => {
      if (!dirent.isDirectory()) return false;
      const name = dirent.name;
      // Ignore dot-folders, node_modules, and _reference
      if (name.startsWith('.')) return false;
      if (name === 'node_modules') return false;
      if (name === '_reference') return false;
      return true;
    }).length;

    expect(actualFolderCount).toBeLessThanOrEqual(allowedFolders.length);
  });
});
