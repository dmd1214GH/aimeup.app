describe('EatGPT App', () => {
  test('basic test suite runs successfully', () => {
    // Basic test to prove React Native test environment works
    const appName = 'EatGPT';
    const isReactNativeApp = true;
    
    expect(appName).toBe('EatGPT');
    expect(isReactNativeApp).toBe(true);
  });

  test('can perform async operations', async () => {
    const mockAsyncOperation = async () => {
      return new Promise(resolve => setTimeout(() => resolve('success'), 10));
    };

    const result = await mockAsyncOperation();
    expect(result).toBe('success');
  });

  test('can work with objects and arrays', () => {
    const mockData = {
      users: ['Alice', 'Bob'],
      count: 2
    };

    expect(mockData.users).toHaveLength(2);
    expect(mockData.count).toBe(2);
    expect(mockData.users).toContain('Alice');
  });
});