import { NextResponse } from 'next/server';
import { chatCache } from '@/lib/chat-cache';

export async function GET() {
  try {
    const stats = chatCache.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        chatEntries: stats.chatEntries,
        vectorEntries: stats.vectorEntries,
        embeddingEntries: stats.embeddingEntries,
        totalEntries: stats.chatEntries + stats.vectorEntries + stats.embeddingEntries,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    chatCache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
} 