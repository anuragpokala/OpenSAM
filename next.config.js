/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for Node.js modules in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        dns: false,
        net: false,
        tls: false,
        child_process: false,
        os: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
        assert: false,
        buffer: false,
        events: false,
        process: false,
        'node:stream': false,
        'node:process': false,
        'node:util': false,
        'node:url': false,
        'node:querystring': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:assert': false,
        'node:buffer': false,
        'node:events': false,
        'node:fs': false,
        'node:path': false,
        'node:crypto': false,
        'node:dns': false,
        'node:net': false,
        'node:tls': false,
        'node:child_process': false,
        'node:os': false,
      };
      
      // Exclude problematic packages from client bundle
      config.externals = config.externals || [];
      config.externals.push('chromadb');
      config.externals.push('redis');
      
      // Add rule to ignore specific problematic modules
      config.module.rules.push({
        test: /[\\/]node_modules[\\/](chromadb|redis)[\\/]/,
        use: 'null-loader'
      });
    }
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    NEXT_PUBLIC_SAM_API_KEY: process.env.SAM_API_KEY,
    SUPA_BASE_API_KEY: process.env.SUPA_BASE_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' ? 'https://opensam-ai.vercel.app' : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;