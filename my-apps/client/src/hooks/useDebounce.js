// ============================================
// my-apps/client/src/hooks/useDebounce.js
// Custom hook for debouncing values
// Create this file: my-apps/client/src/hooks/useDebounce.js
// ============================================

import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Delays updating the returned value until after the specified delay
 * has passed since the last time the value changed.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500)
 * @returns {any} - The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // This will only run when debouncedSearchTerm changes
 *   // (after 500ms of no changes to searchTerm)
 *   fetchSearchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay has passed
    // or if component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebounceCallback Hook
 * 
 * Alternative version that debounces a callback function
 * 
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced callback function
 * 
 * @example
 * const handleSearch = useDebounceCallback((searchTerm) => {
 *   fetchSearchResults(searchTerm);
 * }, 500);
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export const useDebounceCallback = (callback, delay = 500) => {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const debouncedCallback = (...args) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  return debouncedCallback;
};

export default useDebounce;