const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure for monorepo
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Include monorepo packages
config.watchFolders = [monorepoRoot];

// Map workspace packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Handle workspace packages
config.resolver.disableHierarchicalLookup = true;

// Enable NativeWind with CSS interop
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { input: './global.css' });