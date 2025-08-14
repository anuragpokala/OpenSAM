import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

export async function GET(req: NextRequest) {
  try {
    console.log('🔌 Testing Pinecone connection...');
    
    // Configuration extracted from your URL
    const PINECONE_CONFIG = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: 'aped-4627-b74a',
      indexName: 'open-sam-1'
    };

    if (!PINECONE_CONFIG.apiKey) {
      return NextResponse.json({
        error: 'Pinecone API key not configured',
        message: 'Set PINECONE_API_KEY in your environment variables',
        config: {
          environment: PINECONE_CONFIG.environment,
          indexName: PINECONE_CONFIG.indexName
        }
      }, { status: 400 });
    }

    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: PINECONE_CONFIG.apiKey,
    });

    console.log('✅ Pinecone client initialized');

    // List all indexes
    const indexes = await pinecone.listIndexes();
    console.log('📊 Available indexes:', indexes.indexes?.map(idx => idx.name) || []);

    // Check if target index exists
    const targetIndex = indexes.indexes?.find(idx => idx.name === PINECONE_CONFIG.indexName);
    
    if (!targetIndex) {
      return NextResponse.json({
        error: 'Target index not found',
        availableIndexes: indexes.indexes?.map(idx => idx.name) || [],
        targetIndex: PINECONE_CONFIG.indexName,
        config: PINECONE_CONFIG
      }, { status: 404 });
    }

    // Get index instance
    const index = pinecone.index(PINECONE_CONFIG.indexName);
    console.log('🔗 Index instance created');

    // Test query with dummy vector
    const dummyVector = new Array(1536).fill(0.1);
    const queryResponse = await index.query({
      vector: dummyVector,
      topK: 5,
      includeMetadata: true
    });

    console.log('✅ Query successful');

    return NextResponse.json({
      success: true,
      message: 'Pinecone connection successful',
      config: {
        indexName: PINECONE_CONFIG.indexName,
        environment: PINECONE_CONFIG.environment,
        dimension: targetIndex.dimension,
        metric: targetIndex.metric,
        status: targetIndex.status
      },
      testResults: {
        querySuccessful: true,
        totalResults: queryResponse.matches?.length || 0,
        sampleResults: queryResponse.matches?.slice(0, 3).map(match => ({
          id: match.id,
          score: match.score,
          hasMetadata: !!match.metadata
        })) || []
      },
      timestamp: Date.now()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Pinecone connection test failed:', error);
    
    return NextResponse.json({
      error: 'Pinecone connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        environment: 'aped-4627-b74a',
        indexName: 'open-sam-1',
        hasApiKey: !!process.env.PINECONE_API_KEY
      },
      timestamp: Date.now()
    }, { status: 500 });
  }
} 