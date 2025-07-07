const { ChromaClient } = require('chromadb');

async function testServerChromaDBConnection() {
  console.log('🧪 Testing Next.js server connection to ChromaDB...\n');
  
  try {
    // Test 1: Basic client creation
    console.log('1️⃣ Creating ChromaDB client...');
    const client = new ChromaClient({
      host: 'localhost',
      port: 8000,
      ssl: false
    });
    console.log('✅ ChromaDB client created successfully');
    
    // Test 2: Check if we can list collections
    console.log('\n2️⃣ Testing listCollections()...');
    const collections = await client.listCollections();
    console.log('✅ List collections successful');
    console.log('📋 Collections found:', collections.length);
    console.log('📋 Collection names:', collections.map(c => c.name));
    
    // Test 3: Create a test collection
    console.log('\n3️⃣ Testing createCollection()...');
    const testCollectionName = 'test_server_connection';
    const testCollection = await client.createCollection({
      name: testCollectionName,
      metadata: {
        dimension: '1536',
        description: 'Test collection for server connection'
      }
    });
    console.log('✅ Test collection created successfully');
    console.log('📋 Collection name:', testCollection.name);
    
    // Test 4: Add a test vector
    console.log('\n4️⃣ Testing upsert()...');
    const testVector = new Array(1536).fill(0.1);
    await testCollection.upsert({
      ids: ['test_vector_1'],
      embeddings: [testVector],
      metadatas: [{ 
        type: 'test', 
        title: 'Test Vector',
        description: 'A test vector for server connection'
      }]
    });
    console.log('✅ Test vector upserted successfully');
    
    // Test 5: Query the test vector
    console.log('\n5️⃣ Testing query()...');
    const queryResult = await testCollection.query({
      queryEmbeddings: [testVector],
      nResults: 1
    });
    console.log('✅ Query successful');
    console.log('📋 Query results:', queryResult.ids[0].length, 'vectors found');
    
    // Test 6: Get the vector directly
    console.log('\n6️⃣ Testing get()...');
    const getResult = await testCollection.get({
      ids: ['test_vector_1'],
      include: ['embeddings', 'metadatas']
    });
    console.log('✅ Get successful');
    console.log('📋 Retrieved vector ID:', getResult.ids[0]);
    
    // Test 7: List collections again to see the new one
    console.log('\n7️⃣ Verifying collection was created...');
    const updatedCollections = await client.listCollections();
    console.log('✅ Updated collections list successful');
    console.log('📋 Total collections:', updatedCollections.length);
    console.log('📋 Collection names:', updatedCollections.map(c => c.name));
    
    // Test 8: Clean up - delete the test collection
    console.log('\n8️⃣ Cleaning up test collection...');
    await client.deleteCollection({ name: testCollectionName });
    console.log('✅ Test collection deleted successfully');
    
    // Test 9: Final verification
    console.log('\n9️⃣ Final verification...');
    const finalCollections = await client.listCollections();
    console.log('✅ Final collections list successful');
    console.log('📋 Final collections count:', finalCollections.length);
    
    console.log('\n🎉 All ChromaDB connection tests passed!');
    console.log('✅ Your Next.js server can communicate with ChromaDB properly');
    
  } catch (error) {
    console.error('\n❌ ChromaDB connection test failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Additional debugging info
    console.log('\n🔍 Debugging information:');
    console.log('- ChromaDB server should be running on localhost:8000');
    console.log('- Check if ChromaDB server is accessible: curl http://localhost:8000/api/v2/heartbeat');
    console.log('- Check ChromaDB server logs for any errors');
  }
}

// Run the test
testServerChromaDBConnection().catch(console.error); 