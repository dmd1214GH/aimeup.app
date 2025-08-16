const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Start with Expo's default Metro configuration
const config = getDefaultConfig(__dirname);

// === MONOREPO CONFIGURATION ===
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Watch all monorepo packages for changes (enables hot reload across packages)
config.watchFolders = [monorepoRoot];

// Tell Metro where to find node_modules in our pnpm monorepo structure
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// CRITICAL for pnpm monorepos: prevents Metro from using wrong package versions
// Without this, Metro might resolve to hoisted versions instead of workspace packages
config.resolver.disableHierarchicalLookup = true;

// === VECTOR ICONS CONFIGURATION ===
// Add support for react-native-vector-icons
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'ttf', 'otf'];

module.exports = config;
