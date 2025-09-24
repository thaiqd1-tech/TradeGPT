import React from 'react';
import { Button } from './ui/button';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button variant="ghost" size="icon" className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" onClick={toggleTheme}>
      <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
    </Button>
  );
};

export { ThemeToggle };
