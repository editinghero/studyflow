
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorScheme = 'blue' | 'purple' | 'green' | 'rose' | 'orange';

interface ThemeContextType {
  isDarkMode: boolean;
  colorScheme: ColorScheme;
  toggleDarkMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const colorSchemeVariables = {
  blue: {
    light: {
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
    },
    dark: {
      '--primary': '217.2 91.2% 59.8%',
      '--primary-foreground': '222.2 84% 4.9%',
    }
  },
  purple: {
    light: {
      '--primary': '262.1 83.3% 57.8%',
      '--primary-foreground': '210 40% 98%',
    },
    dark: {
      '--primary': '263.4 70% 50.4%',
      '--primary-foreground': '210 40% 98%',
    }
  },
  green: {
    light: {
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
    },
    dark: {
      '--primary': '142.1 70.6% 45.3%',
      '--primary-foreground': '355.7 100% 97.3%',
    }
  },
  rose: {
    light: {
      '--primary': '346.8 77.2% 49.8%',
      '--primary-foreground': '355.7 100% 97.3%',
    },
    dark: {
      '--primary': '346.8 77.2% 49.8%',
      '--primary-foreground': '355.7 100% 97.3%',
    }
  },
  orange: {
    light: {
      '--primary': '24.6 95% 53.1%',
      '--primary-foreground': '60 9.1% 97.8%',
    },
    dark: {
      '--primary': '20.5 90.2% 48.2%',
      '--primary-foreground': '60 9.1% 97.8%',
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Changed default to true (dark mode)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('studyPlannerTheme');
    const savedColorScheme = localStorage.getItem('studyPlannerColorScheme');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    if (savedColorScheme) {
      setColorScheme(savedColorScheme as ColorScheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyPlannerTheme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('studyPlannerColorScheme', colorScheme);
    
    // Apply color scheme variables
    const variables = colorSchemeVariables[colorScheme][isDarkMode ? 'dark' : 'light'];
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [colorScheme, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, colorScheme, toggleDarkMode, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
