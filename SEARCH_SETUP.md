# OpenSAM AI Search Setup Guide

## Why Search Isn't Working

The search functionality requires API keys to be configured. If you're seeing "No search results yet" or search isn't working, it's likely because the required API keys are not set up.

## Required API Keys

### 1. SAM.gov API Key (Required for Search)
- **Purpose**: Fetches government contracting opportunities from SAM.gov
- **How to get**: Visit https://api.sam.gov/ and register for an API key
- **Environment variable**: `NEXT_PUBLIC_SAM_API_KEY`

### 2. OpenAI API Key (Required for AI Features)
- **Purpose**: Powers the AI chat and semantic search features
- **How to get**: Visit https://platform.openai.com/api-keys
- **Environment variable**: `NEXT_PUBLIC_OPENAI_API_KEY`

## Setup Instructions

### Step 1: Create Environment File
Create a `.env.local` file in the root directory of the project:

```bash
# Copy the example file
cp env.example .env.local
```

### Step 2: Add Your API Keys
Edit `.env.local` and add your actual API keys:

```env
# SAM.gov API Key (Required for search)
NEXT_PUBLIC_SAM_API_KEY=your_actual_sam_api_key_here

# OpenAI API Key (Required for AI features)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

### Step 3: Restart Development Server
After adding the API keys, restart your development server:

```bash
npm run dev
```

## Testing Your Setup

### Test SAM.gov API Key
Run the SAM.gov API test:

```bash
node test-sam-api.js
```

### Test OpenAI API Key
Run the API key test:

```bash
node test-api-keys.js --openai sk-your_openai_api_key_here
```

## Troubleshooting

### Common Issues

1. **"SAM.gov API key is not configured"**
   - Make sure you've created `.env.local` file
   - Verify the API key is correctly set
   - Restart the development server

2. **"Search failed: Invalid API key"**
   - Check that your SAM.gov API key is valid
   - Ensure you have the correct permissions on your SAM.gov account

3. **"Search failed: Rate limit exceeded"**
   - SAM.gov has rate limits. Wait a few minutes and try again
   - Consider upgrading your SAM.gov API plan

4. **No search results**
   - Try different search terms
   - Check if there are active opportunities matching your criteria
   - Verify your search query format

### Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Verify your API keys are working with the test scripts
3. Ensure your SAM.gov account has the necessary permissions
4. Check the SAM.gov API documentation for any changes

## Alternative API Providers

If you prefer not to use OpenAI, you can also configure:

- **Anthropic Claude**: Set `NEXT_PUBLIC_ANTHROPIC_API_KEY`
- **Hugging Face**: Set `NEXT_PUBLIC_HUGGINGFACE_API_KEY`

Then select your preferred provider in the sidebar of the application. 