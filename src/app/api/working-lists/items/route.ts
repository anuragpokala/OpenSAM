import { NextRequest, NextResponse } from 'next/server';
import { workingListStore, workingListUtils } from '@/lib/workingList';
import { WorkingListItem } from '@/types';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Rate limiting for working list items API calls
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
 * Get working list items
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
    const listId = searchParams.get('listId');
    const itemId = searchParams.get('itemId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    
    if (itemId) {
      // Get specific item
      const item = await workingListStore.getItem(itemId);
      if (!item) {
        return NextResponse.json({ 
          error: 'Working list item not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: { item },
        timestamp: Date.now(),
      }, { status: 200 });
    } else if (listId) {
      // Get items in specific list
      const items = await workingListStore.getListItems(listId);
      
      return NextResponse.json({
        success: true,
        data: { items },
        timestamp: Date.now(),
      }, { status: 200 });
    } else {
      // Get items with filters
      let items: WorkingListItem[] = [];
      
      if (type) {
        items = await workingListStore.getItemsByType(type as WorkingListItem['type']);
      } else if (status) {
        items = await workingListStore.getItemsByStatus(status as WorkingListItem['status']);
      } else if (priority) {
        items = await workingListStore.getItemsByPriority(priority as WorkingListItem['priority']);
      } else if (search) {
        items = await workingListStore.searchItems(search);
      } else {
        // Get all items (limited)
        const allLists = await workingListStore.getAllLists();
        const allItems = await Promise.all(
          allLists.map(list => workingListStore.getListItems(list.id))
        );
        items = allItems.flat().slice(0, 100); // Limit to 100 items
      }
      
      return NextResponse.json({
        success: true,
        data: { items },
        timestamp: Date.now(),
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Working list items GET error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to retrieve working list items',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Add item to working list
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listId, item, opportunity } = body;
    
    // Validate required parameters
    if (!listId) {
      return NextResponse.json({ 
        error: 'List ID is required' 
      }, { status: 400 });
    }
    
    let newItem: WorkingListItem | null;
    
    if (opportunity) {
      // Add opportunity to list
      newItem = await workingListUtils.addOpportunityToList(listId, opportunity);
    } else if (item) {
      // Add custom item to list
      newItem = await workingListStore.addItemToList(listId, item);
    } else {
      return NextResponse.json({ 
        error: 'Item or opportunity data is required' 
      }, { status: 400 });
    }
    
    if (!newItem) {
      return NextResponse.json({ 
        error: 'Failed to add item to list' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: { item: newItem },
      message: 'Item added to working list successfully',
      timestamp: Date.now(),
    }, { status: 201 });
    
  } catch (error) {
    console.error('Working list items POST error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to add item to working list',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Update working list item
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, updates } = body;
    
    if (!itemId) {
      return NextResponse.json({ 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    const updatedItem = await workingListStore.updateItem(itemId, updates);
    
    if (!updatedItem) {
      return NextResponse.json({ 
        error: 'Working list item not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: { item: updatedItem },
      message: 'Working list item updated successfully',
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Working list items PUT error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update working list item',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Remove item from working list
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');
    const itemId = searchParams.get('itemId');
    
    if (!listId || !itemId) {
      return NextResponse.json({ 
        error: 'List ID and Item ID are required' 
      }, { status: 400 });
    }
    
    const removed = await workingListStore.removeItemFromList(listId, itemId);
    
    if (!removed) {
      return NextResponse.json({ 
        error: 'Working list item not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from working list successfully',
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Working list items DELETE error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to remove item from working list',
      timestamp: Date.now(),
    }, { status: 500 });
  }
} 