import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button 
      onClick={toggleDarkMode}
      className="dark-mode-toggle"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
};

export default DarkModeToggle;