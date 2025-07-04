import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Always start with system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSystemPreference, setIsSystemPreference] = useState(() => {
    // Check if user has manually set a preference
    const saved = localStorage.getItem('darkMode');
    return saved === null;
  });

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only update if we're following system preference
      if (isSystemPreference) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isSystemPreference]);

  useEffect(() => {
    // Load saved preference on mount
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setIsDarkMode(JSON.parse(saved));
      setIsSystemPreference(false);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to localStorage only if user has made a manual choice
    if (!isSystemPreference) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, isSystemPreference]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // Mark as user preference (not system)
    setIsSystemPreference(false);
  };

  const resetToSystemPreference = () => {
    // Remove saved preference and follow system
    localStorage.removeItem('darkMode');
    setIsSystemPreference(true);
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  return (
    <DarkModeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode, 
      isSystemPreference,
      resetToSystemPreference 
    }}>
      {children}
    </DarkModeContext.Provider>
  );
};