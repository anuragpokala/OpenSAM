import { NextRequest, NextResponse } from 'next/server';
import { LLMProvider, LLMMessage, LLMResponse, CompanyProfile } from '@/types';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';
import { chatWithRAG, findMatchingOpportunities, RAGContext } from '@/lib/chat-rag';
import { chatCache } from '@/lib/chat-cache';
// Removed: import { rateLimit } from '@/lib/utils';

// Rate limiting configuration
// Remove limiter and use local rate limit config/vars
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per window

/**
 * Rate limiting middleware
 */
function checkRateLimit(req: NextRequest): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIp as string);
  
  if (!clientData) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Check if limit exceeded
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment count
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
    chatEndpoint: '', // Will be constructed per model
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

/**
 * Format messages for OpenAI API
 */
function formatOpenAIMessages(messages: LLMMessage[]): any[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
  ];
}

/**
 * Format messages for Anthropic API
 */
function formatAnthropicMessages(messages: LLMMessage[]): any {
  const userMessages = messages.filter(msg => msg.role !== 'system');
  return {
    system: SYSTEM_PROMPT,
    messages: userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
  };
}

/**
 * Format messages for Hugging Face API
 */
function formatHuggingFaceMessages(messages: LLMMessage[]): any {
  const conversationText = messages.map(msg => {
    const prefix = msg.role === 'user' ? 'Human: ' : 'Assistant: ';
    return prefix + msg.content;
  }).join('\n\n');
  
  return {
    inputs: `${SYSTEM_PROMPT}\n\n${conversationText}\n\nAssistant:`,
    parameters: {
      max_new_tokens: 1000,
      temperature: 0.7,
      return_full_text: false,
    }
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.openai;
  
  const payload = {
    model,
    messages: formatOpenAIMessages(messages),
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };
  
  const response = await fetch(`${config.baseUrl}${config.chatEndpoint}`, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    model: data.model,
    provider: 'openai',
  };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.anthropic;
  
  const payload = {
    model,
    max_tokens: maxTokens,
    temperature,
    ...formatAnthropicMessages(messages),
  };
  
  const response = await fetch(`${config.baseUrl}${config.chatEndpoint}`, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    content: data.content[0].text,
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    model: data.model,
    provider: 'anthropic',
  };
}

/**
 * Call Hugging Face API
 */
async function callHuggingFace(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.huggingface;
  
  const payload = formatHuggingFaceMessages(messages);
  payload.parameters.temperature = temperature;
  payload.parameters.max_new_tokens = maxTokens;
  
  const response = await fetch(`${config.baseUrl}/${model}`, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Hugging Face API error: ${error.error || response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    content: Array.isArray(data) ? data[0].generated_text : data.generated_text,
    usage: {
      prompt_tokens: 0, // HF doesn't provide token counts
      completion_tokens: 0,
      total_tokens: 0,
    },
    model,
    provider: 'huggingface',
  };
}

/**
 * Main chat API handler
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Chat API called');
    // Use local checkRateLimit instead of limiter
    if (!checkRateLimit(request)) {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('📝 Request body:', { 
      model: body.model, 
      messagesCount: body.messages?.length,
      hasCompanyProfile: !!body.companyProfile 
    });

    const { model, messages, companyProfile, context } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      console.log('❌ Invalid request parameters');
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Extract provider and model from the model string
    const [provider, modelName] = model.split(':');
    console.log('🤖 Provider:', provider, 'Model:', modelName);

    // Determine API key: prefer user-provided, else use server-side env var
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

    console.log('✅ API key provided, proceeding with chat request');

    // Check cache first
    const companyProfileId = companyProfile?.id || 'no-profile';
    const cachedResponse = chatCache.getChatResponse(messages, companyProfileId, provider, modelName);
    
    if (cachedResponse) {
      console.log('🚀 Returning cached response');
      return NextResponse.json({
        success: true,
        data: {
          content: cachedResponse.response,
          ragContext: cachedResponse.ragContext,
          cached: true
        }
      });
    }

    // Remove mock response, use real AI + RAG logic
    let aiResponse = '';
    let ragContext: RAGContext | null = null;
    let opportunities: Array<{ opportunity: any; score: number }> = [];
    let accuracyMetrics: any = null;
    
    try {
      if (companyProfile) {
        // Use RAG flow
        const llmFunction = async (systemPrompt: string, userPrompt: string) => {
          if (provider === 'openai') {
            const result = await callOpenAI([
              { role: 'system', content: systemPrompt },
              ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
            ], modelName, apiKey, context?.temperature, context?.maxTokens);
            return result.content;
          } else if (provider === 'anthropic') {
            const result = await callAnthropic([
              { role: 'system', content: systemPrompt },
              ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
            ], modelName, apiKey, context?.temperature, context?.maxTokens);
            return result.content;
          } else if (provider === 'huggingface') {
            const result = await callHuggingFace([
              { role: 'system', content: systemPrompt },
              ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
            ], modelName, apiKey, context?.temperature, context?.maxTokens);
            return result.content;
          } else {
            throw new Error('Unsupported provider');
          }
        };
        const ragResult = await chatWithRAG(
          messages[messages.length - 1]?.content || '',
          companyProfile,
          llmFunction
        );
        aiResponse = ragResult.response;
        ragContext = ragResult.context;
        opportunities = ragResult.opportunities || [];
        const accuracyMetrics = ragResult.accuracyMetrics;
      } else {
        // No company profile, just chat
        if (provider === 'openai') {
          const result = await callOpenAI(messages, modelName, apiKey, context?.temperature, context?.maxTokens);
          aiResponse = result.content;
        } else if (provider === 'anthropic') {
          const result = await callAnthropic(messages, modelName, apiKey, context?.temperature, context?.maxTokens);
          aiResponse = result.content;
        } else if (provider === 'huggingface') {
          const result = await callHuggingFace(messages, modelName, apiKey, context?.temperature, context?.maxTokens);
          aiResponse = result.content;
        } else {
          throw new Error('Unsupported provider');
        }
      }
      
      // Cache the response
      chatCache.setChatResponse(messages, companyProfileId, provider, modelName, {
        response: aiResponse,
        ragContext,
        opportunities
      });
    } catch (err) {
      console.error('❌ AI chat error:', err);
      return NextResponse.json({ error: 'AI chat error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        content: aiResponse,
        ragContext: ragContext,
        accuracyMetrics: accuracyMetrics
      }
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limit configuration for internal use only