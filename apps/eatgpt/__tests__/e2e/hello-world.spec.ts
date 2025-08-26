import { test, expect } from '@playwright/test';

test.describe('EatGPT Hello World', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8082');
  });

  test('should display Hello World text', async ({ page }) => {
    // Wait for the app to load
    await page.waitForTimeout(3000);

    // Check that Hello World text is visible
    const helloWorldText = await page.locator('[data-testid="hello-world-text"]').first();
    await expect(helloWorldText).toBeVisible();
    await expect(helloWorldText).toContainText('Hello World');
  });
});
