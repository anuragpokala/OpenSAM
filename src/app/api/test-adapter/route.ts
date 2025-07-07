import { NextRequest, NextResponse } from 'next/server';
import { getVectorStoreAdapter } from '@/lib/adapters/factory';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing vector store adapter...');
    
    // Test 1: Check environment config
    console.log('🔍 Environment config:');
    console.log('VECTOR_STORE_PROVIDER:', process.env.VECTOR_STORE_PROVIDER);
    console.log('VECTOR_STORE_URL:', process.env.VECTOR_STORE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Test 2: Try to get vector store adapter
    console.log('🔍 Getting vector store adapter...');
    const adapter = getVectorStoreAdapter();
    console.log('✅ Vector store adapter created:', adapter.constructor.name);
    
    // Test 3: Test connection
    console.log('🔍 Testing connection...');
    const isConnected = await adapter.isConnected();
    console.log('Connection status:', isConnected);
    
    // Test 4: List collections
    console.log('🔍 Listing collections...');
    const collections = await adapter.listCollections();
    console.log('Collections:', collections);
    
    return NextResponse.json({ 
      success: true, 
      adapterType: adapter.constructor.name,
      isConnected,
      collections
    });
    
  } catch (error) {
    console.error('❌ Adapter test failed:', error);
    return NextResponse.json({ 
      error: 'Adapter test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 