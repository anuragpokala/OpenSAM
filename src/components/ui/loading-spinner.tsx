import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'default' | 'inline' | 'overlay';
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const spinner = (
    <Loader2 className={cn(
      'animate-spin text-primary',
      sizeClasses[size],
      className
    )} />
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {spinner}
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Button loading spinner for use inside buttons
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Loader2 className={cn(
      'animate-spin',
      size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
    )} />
  );
} 