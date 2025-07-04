import { NextRequest, NextResponse } from 'next/server';
import { workingListStore, workingListUtils } from '@/lib/workingList';
import { WorkingList, WorkingListItem } from '@/types';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Rate limiting for working list API calls
 */
function checkRateLimit(req: NextRequest): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIp as string);
  
  if (!clientData) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Check if limit exceeded
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment count
  clientData.count++;
  return true;
}

/**
 * Get all working lists for a user
 */
export async function GET(req: NextRequest) {
  // Check rate limit
  if (!checkRateLimit(req)) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }, { status: 429 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default';
    const listId = searchParams.get('listId');
    const includeItems = searchParams.get('includeItems') === 'true';
    
    if (listId) {
      // Get specific list
      const list = await workingListStore.getList(listId);
      if (!list) {
        return NextResponse.json({ 
          error: 'Working list not found' 
        }, { status: 404 });
      }
      
      let response: any = { list };
      
      if (includeItems) {
        const items = await workingListStore.getListItems(listId);
        response.items = items;
      }
      
      return NextResponse.json({
        success: true,
        data: response,
        timestamp: Date.now(),
      }, { status: 200 });
    } else {
      // Get all lists for user
      const lists = await workingListStore.getListsByUser(userId);
      
      return NextResponse.json({
        success: true,
        data: { lists },
        timestamp: Date.now(),
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Working list GET error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to retrieve working lists',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Create a new working list
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, tags, isPublic, createdBy, opportunity } = body;
    
    // Validate required parameters
    if (!name || !createdBy) {
      return NextResponse.json({ 
        error: 'Name and createdBy are required' 
      }, { status: 400 });
    }
    
    let list: WorkingList;
    
    if (opportunity) {
      // Create list from opportunity
      list = await workingListUtils.createOpportunityList(opportunity, createdBy);
    } else {
      // Create empty list
      list = await workingListStore.createList({
        name,
        description,
        items: [],
        tags: tags || [],
        isPublic: isPublic || false,
        createdBy,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: { list },
      message: 'Working list created successfully',
      timestamp: Date.now(),
    }, { status: 201 });
    
  } catch (error) {
    console.error('Working list POST error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to create working list',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Update a working list
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { listId, updates } = body;
    
    if (!listId) {
      return NextResponse.json({ 
        error: 'List ID is required' 
      }, { status: 400 });
    }
    
    const updatedList = await workingListStore.updateList(listId, updates);
    
    if (!updatedList) {
      return NextResponse.json({ 
        error: 'Working list not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: { list: updatedList },
      message: 'Working list updated successfully',
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Working list PUT error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update working list',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Delete a working list
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');
    
    if (!listId) {
      return NextResponse.json({ 
        error: 'List ID is required' 
      }, { status: 400 });
    }
    
    const deleted = await workingListStore.deleteList(listId);
    
    if (!deleted) {
      return NextResponse.json({ 
        error: 'Working list not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Working list deleted successfully',
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Working list DELETE error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to delete working list',
      timestamp: Date.now(),
    }, { status: 500 });
  }
} 