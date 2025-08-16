import { NextRequest, NextResponse } from 'next/server';
import { LLMProvider, LLMMessage, LLMResponse, CompanyProfile } from '@/types';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';
import { chatWithRAG, findMatchingOpportunities, RAGContext } from '@/lib/chat-rag';
import { chatCache } from '@/lib/chat-cache';

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per window

function checkRateLimit(req: NextRequest): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIp as string);
  
  if (!clientData) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  clientData.count++;
  return true;
}

// LLM Provider configurations
const LLM_CONFIGS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    chatEndpoint: '/chat/completions',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    chatEndpoint: '/messages',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    }),
  },
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co/models',
    chatEndpoint: '',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
  },
};

// System prompt for SAM.gov expertise
const SYSTEM_PROMPT = `You are OpenSAM AI, an expert assistant for SAM.gov (System for Award Management) government contracting opportunities. Your expertise includes:

- Government contracting processes and terminology
- SAM.gov opportunity analysis and search
- Contract award history and trends
- NAICS codes and industry classifications
- Set-aside programs and small business categories
- Federal procurement regulations (FAR)
- Proposal writing and past performance evaluation

When users ask about contracting opportunities, provide detailed, accurate information. If you need to search for specific opportunities, indicate that you'll search SAM.gov data. Always prioritize accuracy and compliance with federal regulations.

Keep responses concise but comprehensive, and always consider the business context of government contracting.

You have access to a local vector database of SAM.gov opportunities, entities, and chat history. Use this context to provide more relevant and personalized responses.`;

function formatOpenAIMessages(messages: LLMMessage[]): any[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
  ];
}

async function callOpenAIStream(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ReadableStream> {
  const config = LLM_CONFIGS.openai;
  const formattedMessages = formatOpenAIMessages(messages);
  
  const response = await fetch(`${config.baseUrl}${config.chatEndpoint}`, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  return response.body!;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Streaming Chat API called');
    
    if (!checkRateLimit(request)) {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { model, messages, companyProfile, context } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      console.log('❌ Invalid request parameters');
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const [provider, modelName] = model.split(':');
    console.log('🤖 Provider:', provider, 'Model:', modelName);

    let apiKey: string | undefined;
    if (provider === 'openai') {
      apiKey = body.apiKey || process.env.OPENAI_API_KEY;
    } else if (provider === 'anthropic') {
      apiKey = body.apiKey || process.env.ANTHROPIC_API_KEY;
    } else if (provider === 'huggingface') {
      apiKey = body.apiKey || process.env.HUGGINGFACE_API_KEY;
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided for selected provider.' }, { status: 400 });
    }

    console.log('✅ API key provided, proceeding with streaming chat request');

    // Check cache first
    const companyProfileId = companyProfile?.id || 'no-profile';
    const cachedResponse = chatCache.getChatResponse(messages, companyProfileId, provider, modelName);
    
    if (cachedResponse) {
      console.log('🚀 Returning cached response via stream');
      // Return cached response as a stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunks = cachedResponse.response.split(' ');
          let index = 0;
          
          const sendChunk = () => {
            if (index < chunks.length) {
              const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk, cached: true })}\n\n`));
              index++;
              setTimeout(sendChunk, 50); // Simulate streaming
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, cached: true })}\n\n`));
              controller.close();
            }
          };
          
          sendChunk();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // For now, only support OpenAI streaming
    if (provider !== 'openai') {
      return NextResponse.json({ error: 'Streaming only supported for OpenAI' }, { status: 400 });
    }

    try {
      const stream = await callOpenAIStream(messages, modelName, apiKey, context?.temperature, context?.maxTokens);
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (err) {
      console.error('❌ Streaming AI chat error:', err);
      return NextResponse.json({ error: 'AI chat error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Streaming Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 