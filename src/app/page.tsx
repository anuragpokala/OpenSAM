'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Database,
  Building,
  Plus,
  MessageSquare,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { useAppStore, useUIState, useLLMConfig, useCompanyProfile, useIsCompanyProfileLoading, useCurrentSession, useChatSessions } from '@/stores/appStore';
import { cn, generateId } from '@/lib/utils';
import SearchView from '@/components/SearchView';
import CacheStatus from '@/components/CacheStatus';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ChatSessionManager } from '@/components/ChatSessionManager';
import { CompanyProfile } from '@/types';

// Add logo SVGs at the top (after imports)
const OpenAILogo = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="20" cy="20" r="20" fill="#10A37F" />
      <path d="M27.5 13.5c-.6-1-1.7-1.3-2.7-.7l-1.2.7c-.2-.1-.5-.2-.7-.3l-.2-1.3c-.2-1.1-1.2-1.9-2.3-1.7-.6.1-1.1.5-1.4 1l-.7 1.2c-.2.1-.5.2-.7.3l-1.3-.2c-1.1-.2-2.1.6-2.3 1.7-.1.6.1 1.2.5 1.6l.7 1.2c-.1.2-.2.5-.3.7l-1.3.2c-1.1.2-1.9 1.2-1.7 2.3.1.6.5 1.1 1 1.4l1.2.7c.1.2.2.5.3.7l-.2 1.3c-.2 1.1.6 2.1 1.7 2.3.6.1 1.2-.1 1.6-.5l1.2-.7c.2.1.5.2.7.3l.2 1.3c.2 1.1 1.2 1.9 2.3 1.7.6-.1 1.1-.5 1.4-1l.7-1.2c.2-.1.5-.2.7-.3l1.3.2c1.1.2 2.1-.6 2.3-1.7.1-.6-.1-1.2-.5-1.6l-.7-1.2c.1-.2.2-.5.3-.7l1.3-.2c1.1-.2 1.9-1.2 1.7-2.3-.1-.6-.5-1.1-1-1.4l-1.2-.7c-.1-.2-.2-.5-.3-.7l.2-1.3c.2-1.1-.6-2.1-1.7-2.3z" fill="#fff"/>
    </g>
  </svg>
);

const AnthropicLogo = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="20" cy="20" r="20" fill="#FFCD1C" />
      <rect x="12" y="12" width="16" height="16" rx="8" fill="#fff" />
      <rect x="16" y="16" width="8" height="8" rx="4" fill="#FFCD1C" />
      <circle cx="20" cy="20" r="2.5" fill="#fff" />
    </g>
  </svg>
);

const HuggingFaceLogo = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="20" cy="20" r="20" fill="#FFD21F" />
      <ellipse cx="20" cy="24" rx="8" ry="5" fill="#fff" />
      <ellipse cx="16" cy="22" rx="1.5" ry="2" fill="#000" />
      <ellipse cx="24" cy="22" rx="1.5" ry="2" fill="#000" />
      <path d="M16 26c1.5 1 6.5 1 8 0" stroke="#000" strokeWidth="1.2" strokeLinecap="round"/>
      <ellipse cx="20" cy="18" rx="7" ry="6" fill="#fff" />
      <ellipse cx="17" cy="18" rx="1.2" ry="1.5" fill="#000" />
      <ellipse cx="23" cy="18" rx="1.2" ry="1.5" fill="#000" />
    </g>
  </svg>
);

// Navigation items
const navigationItems = [
  // { id: 'chat', label: 'Chat', icon: MessageCircle }, // Hidden for now
  { id: 'search', label: 'Search', icon: Search },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'upload', label: 'AI Company Profile', icon: Upload },
  { id: 'vectorstore', label: 'Vector Store', icon: Database },
];

// Main Dashboard Component
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<CompanyProfile | null>(null);
  const [showCompanyProfileSelector, setShowCompanyProfileSelector] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<CompanyProfile[]>([]);
  
  const { sidebarOpen, currentView, theme } = useUIState();
  const llmConfig = useLLMConfig();
  const companyProfile = useCompanyProfile();
  const { 
    setSidebarOpen, 
    setCurrentView, 
    setLLMProvider, 
    setLLMModel, 
    setLLMApiKey,
    validateLLMConfig,
    loadProfile,
    loadSavedProfiles,
    setCompanyProfile
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

  // Load saved profiles from vector store
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profiles = await loadSavedProfiles();
        setSavedProfiles(profiles);
        // Auto-select the first available profile if none is selected
        if ((!selectedCompanyProfile || !companyProfile) && Array.isArray(profiles) && profiles.length > 0) {
          setSelectedCompanyProfile(profiles[0]);
          setCompanyProfile(profiles[0]);
          try {
            localStorage.setItem('opensam-selected-company-profile', profiles[0].id);
          } catch {}
        }
      } catch (error) {
        console.error('Failed to load saved profiles:', error);
        setSavedProfiles([]);
      }
    };

    loadProfiles();
  }, [loadSavedProfiles, selectedCompanyProfile, companyProfile, setCompanyProfile]);

  // Load selected company profile from localStorage on mount
  useEffect(() => {
    const savedProfileId = localStorage.getItem('opensam-selected-company-profile');
    if (savedProfileId && !selectedCompanyProfile) {
      const savedProfile = loadProfile(savedProfileId);
      if (savedProfile) {
        setSelectedCompanyProfile(savedProfile);
      }
    }
  }, [selectedCompanyProfile, loadProfile]);

  // Set default company profile if available
  useEffect(() => {
    if (companyProfile && !selectedCompanyProfile) {
      setSelectedCompanyProfile(companyProfile);
    }
  }, [companyProfile, selectedCompanyProfile]);

  // Save selected company profile to localStorage when it changes
  useEffect(() => {
    if (selectedCompanyProfile) {
      localStorage.setItem('opensam-selected-company-profile', selectedCompanyProfile.id);
    } else {
      localStorage.removeItem('opensam-selected-company-profile');
    }
  }, [selectedCompanyProfile]);

  // Close company profile selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showCompanyProfileSelector && !target.closest('.company-profile-selector')) {
        setShowCompanyProfileSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompanyProfileSelector]);

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out",
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
              <div className="flex space-x-2">
                <Button
                  variant={llmConfig.provider === 'openai' ? 'default' : 'outline'}
                  size="sm"
                  aria-label="OpenAI"
                  onClick={() => setLLMProvider('openai')}
                >
                  <OpenAILogo className="h-5 w-5" />
                </Button>
                <Button
                  variant={llmConfig.provider === 'anthropic' ? 'default' : 'outline'}
                  size="sm"
                  aria-label="Anthropic"
                  onClick={() => setLLMProvider('anthropic')}
                >
                  <AnthropicLogo className="h-5 w-5" />
                </Button>
                <Button
                  variant={llmConfig.provider === 'huggingface' ? 'default' : 'outline'}
                  size="sm"
                  aria-label="Hugging Face"
                  onClick={() => setLLMProvider('huggingface')}
                >
                  <HuggingFaceLogo className="h-5 w-5" />
                </Button>
              </div>
              
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
        <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
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
            {/* Global Company Profile Selector */}
            <div className="hidden sm:flex items-center space-x-2 text-sm relative company-profile-selector">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 px-2 py-1 h-auto"
                  onClick={() => setShowCompanyProfileSelector(!showCompanyProfileSelector)}
                >
                  <Building className="h-3 w-3" />
                  <span className="font-medium">
                    {selectedCompanyProfile ? selectedCompanyProfile.entityName : 'Select Company'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                
                {/* Company Profile Dropdown */}
                {showCompanyProfileSelector && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Saved Profiles</div>
                      {savedProfiles.length > 0 ? (
                        <div className="space-y-1">
                          {savedProfiles.map((profile: CompanyProfile) => (
                            <div
                              key={profile.id}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedCompanyProfile?.id === profile.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => {
                                setSelectedCompanyProfile(profile);
                                setShowCompanyProfileSelector(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{profile.entityName || 'Unnamed Company'}</p>
                                  <p className="text-xs opacity-75">
                                    {profile.naicsCodes?.length > 0 ? `NAICS: ${profile.naicsCodes.join(', ')}` : 'No NAICS codes'}
                                  </p>
                                </div>
                                {selectedCompanyProfile?.id === profile.id && (
                                  <div className="w-2 h-2 bg-current rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 text-xs text-muted-foreground">
                          No saved profiles. Create one in the AI Company Profile section.
                        </div>
                      )}
                      
                      {selectedCompanyProfile && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCompanyProfile(null);
                              setShowCompanyProfileSelector(false);
                            }}
                          >
                            Clear Selection
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ThemeToggle />
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
            {/* {currentView === 'chat' && <ChatView selectedCompanyProfile={selectedCompanyProfile} setSelectedCompanyProfile={setSelectedCompanyProfile} savedProfiles={savedProfiles} />} */}
            {currentView === 'search' && <SearchView />}
          {currentView === 'forecast' && <ForecastView />}
          {currentView === 'upload' && <UploadView savedProfiles={savedProfiles} />}
          {currentView === 'vectorstore' && <VectorStoreView />}
        </main>
      </div>

      {/* API Key Dialog */}
      {apiKeyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Configure API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                  Provider
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant={llmConfig.provider === 'openai' ? 'default' : 'outline'}
                    size="sm"
                    aria-label="OpenAI"
                    onClick={() => setLLMProvider('openai')}
                  >
                    <OpenAILogo className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={llmConfig.provider === 'anthropic' ? 'default' : 'outline'}
                    size="sm"
                    aria-label="Anthropic"
                    onClick={() => setLLMProvider('anthropic')}
                  >
                    <AnthropicLogo className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={llmConfig.provider === 'huggingface' ? 'default' : 'outline'}
                    size="sm"
                    aria-label="Hugging Face"
                    onClick={() => setLLMProvider('huggingface')}
                  >
                    <HuggingFaceLogo className="h-5 w-5" />
                  </Button>
                </div>
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
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
                    <div className="flex space-x-2">
                      <Button
                        variant={llmConfig.provider === 'openai' ? 'default' : 'outline'}
                        size="sm"
                        aria-label="OpenAI"
                        onClick={() => setLLMProvider('openai')}
                      >
                        <OpenAILogo className="h-5 w-5" />
                      </Button>
                      <Button
                        variant={llmConfig.provider === 'anthropic' ? 'default' : 'outline'}
                        size="sm"
                        aria-label="Anthropic"
                        onClick={() => setLLMProvider('anthropic')}
                      >
                        <AnthropicLogo className="h-5 w-5" />
                      </Button>
                      <Button
                        variant={llmConfig.provider === 'huggingface' ? 'default' : 'outline'}
                        size="sm"
                        aria-label="Hugging Face"
                        onClick={() => setLLMProvider('huggingface')}
                      >
                        <HuggingFaceLogo className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-opensam-gray-700 mb-1">
                      Model
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {llmConfig.provider === 'openai' && (
                        <>
                          <Button
                            variant={llmConfig.model === 'gpt-4' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('gpt-4')}
                          >
                            GPT-4
                          </Button>
                          <Button
                            variant={llmConfig.model === 'gpt-3.5-turbo' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('gpt-3.5-turbo')}
                          >
                            GPT-3.5 Turbo
                          </Button>
                        </>
                      )}
                      {llmConfig.provider === 'anthropic' && (
                        <>
                          <Button
                            variant={llmConfig.model === 'claude-3-opus' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('claude-3-opus')}
                          >
                            Claude 3 Opus
                          </Button>
                          <Button
                            variant={llmConfig.model === 'claude-3-sonnet' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('claude-3-sonnet')}
                          >
                            Claude 3 Sonnet
                          </Button>
                          <Button
                            variant={llmConfig.model === 'claude-3-haiku' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('claude-3-haiku')}
                          >
                            Claude 3 Haiku
                          </Button>
                        </>
                      )}
                      {llmConfig.provider === 'huggingface' && (
                        <>
                          <Button
                            variant={llmConfig.model === 'meta-llama/Llama-2-70b-chat-hf' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('meta-llama/Llama-2-70b-chat-hf')}
                          >
                            Llama 2 70B
                          </Button>
                          <Button
                            variant={llmConfig.model === 'microsoft/DialoGPT-medium' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setLLMModel('microsoft/DialoGPT-medium')}
                          >
                            DialoGPT Medium
                          </Button>
                        </>
                      )}
                    </div>
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
function ChatView({ 
  selectedCompanyProfile, 
  setSelectedCompanyProfile,
  savedProfiles
}: { 
  selectedCompanyProfile: CompanyProfile | null; 
  setSelectedCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile | null>>; 
  savedProfiles: CompanyProfile[];
}) {

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Initialize session if none exists
  useEffect(() => {
    if (!currentSession && chatSessions.length === 0) {
      createChatSession(); // No title argument
    }
  }, [currentSession, chatSessions.length, createChatSession]);

  // Handle prepopulated message
  useEffect(() => {
    if (prepopulatedMessage) {
      setInputMessage(prepopulatedMessage);
      setPrepopulatedMessage(null); // Clear the prepopulated message
    }
  }, [prepopulatedMessage, setPrepopulatedMessage]);

  // Set default company profile if available
  useEffect(() => {
    if (companyProfile && !selectedCompanyProfile) {
      setSelectedCompanyProfile(companyProfile);
    }
  }, [companyProfile, selectedCompanyProfile]);

  // Load selected company profile from localStorage on mount
  useEffect(() => {
    const savedProfileId = localStorage.getItem('opensam-selected-company-profile');
    if (savedProfileId && !selectedCompanyProfile) {
      const savedProfile = loadProfile(savedProfileId);
      if (savedProfile) {
        setSelectedCompanyProfile(savedProfile);
      }
    }
  }, [selectedCompanyProfile, loadProfile]);

  // Save selected company profile to localStorage when it changes
  useEffect(() => {
    if (selectedCompanyProfile) {
      localStorage.setItem('opensam-selected-company-profile', selectedCompanyProfile.id);
    } else {
      localStorage.removeItem('opensam-selected-company-profile');
    }
  }, [selectedCompanyProfile]);

  const sendMessage = async () => {
    console.log('sendMessage called with:', { inputMessage, currentSession, llmConfig });
    
    if (!inputMessage.trim()) return;
    
    // Check if we have a current session, create one if not
    let session = currentSession;
    if (!session) {
      console.log('No current session, creating new one...');
      session = createChatSession(); // No title argument
      if (!session) {
        console.error('Failed to create new session');
        return;
      }
      console.log('Created new session:', session);
    }
    
    // Check for API key
    if (!llmConfig.apiKey) {
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Please set your API key in the settings to start chatting.',
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random()}`
      };
      addMessageToSession(session.id, errorMessage);
      setInputMessage('');
      return;
    }

    const userMessage = { 
      role: 'user' as const, 
      content: inputMessage,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random()}`
    };
    
    // Check if this is the first message for auto-title
    const isFirstMessage = Array.isArray(session.messages) && session.messages.length === 0;
    
    // Add user message to current session
    addMessageToSession(session.id, userMessage);
    
    // Auto-update session title if it's the first message and title is default
    if (isFirstMessage && session.title === 'New Chat') {
      const title = inputMessage.length > 30 ? inputMessage.substring(0, 30) + '...' : inputMessage;
      updateSession(session.id, { title });
    }
    
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
          messages: [...(Array.isArray(session.messages) ? session.messages : []), userMessage],
          companyProfile: selectedCompanyProfile, // Include selected company profile
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
          content: data.data.content,
          timestamp: Date.now(),
          id: `msg_${Date.now()}_${Math.random()}`,
          ragContext: data.data.ragContext // Include RAG context if available
        };
        addMessageToSession(session.id, assistantMessage);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random()}`
      };
      addMessageToSession(session.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('handleKeyPress:', e.key, e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Calling sendMessage from handleKeyPress');
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto chat-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse status-indicator"></div>
              <h2 className="text-lg font-semibold text-gray-900">OpenSAM AI Assistant</h2>
            </div>
            
            {/* Session Info */}
            {currentSession && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {currentSession.title}
                  </span>
                  {currentSession.messages.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {currentSession.messages.length}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessionManager(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {selectedCompanyProfile && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Building className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedCompanyProfile.entityName}
                </span>
                <button
                  onClick={() => setSelectedCompanyProfile(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessionManager(true)}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            {!selectedCompanyProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompanySelector(!showCompanySelector)}
                className="text-sm"
              >
                <Building className="h-4 w-4 mr-2" />
                Select Company
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Company Profile Selector */}
      {showCompanySelector && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="max-w-2xl">
            <h4 className="font-medium text-gray-900 mb-3">Select Company Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedProfiles.length > 0 ? (
                savedProfiles.map((profile: CompanyProfile) => (
                  <div
                    key={profile.id}
                                         className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 company-profile-option ${
                       selectedCompanyProfile?.id === profile.id
                         ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                         : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                     }`}
                    onClick={() => {
                      setSelectedCompanyProfile(profile);
                      setShowCompanySelector(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{profile.entityName || 'Unnamed Company'}</p>
                        <p className="text-sm text-gray-600">
                          {profile.naicsCodes?.length > 0 ? `NAICS: ${profile.naicsCodes.join(', ')}` : 'No NAICS codes'}
                        </p>
                      </div>
                      {selectedCompanyProfile?.id === profile.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4">
                  <Building className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    No saved company profiles found. Create one in the AI Company Profile section.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="chat-messages bg-gray-50 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Bot className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to OpenSAM AI</h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  Ask me about SAM.gov opportunities, market trends, or get personalized recommendations for your company.
                </p>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto quick-actions-grid">
                   <button
                     onClick={() => setInputMessage("What are the latest cybersecurity contract opportunities?")}
                     className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors quick-action"
                   >
                    <div className="font-medium text-gray-900">🔒 Cybersecurity</div>
                    <div className="text-sm text-gray-600">Latest contract opportunities</div>
                  </button>
                                     <button
                     onClick={() => setInputMessage("Show me small business set-aside opportunities in my area")}
                     className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors quick-action"
                   >
                     <div className="font-medium text-gray-900">🏢 Small Business</div>
                     <div className="text-sm text-gray-600">Set-aside opportunities</div>
                   </button>
                   <button
                     onClick={() => setInputMessage("What are the trending NAICS codes this quarter?")}
                     className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors quick-action"
                   >
                     <div className="font-medium text-gray-900">📊 Market Trends</div>
                     <div className="text-sm text-gray-600">Trending NAICS codes</div>
                   </button>
                   <button
                     onClick={() => setInputMessage("Help me understand the proposal requirements for this opportunity")}
                     className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors quick-action"
                   >
                     <div className="font-medium text-gray-900">📋 Proposal Help</div>
                     <div className="text-sm text-gray-600">Requirements analysis</div>
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentSession?.messages.map((message, index) => (
                <div key={message.id || index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] lg:max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                             {/* Avatar */}
                       <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                         message.role === 'user' 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-gray-200 text-gray-700'
                       }`}>
                         {message.role === 'user' ? (
                           <span className="text-sm font-medium">U</span>
                         ) : (
                           <Bot className="h-4 w-4" />
                         )}
                       </div>
                       
                       {/* Message Bubble */}
                       <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                         <div className={`inline-block p-4 rounded-2xl max-w-full message-bubble ${
                           message.role === 'user' 
                             ? 'bg-blue-600 text-white rounded-br-md' 
                             : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                         }`}>
                          {message.role === 'user' ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          ) : (
                            <div className="text-sm leading-relaxed">
                              <MarkdownRenderer content={message.content} />
                                                             {/* Show RAG context if available */}
                               {(message as any).ragContext && (
                                 <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 rag-context">
                                   <div className="flex items-center space-x-2 mb-2">
                                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                     <p className="text-xs font-medium text-blue-800">
                                       Related Opportunities ({(message as any).ragContext.opportunities.length})
                                     </p>
                                   </div>
                                   <div className="space-y-2">
                                     {(message as any).ragContext.opportunities.slice(0, 3).map((item: any, oppIndex: number) => (
                                       <div key={oppIndex} className="text-xs bg-white p-2 rounded border">
                                         <p className="font-medium text-gray-900 flex items-center justify-between">
                                           {item.opportunity.title}
                                           <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-semibold">
                                             {item.score}% match
                                           </span>
                                         </p>
                                         <p className="text-gray-600">
                                           {item.opportunity.naicsCode}
                                         </p>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                        
                                                 {/* Message Actions */}
                         <div className={`flex items-center space-x-2 mt-2 message-actions ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {message.timestamp && (
                             <span className="text-xs text-gray-500 message-timestamp">
                               {formatTimestamp(message.timestamp)}
                             </span>
                           )}
                           {message.role === 'assistant' && (
                             <button
                               onClick={() => copyToClipboard(message.content)}
                               className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                               title="Copy message"
                             >
                               Copy
                             </button>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] lg:max-w-[70%]">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-700" />
                      </div>
                                             <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                         <div className="flex items-center space-x-2">
                           <div className="flex space-x-1 typing-dots">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                           </div>
                           <span className="text-sm text-gray-600">AI is thinking...</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Session Manager */}
      <ChatSessionManager 
        isOpen={showSessionManager} 
        onClose={() => setShowSessionManager(false)} 
      />

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
                             <div className="relative chat-input">
                 <textarea
                   placeholder="Ask about SAM.gov opportunities, market trends, or get personalized recommendations..."
                   className="w-full p-4 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 chat-textarea"
                   rows={1}
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyPress={handleKeyPress}
                   disabled={isLoading}
                   style={{ minHeight: '48px', maxHeight: '120px' }}
                 />
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {inputMessage.length}/1000
                  </span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                console.log('Send button clicked');
                sendMessage();
              }}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
                             {isLoading ? (
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin loading-spinner"></div>
                   <span>Sending...</span>
                 </div>
               ) : (
                <div className="flex items-center space-x-2">
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              )}
            </Button>
          </div>
          
          {!llmConfig.apiKey && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  💡 Set your API key in the sidebar to start chatting with AI
                </span>
              </div>
            </div>
          )}
          
          {!selectedCompanyProfile && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  💡 Select a company profile above to get personalized opportunity recommendations
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
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
function UploadView({ savedProfiles }: { savedProfiles: CompanyProfile[] }) {
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const companyProfile = useCompanyProfile();
  const isCompanyProfileLoading = useIsCompanyProfileLoading();
  const { 
    setCompanyProfile, 
    updateCompanyProfile, 
    setIsCompanyProfileLoading, 
    fetchSAMEntityData, 
    saveCompanyProfile,
    enhanceCompanyProfile,
    loadSavedProfiles,
    loadProfile
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
        // Extract data from SAM.gov response structure
        const entityRegistration = samData.entityRegistration || {};
        const coreData = samData.coreData || {};
        const physicalAddress = coreData.physicalAddress || {};
        const governmentBusinessPOC = samData.pointsOfContact?.governmentBusinessPOC || {};
        const businessTypes = coreData.businessTypes?.businessTypeList?.map((bt: any) => bt.businessTypeDesc) || [];
        const naicsCodes = samData.assertions?.goodsAndServices?.naicsList?.map((naics: any) => naics.naicsCode) || [];
        
        // Update form with SAM data
        setContactInfo({
          address: physicalAddress.addressLine1 || '',
          city: physicalAddress.city || '',
          state: physicalAddress.stateOrProvinceCode || '',
          zipCode: physicalAddress.zipCode || '',
          phone: '', // SAM.gov doesn't provide phone in POC data
          email: '', // SAM.gov doesn't provide email in POC data
          website: contactInfo.website || coreData.entityInformation?.entityURL || ''
        });
        setBusinessTypes(businessTypes);
        setNaicsCodes(naicsCodes);
        
        // Update company profile with SAM data
        const updatedProfile: CompanyProfile = {
          id: companyProfile?.id || generateId(),
          ueiSAM,
          entityName: entityRegistration.legalBusinessName || 'Unknown Company',
          description: description || `Company profile for ${entityRegistration.legalBusinessName || 'Unknown Company'}`,
          businessTypes: businessTypes,
          naicsCodes: naicsCodes,
          capabilities: capabilities,
          pastPerformance: pastPerformance,
          certifications: certifications,
          contactInfo: {
            address: physicalAddress.addressLine1 || '',
            city: physicalAddress.city || '',
            state: physicalAddress.stateOrProvinceCode || '',
            zipCode: physicalAddress.zipCode || '',
            phone: '', // SAM.gov doesn't provide phone in POC data
            email: '', // SAM.gov doesn't provide email in POC data
            website: contactInfo.website || coreData.entityInformation?.entityURL || ''
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

  const handleEnhanceProfile = async () => {
    const companyName = companyProfile?.entityName || '';
    const website = contactInfo.website || '';
    
    if (!companyName.trim()) {
      alert('Please fetch SAM data or enter a company name first');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhancedData = await enhanceCompanyProfile(companyName, website);
      
      // Update the profile with enhanced data
      const updatedProfile: CompanyProfile = {
        ...companyProfile!,
        description: enhancedData.enhancedDescription || description,
        aiEnhanced: enhancedData,
        updatedAt: Date.now()
      };
      
      await saveCompanyProfile(updatedProfile);
      
      // Update form fields with enhanced data
      setDescription(enhancedData.enhancedDescription || description);
      setCapabilities(enhancedData.keyProducts || capabilities);
      setBusinessTypes(enhancedData.targetMarkets || businessTypes);
      
      alert('Company profile enhanced successfully with AI!');
    } catch (error) {
      console.error('Error enhancing profile:', error);
      alert(`Failed to enhance company profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEnhancing(false);
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
          {/* Profile Selector */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">Saved Profiles</h4>
                <p className="text-sm text-muted-foreground">
                  Load a previously saved company profile or create a new one
                </p>
              </div>
              <div className="flex space-x-2">
                <select
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      loadProfile(e.target.value);
                    }
                  }}
                  value=""
                >
                  <option value="">Select a saved profile...</option>
                  {savedProfiles.map((profile: any) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.entityName || 'Unnamed Profile'} ({new Date(profile.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear current profile to create new one
                    setCompanyProfile(null);
                    setUeiSAM('');
                    setDescription('');
                    setBusinessTypes([]);
                    setNaicsCodes([]);
                    setCapabilities([]);
                    setPastPerformance([]);
                    setCertifications([]);
                    setContactInfo({
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      phone: '',
                      email: '',
                      website: ''
                    });
                  }}
                >
                  New Profile
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* UEI SAM Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Company Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">UEI SAM Number *</label>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your UEI SAM number to automatically fetch company data from SAM.gov
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Company Name</label>
                  <Input
                    placeholder="Company name"
                    value={companyProfile?.entityName || ''}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* AI Enhancement Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">AI-Powered Profile Enhancement</h3>
              <div className="bg-gradient-to-r from-muted/50 to-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Enhance Your Profile with AI</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use AI to automatically populate your company profile with detailed information based on your company name and website.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Company Name</label>
                        <Input
                          placeholder="Company name"
                          value={companyProfile?.entityName || ''}
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Website URL</label>
                        <Input
                          placeholder="https://yourcompany.com"
                          value={contactInfo.website}
                          onChange={(e) => setContactInfo({...contactInfo, website: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={handleEnhanceProfile}
                      disabled={isEnhancing || !companyProfile?.entityName}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                    >
                      {isEnhancing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {companyProfile?.aiEnhanced && (
                  <div className="mt-4 p-3 bg-card rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">AI Enhancement Details</span>
                      <span className="text-xs text-muted-foreground">
                        Enhanced {new Date(companyProfile.aiEnhanced.lastEnhanced).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div><span className="font-medium">Industry:</span> {companyProfile.aiEnhanced.industry}</div>
                      <div><span className="font-medium">Size:</span> {companyProfile.aiEnhanced.companySize}</div>
                      {companyProfile.aiEnhanced.foundingYear && (
                        <div><span className="font-medium">Founded:</span> {companyProfile.aiEnhanced.foundingYear}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Company Description</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Description *</label>
                <textarea
                  className="w-full mt-1 p-3 border border-border rounded-lg resize-none bg-background text-foreground"
                  rows={4}
                  placeholder="Describe what your company does, your expertise, and key capabilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Types */}
                <div>
                  <label className="text-sm font-medium text-foreground">Business Types</label>
                  <div className="mt-1 space-y-2">
                    {businessTypes.map((type, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm bg-muted px-2 py-1 rounded">{type}</span>
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
                  <label className="text-sm font-medium text-foreground">NAICS Codes</label>
                  <div className="mt-1 space-y-2">
                    {naicsCodes.map((code, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm bg-muted px-2 py-1 rounded">{code}</span>
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
              <h3 className="text-lg font-medium text-foreground">Capabilities & Expertise</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Key Capabilities</label>
                <div className="mt-1 space-y-2">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{capability}</span>
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

            {/* AI Enhanced Information Display */}
            {companyProfile?.aiEnhanced && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">AI-Enhanced Company Information</h3>
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Overview */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Company Overview</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Industry:</span> {companyProfile.aiEnhanced.industry}</div>
                        <div><span className="font-medium">Company Size:</span> {companyProfile.aiEnhanced.companySize}</div>
                        {companyProfile.aiEnhanced.foundingYear && (
                          <div><span className="font-medium">Founded:</span> {companyProfile.aiEnhanced.foundingYear}</div>
                        )}
                        {companyProfile.aiEnhanced.revenue && (
                          <div><span className="font-medium">Revenue:</span> {companyProfile.aiEnhanced.revenue}</div>
                        )}
                        {companyProfile.aiEnhanced.employeeCount && (
                          <div><span className="font-medium">Employees:</span> {companyProfile.aiEnhanced.employeeCount}</div>
                        )}
                      </div>
                    </div>

                    {/* Key Products & Markets */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Products & Markets</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-foreground">Key Products:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {companyProfile.aiEnhanced.keyProducts.map((product, index) => (
                              <span key={index} className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{product}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">Target Markets:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {companyProfile.aiEnhanced.targetMarkets.map((market, index) => (
                              <span key={index} className="text-xs bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">{market}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitive Advantages */}
                  {companyProfile.aiEnhanced.competitiveAdvantages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-foreground mb-2">Competitive Advantages</h4>
                      <div className="flex flex-wrap gap-2">
                        {companyProfile.aiEnhanced.competitiveAdvantages.map((advantage, index) => (
                          <span key={index} className="text-sm bg-purple-500/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">{advantage}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technology Stack */}
                  {companyProfile.aiEnhanced.technologyStack && companyProfile.aiEnhanced.technologyStack.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-foreground mb-2">Technology Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {companyProfile.aiEnhanced.technologyStack.map((tech, index) => (
                          <span key={index} className="text-sm bg-orange-500/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Partnerships & Awards */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyProfile.aiEnhanced.partnerships && companyProfile.aiEnhanced.partnerships.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Partnerships</h4>
                        <div className="flex flex-wrap gap-2">
                          {companyProfile.aiEnhanced.partnerships.map((partner, index) => (
                            <span key={index} className="text-sm bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">{partner}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {companyProfile.aiEnhanced.awards && companyProfile.aiEnhanced.awards.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Awards & Recognition</h4>
                        <div className="flex flex-wrap gap-2">
                          {companyProfile.aiEnhanced.awards.map((award, index) => (
                            <span key={index} className="text-sm bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">{award}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Past Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Past Performance</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Past Performance Projects</label>
                <div className="mt-1 space-y-2">
                  {pastPerformance.map((project, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">{project}</span>
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
              <h3 className="text-lg font-medium text-foreground">Certifications</h3>
              <div>
                <label className="text-sm font-medium text-foreground">Certifications & Qualifications</label>
                <div className="mt-1 space-y-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">{cert}</span>
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
              <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <Input
                    placeholder="Street address"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input
                    placeholder="City"
                    value={contactInfo.city}
                    onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">State</label>
                  <Input
                    placeholder="State"
                    value={contactInfo.state}
                    onChange={(e) => setContactInfo({...contactInfo, state: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">ZIP Code</label>
                  <Input
                    placeholder="ZIP code"
                    value={contactInfo.zipCode}
                    onChange={(e) => setContactInfo({...contactInfo, zipCode: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    placeholder="Phone number"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    placeholder="Email address"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Website</label>
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
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reset
              </Button>
              <Button onClick={handleSaveProfile} disabled={!ueiSAM.trim() || !description.trim()}>
                Save Company Profile
              </Button>
            </div>

            {/* SAM Entity Data Display */}
            {companyProfile?.samEntityData && (
              <div className="mt-6 p-4 bg-card rounded-lg">
                <h4 className="font-medium text-foreground mb-2">SAM.gov Entity Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">CAGE Code:</span> {companyProfile.samEntityData.entityRegistration.cageCode}
                  </div>
                  <div>
                    <span className="font-medium">Registration Status:</span> {companyProfile.samEntityData.entityRegistration.registrationStatus}
                  </div>
                  <div>
                    <span className="font-medium">Registration Date:</span> {new Date(companyProfile.samEntityData.entityRegistration.registrationDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(companyProfile.samEntityData.entityRegistration.lastUpdateDate).toLocaleDateString()}
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

// Vector Store View Component
function VectorStoreView() {
  const [isLoading, setIsLoading] = useState(false);
  const [vectorStoreData, setVectorStoreData] = useState<any>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [collectionDetails, setCollectionDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  // Load vector store data on component mount
  useEffect(() => {
    loadVectorStoreData();
  }, []);

  const loadVectorStoreData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/vector-store');
      const result = await response.json();
      
      if (result.success) {
        setVectorStoreData(result.data);
      } else {
        setError(result.error || 'Failed to load vector store data');
      }
    } catch (error) {
      console.error('Failed to load vector store data:', error);
      setError('Failed to connect to vector store');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollectionDetails = async (collectionName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/vector-store?action=sample&collection=${collectionName}&limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setCollectionDetails(result.data);
        setSelectedCollection(collectionName);
      } else {
        setError(result.error || 'Failed to load collection details');
      }
    } catch (error) {
      console.error('Failed to load collection details:', error);
      setError('Failed to load collection details');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCollection = async (collectionName: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/vector-store?action=delete&collection=${collectionName}`, {
        method: 'GET'
      });
      const result = await response.json();
      
      if (result.success) {
        // Reload data after deletion
        await loadVectorStoreData();
        if (selectedCollection === collectionName) {
          setSelectedCollection(null);
          setCollectionDetails(null);
        }
      } else {
        setError(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      setError('Failed to delete collection');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (collectionName: string, recordId: string) => {
    if (!confirm(`Are you sure you want to delete the record "${recordId}" from collection "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/vector-store?action=delete-record&collection=${collectionName}&ids=${recordId}`, {
        method: 'GET'
      });
      const result = await response.json();
      
      if (result.success) {
        // Reload collection details after deletion
        if (selectedCollection === collectionName) {
          await loadCollectionDetails(collectionName);
        }
        // Also reload main data to update counts
        await loadVectorStoreData();
      } else {
        setError(result.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
      setError('Failed to delete record');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSelectedRecords = async () => {
    if (selectedRecords.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedRecords.size} selected record(s) from collection "${selectedCollection}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const recordIds = Array.from(selectedRecords).join(',');
      const response = await fetch(`/api/vector-store?action=delete-record&collection=${selectedCollection}&ids=${recordIds}`, {
        method: 'GET'
      });
      const result = await response.json();
      
      if (result.success) {
        // Clear selection and reload data
        setSelectedRecords(new Set());
        await loadCollectionDetails(selectedCollection!);
        await loadVectorStoreData();
      } else {
        setError(result.error || 'Failed to delete selected records');
      }
    } catch (error) {
      console.error('Failed to delete selected records:', error);
      setError('Failed to delete selected records');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecordSelection = (recordId: string) => {
    const newSelection = new Set(selectedRecords);
    if (newSelection.has(recordId)) {
      newSelection.delete(recordId);
    } else {
      newSelection.add(recordId);
    }
    setSelectedRecords(newSelection);
  };

  const selectAllRecords = () => {
    if (collectionDetails?.samples) {
      const allIds = collectionDetails.samples.map((sample: any) => sample.id);
      setSelectedRecords(new Set(allIds));
    }
  };

  const clearSelection = () => {
    setSelectedRecords(new Set());
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return 'No metadata';
    
    return Object.entries(metadata)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
  };

  if (isLoading && !vectorStoreData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Vector Store Dashboard
            </CardTitle>
            <CardDescription>
              View and manage your vector store data and collections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading vector store data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Vector Store Dashboard
            </CardTitle>
            <Button onClick={loadVectorStoreData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            View and manage your vector store data and collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Vector Store Status */}
          {vectorStoreData?.stats && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Vector Store Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Connection Status</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      vectorStoreData.stats.connected ? "bg-green-500" : "bg-red-500"
                    )} />
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {vectorStoreData.stats.connected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Total Collections</span>
                  <p className="text-lg font-semibold mt-1">{vectorStoreData.stats.collections.length}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Active Collections</span>
                  <p className="text-lg font-semibold mt-1">
                    {vectorStoreData.collections?.filter((col: any) => col.hasData).length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collections */}
          {vectorStoreData?.collections && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Collections</h3>
              
              {vectorStoreData.collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No collections found in the vector store.</p>
                  <p className="text-sm">Collections will appear here when you add data to the vector store.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {vectorStoreData.collections.map((collection: any) => (
                    <Card key={collection.name} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{collection.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {collection.hasData ? (
                              <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                {collection.sampleCount} items
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-500/20 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                Empty
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteCollection(collection.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {collection.error ? (
                          <p className="text-sm text-destructive">{collection.error}</p>
                        ) : (
                          <div className="space-y-3">
                            {collection.samples.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Sample Data:</p>
                                {collection.samples.map((sample: any, index: number) => (
                                  <div key={index} className="p-3 bg-muted/30 rounded border">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                          ID: {sample.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Score: {sample.score?.toFixed(3) || 'N/A'}
                                        </p>
                                        {sample.metadata && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {formatMetadata(sample.metadata)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No sample data available</p>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadCollectionDetails(collection.name)}
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collection Details Modal */}
          {selectedCollection && collectionDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Collection: {selectedCollection}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedCollection(null);
                      setCollectionDetails(null);
                      setSelectedRecords(new Set());
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Total items: {collectionDetails.count}
                    </p>
                    <div className="flex items-center space-x-2">
                      {selectedRecords.size > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedRecords.size} selected
                        </span>
                      )}
                      {selectedRecords.size > 0 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={deleteSelectedRecords}
                          disabled={isLoading}
                        >
                          Delete Selected ({selectedRecords.size})
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllRecords}
                      disabled={isLoading}
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearSelection}
                      disabled={isLoading}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {collectionDetails.samples.map((sample: any, index: number) => (
                      <Card key={index} className={selectedRecords.has(sample.id) ? "ring-2 ring-primary" : ""}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.has(sample.id)}
                                  onChange={() => toggleRecordSelection(sample.id)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <p className="font-medium text-foreground">ID: {sample.id}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  Score: {sample.score?.toFixed(3) || 'N/A'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteRecord(selectedCollection!, sample.id)}
                                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                  title="Delete this record"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                            
                            {sample.metadata && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Metadata:</p>
                                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                  <pre className="whitespace-pre-wrap">{formatMetadata(sample.metadata)}</pre>
                                </div>
                              </div>
                            )}
                            
                            {sample.values && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Vector (first 10 dimensions):</p>
                                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                  [{sample.values.slice(0, 10).map((v: number) => v.toFixed(4)).join(', ')}...]
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}