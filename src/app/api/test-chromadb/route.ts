import { NextRequest, NextResponse } from 'next/server';
import { getVectorStoreAdapter } from '@/lib/adapters/factory';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing ChromaDB operations directly...');
    
    const adapter = getVectorStoreAdapter();
    
    // Test 1: Create a test collection
    console.log('🔍 Creating test collection...');
    await adapter.createCollection('test_company_profiles', 1536);
    console.log('✅ Test collection created');
    
    // Test 2: Add a simple test vector
    console.log('🔍 Adding test vector...');
    const testVector = {
      id: 'test_profile_1',
      values: new Array(1536).fill(0.1), // Simple test vector
      metadata: {
        type: 'entity',
        title: 'Test Company',
        description: 'A test company',
        profileId: 'test-1'
      }
    };
    
    await adapter.upsert('test_company_profiles', [testVector]);
    console.log('✅ Test vector added');
    
    // Test 3: Query the vector
    console.log('🔍 Querying test vector...');
    const queryResult = await adapter.query(
      'test_company_profiles',
      new Array(1536).fill(0.1),
      1
    );
    console.log('Query result count:', queryResult.length);
    
    // Test 4: Get the vector directly
    console.log('🔍 Getting test vector directly...');
    const directVector = await adapter.getVector('test_company_profiles', 'test_profile_1');
    console.log('Direct vector found:', !!directVector);
    
    // Test 5: List collections
    console.log('🔍 Listing collections...');
    const collections = await adapter.listCollections();
    console.log('Collections:', collections);
    
    // Test 6: Clean up
    console.log('🔍 Cleaning up...');
    await adapter.deleteCollection('test_company_profiles');
    console.log('✅ Test collection deleted');
    
    return NextResponse.json({ 
      success: true, 
      queryResultCount: queryResult.length,
      directVectorFound: !!directVector,
      collections: collections
    });
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error);
    return NextResponse.json({ 
      error: 'ChromaDB test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 