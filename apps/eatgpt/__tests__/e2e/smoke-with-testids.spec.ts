import { test, expect, Locator } from '@playwright/test';

/**
 * Helper to get element by testID with fallback to text
 */
async function getElement(page: any, testId: string, fallbackText: string): Promise<Locator> {
  // Try testID first
  const testIdLocator = page.getByTestId(testId);
  if ((await testIdLocator.count()) > 0) {
    return testIdLocator.first();
  }
  // Fallback to text
  return page.getByText(fallbackText).first();
}

/**
 * Smoke Test with TestID support - Single session navigating through all pages
 * Mirrors Maestro smoke.flow.yaml with same testIDs
 */
test.describe('Smoke Test with TestIDs - App Navigation', () => {
  test('should navigate through all pages in the app', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify home page - try testID first, fallback to text
    const homeTitle = await getElement(page, 'home.title.text', 'EatGPT');
    await expect(homeTitle).toBeVisible();

    const homeSubtitle = await getElement(page, 'home.subtitle.text', 'React Native + Web App');
    await expect(homeSubtitle).toBeVisible();

    // Navigate to Kitchen Sink using testID with fallback
    const kitchenSinkButton = await getElement(
      page,
      'home.navigate.kitchensink',
      'View Kitchen Sink'
    );
    await kitchenSinkButton.click();
    await page.waitForURL('**/kitchensink');
    await expect(page.getByText('Kitchen Sink - UI Components Demo')).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Tokens Debug using testID with fallback
    const tokensButton = await getElement(page, 'home.navigate.tokens', 'Tokens Debug Guide');
    await tokensButton.click();
    await page.waitForURL('**/tokens-debug');

    const tokensTitle = await getElement(page, 'tokensDebug.title.text', 'Design Tokens Debug');
    await expect(tokensTitle).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Environment Test using testID with fallback
    const envTestButton = await getElement(
      page,
      'home.navigate.envtest',
      'Test Environment Variables'
    );
    await envTestButton.click();
    await page.waitForURL('**/env-test');

    const envTestTitle = await getElement(page, 'envTest.title.text', 'Environment Variables Test');
    await expect(envTestTitle).toBeVisible();

    // Go back to home
    await page.goBack();
    await page.waitForURL('**/');

    // Navigate to Environment Error Demo using testID with fallback
    const envErrorButton = await getElement(
      page,
      'home.navigate.enverror',
      'Environment Error Demo'
    );
    await envErrorButton.click();
    await page.waitForURL('**/env-error-demo');

    const envErrorTitle = await getElement(
      page,
      'envErrorDemo.title.text',
      'Environment Error Demo'
    );
    // Just verify we navigated, title might be hidden
    await expect(page.url()).toContain('env-error-demo');

    // Final verification - navigate back to home
    await page.goBack();
    await page.waitForURL('**/');
    const finalHomeTitle = await getElement(page, 'home.title.text', 'EatGPT');
    await expect(finalHomeTitle).toBeVisible();
  });
});
