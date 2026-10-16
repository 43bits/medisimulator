import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '@/constants/tokens';

type Colors = typeof LightColors;

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
