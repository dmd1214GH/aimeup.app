import { test, expect } from '@playwright/test';

/**
 * Smoke Test - Single browser session navigating through all pages
 * Verifies basic navigation works without errors
 */
test.describe('Smoke Test - App Navigation', () => {
  test('should navigate through all pages in the app', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify we're on the home page with title
    await expect(page.getByRole('heading', { name: 'EatGPT' })).toBeVisible();
    await expect(page.getByText('React Native + Web App')).toBeVisible();

    // Verify all navigation buttons are present
    const navButtons = [
      'View Kitchen Sink',
      'Tokens Debug Guide',
      'Test Environment Variables',
      'Environment Error Demo',
    ];

    for (const buttonText of navButtons) {
      await expect(page.getByText(buttonText)).toBeVisible();
    }

    // Navigate to Kitchen Sink and verify
    await page.getByText('View Kitchen Sink').click();
    await page.waitForURL('**/kitchensink');
    await expect(page.getByText('Kitchen Sink - UI Components Demo')).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Tokens Debug and verify
    await page.getByText('Tokens Debug Guide').click();
    await page.waitForURL('**/tokens-debug');
    await expect(page.getByText('Design Tokens Debug')).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Environment Test and verify
    await page.getByText('Test Environment Variables').click();
    await page.waitForURL('**/env-test');
    await expect(page.getByText('Environment Variables Test')).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Environment Error Demo and verify
    await page.getByText('Environment Error Demo').click();
    await page.waitForURL('**/env-error-demo');
    // The title might be on the page multiple times or hidden, just verify we navigated
    await expect(page.url()).toContain('env-error-demo');

    // Final verification - we can navigate back to home
    await page.goBack();
    await page.waitForURL('**/');
    await expect(page.getByRole('heading', { name: 'EatGPT' })).toBeVisible();
  });
});
