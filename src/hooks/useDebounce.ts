
/*
 * Example Usage:
 * const [searchTerm, setSearchTerm] = useState('');
 * // This debounced value will only update 500ms after searchTerm stops changing.
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Make an API call or perform an expensive operation with the debounced value.
 *     fetchResults(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */

import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay.
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value or delay changes, or if the component unmounts.
    // This prevents the debounced value from updating if the original value changes
    // again before the delay has passed.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // The effect re-runs only when the value or delay changes.

  return debouncedValue;
}
