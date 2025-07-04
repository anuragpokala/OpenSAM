const { ChromaClient } = require('chromadb');

async function testChromaDB() {
  console.log('🧪 Testing ChromaDB connection...');
  
  try {
    // Initialize ChromaDB client
    const client = new ChromaClient({ 
      host: 'localhost',
      port: 8000,
      ssl: false
    });
    
    // Test connection
    console.log('📡 Testing connection...');
    await client.heartbeat();
    console.log('✅ ChromaDB connection successful!');
    
    // Test collection creation
    console.log('📦 Testing collection creation...');
    const collectionName = 'test_collection_' + Date.now();
    const collection = await client.createCollection({
      name: collectionName,
      metadata: {
        description: 'Test collection for OpenSAM AI'
      }
    });
    console.log('✅ Collection created successfully!');
    
    // Test vector insertion
    console.log('📝 Testing vector insertion...');
    const testVectors = [
      {
        id: 'test1',
        values: [0.1, 0.2, 0.3, 0.4, 0.5],
        metadata: { text: 'Test document 1', source: 'opensam-test' }
      },
      {
        id: 'test2', 
        values: [0.6, 0.7, 0.8, 0.9, 1.0],
        metadata: { text: 'Test document 2', source: 'opensam-test' }
      }
    ];
    
    await collection.upsert({
      ids: testVectors.map(v => v.id),
      embeddings: testVectors.map(v => v.values),
      metadatas: testVectors.map(v => v.metadata)
    });
    console.log('✅ Vectors inserted successfully!');
    
    // Test vector search
    console.log('🔍 Testing vector search...');
    const queryResult = await collection.query({
      queryEmbeddings: [[0.1, 0.2, 0.3, 0.4, 0.5]],
      nResults: 2
    });
    
    if (queryResult.ids && queryResult.ids[0].length > 0) {
      console.log('✅ Vector search working!');
      console.log(`   Found ${queryResult.ids[0].length} results`);
    } else {
      console.log('❌ Vector search failed - no results returned');
    }
    
    // Clean up test collection
    console.log('🧹 Cleaning up test collection...');
    await client.deleteCollection({ name: collectionName });
    console.log('✅ Test collection deleted!');
    
    console.log('\n🎉 ChromaDB is working perfectly!');
    console.log('   Your OpenSAM AI Dashboard is ready to use ChromaDB for vector storage.');
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure ChromaDB is running:');
    console.log('   - Docker: docker run -p 8000:8000 chromadb/chroma');
    console.log('   - Or: chroma run --host localhost --port 8000');
    console.log('2. Check that port 8000 is available');
    console.log('3. Verify your .env.local has VECTOR_STORE_URL=http://localhost:8000');
  }
}

// Run the test
testChromaDB(); 