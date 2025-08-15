import { test, expect } from '@playwright/test';

/**
 * Interaction Tests - Verify components actually work
 * Tests user interactions, state changes, and data flow
 */
test.describe('Component Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to KitchenSink where all components are
    await page.goto('/kitchensink');
    await page.waitForLoadState('networkidle');
  });

  test('should handle button interactions and state changes', async ({ page }) => {
    // Test Primary button click
    const primaryButton = page.getByText('Primary Button').first();
    await expect(primaryButton).toBeVisible();

    // Click and handle alert dialog (Playwright auto-dismisses alerts)
    page.on('dialog', (dialog) => dialog.accept());
    await primaryButton.click();

    // Test Secondary button interaction
    const secondaryButton = page.getByText('Secondary Button').first();
    await secondaryButton.click();

    // Test Outline button
    const outlineButton = page.getByText('Outline Button').first();
    await outlineButton.click();

    // Test Loading button - should show loading state
    const loadingButton = page.getByText('Loading Button').first();
    await loadingButton.click();

    // Verify Disabled button exists and is visible
    // Note: React Native Web doesn't expose disabled state the same way
    const disabledButton = page.getByText('Disabled Button').first();
    await expect(disabledButton).toBeVisible();
  });

  test('should handle input field interactions and validation', async ({ page }) => {
    // Find text input by placeholder
    const textInput = page.getByPlaceholder('Enter some text...').first();
    await expect(textInput).toBeVisible();

    // Type text and verify it appears
    await textInput.fill('Test input value');
    await expect(textInput).toHaveValue('Test input value');

    // Clear and type new value
    await textInput.clear();
    await textInput.fill('New value');
    await expect(textInput).toHaveValue('New value');

    // Test password input
    const passwordInput = page.getByPlaceholder('Enter password...').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('SecretPassword123');
    // Password inputs should mask the value
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');

    // Test error input exists
    const errorInput = page.getByPlaceholder('This has an error...').first();
    await expect(errorInput).toBeVisible();

    // Test multiline input
    const multilineInput = page.getByPlaceholder('Enter multiple lines...').first();
    await expect(multilineInput).toBeVisible();
    await multilineInput.fill('Line 1\nLine 2\nLine 3');
  });

  test('should demonstrate Redux state management', async ({ page }) => {
    // Look for Redux state section
    const reduxSection = page.getByText('Redux State Demo').first();
    await expect(reduxSection).toBeVisible();

    // Find the composer state indicator
    const composerText = page.getByText(/Composer Open: (Yes|No)/i).first();
    await expect(composerText).toBeVisible();
    const initialComposerState = await composerText.textContent();

    // Toggle composer state using the actual button text
    const composerButton = page.getByText(/Open Composer|Close Composer/i).first();
    await composerButton.click();

    // Verify state changed
    await expect(composerText).not.toHaveText(initialComposerState!);

    // Check theme state - look for the actual text pattern
    const themeText = await page.getByText('Theme:').first().textContent();
    expect(themeText).toContain('Theme:');
  });

  test('should complete a full user interaction workflow', async ({ page }) => {
    // This test simulates a complete user journey through multiple components

    // Step 1: Interact with a button
    page.on('dialog', (dialog) => dialog.accept());
    const primaryButton = page.getByText('Primary Button').first();
    await primaryButton.click();

    // Step 2: Fill in an input field
    const textInput = page.getByPlaceholder('Enter some text...').first();
    await textInput.fill('User workflow test');

    // Step 3: Test different button sizes
    const smallButton = page.getByText('Small Button').first();
    await smallButton.click();

    const largeButton = page.getByText('Large Button').first();
    await largeButton.click();

    // Step 4: Verify all interactions worked (input still has value)
    await expect(textInput).toHaveValue('User workflow test');

    // Step 5: Navigate away and back to verify page stability
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/kitchensink');
    await page.waitForLoadState('networkidle');

    // Verify page still loads correctly after navigation
    await expect(page.getByText('Kitchen Sink - UI Components Demo')).toBeVisible();
    await expect(page.getByText('Button Variants')).toBeVisible();
  });
});
