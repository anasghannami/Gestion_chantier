import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@btp_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme);
        }
      } catch (e) {
        console.error('Erreur chargement thème:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      setThemeState(nextTheme);
      await AsyncStorage.setItem('@btp_theme', nextTheme);
    } catch (e) {
      console.error('Erreur sauvegarde thème:', e);
    }
  };

  const setTheme = async (newTheme) => {
    try {
      if (newTheme === 'dark' || newTheme === 'light') {
        setThemeState(newTheme);
        await AsyncStorage.setItem('@btp_theme', newTheme);
      }
    } catch (e) {
      console.error('Erreur sauvegarde thème:', e);
    }
  };

  const themeColors = colors[theme] || colors.dark;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, themeColors, isDark, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
  }
  return context;
}
