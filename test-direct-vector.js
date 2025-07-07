// Direct test of vector store functionality
const { vectorStoreServerUtils } = require('./src/lib/vectorStore-server');

async function testDirectVectorStore() {
  console.log('🧪 Testing vector store directly...');
  
  try {
    // Test 1: Check if vector store is connected
    console.log('\n1️⃣ Checking vector store connection...');
    const isConnected = await vectorStoreServerUtils.isConnected();
    console.log('Vector store connected:', isConnected);
    
    // Test 2: List collections
    console.log('\n2️⃣ Listing collections...');
    const collections = await vectorStoreServerUtils.listCollections();
    console.log('Available collections:', collections);
    
    // Test 3: Add vonar.ai Inc. profile directly
    console.log('\n3️⃣ Adding vonar.ai Inc. profile directly...');
    const vonarProfile = {
      id: "vonar-ai-inc",
      entityName: "vonar.ai Inc.",
      description: "AI-powered government contracting platform",
      businessTypes: ["Small Business"],
      naicsCodes: ["541511", "541519"],
      capabilities: ["AI Development", "Government Contracting", "Software Development"],
      ueiSAM: "VONAR123456789",
      contactInfo: {
        address: "123 AI Street",
        city: "Arlington",
        state: "VA",
        zipCode: "22201",
        website: "https://vonar.ai"
      }
    };
    
    await vectorStoreServerUtils.addCompanyProfile(vonarProfile);
    console.log('✅ Profile added successfully');
    
    // Test 4: Check if profile is now in vector store
    console.log('\n4️⃣ Checking if profile is in vector store...');
    const updatedCollections = await vectorStoreServerUtils.listCollections();
    console.log('Updated collections:', updatedCollections);
    
    // Test 5: Try to retrieve the profile vector
    console.log('\n5️⃣ Retrieving profile vector...');
    const profileVector = await vectorStoreServerUtils.getCompanyProfileVector("vonar-ai-inc");
    if (profileVector) {
      console.log('✅ Profile vector found:', profileVector.id);
      console.log('Vector metadata:', profileVector.metadata);
    } else {
      console.log('❌ Profile vector not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testDirectVectorStore().catch(console.error); 