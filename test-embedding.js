// Test embedding service
const { getEmbeddingService } = require('./src/lib/embed');

async function testEmbedding() {
  console.log('🧪 Testing embedding service...');
  
  try {
    // Test 1: Create embedding service
    console.log('\n1️⃣ Creating embedding service...');
    const embeddingService = getEmbeddingService({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small'
    });
    console.log('✅ Embedding service created');
    
    // Test 2: Generate embedding
    console.log('\n2️⃣ Generating embedding...');
    const testText = "vonar.ai Inc. is an AI-powered government contracting platform";
    const embedding = await embeddingService.getEmbedding(testText);
    console.log('✅ Embedding generated');
    console.log('Embedding length:', embedding.length);
    console.log('Embedding preview:', embedding.slice(0, 5));
    
    // Test 3: Test with simple vector fallback
    console.log('\n3️⃣ Testing simple vector fallback...');
    const simpleService = getEmbeddingService({
      provider: 'local'
    });
    const simpleEmbedding = await simpleService.getEmbedding(testText);
    console.log('✅ Simple embedding generated');
    console.log('Simple embedding length:', simpleEmbedding.length);
    
  } catch (error) {
    console.error('❌ Embedding test failed:', error);
    console.error('Error details:', error.message);
  }
}

testEmbedding().catch(console.error); 