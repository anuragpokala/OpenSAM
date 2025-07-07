import { NextRequest, NextResponse } from 'next/server';
import { getVectorStoreAdapter } from '@/lib/adapters/factory';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing Next.js app ChromaDB integration...');
    
    // Test 1: Get the vector store adapter (same as your app uses)
    console.log('🔍 Getting vector store adapter...');
    const adapter = getVectorStoreAdapter();
    console.log('✅ Adapter created:', adapter.constructor.name);
    
    // Test 2: Check connection
    console.log('🔍 Testing connection...');
    const isConnected = await adapter.isConnected();
    console.log('Connection status:', isConnected);
    
    // Test 3: List collections
    console.log('🔍 Listing collections...');
    const collections = await adapter.listCollections();
    console.log('Collections:', collections);
    
    // Test 4: Create a test collection using your adapter
    console.log('🔍 Creating test collection via adapter...');
    await adapter.createCollection('test_app_collection', 1536);
    console.log('✅ Test collection created via adapter');
    
    // Test 5: Add a test vector using your adapter
    console.log('🔍 Adding test vector via adapter...');
    const testVector = {
      id: 'test_app_vector_1',
      values: new Array(1536).fill(0.1),
      metadata: {
        type: 'test',
        title: 'Test App Vector',
        description: 'Test vector added via app adapter'
      }
    };
    
    await adapter.upsert('test_app_collection', [testVector]);
    console.log('✅ Test vector added via adapter');
    
    // Test 6: Query the vector using your adapter
    console.log('🔍 Querying test vector via adapter...');
    const queryResult = await adapter.query(
      'test_app_collection',
      new Array(1536).fill(0.1),
      1
    );
    console.log('Query result count:', queryResult.length);
    
    // Test 7: Get the vector directly using your adapter
    console.log('🔍 Getting test vector directly via adapter...');
    const directVector = await adapter.getVector('test_app_collection', 'test_app_vector_1');
    console.log('Direct vector found:', !!directVector);
    
    // Test 8: List collections again
    console.log('🔍 Listing collections after operations...');
    const updatedCollections = await adapter.listCollections();
    console.log('Updated collections:', updatedCollections);
    
    // Test 9: Clean up
    console.log('🔍 Cleaning up...');
    await adapter.deleteCollection('test_app_collection');
    console.log('✅ Test collection deleted');
    
    return NextResponse.json({ 
      success: true, 
      adapterType: adapter.constructor.name,
      isConnected,
      initialCollections: collections,
      updatedCollections,
      queryResultCount: queryResult.length,
      directVectorFound: !!directVector
    });
    
  } catch (error) {
    console.error('❌ App ChromaDB test failed:', error);
    return NextResponse.json({ 
      error: 'App ChromaDB test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 