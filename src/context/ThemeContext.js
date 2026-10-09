// ==================================================
// FILE: ThemeContext.js
// PURPOSE: Shares light or dark colours with all screens


// ===== IMPORTS =====
import { createContext, useContext, useMemo, useState } from 'react';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // ===== DARK MODE STATE =====
  const [isDark, setIsDark] = useState(false);
  // ===== THEME TOGGLE / LIGHT THEME / DARK THEME =====
  const value = useMemo(
    () => ({ isDark, toggleTheme: () => setIsDark((current) => !current), colors: isDark ? darkColors : lightColors }),
    [isDark],
  );
  // ===== MAIN DISPLAY =====
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider.');
  return context;
}
