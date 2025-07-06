# ChromaDB Vector Store Integration

This document describes the ChromaDB vector store integration for the OpenSAM AI Dashboard, enabling semantic search and opportunity matching.

## 🏗️ Architecture

The vector store integration consists of several key components:

### 1. Embedding Service (`src/lib/embed.ts`)
- **Purpose**: Generates vector embeddings for text using OpenAI's `text-embedding-3-small`
- **Features**: 
  - Caching for performance
  - Fallback to simple hash-based vectors
  - Configurable providers (OpenAI, local)
- **Usage**:
  ```typescript
  import { getEmbeddingService } from '@/lib/embed';
  
  const embeddingService = getEmbeddingService();
  const embedding = await embeddingService.getEmbedding('AI software development');
  ```

### 2. Vector Store Utils (`src/lib/vectorStore.ts`)
- **Purpose**: High-level interface for vector store operations
- **Features**:
  - Opportunity vectorization and storage
  - Company profile vectorization and storage
  - Similarity search and matching
  - Collection management
- **Usage**:
  ```typescript
  import { vectorStoreUtils } from '@/lib/vectorStore';
  
  // Add opportunity to vector store
  await vectorStoreUtils.addOpportunity(opportunity);
  
  // Add company profile to vector store
  await vectorStoreUtils.addCompanyProfile(companyProfile);
  
  // Find matching opportunities
  const matches = await vectorStoreUtils.findMatchingOpportunities(companyProfile);
  ```

### 3. ChromaDB Adapter (`src/lib/adapters/chroma-vector.ts`)
- **Purpose**: Low-level ChromaDB integration
- **Features**:
  - Browser and server-side support
  - CORS handling via Next.js proxy
  - Collection management
  - Vector operations (upsert, query, delete)

### 4. Match API (`src/app/api/match/route.ts`)
- **Purpose**: REST API for opportunity matching
- **Endpoints**:
  - `GET /api/match?company_id=xxx&limit=5` - Find matching opportunities
  - `POST /api/match` - Add company profile to vector store
- **Usage**:
  ```bash
  # Find opportunities matching company profile
  curl "http://localhost:3000/api/match?company_id=test-company-1&limit=5"
  
  # Add company profile to vector store
  curl -X POST "http://localhost:3000/api/match" \
    -H "Content-Type: application/json" \
    -d '{"companyProfile": {...}}'
  ```

### 5. Chat RAG Integration (`src/lib/chat-rag.ts`)
- **Purpose**: Integrates vector search with chat functionality
- **Features**:
  - RAG prompt building
  - Opportunity matching for chat context
  - Company profile formatting
  - Fit analysis
- **Usage**:
  ```typescript
  import { chatWithRAG } from '@/lib/chat-rag';
  
  const result = await chatWithRAG(
    userMessage,
    companyProfile,
    llmFunction
  );
  ```

## 🚀 Setup

### 1. Environment Variables
Add the following to your `.env.local`:

```bash
# OpenAI API Key for embeddings
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Vector Store Configuration
VECTOR_STORE_PROVIDER=chroma
VECTOR_STORE_URL=http://localhost:8000

# ChromaDB Configuration (for local development)
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
```

### 2. Start ChromaDB
```bash
# Using Docker
docker run -p 8000:8000 chromadb/chroma

# Or using the setup script
npm run setup:chromadb
```

### 3. Install Dependencies
```bash
npm install
```

## 📊 Usage

### 1. Ingest Opportunities
```bash
# Run the ingestion script
npm run ingest:vectors

# Or use the API
curl -X POST "http://localhost:3000/api/vector-search" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "opportunity",
    "content": "AI software development services...",
    "metadata": {
      "title": "AI Software Development",
      "naicsCode": "541511"
    }
  }'
```

### 2. Add Company Profile
```bash
# Via API
curl -X POST "http://localhost:3000/api/match" \
  -H "Content-Type: application/json" \
  -d '{
    "companyProfile": {
      "id": "company-1",
      "entityName": "TechCorp Solutions",
      "description": "AI and cybersecurity solutions...",
      "naicsCodes": ["541511", "541519"],
      "capabilities": ["AI Development", "Cybersecurity"]
    }
  }'
```

### 3. Find Matching Opportunities
```bash
# Via API
curl "http://localhost:3000/api/match?company_id=company-1&limit=5"

# Via JavaScript
const response = await fetch('/api/match?company_id=company-1&limit=5');
const matches = await response.json();
```

### 4. Chat with RAG
```typescript
import { chatWithRAG } from '@/lib/chat-rag';

const result = await chatWithRAG(
  "What opportunities are best for my AI company?",
  companyProfile,
  async (systemPrompt, userPrompt) => {
    // Your LLM function here
    return llmResponse;
  }
);

console.log(result.response);
console.log(result.opportunities);
```

## 🧪 Testing

### Run Unit Tests
```bash
# Run vector store tests
npm run test:vectors

# Run all tests
npm test
```

### Test ChromaDB Connection
```bash
npm run test:chromadb
```

## 📈 Collections

The vector store uses the following collections:

1. **`sam_opportunities`** - SAM.gov opportunities
   - Type: `opportunity`
   - Metadata: title, synopsis, naicsCode, state, city, setAside, etc.

2. **`company_profiles`** - Company profiles
   - Type: `entity`
   - Metadata: entityName, naicsCodes, capabilities, businessTypes, etc.

3. **`documents`** - General documents
   - Type: `document`
   - Metadata: title, description, tags, source, etc.

## 🔧 Configuration

### Embedding Configuration
```typescript
const embeddingConfig = {
  provider: 'openai', // 'openai' | 'local'
  apiKey: 'your-api-key',
  model: 'text-embedding-3-small'
};
```

### Vector Store Configuration
```typescript
const vectorStoreConfig = {
  provider: 'chroma', // 'chroma' | 'pinecone'
  url: 'http://localhost:8000'
};
```

## 🚨 Troubleshooting

### Common Issues

1. **ChromaDB Connection Failed**
   - Ensure ChromaDB is running: `docker ps | grep chroma`
   - Check port 8000 is available
   - Verify CORS settings for browser access

2. **Embedding Generation Failed**
   - Check OpenAI API key is valid
   - Verify API quota and rate limits
   - Check network connectivity

3. **Vector Search Returns No Results**
   - Ensure opportunities are ingested
   - Check collection names match
   - Verify embedding dimensions are consistent

### Debug Commands
```bash
# Check vector store status
curl "http://localhost:3000/api/vector-store"

# List collections
curl "http://localhost:3000/api/vector-store?action=collections"

# Test embedding generation
curl -X POST "http://localhost:3000/api/vector-search" \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "content": "test content"}'
```

## 📚 API Reference

### Vector Store Utils

#### `addOpportunity(opportunity, embeddingConfig?)`
Adds a SAM.gov opportunity to the vector store.

#### `addCompanyProfile(profile, embeddingConfig?)`
Adds a company profile to the vector store.

#### `findMatchingOpportunities(profile, limit?)`
Finds opportunities matching a company profile.

#### `searchVectors(queryVector, collection, topK, filter?)`
Searches for similar vectors in a collection.

### Embedding Service

#### `getEmbedding(text)`
Generates embedding for text using configured provider.

#### `clearCache()`
Clears the embedding cache.

### Chat RAG

#### `buildRAGPrompt(userQuestion, companyProfile, opportunities)`
Builds a RAG prompt with company profile and opportunities.

#### `chatWithRAG(userMessage, companyProfile, llmFunction)`
Enhanced chat function with RAG integration.

## 🔮 Future Enhancements

1. **Local Embedding Models**
   - Instructor embeddings
   - SentenceTransformers
   - ONNX runtime support

2. **Advanced Matching**
   - Multi-modal embeddings
   - Temporal relevance
   - Geographic distance calculation

3. **Performance Optimizations**
   - Batch processing
   - Async ingestion
   - Vector quantization

4. **Analytics**
   - Search analytics
   - Match quality metrics
   - User behavior tracking 