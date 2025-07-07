import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing complete vector store pipeline...');
    
    // Test 1: Check vector store connection
    console.log('🔍 Checking vector store connection...');
    const isConnected = await vectorStoreServerUtils.isConnected();
    console.log('Vector store connected:', isConnected);
    
    // Test 2: List collections
    console.log('🔍 Listing collections...');
    const collections = await vectorStoreServerUtils.listCollections();
    console.log('Available collections:', collections);
    
    // Test 3: Add a simple test profile
    console.log('🔍 Adding test profile...');
    const testProfile = {
      id: "test-vonar",
      entityName: "vonar.ai Inc.",
      description: "AI-powered government contracting platform",
      businessTypes: ["Small Business"],
      naicsCodes: ["541511", "541519"],
      capabilities: ["AI Development", "Government Contracting"],
      pastPerformance: [],
      certifications: [],
      ueiSAM: "TEST123456789",
      contactInfo: {
        address: "123 AI Street",
        city: "Arlington",
        state: "VA",
        zipCode: "22201",
        phone: "555-123-4567",
        email: "contact@vonar.ai",
        website: "https://vonar.ai"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await vectorStoreServerUtils.addCompanyProfile(testProfile);
    console.log('✅ Test profile added successfully');
    
    // Test 4: Check if profile is in vector store
    console.log('🔍 Checking if profile is in vector store...');
    const updatedCollections = await vectorStoreServerUtils.listCollections();
    console.log('Updated collections:', updatedCollections);
    
    // Test 5: Try to retrieve the profile
    console.log('🔍 Retrieving profile vector...');
    const profileVector = await vectorStoreServerUtils.getCompanyProfileVector("test-vonar");
    if (profileVector) {
      console.log('✅ Profile vector found:', profileVector.id);
    } else {
      console.log('❌ Profile vector not found');
    }
    
    return NextResponse.json({ 
      success: true, 
      isConnected,
      initialCollections: collections,
      updatedCollections,
      profileFound: !!profileVector
    });
    
  } catch (error) {
    console.error('❌ Vector store test failed:', error);
    return NextResponse.json({ 
      error: 'Vector store test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 