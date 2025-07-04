'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Activity, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  connected: boolean;
}

interface CacheHealth {
  connected: boolean;
  status: string;
  timestamp: number;
}

export default function CacheStatus() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [health, setHealth] = useState<CacheHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCacheStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, healthResponse] = await Promise.all([
        fetch('/api/cache?action=stats'),
        fetch('/api/cache?action=health')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData.data);
      }
    } catch (err) {
      setError('Failed to fetch cache information');
      console.error('Cache stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (action: 'clear-all' | 'clear-prefix', prefix?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          prefix,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cache cleared:', result.message);
        // Refresh stats after clearing
        await fetchCacheStats();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to clear cache');
      }
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Clear cache error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const getStatusIcon = () => {
    if (!health) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    
    if (health.connected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (!health) return 'Unknown';
    return health.connected ? 'Connected' : 'Disconnected';
  };

  const getStatusColor = () => {
    if (!health) return 'bg-gray-100 text-gray-600';
    return health.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Redis Cache Status
        </CardTitle>
        <CardDescription>
          Monitor cache performance and manage cached data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Connection Status</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>

        {/* Cache Statistics */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Keys</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.totalKeys}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.memoryUsage}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCacheStats}
            disabled={loading}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearCache('clear-prefix', 'sam-search')}
            disabled={loading || !health?.connected}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Search Cache
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearCache('clear-all')}
            disabled={loading || !health?.connected}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Cache Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• SAM Search results are cached for 30 minutes</p>
          <p>• Entity data is cached for 1 hour</p>
          <p>• Cache automatically expires based on TTL settings</p>
        </div>
      </CardContent>
    </Card>
  );
} 