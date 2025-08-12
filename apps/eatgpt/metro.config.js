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

// === NATIVEWIND CONFIGURATION ===
// Wraps the config to enable Tailwind CSS className prop support
// This processes global.css and enables className->style transformation
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { 
  input: './global.css'  // Path to the CSS file with Tailwind directives
});