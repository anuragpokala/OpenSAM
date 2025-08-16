import { NextResponse } from 'next/server';
import { PROFILE_TEMPLATES, getAllCategories, searchTemplates } from '@/lib/profile-templates';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    let templates = PROFILE_TEMPLATES;
    
    // Filter by category if specified
    if (category && category !== 'all') {
      templates = templates.filter(template => template.category === category);
    }
    
    // Search by query if specified
    if (query) {
      templates = searchTemplates(query);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        templates,
        categories: getAllCategories(),
        total: templates.length
      }
    });
  } catch (error) {
    console.error('Error fetching profile templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile templates' },
      { status: 500 }
    );
  }
} 