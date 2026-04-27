import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

const THEME_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Dynamic import ensures the native module bridge is ready
      // before we touch AsyncStorage (fixes "Native module is null" crash).
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;

      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else if (systemScheme) {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    } catch {
      // Fall back to dark theme silently
    }
  };

  const toggleTheme = async () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}