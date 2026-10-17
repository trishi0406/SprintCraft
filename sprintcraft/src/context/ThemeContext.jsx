import { createContext, useContext, useState, useEffect } from 'react';

export const themes = [
  {
    id: 'slate',
    name: 'Midnight Slate (Dark)',
    mode: 'dark',
    primary: '#0B1120',
    secondary: '#0F172A',
    accent: '#8B5CF6',
    accentGradient: 'from-violet-500 to-indigo-600',
    dotColor: 'bg-violet-500',
  },
  {
    id: 'obsidian',
    name: 'Cyber Obsidian (Dark)',
    mode: 'dark',
    primary: '#05050A',
    secondary: '#0D0D16',
    accent: '#EC4899',
    accentGradient: 'from-pink-500 to-purple-600',
    dotColor: 'bg-pink-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix (Dark)',
    mode: 'dark',
    primary: '#06120E',
    secondary: '#0B1E18',
    accent: '#10B981',
    accentGradient: 'from-emerald-500 to-teal-600',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'ocean',
    name: 'Oceanic Abyss (Dark)',
    mode: 'dark',
    primary: '#07111E',
    secondary: '#0E1C2E',
    accent: '#06B6D4',
    accentGradient: 'from-cyan-500 to-blue-600',
    dotColor: 'bg-cyan-500',
  },
  {
    id: 'sunset',
    name: 'Sunset Amber (Dark)',
    mode: 'dark',
    primary: '#140E17',
    secondary: '#1F1424',
    accent: '#F43F5E',
    accentGradient: 'from-rose-500 to-amber-500',
    dotColor: 'bg-rose-500',
  },
  {
    id: 'light-slate',
    name: 'Pure White (Light)',
    mode: 'light',
    primary: '#F8FAFC',
    secondary: '#FFFFFF',
    accent: '#7C3AED',
    accentGradient: 'from-violet-600 to-indigo-600',
    dotColor: 'bg-violet-600',
  },
  {
    id: 'light-nordic',
    name: 'Nordic Breeze (Light)',
    mode: 'light',
    primary: '#F1F5F9',
    secondary: '#FFFFFF',
    accent: '#2563EB',
    accentGradient: 'from-blue-600 to-cyan-600',
    dotColor: 'bg-blue-600',
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return localStorage.getItem('sprintcraft_theme') || 'slate';
    } catch {
      return 'slate';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sprintcraft_theme', currentTheme);
    } catch (e) {
      console.error(e);
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const activeThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];
  const isLight = activeThemeObj.mode === 'light';

  const toggleLightDarkMode = () => {
    if (isLight) {
      setCurrentTheme('slate');
    } else {
      setCurrentTheme('light-slate');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme: setCurrentTheme,
        activeThemeObj,
        isLight,
        toggleLightDarkMode,
        themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
