import { NextRequest, NextResponse } from 'next/server';
import { 
  getCacheStats, 
  clearCacheByPrefix, 
  deleteCache, 
  isCacheConnected 
} from '@/lib/redis';

/**
 * GET /api/cache - Get cache statistics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'stats':
        const stats = await getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: Date.now(),
        });
        
      case 'health':
        const connected = await isCacheConnected();
        const health = {
          connected,
          status: connected ? 'ready' : 'disconnected',
          timestamp: Date.now(),
        };
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: Date.now(),
        });
        
      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Cache API available',
            endpoints: ['stats', 'health', 'clear'],
            timestamp: Date.now(),
          },
        });
    }
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json({
      error: 'Failed to get cache information',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * POST /api/cache - Clear cache
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prefix, key } = body;
    
    switch (action) {
      case 'clear-prefix':
        if (!prefix) {
          return NextResponse.json({
            error: 'Prefix is required for clear-prefix action',
            timestamp: Date.now(),
          }, { status: 400 });
        }
        
        await clearCacheByPrefix(prefix);
        return NextResponse.json({
          success: true,
          message: `Cleared cache with prefix: ${prefix}`,
          timestamp: Date.now(),
        });
        
      case 'clear-key':
        if (!key) {
          return NextResponse.json({
            error: 'Key is required for clear-key action',
            timestamp: Date.now(),
          }, { status: 400 });
        }
        
        await deleteCache(key, prefix);
        return NextResponse.json({
          success: true,
          message: `Cleared cache key: ${key}`,
          timestamp: Date.now(),
        });
        
      case 'clear-all':
        // Clear all prefixes we use
        await Promise.all([
          clearCacheByPrefix('sam-search'),
          clearCacheByPrefix('sam-entity'),
          clearCacheByPrefix('vector-search')
        ]);
        return NextResponse.json({
          success: true,
          message: 'Cleared all cache',
          timestamp: Date.now(),
        });
        
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: clear-prefix, clear-key, or clear-all',
          timestamp: Date.now(),
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json({
      error: 'Failed to clear cache',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * DELETE /api/cache - Delete specific cache entry
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const prefix = searchParams.get('prefix');
    
    if (!key) {
      return NextResponse.json({
        error: 'Key parameter is required',
        timestamp: Date.now(),
      }, { status: 400 });
    }
    
    await deleteCache(key, prefix || undefined);
    
    return NextResponse.json({
      success: true,
      message: `Deleted cache key: ${key}`,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Cache delete error:', error);
    return NextResponse.json({
      error: 'Failed to delete cache entry',
      timestamp: Date.now(),
    }, { status: 500 });
  }
} 