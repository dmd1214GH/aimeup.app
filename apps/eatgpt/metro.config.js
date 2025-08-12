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

// Temporarily disable NativeWind to fix web bundling
// const { withNativeWind } = require('nativewind/metro');
// module.exports = withNativeWind(config, { 
//   input: './global.css',
//   configPath: './tailwind.config.js'
// });

module.exports = config;