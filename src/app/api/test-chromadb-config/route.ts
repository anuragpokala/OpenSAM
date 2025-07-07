import { NextRequest, NextResponse } from 'next/server';
import { ChromaClient } from 'chromadb';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing ChromaDB client configuration in Next.js...');
    
    // Test 1: Create client with same config as your adapter
    console.log('🔍 Creating ChromaDB client with adapter config...');
    const client = new ChromaClient({
      host: 'localhost',
      port: 8000,
      ssl: false
    });
    console.log('✅ ChromaDB client created');
    
    // Test 2: Try to list collections
    console.log('🔍 Testing listCollections...');
    const collections = await client.listCollections();
    console.log('✅ List collections successful');
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Test 3: Try to create a collection
    console.log('🔍 Testing createCollection...');
    const testCollection = await client.createCollection({
      name: 'test_nextjs_config',
      metadata: {
        dimension: '1536',
        description: 'Test collection for Next.js config'
      }
    });
    console.log('✅ Create collection successful');
    console.log('📋 Collection name:', testCollection.name);
    
    // Test 4: Try to add a vector
    console.log('🔍 Testing upsert...');
    await testCollection.upsert({
      ids: ['test_vector_1'],
      embeddings: [new Array(1536).fill(0.1)],
      metadatas: [{ type: 'test', title: 'Test Vector' }]
    });
    console.log('✅ Upsert successful');
    
    // Test 5: Clean up
    console.log('🔍 Cleaning up...');
    await client.deleteCollection({ name: 'test_nextjs_config' });
    console.log('✅ Cleanup successful');
    
    return NextResponse.json({ 
      success: true, 
      collections: collections.map(c => c.name),
      clientConfig: {
        host: 'localhost',
        port: 8000,
        ssl: false
      }
    });
    
  } catch (error) {
    console.error('❌ ChromaDB config test failed:', error);
    return NextResponse.json({ 
      error: 'ChromaDB config test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 