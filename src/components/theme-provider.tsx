'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useAppStore();

  useEffect(() => {
    // Apply theme class to document element
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
} 