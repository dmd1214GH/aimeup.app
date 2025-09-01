/**
 * Test file with auto-fixable failures for testing aimequal-runner
 * These should be automatically fixed by the agent
 */

// ESLint error: unused variable (auto-fixable) - FIXED

// These functions are demo examples for auto-fixing but aren't used in tests
// Keeping them as examples but exporting them to avoid unused var warnings
export function poorlyFormatted(x: number, y: number) {
  return x + y;
}

// TypeScript error: missing type annotation (auto-fixable)
export function missingTypes(param: any) {
  return param.toString();
}

describe('Auto-Fixable Test Scenarios', () => {
  test('simple assertion that needs updating', () => {
    const result = 2 + 2;
    // This is wrong but easily fixable
    expect(result).toBe(4); // Should be 4
  });

  test('string literal that needs updating', () => {
    const greeting = 'Hello, World!';
    // Wrong expected value
    expect(greeting).toBe('Hello, World!'); // Simple string mismatch
  });
});
