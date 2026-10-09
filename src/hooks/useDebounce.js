// ==================================================
// FILE: useDebounce.js
// PURPOSE: Waits before sharing a changed value
// VIVA: Edit wait timer for search and the reservation date hint here
// ==================================================

// ===== IMPORTS =====
import { useEffect, useState } from 'react';

export function useDebounce(value, delay) {
  // ===== LOCAL STATE =====
  const [debouncedValue, setDebouncedValue] = useState(value);

  // ===== WAIT BEFORE SEARCH =====
// Delays the new value; clears the old timer when the value changes.
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
