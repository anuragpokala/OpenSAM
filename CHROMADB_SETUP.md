# ChromaDB Local Setup Guide

This guide helps you set up ChromaDB as the local vector store for OpenSAM AI Dashboard.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
npm run setup:chromadb

# Test the connection
npm run test:chromadb
```

### Option 2: Manual Setup

#### Using Docker (Recommended)

```bash
# Start ChromaDB with Docker
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  -v chromadb_data:/chroma/chroma \
  chromadb/chroma:latest

# Check if it's running
docker ps | grep chromadb

# Stop ChromaDB (when needed)
docker stop chromadb

# Remove ChromaDB (when needed)
docker rm chromadb
```

#### Using pip (Alternative)

```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

## 🔧 Configuration

Make sure your `.env.local` file has the correct ChromaDB configuration:

```env
# Vector Store Configuration
VECTOR_STORE_PROVIDER=chroma
VECTOR_STORE_URL=http://localhost:8000
```

## 🧪 Testing

Test your ChromaDB setup:

```bash
npm run test:chromadb
```

This will:
- ✅ Test connection to ChromaDB
- ✅ Create a test collection
- ✅ Insert test vectors
- ✅ Perform a vector search
- ✅ Clean up test data

## 📊 ChromaDB Dashboard

Once ChromaDB is running, you can access the web dashboard at:
- **URL**: http://localhost:8000
- **API Endpoint**: http://localhost:8000/api/v1

## 🔍 Troubleshooting

### Connection Issues

1. **Port 8000 already in use**
   ```bash
   # Check what's using port 8000
   lsof -i :8000
   
   # Kill the process or use a different port
   ```

2. **Docker not running**
   ```bash
   # Start Docker Desktop
   # Then run the setup script again
   npm run setup:chromadb
   ```

3. **Permission denied**
   ```bash
   # Make the setup script executable
   chmod +x setup-chromadb.sh
   ```

### Performance Issues

1. **Increase memory for Docker**
   ```bash
   docker run -d \
     --name chromadb \
     -p 8000:8000 \
     -v chromadb_data:/chroma/chroma \
     -e CHROMA_SERVER_HOST=0.0.0.0 \
     -e CHROMA_SERVER_HTTP_PORT=8000 \
     chromadb/chroma:latest
   ```

2. **Persistent storage**
   ```bash
   # Create a named volume for data persistence
   docker volume create chromadb_data
   ```

## 🎯 Integration with OpenSAM AI

Once ChromaDB is running:

1. **Start your Next.js app**
   ```bash
   npm run dev
   ```

2. **ChromaDB will automatically be used for:**
   - Storing document embeddings
   - Semantic search functionality
   - AI chat context retrieval
   - Vector similarity searches

3. **Collections created automatically:**
   - `sam_opportunities` - SAM.gov contract data
   - `uploaded_documents` - User uploaded files
   - `chat_history` - Conversation embeddings

## 📈 Monitoring

Monitor ChromaDB performance:

```bash
# Check container logs
docker logs chromadb

# Check resource usage
docker stats chromadb

# List collections
curl http://localhost:8000/api/v1/collections
```

## 🔄 Switching Environments

To switch between local (ChromaDB) and production (Pinecone):

```env
# Local Development
VECTOR_STORE_PROVIDER=chroma
VECTOR_STORE_URL=http://localhost:8000

# Production
VECTOR_STORE_PROVIDER=pinecone
VECTOR_STORE_API_KEY=your_pinecone_key
VECTOR_STORE_ENVIRONMENT=us-east-1-aws
VECTOR_STORE_PROJECT_ID=your_project_id
```

The application will automatically use the appropriate vector store based on your configuration. 