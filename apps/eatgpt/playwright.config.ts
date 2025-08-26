import { defineConfig, devices } from '@playwright/test';

const headless = process.env.HEADED !== 'true';
const slowMo = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless,
          slowMo,
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          headless,
          slowMo,
        },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: {
          headless,
          slowMo,
        },
      },
    },
  ],
  webServer: {
    command: 'npm run web:ci',
    url: 'http://localhost:8082',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
