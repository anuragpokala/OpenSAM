import { getCacheAdapter, getVectorStoreAdapter, loadEnvironmentConfig } from './factory';
import { createVector } from '../vectorStore';

/**
 * Test function to verify adapters are working
 */
export async function testAdapters() {
  console.log('🧪 Testing Adapter System...\n');

  // Load configuration
  const config = loadEnvironmentConfig();
  console.log('📋 Configuration:', {
    cache: config.cache.provider,
    vectorStore: config.vectorStore.provider,
    environment: process.env.NODE_ENV
  });

  // Test Cache Adapter
  console.log('\n🔍 Testing Cache Adapter...');
  try {
    const cache = getCacheAdapter();
    
    // Test connection
    const connected = await cache.isConnected();
    console.log(`✅ Cache connected: ${connected}`);
    
    if (connected) {
      // Test set/get
      const testKey = 'test:adapter:key';
      const testValue = { message: 'Hello from adapter!', timestamp: Date.now() };
      
      await cache.set(testKey, testValue, { ttl: 60 });
      console.log('✅ Cache set successful');
      
      const retrieved = await cache.get(testKey);
      console.log(`✅ Cache get successful: ${retrieved ? 'Data retrieved' : 'No data'}`);
      
      // Test stats
      const stats = await cache.getStats();
      console.log(`✅ Cache stats: ${stats.totalKeys} keys, ${stats.memoryUsage} memory`);
      
      // Cleanup
      await cache.delete(testKey);
      console.log('✅ Cache cleanup successful');
    }
  } catch (error) {
    console.error('❌ Cache adapter test failed:', error);
  }

  // Test Vector Store Adapter
  console.log('\n🔍 Testing Vector Store Adapter...');
  try {
    const vectorStore = getVectorStoreAdapter();
    
    // Test connection
    const connected = await vectorStore.isConnected();
    console.log(`✅ Vector store connected: ${connected}`);
    
    if (connected) {
      // Test collection operations
      const testCollection = 'test-collection';
      
      await vectorStore.createCollection(testCollection, 1536);
      console.log('✅ Collection creation successful');
      
      // Test vector operations
      const testVector = createVector('test-vector-1', [0.1, 0.2, 0.3, ...Array(1533).fill(0)]);
      await vectorStore.upsert(testCollection, [testVector]);
      console.log('✅ Vector upsert successful');
      
      // Test query
      const queryVector = [0.1, 0.2, 0.3, ...Array(1533).fill(0)];
      const results = await vectorStore.query(testCollection, queryVector, 5);
      console.log(`✅ Vector query successful: ${results.length} results`);
      
      // Test collections list
      const collections = await vectorStore.listCollections();
      console.log(`✅ Collections list: ${collections.length} collections`);
      
      // Cleanup
      await vectorStore.deleteCollection(testCollection);
      console.log('✅ Vector store cleanup successful');
    }
  } catch (error) {
    console.error('❌ Vector store adapter test failed:', error);
  }

  console.log('\n🎉 Adapter testing complete!');
}

// Export for use in development
if (process.env.NODE_ENV === 'development') {
  // Auto-run test in development
  testAdapters().catch(console.error);
} 