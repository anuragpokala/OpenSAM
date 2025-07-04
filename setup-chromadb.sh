#!/bin/bash

# OpenSAM AI - ChromaDB Local Setup Script
# This script helps you set up ChromaDB for local development

echo "🚀 Setting up ChromaDB for OpenSAM AI Dashboard..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker found. Using Docker to run ChromaDB..."
    
    # Check if ChromaDB container is already running
    if docker ps | grep -q chromadb; then
        echo "✅ ChromaDB is already running!"
        echo "   Access ChromaDB at: http://localhost:8000"
        echo "   API endpoint: http://localhost:8000/api/v1"
    else
        echo "📦 Starting ChromaDB with Docker..."
        docker run -d \
            --name chromadb \
            -p 8000:8000 \
            -v chromadb_data:/chroma/chroma \
            chromadb/chroma:latest
        
        echo "✅ ChromaDB started successfully!"
        echo "   Access ChromaDB at: http://localhost:8000"
        echo "   API endpoint: http://localhost:8000/api/v1"
        echo ""
        echo "To stop ChromaDB: docker stop chromadb"
        echo "To remove ChromaDB: docker rm chromadb"
    fi
else
    echo "❌ Docker not found. Please install Docker first:"
    echo "   macOS: brew install docker"
    echo "   Ubuntu: sudo apt-get install docker.io"
    echo "   Windows: https://docs.docker.com/desktop/install/windows/"
    echo ""
    echo "Alternatively, you can install ChromaDB with pip:"
    echo "   pip install chromadb"
    echo "   chroma run --host localhost --port 8000"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Make sure your .env.local has:"
echo "   VECTOR_STORE_PROVIDER=chroma"
echo "   VECTOR_STORE_URL=http://localhost:8000"
echo ""
echo "2. Start your Next.js app:"
echo "   npm run dev"
echo ""
echo "3. ChromaDB will be automatically used for vector storage!" 