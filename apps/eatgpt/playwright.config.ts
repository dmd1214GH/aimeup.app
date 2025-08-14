import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  testMatch: ['**/*.spec.ts'],
  
  // Test execution settings
  timeout: 30000, // 30 seconds per test
  fullyParallel: false, // Run tests sequentially for now
  forbidOnly: true, // Fail if test.only is left in code
  retries: 0, // No retries in dev
  workers: 1, // Single worker for predictable results
  
  // Reporter configuration
  reporter: [
    ['list'], // Simple list output for terminal
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  
  // Shared settings for all browsers
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:8081',
    
    // Timeout for each action
    actionTimeout: 10000,
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Slow down actions for demo (0 = normal speed, 1000 = 1 second between actions)
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
      headless: process.env.HEADED === 'true' ? false : true,
    },
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/',

  // Web server configuration (commented out for manual control)
  // webServer: {
  //   command: 'pnpm web',
  //   port: 8081,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: true,
  // },
});