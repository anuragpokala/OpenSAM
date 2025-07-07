const fetch = require('node-fetch');

async function testVectorStore() {
  console.log('🧪 Testing vector store operations...');
  
  // Test 1: Check current vector store status
  console.log('\n1️⃣ Checking current vector store status...');
  try {
    const statusResponse = await fetch('http://localhost:3000/api/vector-store');
    const statusData = await statusResponse.json();
    console.log('Current collections:', statusData.data.collections);
  } catch (error) {
    console.error('Failed to check vector store status:', error);
  }
  
  // Test 2: Add vonar.ai Inc. profile
  console.log('\n2️⃣ Adding vonar.ai Inc. to vector store...');
  const vonarProfile = {
    id: "vonar-ai-inc",
    entityName: "vonar.ai Inc.",
    description: "AI-powered government contracting platform that helps businesses find and win government contracts through intelligent matching and automation.",
    businessTypes: ["Small Business"],
    naicsCodes: ["541511", "541519", "541512"],
    capabilities: [
      "AI Development",
      "Government Contracting",
      "Software Development",
      "Machine Learning",
      "Natural Language Processing",
      "Contract Analysis",
      "Opportunity Matching"
    ],
    pastPerformance: [
      "Successfully delivered AI-powered contract analysis platform",
      "Implemented government contracting automation solutions",
      "Developed intelligent opportunity matching algorithms"
    ],
    certifications: ["ISO 27001", "CMMI Level 3"],
    ueiSAM: "VONAR123456789",
    contactInfo: {
      address: "123 AI Street",
      city: "Arlington",
      state: "VA",
      zipCode: "22201",
      phone: "555-123-4567",
      email: "contact@vonar.ai",
      website: "https://vonar.ai"
    },
    aiEnhanced: {
      industry: "Technology Services",
      companySize: "Small Business",
      foundingYear: 2023,
      revenue: "$1M - $5M",
      employeeCount: "10-25",
      enhancedDescription: "vonar.ai Inc. is a cutting-edge technology company specializing in AI-powered government contracting solutions. We leverage machine learning and natural language processing to help businesses efficiently identify and win government contracts.",
      keyProducts: ["AI Contract Analyzer", "Opportunity Matching Engine", "Government Contracting Platform"],
      targetMarkets: ["Federal Government", "State Government", "Defense Contractors", "Technology Companies"],
      competitiveAdvantages: ["AI Expertise", "Government Domain Knowledge", "Proven Technology", "Small Business Status"],
      technologyStack: ["Python", "React", "Node.js", "TensorFlow", "OpenAI API", "AWS"],
      partnerships: ["AWS Partner", "OpenAI Partner"],
      awards: ["SBA Innovation Award"],
      lastEnhanced: Date.now()
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  try {
    const addResponse = await fetch('http://localhost:3000/api/company-profile/vectorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: vonarProfile })
    });
    
    const addResult = await addResponse.json();
    console.log('Add result:', addResult);
  } catch (error) {
    console.error('Failed to add profile:', error);
  }
  
  // Test 3: Check if vonar.ai Inc. is now in vector store
  console.log('\n3️⃣ Checking if vonar.ai Inc. is in vector store...');
  try {
    const checkResponse = await fetch('http://localhost:3000/api/vector-store');
    const checkData = await checkResponse.json();
    console.log('Updated collections:', checkData.data.collections);
  } catch (error) {
    console.error('Failed to check updated vector store:', error);
  }
  
  // Test 4: Try to find matching opportunities for vonar.ai Inc.
  console.log('\n4️⃣ Testing opportunity matching for vonar.ai Inc....');
  try {
    const matchResponse = await fetch('http://localhost:3000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyProfile: vonarProfile })
    });
    
    const matchResult = await matchResponse.json();
    console.log('Match result:', matchResult);
  } catch (error) {
    console.error('Failed to test matching:', error);
  }
}

testVectorStore().catch(console.error); 