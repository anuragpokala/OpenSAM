const { ChromaClient } = require('chromadb');
const { Pinecone } = require('@pinecone-database/pinecone');

// Configuration
const CHROMADB_CONFIG = {
  url: process.env.VECTOR_STORE_URL || 'http://localhost:8000'
};

const PINECONE_CONFIG = {
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'aped-4627-b74a',
  indexName: 'open-sam-1'
};

async function migrateChromaDBToPinecone() {
  try {
    console.log('🚀 Starting ChromaDB to Pinecone migration...');
    console.log('📊 ChromaDB URL:', CHROMADB_CONFIG.url);
    console.log('🏷️ Pinecone Index:', PINECONE_CONFIG.indexName);
    
    // Initialize ChromaDB client
    console.log('\n1️⃣ Connecting to ChromaDB...');
    const chromaClient = new ChromaClient({
      path: CHROMADB_CONFIG.url
    });
    
    // List all collections in ChromaDB
    const collections = await chromaClient.listCollections();
    console.log('📋 ChromaDB Collections found:', collections.map(col => col.name));
    
    if (collections.length === 0) {
      console.log('⚠️ No collections found in ChromaDB. Nothing to migrate.');
      return;
    }
    
    // Initialize Pinecone client
    console.log('\n2️⃣ Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: PINECONE_CONFIG.apiKey,
    });
    
    const index = pinecone.index(PINECONE_CONFIG.indexName);
    console.log('✅ Pinecone index connected');
    
    // Migrate each collection
    for (const collection of collections) {
      console.log(`\n3️⃣ Migrating collection: ${collection.name}`);
      
      try {
        // Get all vectors from ChromaDB collection
        const chromaCollection = await chromaClient.getCollection({
          name: collection.name
        });
        
        // Get all vectors (this might need pagination for large collections)
        const allVectors = await chromaCollection.get({
          include: ['embeddings', 'metadatas', 'documents']
        });
        
        console.log(`📊 Found ${allVectors.ids?.length || 0} vectors in collection ${collection.name}`);
        
        if (!allVectors.ids || allVectors.ids.length === 0) {
          console.log(`⚠️ No vectors found in collection ${collection.name}, skipping...`);
          continue;
        }
        
        // Prepare vectors for Pinecone
        const pineconeVectors = [];
        for (let i = 0; i < allVectors.ids.length; i++) {
          const id = allVectors.ids[i];
          const embedding = allVectors.embeddings?.[i];
          const metadata = allVectors.metadatas?.[i] || {};
          const document = allVectors.documents?.[i];
          
          if (embedding && embedding.length === 1536) {
            pineconeVectors.push({
              id: id,
              values: embedding,
              metadata: {
                ...metadata,
                source: 'chromadb-migration',
                originalCollection: collection.name,
                document: document || null,
                migratedAt: new Date().toISOString()
              }
            });
          } else {
            console.log(`⚠️ Skipping vector ${id} - invalid embedding dimension: ${embedding?.length || 0}`);
          }
        }
        
        console.log(`📤 Migrating ${pineconeVectors.length} vectors to Pinecone...`);
        
        // Upload vectors to Pinecone in batches
        const batchSize = 100;
        for (let i = 0; i < pineconeVectors.length; i += batchSize) {
          const batch = pineconeVectors.slice(i, i + batchSize);
          await index.upsert(batch);
          console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pineconeVectors.length / batchSize)}`);
        }
        
        console.log(`✅ Successfully migrated collection ${collection.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate collection ${collection.name}:`, error.message);
      }
    }
    
    // Verify migration
    console.log('\n4️⃣ Verifying migration...');
    const queryResponse = await index.query({
      vector: new Array(1536).fill(0.1), // Dummy vector
      topK: 10,
      includeMetadata: true
    });
    
    console.log('📊 Migration verification results:');
    console.log(`- Total vectors in Pinecone: ${queryResponse.matches?.length || 0}`);
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log('📋 Sample migrated vectors:');
      queryResponse.matches.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ID: ${match.id}`);
        console.log(`     Collection: ${match.metadata?.originalCollection || 'unknown'}`);
        console.log(`     Type: ${match.metadata?.type || 'unknown'}`);
        console.log(`     Score: ${match.score?.toFixed(4)}`);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 Make sure PINECONE_API_KEY is set correctly');
    }
    
    if (error.message.includes('ChromaDB')) {
      console.log('💡 Make sure ChromaDB is running at:', CHROMADB_CONFIG.url);
    }
  }
}

// Run migration
migrateChromaDBToPinecone(); 