# OpenSAM AI 🚀

> **The slickest black-and-white government contracting data dashboard on the planet.**
> 
> Discover, search, and forecast government contract opportunities with AI. Built for the future of public sector innovation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[🌐 Live Demo](https://opensamai.com) (Coming Soon) • [🐛 Report Bug](https://github.com/akshayakula/OpenSAM/issues) • [💡 Request Feature](https://github.com/akshayakula/OpenSAM/issues)

---

## 🚨 Disclaimer

**OpenSAM AI is an independent open-source project and is _not affiliated with, endorsed by, or connected to SAM.gov, the U.S. General Services Administration, or any government agency in any way whatsoever_.**

---

## ✨ Features

- 🔍 **Lightning-fast semantic search** for SAM.gov opportunities
- 🤖 **AI-powered chat** with multi-LLM support (OpenAI, Anthropic, Hugging Face)
- 📊 **Market forecasting** and interactive analytics
- 📄 **Document upload & RAG**: bring your own past performance docs
- 🎨 **Monochrome, accessible design**: beautiful, high-contrast, and mobile-first
- 🔧 **Open, hackable, and community-driven**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys (OpenAI, Anthropic, or Hugging Face)
- SAM.gov API key (for real data)

### Installation

```bash
# Clone the repository
git clone https://github.com/akshayakula/OpenSAM.git
cd OpenSAM

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action!

---

## 🛠️ Development Setup

### Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# LLM Provider API Keys (choose one or more)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...

# SAM.gov API (optional for development)
SAM_API_KEY=your_sam_api_key

# Vector Store (local development)
CHROMADB_URL=http://localhost:8000

# Cache (local development)
REDIS_URL=redis://localhost:6379
```

### Local Services Setup

#### ChromaDB (Vector Database)

```bash
# Option 1: Using pip
pip install chromadb
chroma run --host localhost --port 8000

# Option 2: Using Docker
docker run -p 8000:8000 chromadb/chroma
```

#### Redis (Cache)

```bash
# macOS
brew install redis
redis-server --daemonize yes

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis-server

# Test connection
redis-cli ping  # Should return PONG
```

### Development Scripts

```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:watch

# Run e2e tests
npm run test:e2e

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Lint and format code
npm run lint
npm run format
```

---

## 🏗️ Project Structure

```
opensam-ai-dashboard/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # LLM chat endpoints
│   │   │   ├── sam-search/    # SAM.gov search API
│   │   │   └── vector-search/ # Vector search endpoints
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── SearchView.tsx     # Search interface
│   │   └── CacheStatus.tsx    # Cache monitoring
│   ├── lib/
│   │   ├── adapters/          # Service adapters
│   │   ├── chat-rag.ts        # RAG implementation
│   │   ├── vectorStore.ts     # Vector store utilities
│   │   └── utils.ts           # Helper functions
│   ├── stores/
│   │   └── appStore.ts        # Zustand state management
│   └── types/
│       └── index.ts           # TypeScript definitions
├── tests/                     # Test suites
├── public/                    # Static assets
└── docs/                      # Documentation
```

---

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

---

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

2. **Apply Filters**: Refine results with date ranges, locations, NAICS codes, etc.

3. **Save Favorites**: Star important opportunities for later review

### Document Upload

1. **Supported Formats**: PDF, CSV, TXT files up to 10MB
2. **Processing**: Files are automatically processed and indexed
3. **Chat Integration**: Reference uploaded documents in conversations

---

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:watch
npm test -- --coverage
```

### End-to-End Tests
```bash
npx playwright install
npm run test:e2e
npx playwright test --ui
```

### Test Coverage Goals
- **Unit Tests**: >90% coverage for utilities and components
- **Integration Tests**: API endpoints and state management
- **E2E Tests**: Critical user journeys

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify

```toml
[build]
command = "npm run build"
publish = "out"
```

### Docker

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

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Commits**: Use conventional commit messages

### Areas to Contribute

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🧪 **Test coverage**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

- 🌐 [Website](https://opensamai.com) (Coming Soon)
- 🐛 [Issue Tracker](https://github.com/akshayakula/OpenSAM/issues)
- 💡 [Feature Requests](https://github.com/akshayakula/OpenSAM/issues)

### Connect with the Team

**Akshay (Creator)**
- **LinkedIn:** [akshayakula](https://www.linkedin.com/in/akshayakula/)
- **X (Twitter):** [@akshay_akula](https://x.com/akshay_akula)
- **Instagram:** [@akshayakula](https://instagram.com/akshayakula)

**DMs are open! Reach out on any platform above.**

---

## ❓ FAQ

**Q: Can I use this without SAM.gov API access?**
A: Yes, mock data is included for development. For real data, get a SAM.gov API key.

**Q: Which LLM provider is best?**
A: OpenAI GPT-4 is excellent for government contracting queries, Anthropic Claude is great for document analysis.

**Q: Is my API key secure?**
A: Yes, keys are encrypted client-side and never stored on our servers.

**Q: Can I customize the design?**
A: The app uses a black-and-white theme for accessibility. Customization requires CSS changes.

---

<div align="center">
Built with ❤️ for the government contracting and AI community

[opensamai.com](https://opensamai.com) (Coming Soon)
</div>
