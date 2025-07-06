import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';
import { CompanyProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    
    if (!profile) {
      return NextResponse.json({ 
        error: 'Company profile is required' 
      }, { status: 400 });
    }

    // Add company profile to vector store
    await vectorStoreServerUtils.addCompanyProfile(profile);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Company profile added to vector store successfully' 
    });
    
  } catch (error) {
    console.error('Company profile vectorization error:', error);
    return NextResponse.json({ 
      error: 'Failed to add company profile to vector store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 