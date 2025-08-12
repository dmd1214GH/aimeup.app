import { debounce, throttle, changeDetector } from '../utility';

describe('utility functions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    test('should only execute once for multiple rapid calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    test('should limit function execution rate', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      jest.advanceTimersByTime(100);
      throttledFn('fourth');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });
  });

  describe('changeDetector', () => {
    test('should detect changes in objects', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 31 };
      const obj3 = { name: 'John', age: 30 };

      expect(changeDetector(obj1, obj2)).toBe(true);
      expect(changeDetector(obj1, obj3)).toBe(false);
    });

    test('should detect changes in arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3, 4];
      const arr3 = [1, 2, 3];

      expect(changeDetector(arr1, arr2)).toBe(true);
      expect(changeDetector(arr1, arr3)).toBe(false);
    });

    test('should detect changes in primitive values', () => {
      expect(changeDetector('hello', 'world')).toBe(true);
      expect(changeDetector('hello', 'hello')).toBe(false);
      expect(changeDetector(42, 43)).toBe(true);
      expect(changeDetector(42, 42)).toBe(false);
    });
  });
});