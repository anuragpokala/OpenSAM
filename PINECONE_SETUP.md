# Pinecone Setup Guide for OpenSAM AI

## 🎯 Overview

This guide will help you connect OpenSAM AI to your Pinecone index at:
`https://open-sam-1-jmmui61.svc.aped-4627-b74a.pinecone.io`

## 📊 Index Details

- **Index Name**: `open-sam-1`
- **Environment**: `aped-4627-b74a`
- **Dimension**: 1536 (OpenAI text-embedding-3-small)
- **Metric**: Cosine similarity

## 🔧 Configuration Steps

### 1. Get Your Pinecone API Key

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Navigate to API Keys section
3. Copy your API key

### 2. Update Environment Variables

Add these to your `.env` file:

```bash
# Vector Store Configuration
VECTOR_STORE_PROVIDER=pinecone
PINECONE_API_KEY=your_actual_pinecone_api_key_here
VECTOR_STORE_ENVIRONMENT=aped-4627-b74a
VECTOR_STORE_PROJECT_ID=your_pinecone_project_id_here
```

### 3. Test the Connection

Run the test script:
```bash
node test-pinecone-connection.js
```

Or test via API:
```bash
curl http://localhost:3001/api/test-pinecone
```

## 🧪 Testing the Connection

### Option 1: Node.js Test Script
```bash
# Set your API key
export PINECONE_API_KEY=your_actual_api_key

# Run the test
node test-pinecone-connection.js
```

### Option 2: API Endpoint
Visit: `http://localhost:3001/api/test-pinecone`

### Option 3: Browser Test
Open your browser and navigate to:
`http://localhost:3001/api/test-pinecone`

## 🔍 Expected Results

If successful, you should see:
```json
{
  "success": true,
  "message": "Pinecone connection successful",
  "config": {
    "indexName": "open-sam-1",
    "environment": "aped-4627-b74a",
    "dimension": 1536,
    "metric": "cosine",
    "status": "Ready"
  },
  "testResults": {
    "querySuccessful": true,
    "totalResults": 0,
    "sampleResults": []
  }
}
```

## 🚀 Enable Vector Features

Once connected, the following features will work:

1. **Company Profile Matching** - Calculate match scores between companies and opportunities
2. **Semantic Search** - Find opportunities using natural language queries
3. **Vector Storage** - Store and retrieve company profiles and opportunities as vectors
4. **Similarity Calculations** - Compare opportunities and company profiles

## 🔧 Troubleshooting

### API Key Issues
- Make sure `PINECONE_API_KEY` is set correctly
- Verify the API key is active in Pinecone console

### Index Not Found
- Check if the index name `open-sam-1` exists in your Pinecone project
- Verify the environment `aped-4627-b74a` is correct

### Connection Errors
- Check your internet connection
- Verify Pinecone service status
- Ensure the index is in "Ready" state

## 📝 Next Steps

After successful connection:

1. **Restart the development server** to pick up new environment variables
2. **Test the calculating score feature** in the search interface
3. **Upload company profiles** to see vector matching in action
4. **Try semantic search** with natural language queries

## 🎉 Success!

Once connected, you'll have full access to:
- ✅ Vector-based company matching
- ✅ Semantic opportunity search
- ✅ AI-powered similarity calculations
- ✅ Advanced search capabilities 