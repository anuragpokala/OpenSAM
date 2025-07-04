'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  TrendingUp, 
  Upload, 
  Settings, 
  Menu, 
  X,
  Bot,
  Key,
  ChevronDown,
  Star,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppStore, useUIState, useLLMConfig, useCompanyProfile, useIsCompanyProfileLoading } from '@/stores/appStore';
import { cn, generateId } from '@/lib/utils';
import SearchView from '@/components/SearchView';
import CacheStatus from '@/components/CacheStatus';
import { CompanyProfile } from '@/types';

// Navigation items
const navigationItems = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'upload', label: 'AI Company Profile', icon: Upload },
];

// Main Dashboard Component
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  
  const { sidebarOpen, currentView, theme } = useUIState();
  const llmConfig = useLLMConfig();
  const { 
    setSidebarOpen, 
    setCurrentView, 
    setLLMProvider, 
    setLLMModel, 
    setLLMApiKey,
    validateLLMConfig 
  } = useAppStore();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Debug environment variables
        console.log('Environment check:', {
          NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Set' : 'Not set',
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
          llmConfig: llmConfig
        });
        
        // Initialize store and validate configuration
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [llmConfig]);

  // Handle API key setup
  const handleApiKeySetup = async (provider: string, apiKey: string) => {
    try {
      setLLMApiKey(apiKey);
      const isValid = await validateLLMConfig();
      if (isValid) {
        setApiKeyDialogOpen(false);
      } else {
        alert('Invalid API key. Please check your key and try again.');
      }
    } catch (error) {
      console.error('Failed to validate API key:', error);
      alert('Failed to validate API key. Please try again.');
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-opensam-black mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-opensam-black">Loading OpenSAM AI...</h2>
          <p className="text-opensam-gray-600 mt-2">Initializing dashboard components</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-opensam-white border-r border-opensam-gray-200 transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-opensam-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-opensam-black" />
              <h1 className="text-lg font-bold text-opensam-black">OpenSAM AI</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentView(item.id as any)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* LLM Configuration */}
          <div className="p-4 border-t border-opensam-gray-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-opensam-gray-700">
                LLM Provider
              </label>
              <Select
                value={llmConfig.provider}
                onValueChange={(value) => setLLMProvider(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="huggingface">Hugging Face</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setApiKeyDialogOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                {llmConfig.apiKey ? 'Update API Key' : 'Set API Key'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="bg-opensam-white border-b border-opensam-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-opensam-black capitalize">
              {currentView}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-opensam-gray-600">
              <div className={cn(
                "w-2 h-2 rounded-full",
                llmConfig.apiKey ? "bg-green-500" : "bg-red-500"
              )} />
              <span>
                {llmConfig.apiKey ? `${llmConfig.provider} connected` : 'No API key'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {currentView === 'chat' && <ChatView />}
          {currentView === 'search' && <SearchView />}
          {currentView === 'forecast' && <ForecastView />}
          {currentView === 'upload' && <UploadView />}
        </main>
      </div>

      {/* API Key Dialog */}
      {apiKeyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-opensam-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Configure API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                  Provider
                </label>
                <Select value={llmConfig.provider} onValueChange={(value) => setLLMProvider(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApiKeySetup(llmConfig.provider, e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setApiKeyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (input?.value) {
                      handleApiKeySetup(llmConfig.provider, input.value);
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-opensam-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LLM Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>LLM Configuration</CardTitle>
                  <CardDescription>
                    Configure your AI provider settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                      Provider
                    </label>
                    <Select value={llmConfig.provider} onValueChange={(value) => setLLMProvider(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                      Model
                    </label>
                    <Select value={llmConfig.model} onValueChange={(value) => setLLMModel(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {llmConfig.provider === 'openai' && (
                          <>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </>
                        )}
                        {llmConfig.provider === 'anthropic' && (
                          <>
                            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                          </>
                        )}
                        {llmConfig.provider === 'huggingface' && (
                          <>
                            <SelectItem value="meta-llama/Llama-2-70b-chat-hf">Llama 2 70B</SelectItem>
                            <SelectItem value="microsoft/DialoGPT-medium">DialoGPT Medium</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setApiKeyDialogOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {llmConfig.apiKey ? 'Update API Key' : 'Set API Key'}
                  </Button>
                </CardContent>
              </Card>

              {/* Cache Status */}
              <CacheStatus />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Chat View Component
function ChatView() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const llmConfig = useLLMConfig();

  const sendMessage = async () => {
    if (!inputMessage.trim() || !llmConfig.apiKey) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmConfig.apiKey}`
        },
        body: JSON.stringify({
          model: `${llmConfig.provider}:${llmConfig.model}`,
          messages: [...messages, userMessage],
          context: {
            temperature: llmConfig.temperature || 0.7,
            maxTokens: llmConfig.maxTokens || 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: data.data.content 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            AI Chat Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about SAM.gov opportunities, get insights, and explore contract data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-96 border border-opensam-gray-200 rounded-lg p-4 bg-opensam-gray-50 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-opensam-gray-500">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-2 text-opensam-gray-400" />
                    <p>Start a conversation with the AI assistant</p>
                    <p className="text-sm mt-1">Try asking about recent contract opportunities or market trends</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-opensam-black text-opensam-white' 
                          : 'bg-opensam-gray-200 text-opensam-black'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-opensam-gray-200 text-opensam-black p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-opensam-black"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about SAM.gov opportunities..."
                className="flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !llmConfig.apiKey}
              />
              <Button 
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !llmConfig.apiKey}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {!llmConfig.apiKey && (
              <p className="text-sm text-red-500 text-center">
                Please set your API key in the sidebar to start chatting
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Forecast View Component
function ForecastView() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Market Forecast
          </CardTitle>
          <CardDescription>
            Analyze trends and forecast future opportunities based on historical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-opensam-black">1,234</div>
                  <div className="text-sm text-opensam-gray-600">Active Opportunities</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-opensam-black">$45.2M</div>
                  <div className="text-sm text-opensam-gray-600">Total Value</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-opensam-black">+12%</div>
                  <div className="text-sm text-opensam-gray-600">Growth Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="h-64 border border-opensam-gray-200 rounded-lg p-4 bg-opensam-gray-50">
            <div className="flex items-center justify-center h-full text-opensam-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-opensam-gray-400" />
                <p>Forecast charts will appear here</p>
                <p className="text-sm mt-1">Upload historical data to generate predictions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Company Profile View Component
function UploadView() {
  const [ueiSAM, setUeiSAM] = useState('');
  const [description, setDescription] = useState('');
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [naicsCodes, setNaicsCodes] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [pastPerformance, setPastPerformance] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: ''
  });
  
  const companyProfile = useCompanyProfile();
  const isCompanyProfileLoading = useIsCompanyProfileLoading();
  const { 
    setCompanyProfile, 
    updateCompanyProfile, 
    setIsCompanyProfileLoading, 
    fetchSAMEntityData, 
    saveCompanyProfile 
  } = useAppStore();

  // Load existing profile on mount
  useEffect(() => {
    if (companyProfile) {
      setUeiSAM(companyProfile.ueiSAM);
      setDescription(companyProfile.description);
      setBusinessTypes(companyProfile.businessTypes);
      setNaicsCodes(companyProfile.naicsCodes);
      setCapabilities(companyProfile.capabilities);
      setPastPerformance(companyProfile.pastPerformance);
      setCertifications(companyProfile.certifications);
      setContactInfo(companyProfile.contactInfo);
    }
  }, [companyProfile]);

  const handleFetchSAMData = async () => {
    if (!ueiSAM.trim()) {
      alert('Please enter a UEI SAM number');
      return;
    }

    setIsCompanyProfileLoading(true);
    try {
      const samData = await fetchSAMEntityData(ueiSAM);
      if (samData) {
        // Update form with SAM data
        setContactInfo({
          address: samData.address?.line1 || '',
          city: samData.address?.city || '',
          state: samData.address?.state || '',
          zipCode: samData.address?.zipCode || '',
          phone: samData.pointOfContact?.phone || '',
          email: samData.pointOfContact?.email || '',
          website: contactInfo.website || ''
        });
        setBusinessTypes(samData.businessTypes || []);
        
        // Update company profile with SAM data
        const updatedProfile: CompanyProfile = {
          id: companyProfile?.id || generateId(),
          ueiSAM,
          entityName: samData.entityName,
          description: description || `Company profile for ${samData.entityName}`,
          businessTypes: samData.businessTypes || [],
          naicsCodes: naicsCodes,
          capabilities: capabilities,
          pastPerformance: pastPerformance,
          certifications: certifications,
          contactInfo: {
            address: samData.address?.line1 || '',
            city: samData.address?.city || '',
            state: samData.address?.state || '',
            zipCode: samData.address?.zipCode || '',
            phone: samData.pointOfContact?.phone || '',
            email: samData.pointOfContact?.email || '',
            website: contactInfo.website || ''
          },
          samEntityData: samData,
          createdAt: companyProfile?.createdAt || Date.now(),
          updatedAt: Date.now()
        };
        
        await saveCompanyProfile(updatedProfile);
        alert('SAM.gov entity data fetched and saved successfully!');
      } else {
        alert('No entity found with the provided UEI SAM number');
      }
    } catch (error) {
      console.error('Error fetching SAM data:', error);
      alert('Failed to fetch SAM.gov entity data. Please check your API key and try again.');
    } finally {
      setIsCompanyProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!ueiSAM.trim()) {
      alert('Please enter a UEI SAM number');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a company description');
      return;
    }

    try {
      const profile: CompanyProfile = {
        id: companyProfile?.id || generateId(),
        ueiSAM,
        entityName: companyProfile?.entityName || 'Your Company',
        description,
        businessTypes,
        naicsCodes,
        capabilities,
        pastPerformance,
        certifications,
        contactInfo,
        samEntityData: companyProfile?.samEntityData,
        createdAt: companyProfile?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await saveCompanyProfile(profile);
      alert('Company profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save company profile');
    }
  };

  const addArrayItem = (array: string[], setter: (items: string[]) => void, placeholder: string) => {
    const item = prompt(`Enter ${placeholder}:`);
    if (item && item.trim()) {
      setter([...array, item.trim()]);
    }
  };

  const removeArrayItem = (array: string[], setter: (items: string[]) => void, index: number) => {
    setter(array.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            AI Company Profile
          </CardTitle>
          <CardDescription>
            Create and manage your company profile for AI-powered opportunity matching and analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* UEI SAM Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Company Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">UEI SAM Number *</label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      placeholder="Enter your UEI SAM number"
                      value={ueiSAM}
                      onChange={(e) => setUeiSAM(e.target.value)}
                    />
                    <Button 
                      onClick={handleFetchSAMData}
                      disabled={isCompanyProfileLoading || !ueiSAM.trim()}
                      variant="outline"
                    >
                      {isCompanyProfileLoading ? 'Fetching...' : 'Fetch SAM Data'}
                    </Button>
                  </div>
                  <p className="text-xs text-opensam-gray-500 mt-1">
                    Enter your UEI SAM number to automatically fetch company data from SAM.gov
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">Company Name</label>
                  <Input
                    placeholder="Company name"
                    value={companyProfile?.entityName || ''}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Company Description</h3>
              <div>
                <label className="text-sm font-medium text-opensam-gray-700">Description *</label>
                <textarea
                  className="w-full mt-1 p-3 border border-opensam-gray-300 rounded-lg resize-none"
                  rows={4}
                  placeholder="Describe what your company does, your expertise, and key capabilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Types */}
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">Business Types</label>
                  <div className="mt-1 space-y-2">
                    {businessTypes.map((type, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm bg-opensam-gray-100 px-2 py-1 rounded">{type}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeArrayItem(businessTypes, setBusinessTypes, index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addArrayItem(businessTypes, setBusinessTypes, 'business type')}
                    >
                      + Add Business Type
                    </Button>
                  </div>
                </div>

                {/* NAICS Codes */}
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">NAICS Codes</label>
                  <div className="mt-1 space-y-2">
                    {naicsCodes.map((code, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm bg-opensam-gray-100 px-2 py-1 rounded">{code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeArrayItem(naicsCodes, setNaicsCodes, index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addArrayItem(naicsCodes, setNaicsCodes, 'NAICS code')}
                    >
                      + Add NAICS Code
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Capabilities & Expertise</h3>
              <div>
                <label className="text-sm font-medium text-opensam-gray-700">Key Capabilities</label>
                <div className="mt-1 space-y-2">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-blue-100 px-2 py-1 rounded">{capability}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem(capabilities, setCapabilities, index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem(capabilities, setCapabilities, 'capability')}
                  >
                    + Add Capability
                  </Button>
                </div>
              </div>
            </div>

            {/* Past Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Past Performance</h3>
              <div>
                <label className="text-sm font-medium text-opensam-gray-700">Past Performance Projects</label>
                <div className="mt-1 space-y-2">
                  {pastPerformance.map((project, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-green-100 px-2 py-1 rounded">{project}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem(pastPerformance, setPastPerformance, index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem(pastPerformance, setPastPerformance, 'past performance project')}
                  >
                    + Add Past Performance
                  </Button>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Certifications</h3>
              <div>
                <label className="text-sm font-medium text-opensam-gray-700">Certifications & Qualifications</label>
                <div className="mt-1 space-y-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-purple-100 px-2 py-1 rounded">{cert}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem(certifications, setCertifications, index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem(certifications, setCertifications, 'certification')}
                  >
                    + Add Certification
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-opensam-black">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">Address</label>
                  <Input
                    placeholder="Street address"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">City</label>
                  <Input
                    placeholder="City"
                    value={contactInfo.city}
                    onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">State</label>
                  <Input
                    placeholder="State"
                    value={contactInfo.state}
                    onChange={(e) => setContactInfo({...contactInfo, state: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">ZIP Code</label>
                  <Input
                    placeholder="ZIP code"
                    value={contactInfo.zipCode}
                    onChange={(e) => setContactInfo({...contactInfo, zipCode: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-opensam-gray-700">Email</label>
                  <Input
                    placeholder="Email address"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-opensam-gray-700">Website</label>
                  <Input
                    placeholder="Website URL (optional)"
                    value={contactInfo.website}
                    onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-opensam-gray-200">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reset
              </Button>
              <Button onClick={handleSaveProfile} disabled={!ueiSAM.trim() || !description.trim()}>
                Save Company Profile
              </Button>
            </div>

            {/* SAM Entity Data Display */}
            {companyProfile?.samEntityData && (
              <div className="mt-6 p-4 bg-opensam-gray-50 rounded-lg">
                <h4 className="font-medium text-opensam-black mb-2">SAM.gov Entity Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">CAGE Code:</span> {companyProfile.samEntityData.cageCode}
                  </div>
                  <div>
                    <span className="font-medium">DUNS:</span> {companyProfile.samEntityData.duns}
                  </div>
                  <div>
                    <span className="font-medium">Registration Status:</span> {companyProfile.samEntityData.registrationStatus}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(companyProfile.samEntityData.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}