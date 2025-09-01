/**
 * Test file with intentional failures for testing aimequal-runner
 * These failures are designed to test:
 * 1. Report-only patterns (business logic, security)
 * 2. Exceeding the 5-attempt limit
 */

describe('Unfixable Test Scenarios', () => {
  // Business Logic Failure - Should be report-only
  test('calculateTotalPrice should apply correct discount', () => {
    function calculateTotalPrice(items: number[], discountPercentage: number): number {
      const subtotal = items.reduce((sum, price) => sum + price, 0);
      // INTENTIONAL BUG: Wrong calculation - multiplying instead of subtracting discount
      const discount = subtotal * (discountPercentage * 100);
      return subtotal - discount;
    }

    const items = [10, 20, 30];
    const discount = 0.1; // 10% discount
    const result = calculateTotalPrice(items, discount);

    // This will fail because the calculation is wrong
    expect(result).toBe(54); // Should be 60 - 6 = 54
  });

  // Security Test Failure - Should be report-only
  test('validateAuthToken should reject expired tokens', () => {
    function validateAuthToken(token: string): boolean {
      // INTENTIONAL BUG: Not checking expiration properly
      if (token.includes('expired')) {
        return true; // Should return false for expired tokens!
      }
      return token.length > 0;
    }

    const expiredToken = 'auth_expired_12345';

    // This will fail because security logic is wrong
    expect(validateAuthToken(expiredToken)).toBe(false);
  });

  // Test that will exceed 5 attempts due to flaky behavior
  let attemptCount = 0;
  test('flaky test that always fails differently', () => {
    attemptCount++;

    // This test fails with a different error each time
    // simulating a scenario where fixes don't actually solve the problem
    const errors = [
      'Network timeout',
      'Connection refused',
      'Invalid response',
      'Service unavailable',
      'Rate limit exceeded',
      'Unknown error',
    ];

    const errorIndex = Math.min(attemptCount - 1, errors.length - 1);
    throw new Error(errors[errorIndex]);
  });

  // Data validation failure - Business logic
  test('user data validation should enforce business rules', () => {
    interface User {
      age: number;
      email: string;
      membershipLevel: 'bronze' | 'silver' | 'gold';
    }

    function validateUser(user: User): boolean {
      // INTENTIONAL BUG: Wrong business rule - gold members should be 18+, not 21+
      if (user.membershipLevel === 'gold' && user.age < 21) {
        return false;
      }
      return user.email.includes('@');
    }

    const goldMember: User = {
      age: 19,
      email: 'user@example.com',
      membershipLevel: 'gold',
    };

    // This will fail because business rule is incorrectly implemented
    expect(validateUser(goldMember)).toBe(true); // 19-year-old should be valid for gold
  });

  // Performance regression - Should be report-only
  test('algorithm performance should meet SLA', () => {
    function inefficientSort(arr: number[]): number[] {
      // INTENTIONAL: Using bubble sort instead of efficient algorithm
      const result = [...arr];
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result.length - 1; j++) {
          if (result[j] > result[j + 1]) {
            [result[j], result[j + 1]] = [result[j + 1], result[j]];
          }
        }
      }
      return result;
    }

    const largeArray = Array.from({ length: 10000 }, () => Math.random());
    const startTime = Date.now();
    inefficientSort(largeArray);
    const duration = Date.now() - startTime;

    // This will likely fail due to poor performance
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
});
