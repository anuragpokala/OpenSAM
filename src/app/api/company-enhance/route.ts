import { NextRequest, NextResponse } from 'next/server';
import { LLMProvider, LLMMessage, LLMResponse } from '@/types';

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

// System prompt for company profile enhancement
const ENHANCEMENT_PROMPT = `You are an expert business analyst specializing in company research and profile enhancement. Your task is to analyze a company based on its name and website to create a comprehensive business profile.

Please provide the following information in a structured JSON format:

{
  "industry": "Primary industry classification",
  "companySize": "Small/Medium/Large/Enterprise",
  "foundingYear": "Year founded (if available)",
  "revenue": "Revenue range (if available)",
  "employeeCount": "Employee count range (if available)",
  "enhancedDescription": "Detailed 2-3 paragraph description of the company's business, mission, and value proposition",
  "keyProducts": ["Product 1", "Product 2", "Product 3"],
  "targetMarkets": ["Market 1", "Market 2", "Market 3"],
  "competitiveAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "technologyStack": ["Technology 1", "Technology 2"],
  "partnerships": ["Partner 1", "Partner 2"],
  "awards": ["Award 1", "Award 2"]
}

Guidelines:
- Be factual and professional
- Focus on information relevant to government contracting
- If information is not available, omit the field or use "Not available"
- Keep descriptions concise but comprehensive
- Ensure all arrays have at least 2-3 items
- Make the enhanced description compelling for government contracting opportunities

Return ONLY the JSON object, no additional text.`;

/**
 * Call OpenAI API for company enhancement
 */
async function callOpenAI(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.3,
  maxTokens: number = 2000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.openai;
  
  const payload = {
    model,
    messages: [
      { role: 'system', content: ENHANCEMENT_PROMPT },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }))
    ],
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
 * Call Anthropic API for company enhancement
 */
async function callAnthropic(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.3,
  maxTokens: number = 2000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.anthropic;
  
  const userMessages = messages.filter(msg => msg.role !== 'system');
  
  const payload = {
    model,
    max_tokens: maxTokens,
    temperature,
    system: ENHANCEMENT_PROMPT,
    messages: userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))
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
 * Call Hugging Face API for company enhancement
 */
async function callHuggingFace(
  messages: LLMMessage[], 
  model: string, 
  apiKey: string,
  temperature: number = 0.3,
  maxTokens: number = 2000
): Promise<LLMResponse> {
  const config = LLM_CONFIGS.huggingface;
  
  const conversationText = messages.map(msg => {
    const prefix = msg.role === 'user' ? 'Human: ' : 'Assistant: ';
    return prefix + msg.content;
  }).join('\n\n');
  
  const payload = {
    inputs: `${ENHANCEMENT_PROMPT}\n\n${conversationText}\n\nAssistant:`,
    parameters: {
      max_new_tokens: maxTokens,
      temperature: temperature,
      return_full_text: false,
    }
  };
  
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
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    model,
    provider: 'huggingface',
  };
}

/**
 * Parse LLM response to extract JSON
 */
function parseEnhancementResponse(content: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, try parsing the entire content
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse LLM response as JSON:', error);
    throw new Error('Invalid response format from AI service');
  }
}

/**
 * Main company enhancement API handler
 */
export async function POST(req: NextRequest) {
  try {
    const { companyName, website, llmConfig } = await req.json();
    
    // Validate input
    if (!companyName || !llmConfig) {
      return NextResponse.json({ 
        error: 'Company name and LLM configuration are required.' 
      }, { status: 400 });
    }
    
    // Parse provider and model
    const [provider, modelName] = llmConfig.model.split(':');
    
    if (!provider || !modelName) {
      return NextResponse.json({ 
        error: 'Invalid model format. Use "provider:model" format.' 
      }, { status: 400 });
    }
    
    // Validate provider
    if (!['openai', 'anthropic', 'huggingface'].includes(provider)) {
      return NextResponse.json({ 
        error: 'Invalid provider. Supported providers: openai, anthropic, huggingface.' 
      }, { status: 400 });
    }
    
    // Get API key
    let apiKey = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 llmConfig.apiKey;
    
    // If API key is "server-configured", use environment variable
    if (apiKey === 'server-configured') {
      apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.HUGGINGFACE_API_KEY || '';
    }
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key is required.' 
      }, { status: 401 });
    }
    
    // Create the enhancement request
    const enhancementRequest = `Please analyze and enhance the profile for the following company:

Company Name: ${companyName}
Website: ${website || 'Not provided'}

Please provide a comprehensive business profile based on this information.`;

    const messages: LLMMessage[] = [
      { role: 'user', content: enhancementRequest }
    ];
    
    // Call appropriate LLM provider
    let response: LLMResponse;
    
    switch (provider as LLMProvider) {
      case 'openai':
        response = await callOpenAI(
          messages, 
          modelName, 
          apiKey, 
          llmConfig.temperature || 0.3, 
          llmConfig.maxTokens || 2000
        );
        break;
        
      case 'anthropic':
        response = await callAnthropic(
          messages, 
          modelName, 
          apiKey, 
          llmConfig.temperature || 0.3, 
          llmConfig.maxTokens || 2000
        );
        break;
        
      case 'huggingface':
        response = await callHuggingFace(
          messages, 
          modelName, 
          apiKey, 
          llmConfig.temperature || 0.3, 
          llmConfig.maxTokens || 2000
        );
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Parse the response
    const enhancementData = parseEnhancementResponse(response.content);
    
    // Add timestamp
    enhancementData.lastEnhanced = Date.now();
    
    // Return response
    return NextResponse.json({
      success: true,
      data: enhancementData,
      usage: response.usage,
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Company enhancement API error:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        timestamp: Date.now(),
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        error: 'An unexpected error occurred',
        timestamp: Date.now(),
      }, { status: 500 });
    }
  }
} 