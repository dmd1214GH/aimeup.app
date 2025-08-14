/** @type {import('tailwindcss').Config} */
const tokens = require('@aimeup/tokens/tailwind')

module.exports = {
  // Specify which files Tailwind should scan for className usage
  // This determines which Tailwind utilities get included in the build
  content: [
    // App-level files
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    
    // Monorepo packages - only scan specific packages to avoid node_modules
    // The previous "../../packages/**/*.{js,jsx,ts,tsx}" was matching node_modules
    "../../packages/ui-native/**/*.{js,jsx,ts,tsx}",
    "../../packages/core-react/**/*.{js,jsx,ts,tsx}"
  ],
  
  // NativeWind preset configures Tailwind for React Native compatibility
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {
      // Use design tokens from @aimeup/tokens
      ...tokens
    },
  },
  
  plugins: [
    // Tailwind plugins can be added here
  ],
}