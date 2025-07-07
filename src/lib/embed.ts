/**
 * Embedding service for generating vector representations of text
 * Uses OpenAI text-embedding-3-small with fallback to local alternatives
 */

export interface EmbeddingConfig {
  provider: 'openai' | 'local';
  apiKey?: string;
  model?: string;
}

export class EmbeddingService {
  private config: EmbeddingConfig;
  private cache = new Map<string, number[]>();

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  /**
   * Get embedding for text using configured provider
   */
  async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = `${text}:${this.config.provider}:${this.config.model}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let embedding: number[];

    try {
      if (this.config.provider === 'openai') {
        embedding = await this.getOpenAIEmbedding(text);
      } else {
        embedding = await this.getLocalEmbedding(text);
      }

      // Cache the result
      this.cache.set(cacheKey, embedding);
      
      // Clean cache if it gets too large
      if (this.cache.size > 1000) {
        const entries = Array.from(this.cache.entries());
        this.cache.clear();
        // Keep last 500 entries
        entries.slice(-500).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }

      return embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Fallback to simple hash-based vector
      return this.getSimpleVector(text);
    }
  }

  /**
   * Generate embedding using OpenAI API
   */
  private async getOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key required for embeddings');
    }

    console.log('🔍 OpenAI embedding request:', {
      textLength: text.length,
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    });

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: this.config.model || 'text-embedding-3-small',
        }),
      });

      console.log('🔍 OpenAI response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ OpenAI API error:', error);
        throw new Error(`OpenAI Embeddings API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI embedding generated successfully');
      return data.data[0].embedding;
    } catch (error) {
      console.error('❌ OpenAI embedding failed:', error);
      throw error;
    }
  }

  /**
   * Generate embedding using local model (placeholder for future implementation)
   */
  private async getLocalEmbedding(text: string): Promise<number[]> {
    // TODO: Implement local embedding model (e.g., Instructor, SentenceTransformers)
    // For now, fall back to simple vector
    console.warn('Local embedding not implemented, using simple vector fallback');
    return this.getSimpleVector(text);
  }

  /**
   * Generate simple hash-based vector as fallback
   */
  private getSimpleVector(text: string): number[] {
    // Simple hash-based vector generation (placeholder)
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate a 1536-dimensional vector based on the hash
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < 1536; i++) {
      vector[i] = Math.sin(hash + i) * 0.1; // Simple deterministic "random" values
    }
    
    return vector;
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return { size: this.cache.size };
  }
}

// Default embedding service instance
let defaultEmbeddingService: EmbeddingService | null = null;

export function getEmbeddingService(config?: EmbeddingConfig): EmbeddingService {
  if (!defaultEmbeddingService) {
    const defaultConfig: EmbeddingConfig = {
      provider: 'openai',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small'
    };
    
    console.log('🔍 Embedding service config:', {
      provider: defaultConfig.provider,
      model: defaultConfig.model,
      hasApiKey: !!defaultConfig.apiKey,
      apiKeyLength: defaultConfig.apiKey?.length || 0
    });
    
    defaultEmbeddingService = new EmbeddingService(config || defaultConfig);
  }
  return defaultEmbeddingService;
}

// Convenience function for getting embeddings
export async function getEmbedding(text: string, config?: EmbeddingConfig): Promise<number[]> {
  const service = getEmbeddingService(config);
  return service.getEmbedding(text);
} 