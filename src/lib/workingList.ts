import { WorkingList, WorkingListItem } from '@/types';
import { generateId } from './utils';

// In-memory working list store
class WorkingListStore {
  private lists: Map<string, WorkingList> = new Map();
  private items: Map<string, WorkingListItem> = new Map();

  /**
   * Create a new working list
   */
  async createList(list: Omit<WorkingList, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkingList> {
    const newList: WorkingList = {
      ...list,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.lists.set(newList.id, newList);
    return newList;
  }

  /**
   * Get a working list by ID
   */
  async getList(listId: string): Promise<WorkingList | null> {
    return this.lists.get(listId) || null;
  }

  /**
   * Get all working lists
   */
  async getAllLists(): Promise<WorkingList[]> {
    return Array.from(this.lists.values());
  }

  /**
   * Get lists by user
   */
  async getListsByUser(userId: string): Promise<WorkingList[]> {
    return Array.from(this.lists.values()).filter(list => 
      list.createdBy === userId || list.collaborators?.includes(userId)
    );
  }

  /**
   * Update a working list
   */
  async updateList(listId: string, updates: Partial<WorkingList>): Promise<WorkingList | null> {
    const list = this.lists.get(listId);
    if (!list) return null;

    const updatedList: WorkingList = {
      ...list,
      ...updates,
      updatedAt: Date.now(),
    };

    this.lists.set(listId, updatedList);
    return updatedList;
  }

  /**
   * Delete a working list
   */
  async deleteList(listId: string): Promise<boolean> {
    const list = this.lists.get(listId);
    if (!list) return false;

    // Remove all items in the list
    for (const itemId of list.items) {
      this.items.delete(itemId);
    }

    this.lists.delete(listId);
    return true;
  }

  /**
   * Add an item to a working list
   */
  async addItemToList(listId: string, item: Omit<WorkingListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkingListItem | null> {
    const list = this.lists.get(listId);
    if (!list) return null;

    const newItem: WorkingListItem = {
      ...item,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.items.set(newItem.id, newItem);
    
    // Update list
    const updatedList: WorkingList = {
      ...list,
      items: [...list.items, newItem.id],
      updatedAt: Date.now(),
    };
    this.lists.set(listId, updatedList);

    return newItem;
  }

  /**
   * Get an item by ID
   */
  async getItem(itemId: string): Promise<WorkingListItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Get all items in a list
   */
  async getListItems(listId: string): Promise<WorkingListItem[]> {
    const list = this.lists.get(listId);
    if (!list) return [];

    return list.items
      .map(itemId => this.items.get(itemId))
      .filter((item): item is WorkingListItem => item !== undefined);
  }

  /**
   * Update an item
   */
  async updateItem(itemId: string, updates: Partial<WorkingListItem>): Promise<WorkingListItem | null> {
    const item = this.items.get(itemId);
    if (!item) return null;

    const updatedItem: WorkingListItem = {
      ...item,
      ...updates,
      updatedAt: Date.now(),
    };

    this.items.set(itemId, updatedItem);
    return updatedItem;
  }

  /**
   * Remove an item from a list
   */
  async removeItemFromList(listId: string, itemId: string): Promise<boolean> {
    const list = this.lists.get(listId);
    if (!list) return false;

    const item = this.items.get(itemId);
    if (!item) return false;

    // Remove item from list
    const updatedList: WorkingList = {
      ...list,
      items: list.items.filter(id => id !== itemId),
      updatedAt: Date.now(),
    };
    this.lists.set(listId, updatedList);

    // Delete the item
    this.items.delete(itemId);
    return true;
  }

  /**
   * Get items by type
   */
  async getItemsByType(type: WorkingListItem['type']): Promise<WorkingListItem[]> {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  /**
   * Get items by status
   */
  async getItemsByStatus(status: WorkingListItem['status']): Promise<WorkingListItem[]> {
    return Array.from(this.items.values()).filter(item => item.status === status);
  }

  /**
   * Get items by priority
   */
  async getItemsByPriority(priority: WorkingListItem['priority']): Promise<WorkingListItem[]> {
    return Array.from(this.items.values()).filter(item => item.priority === priority);
  }

  /**
   * Search items by text
   */
  async searchItems(query: string): Promise<WorkingListItem[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.items.values()).filter(item =>
      item.title.toLowerCase().includes(queryLower) ||
      item.description?.toLowerCase().includes(queryLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      item.notes.some(note => note.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get items due soon (within specified days)
   */
  async getItemsDueSoon(days: number = 7): Promise<WorkingListItem[]> {
    const now = Date.now();
    const dueDate = now + (days * 24 * 60 * 60 * 1000);

    return Array.from(this.items.values()).filter(item =>
      item.dueDate && item.dueDate <= dueDate && item.status !== 'completed'
    );
  }

  /**
   * Get overdue items
   */
  async getOverdueItems(): Promise<WorkingListItem[]> {
    const now = Date.now();
    return Array.from(this.items.values()).filter(item =>
      item.dueDate && item.dueDate < now && item.status !== 'completed'
    );
  }

  /**
   * Get store statistics
   */
  async getStats(): Promise<{
    totalLists: number;
    totalItems: number;
    itemsByStatus: Record<string, number>;
    itemsByPriority: Record<string, number>;
    itemsByType: Record<string, number>;
  }> {
    const itemsByStatus: Record<string, number> = {};
    const itemsByPriority: Record<string, number> = {};
    const itemsByType: Record<string, number> = {};

    for (const item of Array.from(this.items.values())) {
      itemsByStatus[item.status] = (itemsByStatus[item.status] || 0) + 1;
      itemsByPriority[item.priority] = (itemsByPriority[item.priority] || 0) + 1;
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
    }

    return {
      totalLists: this.lists.size,
      totalItems: this.items.size,
      itemsByStatus,
      itemsByPriority,
      itemsByType,
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.lists.clear();
    this.items.clear();
  }

  /**
   * Export store data
   */
  async export(): Promise<string> {
    const data = {
      lists: Array.from(this.lists.entries()),
      items: Array.from(this.items.entries()),
    };
    return JSON.stringify(data);
  }

  /**
   * Import store data
   */
  async import(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    
    this.lists = new Map(parsed.lists);
    this.items = new Map(parsed.items);
  }
}

// Create singleton instance
export const workingListStore = new WorkingListStore();

// Utility functions for working with working lists
export const workingListUtils = {
  /**
   * Create a working list from SAM opportunity
   */
  async createOpportunityList(opportunity: any, userId: string): Promise<WorkingList> {
    const list = await workingListStore.createList({
      name: `Opportunity: ${opportunity.title}`,
      description: `Working list for ${opportunity.title}`,
      items: [],
      tags: ['opportunity', opportunity.naicsCode, opportunity.type].filter(Boolean),
      isPublic: false,
      createdBy: userId,
    });

    // Add the opportunity as the first item
    await workingListStore.addItemToList(list.id, {
      type: 'opportunity',
      itemId: opportunity.id,
      title: opportunity.title,
      description: opportunity.synopsis,
      status: 'active',
      priority: 'medium',
      tags: [opportunity.naicsCode, opportunity.type].filter(Boolean),
      notes: [`Added from SAM.gov search on ${new Date().toLocaleDateString()}`],
      metadata: { opportunity },
    });

    return list;
  },

  /**
   * Add SAM opportunity to existing list
   */
  async addOpportunityToList(listId: string, opportunity: any): Promise<WorkingListItem | null> {
    return workingListStore.addItemToList(listId, {
      type: 'opportunity',
      itemId: opportunity.id,
      title: opportunity.title,
      description: opportunity.synopsis,
      status: 'active',
      priority: 'medium',
      tags: [opportunity.naicsCode, opportunity.type].filter(Boolean),
      notes: [`Added from SAM.gov search on ${new Date().toLocaleDateString()}`],
      metadata: { opportunity },
    });
  },

  /**
   * Create a note item
   */
  async createNote(listId: string, title: string, content: string, userId: string): Promise<WorkingListItem | null> {
    return workingListStore.addItemToList(listId, {
      type: 'note',
      itemId: generateId(),
      title,
      description: content,
      status: 'active',
      priority: 'low',
      tags: ['note'],
      notes: [content],
      metadata: { createdBy: userId },
    });
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string): Promise<{
    totalLists: number;
    activeItems: number;
    overdueItems: number;
    dueSoonItems: number;
    recentActivity: WorkingListItem[];
  }> {
    const userLists = await workingListStore.getListsByUser(userId);
    const allItems = await Promise.all(
      userLists.map(list => workingListStore.getListItems(list.id))
    );
    const items = allItems.flat();

    const activeItems = items.filter(item => item.status === 'active').length;
    const overdueItems = (await workingListStore.getOverdueItems()).length;
    const dueSoonItems = (await workingListStore.getItemsDueSoon(7)).length;
    const recentActivity = items
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);

    return {
      totalLists: userLists.length,
      activeItems,
      overdueItems,
      dueSoonItems,
      recentActivity,
    };
  },
}; 