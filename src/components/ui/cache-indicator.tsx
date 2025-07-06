'use client';

import React from 'react';
import { Database, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CacheIndicatorProps {
  cached?: boolean;
  timestamp?: number;
  className?: string;
  variant?: 'subtle' | 'visible';
}

export function CacheIndicator({ 
  cached = false, 
  timestamp, 
  className = '',
  variant = 'subtle'
}: CacheIndicatorProps) {
  if (!cached) return null;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString();
  };

  const isSubtle = variant === 'subtle';

  return (
    <Badge 
      variant="secondary" 
      className={`
        ${isSubtle ? 'opacity-60 hover:opacity-100' : 'opacity-80'}
        transition-opacity duration-200 
        text-xs 
        bg-blue-50 
        text-blue-700 
        border-blue-200
        ${className}
      `}
      title={`Data served from cache${timestamp ? ` at ${formatTimestamp(timestamp)}` : ''}`}
    >
      <Database className="h-3 w-3 mr-1" />
      {isSubtle ? 'Cached' : `Cached${timestamp ? ` • ${formatTimestamp(timestamp)}` : ''}`}
    </Badge>
  );
}

export function CacheNotification({ 
  cached = false, 
  timestamp, 
  className = '',
  onDismiss 
}: CacheIndicatorProps & { onDismiss?: () => void }) {
  if (!cached) return null;

  return (
    <div className={`
      flex items-center justify-between 
      bg-blue-50 border border-blue-200 
      rounded-md px-3 py-2 text-sm 
      text-blue-800
      ${className}
    `}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>Data served from cache for faster loading</span>
        {timestamp && (
          <span className="text-blue-600 text-xs">
            • {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-blue-600 hover:text-blue-800 ml-2"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
} 