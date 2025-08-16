// Pinecone Configuration for OpenSAM AI
// Extracted from: https://open-sam-1-jmmui61.svc.aped-4627-b74a.pinecone.io

const PINECONE_CONFIG = {
  // Index details extracted from URL
  indexName: 'open-sam-1',
  environment: 'aped-4627-b74a',
  
  // API Configuration (set these in your .env file)
  apiKey: process.env.PINECONE_API_KEY,
  projectId: process.env.VECTOR_STORE_PROJECT_ID,
  
  // Vector configuration
  dimension: 1536, // OpenAI text-embedding-3-small dimension
  metric: 'cosine',
  
  // Collection names for different data types
  collections: {
    opportunities: 'sam_opportunities',
    companyProfiles: 'company_profiles',
    documents: 'documents'
  }
};

// Environment variables you need to set in .env:
const REQUIRED_ENV_VARS = {
  VECTOR_STORE_PROVIDER: 'pinecone',
  PINECONE_API_KEY: 'your_pinecone_api_key_here',
  VECTOR_STORE_ENVIRONMENT: 'aped-4627-b74a',
  VECTOR_STORE_PROJECT_ID: 'your_pinecone_project_id_here'
};

console.log('📋 Pinecone Configuration:');
console.log('🏷️ Index Name:', PINECONE_CONFIG.indexName);
console.log('🌍 Environment:', PINECONE_CONFIG.environment);
console.log('📊 Dimension:', PINECONE_CONFIG.dimension);
console.log('📏 Metric:', PINECONE_CONFIG.metric);

console.log('\n🔧 Required Environment Variables:');
Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});

module.exports = { PINECONE_CONFIG, REQUIRED_ENV_VARS }; 