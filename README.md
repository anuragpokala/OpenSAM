# OpenSAM AI Dashboard

> **The slickest black-and-white government contracting data dashboard on the planet.**
> 
> Discover, search, and forecast government contract opportunities with AI. Built for the future of public sector innovation.

[opensamai.com](https://opensamai.com)

---

## 🚨 Disclaimer
**OpenSAM AI is an independent open-source project and is _not affiliated with, endorsed by, or connected to SAM.gov, the U.S. General Services Administration, or any government agency in any way whatsoever_.**

---

## ✨ Why OpenSAM AI?

- **Lightning-fast semantic search** for SAM.gov opportunities
- **AI-powered chat** with multi-LLM support (OpenAI, Anthropic, Hugging Face)
- **Market forecasting** and interactive analytics
- **Document upload & RAG**: bring your own past performance docs
- **Monochrome, accessible design**: beautiful, high-contrast, and mobile-first
- **Open, hackable, and community-driven**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys (OpenAI, Anthropic, or Hugging Face)
- SAM.gov API key (for real data)

### Installation
```bash
git clone https://github.com/your-org/opensam-ai-dashboard.git
cd opensam-ai-dashboard
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## 🔧 Setup & Configuration

### 📋 Quick Setup Guides
- **[Environment Configuration](env.example)** - Copy to `.env.local` and add your API keys
- **[ChromaDB Local Setup](CHROMADB_SETUP.md)** - Vector database for local development
- **[API Keys Setup](test-api-keys.js)** - Test your API keys are working
- **[SAM.gov API Test](test-sam-api.js)** - Verify SAM.gov API connectivity

### 🛠️ Local Development Tools
```bash
# Setup ChromaDB (vector database)
npm run setup:chromadb

# Test ChromaDB connection
npm run test:chromadb

# Test API keys
node test-api-keys.js

# Test SAM.gov API
node test-sam-api.js
```

### 🔄 Environment Switching
The app automatically switches between local and production environments:

**Local Development:**
- Cache: Redis (localhost:6379)
- Vector Store: ChromaDB (localhost:8000)

**Production:**
- Cache: Upstash Redis
- Vector Store: Pinecone

See [Environment Configuration](env.example) for all available options.

---

## 🏗️ Project Structure

```
opensam-ai-dashboard/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── globals.css         # Global styles with black/white theme
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── page.tsx            # Main dashboard page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── button.tsx      # Customized button component
│   │   │   ├── card.tsx        # Card layouts
│   │   │   ├── input.tsx       # Form inputs
│   │   │   └── select.tsx      # Dropdown selects
│   │   ├── chat/               # Chat interface components
│   │   ├── search/             # Search functionality
│   │   ├── upload/             # File upload handling
│   │   └── charts/             # Recharts visualizations
│   ├── pages/api/              # API routes
│   │   ├── chat.ts             # LLM provider integration
│   │   └── sam-search.ts       # SAM.gov search with embeddings
│   ├── stores/                 # Zustand state management
│   │   └── appStore.ts         # Main application store
│   ├── lib/                    # Utility libraries
│   │   └── utils.ts            # Helper functions
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts            # All application types
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Additional utilities
├── tests/                      # Test suites
│   ├── unit/                   # Jest unit tests
│   └── e2e/                    # Playwright end-to-end tests
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind configuration
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🔧 Configuration

### LLM Provider Setup

#### OpenAI
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to environment: `OPENAI_API_KEY=sk-...`

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Add to environment: `ANTHROPIC_API_KEY=sk-ant-...`

#### Hugging Face
1. Visit [Hugging Face Tokens](https://huggingface.co/settings/tokens)
2. Create a new token with inference permissions
3. Add to environment: `HUGGINGFACE_API_KEY=hf_...`

### SAM.gov API Access

1. **Register at SAM.gov**
   - Visit [SAM.gov](https://sam.gov/content/entity-registration)
   - Create a free account

2. **Request API Access**
   - Navigate to the API section
   - Request access to the Opportunities API
   - Wait for approval (usually 1-2 business days)

3. **Configure API Key**
   - Add your SAM API key to `.env.local`
   - Set appropriate rate limits in configuration

### Adapter Architecture

OpenSAM AI uses a flexible adapter pattern that allows easy switching between local and production environments:

#### Cache Adapters
- **Local Development**: Redis server
- **Production**: Upstash Redis (Netlify-compatible)

#### Vector Store Adapters
- **Local Development**: ChromaDB
- **Production**: Pinecone

#### Environment Configuration

The application automatically detects the environment and uses appropriate adapters:

```env
# Cache Configuration
CACHE_PROVIDER=redis          # 'redis' (local) or 'upstash' (production)
CACHE_URL=redis://localhost:6379
CACHE_PASSWORD=your_password

# Vector Store Configuration  
VECTOR_STORE_PROVIDER=chroma  # 'chroma' (local) or 'pinecone' (production)
VECTOR_STORE_URL=http://localhost:8000
VECTOR_STORE_API_KEY=your_pinecone_key
VECTOR_STORE_ENVIRONMENT=us-east-1-aws
```

### Local Development Setup

#### 1. Redis Cache (Local)
```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Start Redis
redis-server --daemonize yes

# Test connection
redis-cli ping  # Should return PONG
```

#### 2. ChromaDB Vector Store (Local)
```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000

# Or use Docker
docker run -p 8000:8000 chromadb/chroma
```

### Production Setup (Netlify)

#### 1. Upstash Redis
1. Create account at [upstash.com](https://upstash.com/)
2. Create a Redis database
3. Copy the REST URL and token to environment variables:
   ```env
   CACHE_PROVIDER=upstash
   CACHE_URL=https://your-instance.upstash.io
   CACHE_PASSWORD=your_token
   ```

#### 2. Pinecone Vector Database
1. Create account at [pinecone.io](https://pinecone.io/)
2. Create a new project and index
3. Copy credentials to environment variables:
   ```env
   VECTOR_STORE_PROVIDER=pinecone
   VECTOR_STORE_API_KEY=your_api_key
   VECTOR_STORE_ENVIRONMENT=us-east-1-aws
   VECTOR_STORE_PROJECT_ID=your_project_id
   ```

### Cache Management

- **Monitor Cache**: Use the Settings panel to view cache statistics
- **Clear Cache**: Clear specific prefixes or all cache data
- **TTL Settings**: 
  - SAM Search results: 30 minutes
  - Entity data: 1 hour
  - Automatic expiration based on usage patterns

## 🎯 Usage Guide

### Chat Interface

1. **Select LLM Provider**: Choose from OpenAI, Anthropic, or Hugging Face
2. **Configure API Key**: Click "Set API Key" in the sidebar
3. **Start Chatting**: Ask questions about government contracting
   - "Find me recent AI contracts over $1M"
   - "What are the trending NAICS codes this quarter?"
   - "Explain the differences between set-aside programs"

### Semantic Search

1. **Natural Language Queries**: Use conversational search terms
   - ✅ "Cybersecurity contracts for small businesses"
   - ✅ "Cloud infrastructure opportunities in Virginia"
   - ❌ "cyber AND security OR cloud"

2. **Apply Filters**: Refine results with:
   - Date ranges
   - Geographic locations
   - NAICS codes
   - Set-aside types
   - Contract values

3. **Save Favorites**: Star important opportunities for later review

### Document Upload

1. **Supported Formats**: PDF, CSV, TXT files up to 10MB
2. **Processing**: Files are automatically:
   - Text extracted and cleaned
   - Converted to embeddings
   - Indexed for semantic search
3. **Chat Integration**: Reference uploaded documents in conversations

### Forecasting

1. **Historical Analysis**: Review past 12 months of opportunities
2. **Trend Visualization**: Interactive charts showing:
   - Volume trends by month
   - Agency distribution
   - NAICS code patterns
3. **Predictive Insights**: AI-generated forecasts based on historical data

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### End-to-End Tests
```bash
# Install Playwright browsers
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui
```

### Test Coverage Goals
- **Unit Tests**: >90% coverage for utilities and components
- **Integration Tests**: API endpoints and state management
- **E2E Tests**: Critical user journeys and provider switching

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   - Add all `.env.local` variables in Vercel dashboard
   - Ensure API keys are properly configured

3. **Domain Configuration**
   - Set up custom domain in Vercel settings
   - Update `NEXT_PUBLIC_APP_URL` to production URL

### Netlify

1. **Build Settings**
   ```toml
   [build]
   command = "npm run build"
   publish = "out"
   ```

2. **Environment Variables**
   - Configure in Netlify dashboard
   - Enable environment variable inheritance

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/out ./out
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

## ⚡ Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check performance metrics
npm run lighthouse
```

### Optimization Techniques
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js Image component with WebP
- **Caching**: API response caching with TTL
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip/Brotli compression for static assets

### Performance Targets
- **Lighthouse Score**: ≥95 for Performance, Accessibility, Best Practices
- **Bundle Size**: ≤1MB initial JavaScript load
- **First Contentful Paint**: ≤1.5s
- **Largest Contentful Paint**: ≤2.5s

## 🔒 Security

### Data Protection
- **API Key Encryption**: Client-side encryption using Web Crypto API
- **No Server Storage**: API keys never stored on server
- **Rate Limiting**: Built-in rate limiting for all endpoints
- **CORS Protection**: Strict origin validation

### Best Practices
- **Content Security Policy**: Prevents XSS attacks
- **HTTPS Only**: Force secure connections in production
- **Input Validation**: Comprehensive request validation
- **Error Handling**: No sensitive data in error messages

## 🤝 Get Involved! 🚀

OpenSAM AI is built by and for the community. We want YOU to get involved—whether you're a developer, designer, data nerd, policy wonk, or just passionate about open government and AI.

- **Fork, hack, and PR your ideas** — see [CONTRIBUTING.md](CONTRIBUTING.md)
- **Share feedback, feature requests, or bug reports**
- **Collaborate on new features, integrations, or research**
- **Help us make government data more accessible and useful for everyone!**

### Connect with Akshay (Project Lead)
- **LinkedIn:** [akshayakula](https://www.linkedin.com/in/akshayakula/)
- **X (Twitter):** [@akshay_akula](https://x.com/akshay_akula)
- **Instagram:** [@akshayakula](https://instagram.com/akshayakula)

**DMs are open! No email, no cap. If you want to get involved, reach out on any of the above.**

---

## 🆘 Support & Community
- [Website](https://opensamai.com)
- [Docs](https://opensamai.com/docs)
- [Discord](https://discord.gg/opensam-ai)
- [Issue Tracker](https://github.com/your-org/opensam-ai-dashboard/issues)

---

## FAQ

**Q: Can I use this without SAM.gov API access?**
A: Yes, mock data is included for dev. For real data, get a SAM.gov API key.

**Q: Which LLM provider is best?**
A: OpenAI GPT-4 is top for gov contracting, Anthropic Claude is great for document analysis.

**Q: Is my API key secure?**
A: Yes, keys are encrypted client-side and never sent to our servers.

**Q: Can I customize the color scheme?**
A: The app is designed for black-and-white accessibility. Customization would require CSS changes.

---

<div align="center">
Built with ❤️ for the government contracting and AI community — [opensamai.com](https://opensamai.com)
</div>
