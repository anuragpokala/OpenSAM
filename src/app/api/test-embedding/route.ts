import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/embed';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing embedding service...');
    
    // Test 1: Check environment variables
    console.log('🔍 Environment variables:');
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('NEXT_PUBLIC_OPENAI_API_KEY length:', process.env.NEXT_PUBLIC_OPENAI_API_KEY?.length || 0);
    
    // Test 2: Create embedding service
    console.log('🔍 Creating embedding service...');
    const embeddingService = getEmbeddingService();
    
    // Test 3: Generate embedding
    console.log('🔍 Generating embedding...');
    const testText = "vonar.ai Inc. is an AI-powered government contracting platform";
    const embedding = await embeddingService.getEmbedding(testText);
    
    console.log('✅ Embedding generated successfully');
    console.log('Embedding length:', embedding.length);
    
    return NextResponse.json({ 
      success: true, 
      embeddingLength: embedding.length,
      embeddingPreview: embedding.slice(0, 5)
    });
    
  } catch (error) {
    console.error('❌ Embedding test failed:', error);
    return NextResponse.json({ 
      error: 'Embedding test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 