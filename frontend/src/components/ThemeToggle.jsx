import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = () => {
    setIsTransitioning(true);
    toggleTheme();
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match the CSS transition duration
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isTransitioning}
      className={`
        flex items-center justify-center p-2 rounded-lg transition-all duration-300
        hover:scale-105 active:scale-95 theme-toggle
        ${isTransitioning ? 'opacity-75 cursor-wait' : ''}
        ${isDark 
          ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`transition-transform duration-300 ${isTransitioning ? 'rotate-180' : ''}`}>
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
