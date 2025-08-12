#!/usr/bin/env node

// Simple tokens build script - will be enhanced later with actual design token generation
console.log('Building design tokens...');

// For now, just create a simple output file
const fs = require('fs');
const path = require('path');

const tokensOutput = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6', 
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
    light: '#F2F2F7',
    dark: '#1C1C1E'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  }
};

// Write tokens to dist directory
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(
  path.join(distDir, 'tokens.json'),
  JSON.stringify(tokensOutput, null, 2)
);

fs.writeFileSync(
  path.join(distDir, 'index.js'),
  `module.exports = ${JSON.stringify(tokensOutput, null, 2)};`
);

console.log('✅ Design tokens built successfully');