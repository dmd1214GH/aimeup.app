import { test, expect, Locator } from '@playwright/test';

/**
 * Helper to get element by testID with fallback
 */
async function getElement(
  page: any,
  testId: string,
  fallback: { type: 'text' | 'placeholder'; value: string }
): Promise<Locator> {
  // Try testID first
  const testIdLocator = page.getByTestId(testId);
  if ((await testIdLocator.count()) > 0) {
    return testIdLocator.first();
  }
  // Fallback to text or placeholder
  if (fallback.type === 'text') {
    return page.getByText(fallback.value).first();
  } else {
    return page.getByPlaceholder(fallback.value).first();
  }
}

/**
 * Interaction Tests with TestID support - Verify components actually work
 * Mirrors Maestro interaction.flow.yaml with same testIDs
 */
test.describe('Component Interaction Tests with TestIDs', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to KitchenSink where all components are
    await page.goto('/kitchensink');
    await page.waitForLoadState('networkidle');
  });

  test('should handle button interactions and state changes', async ({ page }) => {
    // Test Primary button click with testID
    const primaryButton = await getElement(page, 'kitchenSink.primary.button', {
      type: 'text',
      value: 'Primary Button',
    });
    await expect(primaryButton).toBeVisible();

    // Click and handle alert dialog
    page.on('dialog', (dialog) => dialog.accept());
    await primaryButton.click();

    // Test Secondary button with testID
    const secondaryButton = await getElement(page, 'kitchenSink.secondary.button', {
      type: 'text',
      value: 'Secondary Button',
    });
    await secondaryButton.click();

    // Test Outline button with testID
    const outlineButton = await getElement(page, 'kitchenSink.outline.button', {
      type: 'text',
      value: 'Outline Button',
    });
    await outlineButton.click();

    // Test Loading button with testID
    const loadingButton = await getElement(page, 'kitchenSink.loading.button', {
      type: 'text',
      value: 'Loading Button',
    });
    await loadingButton.click();

    // Verify Disabled button exists with testID
    const disabledButton = await getElement(page, 'kitchenSink.disabled.button', {
      type: 'text',
      value: 'Disabled Button',
    });
    await expect(disabledButton).toBeVisible();
  });

  test('should handle input field interactions and validation', async ({ page }) => {
    // Find text input by testID with placeholder fallback
    const textInput = await getElement(page, 'kitchenSink.basic.input', {
      type: 'placeholder',
      value: 'Enter some text...',
    });
    await expect(textInput).toBeVisible();

    // Type text and verify
    await textInput.fill('Test input value');
    await expect(textInput).toHaveValue('Test input value');

    // Clear and type new value
    await textInput.clear();
    await textInput.fill('New value');
    await expect(textInput).toHaveValue('New value');

    // Test password input with testID
    const passwordInput = await getElement(page, 'kitchenSink.password.input', {
      type: 'placeholder',
      value: 'Enter password...',
    });
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('SecretPassword123');

    // Test error input with testID
    const errorInput = await getElement(page, 'kitchenSink.error.input', {
      type: 'placeholder',
      value: 'This has an error...',
    });
    await expect(errorInput).toBeVisible();

    // Test multiline input with testID
    const multilineInput = await getElement(page, 'kitchenSink.multiline.input', {
      type: 'placeholder',
      value: 'Enter multiple lines...',
    });
    await expect(multilineInput).toBeVisible();
    await multilineInput.fill('Line 1\nLine 2\nLine 3');
  });

  test('should demonstrate Redux state management', async ({ page }) => {
    // Look for Redux state section
    const reduxSection = page.getByText('Redux State Demo').first();
    await expect(reduxSection).toBeVisible();

    // Find composer state with testID fallback
    const composerText = page.getByText(/Composer Open: (Yes|No)/i).first();
    await expect(composerText).toBeVisible();
    const initialComposerState = await composerText.textContent();

    // Toggle composer with testID
    const composerButton = await getElement(page, 'kitchenSink.toggleComposer.button', {
      type: 'text',
      value: 'Open Composer',
    });
    await composerButton.click();

    // Verify state changed
    await expect(composerText).not.toHaveText(initialComposerState!);

    // Test theme switching with testIDs
    const lightButton = await getElement(page, 'kitchenSink.theme.light.button', {
      type: 'text',
      value: 'Light',
    });
    const darkButton = await getElement(page, 'kitchenSink.theme.dark.button', {
      type: 'text',
      value: 'Dark',
    });
    const systemButton = await getElement(page, 'kitchenSink.theme.system.button', {
      type: 'text',
      value: 'System',
    });

    // Switch themes
    await darkButton.click();
    await expect(page.getByText('Theme: dark')).toBeVisible();

    await systemButton.click();
    await expect(page.getByText('Theme: system')).toBeVisible();

    await lightButton.click();
    await expect(page.getByText('Theme: light')).toBeVisible();
  });

  test('should handle button sizes', async ({ page }) => {
    // Test button sizes with testIDs
    const smallButton = await getElement(page, 'kitchenSink.small.button', {
      type: 'text',
      value: 'Small Button',
    });
    await smallButton.click();

    const mediumButton = await getElement(page, 'kitchenSink.medium.button', {
      type: 'text',
      value: 'Medium Button',
    });
    await mediumButton.click();

    const largeButton = await getElement(page, 'kitchenSink.large.button', {
      type: 'text',
      value: 'Large Button',
    });
    await largeButton.click();
  });

  test('should complete a full user interaction workflow', async ({ page }) => {
    // This test simulates a complete user journey

    // Step 1: Interact with a button
    page.on('dialog', (dialog) => dialog.accept());
    const primaryButton = await getElement(page, 'kitchenSink.primary.button', {
      type: 'text',
      value: 'Primary Button',
    });
    await primaryButton.click();

    // Step 2: Fill in an input field
    const textInput = await getElement(page, 'kitchenSink.basic.input', {
      type: 'placeholder',
      value: 'Enter some text...',
    });
    await textInput.fill('User workflow test');

    // Step 3: Test different button sizes
    const smallButton = await getElement(page, 'kitchenSink.small.button', {
      type: 'text',
      value: 'Small Button',
    });
    await smallButton.click();

    const largeButton = await getElement(page, 'kitchenSink.large.button', {
      type: 'text',
      value: 'Large Button',
    });
    await largeButton.click();

    // Step 4: Verify input still has value
    await expect(textInput).toHaveValue('User workflow test');

    // Step 5: Navigate away and back
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/kitchensink');
    await page.waitForLoadState('networkidle');

    // Verify page still loads correctly
    await expect(page.getByText('Kitchen Sink - UI Components Demo')).toBeVisible();
    await expect(page.getByText('Button Variants')).toBeVisible();
  });
});
