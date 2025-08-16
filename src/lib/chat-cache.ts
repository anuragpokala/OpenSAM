import { CompanyProfile, SAMOpportunity } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ChatCacheEntry {
  response: string;
  ragContext: any;
  opportunities: Array<{ opportunity: SAMOpportunity; score: number }>;
}

interface VectorSearchCacheEntry {
  results: Array<{ opportunity: SAMOpportunity; score: number }>;
  queryHash: string;
}

class ChatCache {
  private chatCache = new Map<string, CacheEntry<ChatCacheEntry>>();
  private vectorCache = new Map<string, CacheEntry<VectorSearchCacheEntry>>();
  private embeddingCache = new Map<string, CacheEntry<number[]>>();
  
  // Cache TTLs (in milliseconds)
  private readonly CHAT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly VECTOR_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly EMBEDDING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate cache key for chat responses
   */
  private generateChatKey(
    messages: any[],
    companyProfileId: string,
    provider: string,
    model: string
  ): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const messageHash = this.hashString(lastMessage);
    return `chat:${companyProfileId}:${provider}:${model}:${messageHash}`;
  }

  /**
   * Generate cache key for vector searches
   */
  private generateVectorKey(
    query: string,
    companyProfileId: string,
    limit: number
  ): string {
    const queryHash = this.hashString(query);
    return `vector:${companyProfileId}:${queryHash}:${limit}`;
  }

  /**
   * Generate cache key for embeddings
   */
  private generateEmbeddingKey(text: string): string {
    return `embedding:${this.hashString(text)}`;
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Check if cache entry is still valid
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get cached chat response
   */
  getChatResponse(
    messages: any[],
    companyProfileId: string,
    provider: string,
    model: string
  ): ChatCacheEntry | null {
    const key = this.generateChatKey(messages, companyProfileId, provider, model);
    const entry = this.chatCache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      console.log('🎯 Chat cache hit:', key);
      return entry.data;
    }
    
    if (entry) {
      this.chatCache.delete(key);
    }
    
    return null;
  }

  /**
   * Cache chat response
   */
  setChatResponse(
    messages: any[],
    companyProfileId: string,
    provider: string,
    model: string,
    response: ChatCacheEntry
  ): void {
    const key = this.generateChatKey(messages, companyProfileId, provider, model);
    this.chatCache.set(key, {
      data: response,
      timestamp: Date.now(),
      ttl: this.CHAT_CACHE_TTL
    });
    console.log('💾 Cached chat response:', key);
  }

  /**
   * Get cached vector search results
   */
  getVectorSearch(
    query: string,
    companyProfileId: string,
    limit: number
  ): VectorSearchCacheEntry | null {
    const key = this.generateVectorKey(query, companyProfileId, limit);
    const entry = this.vectorCache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      console.log('🎯 Vector cache hit:', key);
      return entry.data;
    }
    
    if (entry) {
      this.vectorCache.delete(key);
    }
    
    return null;
  }

  /**
   * Cache vector search results
   */
  setVectorSearch(
    query: string,
    companyProfileId: string,
    limit: number,
    results: VectorSearchCacheEntry
  ): void {
    const key = this.generateVectorKey(query, companyProfileId, limit);
    this.vectorCache.set(key, {
      data: results,
      timestamp: Date.now(),
      ttl: this.VECTOR_CACHE_TTL
    });
    console.log('💾 Cached vector search:', key);
  }

  /**
   * Get cached embedding
   */
  getEmbedding(text: string): number[] | null {
    const key = this.generateEmbeddingKey(text);
    const entry = this.embeddingCache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      console.log('🎯 Embedding cache hit:', key.substring(0, 20) + '...');
      return entry.data;
    }
    
    if (entry) {
      this.embeddingCache.delete(key);
    }
    
    return null;
  }

  /**
   * Cache embedding
   */
  setEmbedding(text: string, embedding: number[]): void {
    const key = this.generateEmbeddingKey(text);
    this.embeddingCache.set(key, {
      data: embedding,
      timestamp: Date.now(),
      ttl: this.EMBEDDING_CACHE_TTL
    });
    console.log('💾 Cached embedding:', key.substring(0, 20) + '...');
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean chat cache
    for (const [key, entry] of this.chatCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.chatCache.delete(key);
      }
    }
    
    // Clean vector cache
    for (const [key, entry] of this.vectorCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.vectorCache.delete(key);
      }
    }
    
    // Clean embedding cache
    for (const [key, entry] of this.embeddingCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.embeddingCache.delete(key);
      }
    }
    
    console.log(`🧹 Cache cleanup: ${this.chatCache.size} chat, ${this.vectorCache.size} vector, ${this.embeddingCache.size} embedding entries`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    chatEntries: number;
    vectorEntries: number;
    embeddingEntries: number;
  } {
    return {
      chatEntries: this.chatCache.size,
      vectorEntries: this.vectorCache.size,
      embeddingEntries: this.embeddingCache.size
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.chatCache.clear();
    this.vectorCache.clear();
    this.embeddingCache.clear();
    console.log('🗑️ All caches cleared');
  }
}

// Export singleton instance
export const chatCache = new ChatCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  chatCache.cleanup();
}, 5 * 60 * 1000); 