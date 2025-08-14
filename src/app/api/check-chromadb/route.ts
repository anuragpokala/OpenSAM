import { NextRequest, NextResponse } from 'next/server';
import { ChromaClient } from 'chromadb';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Checking ChromaDB contents...');
    
    const chromaUrl = process.env.VECTOR_STORE_URL || 'http://localhost:8000';
    
    // Initialize ChromaDB client
    const chromaClient = new ChromaClient({
      path: chromaUrl
    });
    
    // List all collections
    const collections = await chromaClient.listCollections();
    console.log('📋 Collections found:', collections.map(col => col.name));
    
    const collectionDetails = [];
    
    // Get details for each collection
    for (const collection of collections) {
      try {
        const chromaCollection = await chromaClient.getCollection({
          name: collection.name
        });
        
        // Get all vectors in the collection
        const allVectors = await chromaCollection.get({
          include: ['embeddings', 'metadatas', 'documents']
        });
        
        const vectorCount = allVectors.ids?.length || 0;
        
        // Sample some vectors for metadata analysis
        const sampleVectors = [];
        if (allVectors.ids && allVectors.ids.length > 0) {
          const sampleSize = Math.min(5, allVectors.ids.length);
          for (let i = 0; i < sampleSize; i++) {
            const id = allVectors.ids[i];
            const metadata = allVectors.metadatas?.[i] || {};
            const document = allVectors.documents?.[i];
            const embedding = allVectors.embeddings?.[i];
            
            sampleVectors.push({
              id,
              type: metadata.type || 'unknown',
              title: metadata.title || 'No title',
              embeddingDimension: embedding?.length || 0,
              hasDocument: !!document,
              metadataKeys: Object.keys(metadata)
            });
          }
        }
        
        collectionDetails.push({
          name: collection.name,
          vectorCount,
          sampleVectors,
          totalVectors: vectorCount
        });
        
        console.log(`📊 Collection ${collection.name}: ${vectorCount} vectors`);
        
      } catch (error) {
        console.error(`❌ Error reading collection ${collection.name}:`, error.message);
        collectionDetails.push({
          name: collection.name,
          error: error.message,
          vectorCount: 0,
          sampleVectors: []
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      chromaDbUrl: chromaUrl,
      totalCollections: collections.length,
      collections: collectionDetails,
      summary: {
        totalVectors: collectionDetails.reduce((sum, col) => sum + (col.vectorCount || 0), 0),
        collectionsWithVectors: collectionDetails.filter(col => col.vectorCount > 0).length
      },
      timestamp: Date.now()
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ ChromaDB check failed:', error);
    
    return NextResponse.json({
      error: 'Failed to check ChromaDB',
      message: error instanceof Error ? error.message : 'Unknown error',
      chromaDbUrl: process.env.VECTOR_STORE_URL || 'http://localhost:8000',
      timestamp: Date.now()
    }, { status: 500 });
  }
} 