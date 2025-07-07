const { ChromaClient } = require('chromadb');

async function testChromaDB() {
  console.log('🧪 Testing ChromaDB connection...');
  
  try {
    // Test 1: Create client
    console.log('\n1️⃣ Creating ChromaDB client...');
    const client = new ChromaClient({
      host: 'localhost',
      port: 8000,
      ssl: false
    });
    console.log('✅ ChromaDB client created');
    
    // Test 2: List collections
    console.log('\n2️⃣ Listing collections...');
    const collections = await client.listCollections();
    console.log('Collections:', collections.map(c => c.name));
    
    // Test 3: Create a test collection
    console.log('\n3️⃣ Creating test collection...');
    const testCollection = await client.createCollection({
      name: 'test_collection',
      metadata: {
        dimension: '1536',
        description: 'Test collection'
      }
    });
    console.log('✅ Test collection created');
    
    // Test 4: Add a simple vector
    console.log('\n4️⃣ Adding test vector...');
    const testVector = new Array(1536).fill(0.1); // Simple test vector
    await testCollection.upsert({
      ids: ['test_vector_1'],
      embeddings: [testVector],
      metadatas: [{ type: 'test', title: 'Test Vector' }]
    });
    console.log('✅ Test vector added');
    
    // Test 5: Query the vector
    console.log('\n5️⃣ Querying test vector...');
    const queryResult = await testCollection.query({
      queryEmbeddings: [testVector],
      nResults: 1
    });
    console.log('Query result:', queryResult);
    
    // Test 6: Clean up
    console.log('\n6️⃣ Cleaning up...');
    await client.deleteCollection({ name: 'test_collection' });
    console.log('✅ Test collection deleted');
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error);
    console.error('Error details:', error.message);
  }
}

testChromaDB().catch(console.error); 