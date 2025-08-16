const { Pinecone } = require('@pinecone-database/pinecone');

// Configuration for your Pinecone index
const PINECONE_CONFIG = {
  apiKey: process.env.PINECONE_API_KEY || 'your_pinecone_api_key_here',
  environment: 'aped-4627-b74a', // Extracted from your URL
  indexName: 'open-sam-1' // Extracted from your URL
};

async function testPineconeConnection() {
  try {
    console.log('🔌 Testing Pinecone connection...');
    console.log('📊 Index URL:', 'https://open-sam-1-jmmui61.svc.aped-4627-b74a.pinecone.io');
    console.log('🏷️ Index Name:', PINECONE_CONFIG.indexName);
    console.log('🌍 Environment:', PINECONE_CONFIG.environment);
    
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: PINECONE_CONFIG.apiKey,
    });

    console.log('✅ Pinecone client initialized');

    // List all indexes to verify connection
    console.log('📋 Listing indexes...');
    const indexes = await pinecone.listIndexes();
    console.log('📊 Available indexes:', indexes.indexes?.map(idx => idx.name) || []);

    // Check if our target index exists
    const targetIndex = indexes.indexes?.find(idx => idx.name === PINECONE_CONFIG.indexName);
    if (targetIndex) {
      console.log('✅ Target index found:', targetIndex.name);
      console.log('📊 Index details:', {
        name: targetIndex.name,
        dimension: targetIndex.dimension,
        metric: targetIndex.metric,
        status: targetIndex.status
      });
    } else {
      console.log('⚠️ Target index not found, available indexes:', indexes.indexes?.map(idx => idx.name) || []);
    }

    // Get the index instance
    const index = pinecone.index(PINECONE_CONFIG.indexName);
    console.log('🔗 Index instance created');

    // Test a simple query with a dummy vector
    console.log('🧪 Testing query with dummy vector...');
    const dummyVector = new Array(1536).fill(0.1); // 1536-dimensional vector
    
    const queryResponse = await index.query({
      vector: dummyVector,
      topK: 5,
      includeMetadata: true
    });

    console.log('✅ Query successful!');
    console.log('📊 Query results:', {
      matches: queryResponse.matches?.length || 0,
      totalResults: queryResponse.matches?.length || 0
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log('📋 Sample results:');
      queryResponse.matches.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ID: ${match.id}, Score: ${match.score?.toFixed(4)}`);
      });
    }

    console.log('🎉 Pinecone connection test completed successfully!');

  } catch (error) {
    console.error('❌ Pinecone connection test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 Make sure to set PINECONE_API_KEY in your environment variables');
    }
    
    if (error.message.includes('index')) {
      console.log('💡 Check if the index name and environment are correct');
    }
  }
}

// Run the test
testPineconeConnection(); 