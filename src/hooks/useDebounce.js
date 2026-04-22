/**
 * useDebounce — delays propagating a value until the user stops changing it.
 *
 * Problem it solves:
 *   Without debouncing, every keystroke fires a Spotify API call.
 *   With 400 ms debounce, we only call the API once the user pauses typing.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 400);
 *   // debouncedQuery only updates 400 ms after `query` stops changing
 */

import { useState, useEffect } from 'react';

/**
 * @param {any}    value  - The value to debounce (usually a string)
 * @param {number} delay  - Milliseconds to wait before updating (default 400)
 * @returns The debounced value (lags behind the real value by up to `delay` ms)
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Schedule an update after `delay` ms
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // If `value` changes before the timer fires, cancel and restart the clock.
    // This is the core of debouncing: only the LAST change within the window wins.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
