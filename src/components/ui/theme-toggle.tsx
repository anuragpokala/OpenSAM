'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button';
}

export function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme } = useAppStore();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className={className}
      >
        {theme === 'light' ? (
          <>
            <Moon className="h-4 w-4 mr-2" />
            Dark Mode
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 mr-2" />
            Light Mode
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
} 