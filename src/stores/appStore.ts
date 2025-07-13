import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AppState, 
  LLMConfig, 
  LLMProvider, 
  ChatSession, 
  ChatMessage, 
  SAMOpportunity, 
  SAMSearchFilters, 
  WorkingList,
  WorkingListItem,
  VectorSearchResult,
  SemanticSearchResult,
  CompanyProfile,
  SAMEntityData
} from '@/types';
import { generateId, generateUUID, encryptData, decryptData, generateEncryptionKey } from '@/lib/utils';

// Default LLM configuration
const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2000,
};

// Get API keys from environment variables if available
const getEnvApiKey = (provider: string) => {
  // On client-side, we can only access NEXT_PUBLIC_ prefixed variables
  if (typeof window !== 'undefined') {
    switch (provider) {
      case 'openai':
        return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
      case 'anthropic':
        return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
      case 'huggingface':
        return process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';
      default:
        return '';
    }
  }
  return ''; // Server-side, return empty
};

// Initial state
const initialState: AppState = {
  llmConfig: {
    ...DEFAULT_LLM_CONFIG,
    apiKey: getEnvApiKey(DEFAULT_LLM_CONFIG.provider),
  },
  llmProviders: {
    openai: { 
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] 
    },
    anthropic: { 
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1'] 
    },
    huggingface: { 
      models: ['microsoft/DialoGPT-large', 'mistralai/Mistral-7B-Instruct-v0.2', 'meta-llama/Llama-2-7b-chat-hf'] 
    },
  },
  currentSession: null,
  chatSessions: [],
  isStreaming: false,
  searchResults: [],
  searchFilters: {
    keyword: '',
    active: true,
    limit: 50,
    offset: 0,
  },
  searchQuery: '',
  isSearching: false,
  favorites: [],
  
  // Vector Search State
  vectorSearchResults: [],
  semanticSearchResults: null,
  isVectorSearching: false,
  
  // Working List State
  workingLists: [],
  currentWorkingList: null,
  workingListItems: [],
  isWorkingListLoading: false,
  

  companyProfile: null,
  isCompanyProfileLoading: false,
  sidebarOpen: true,
  currentView: 'chat',
  theme: 'light',
  samApiKey: typeof window === 'undefined' ? '' : (process.env.NEXT_PUBLIC_SAM_API_KEY || ''),
  encryptionKey: '',
  settings: {
    autoSave: true,
    notifications: true,
    analytics: false,
  },
  
  // Cache State
  lastSearchCached: false,
  lastSearchTimestamp: null,
  cacheNotificationDismissed: false,
  
  // Chat Prepopulated Message State
  prepopulatedMessage: null,
};

// Store interface with actions
interface AppStore extends AppState {
  // LLM Actions
  setLLMConfig: (config: Partial<LLMConfig>) => void;
  setLLMProvider: (provider: LLMProvider) => void;
  setLLMModel: (model: string) => void;
  setLLMApiKey: (apiKey: string) => void;
  validateLLMConfig: () => Promise<boolean>;
  
  // Chat Actions
  createChatSession: (title?: string) => ChatSession;
  setCurrentSession: (session: ChatSession | null) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  updateMessageInSession: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  clearAllSessions: () => void;
  importSessions: (sessions: ChatSession[]) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setPrepopulatedMessage: (message: string | null) => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SAMOpportunity[]) => void;
  setSearchFilters: (filters: Partial<SAMSearchFilters>) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToFavorites: (opportunityId: string) => void;
  removeFromFavorites: (opportunityId: string) => void;
  toggleFavorite: (opportunityId: string) => void;
  clearSearchResults: () => void;
  
  // Vector Search Actions
  setVectorSearchResults: (results: VectorSearchResult[]) => void;
  setSemanticSearchResults: (results: SemanticSearchResult | null) => void;
  setIsVectorSearching: (isSearching: boolean) => void;
  performVectorSearch: (query: string, filters?: any) => Promise<void>;
  
  // Working List Actions
  setWorkingLists: (lists: WorkingList[]) => void;
  setCurrentWorkingList: (list: WorkingList | null) => void;
  setWorkingListItems: (items: WorkingListItem[]) => void;
  setIsWorkingListLoading: (loading: boolean) => void;
  createWorkingList: (list: Omit<WorkingList, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkingList>;
  updateWorkingList: (listId: string, updates: Partial<WorkingList>) => Promise<void>;
  deleteWorkingList: (listId: string) => Promise<void>;
  addItemToWorkingList: (listId: string, item: Omit<WorkingListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkingListItem: (itemId: string, updates: Partial<WorkingListItem>) => Promise<void>;
  removeItemFromWorkingList: (listId: string, itemId: string) => Promise<void>;
  

  
  // Company Profile Actions
  setCompanyProfile: (profile: CompanyProfile | null) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  setIsCompanyProfileLoading: (loading: boolean) => void;
  fetchSAMEntityData: (ueiSAM: string) => Promise<SAMEntityData | null>;
  saveCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  enhanceCompanyProfile: (companyName: string, website?: string) => Promise<any>;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: 'chat' | 'search' | 'forecast' | 'upload' | 'vectorstore') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Settings Actions
  setSamApiKey: (apiKey: string) => void;
  setEncryptionKey: (key: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  
  // Cache Actions
  setLastSearchCached: (cached: boolean, timestamp?: number) => void;
  dismissCacheNotification: () => void;
  
  // Utility Actions
  resetStore: () => void;
  exportData: () => string;
  importData: (data: string) => void;
        initializeStore: () => Promise<void>;
  loadSavedProfiles: () => Promise<CompanyProfile[]>;
  loadProfile: (profileId: string) => CompanyProfile | null;
}

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // LLM Actions
      setLLMConfig: (config) => 
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),
      
      setLLMProvider: (provider) => 
        set((state) => ({
          llmConfig: { 
            ...state.llmConfig, 
            provider,
            model: state.llmProviders[provider].models[0] || '',
            apiKey: getEnvApiKey(provider) || state.llmConfig.apiKey, // Try to get from env first
          },
        })),
      
      setLLMModel: (model) => 
        set((state) => ({
          llmConfig: { ...state.llmConfig, model },
        })),
      
      setLLMApiKey: (apiKey) => 
        set((state) => ({
          llmConfig: { ...state.llmConfig, apiKey },
        })),
      
      validateLLMConfig: async () => {
        const { llmConfig } = get();
        if (!llmConfig.apiKey || !llmConfig.model) return false;
        
        try {
          // Test API call with minimal request
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${llmConfig.apiKey}`
            },
            body: JSON.stringify({
              model: `${llmConfig.provider}:${llmConfig.model}`,
              messages: [{ role: 'user', content: 'test' }],
              context: { test: true }
            }),
          });
          
          return response.ok;
        } catch {
          return false;
        }
      },
      
      // Chat Actions
      createChatSession: () => {
        const session: ChatSession = {
          id: generateUUID(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          llmConfig: get().llmConfig,
        };
        
        set((state) => ({
          chatSessions: [...state.chatSessions, session],
          currentSession: session,
        }));
        
        return session;
      },
      
      setCurrentSession: (session) => 
        set({ currentSession: session }),
      
      updateSession: (sessionId, updates) => 
        set((state) => ({
          chatSessions: state.chatSessions.map(session =>
            session.id === sessionId 
              ? { ...session, ...updates, updatedAt: Date.now() }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates, updatedAt: Date.now() }
            : state.currentSession,
        })),
      
      deleteSession: (sessionId) => 
        set((state) => ({
          chatSessions: state.chatSessions.filter(s => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        })),
      
      addMessageToSession: (sessionId, message) => 
        set((state) => ({
          chatSessions: state.chatSessions.map(session =>
            session.id === sessionId 
              ? { 
                  ...session, 
                  messages: [...session.messages, message],
                  updatedAt: Date.now(),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { 
                ...state.currentSession,
                messages: [...state.currentSession.messages, message],
                updatedAt: Date.now(),
              }
            : state.currentSession,
        })),
      
      updateMessageInSession: (sessionId, messageId, updates) => 
        set((state) => ({
          chatSessions: state.chatSessions.map(session =>
            session.id === sessionId 
              ? { 
                  ...session, 
                  messages: session.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { 
                ...state.currentSession,
                messages: state.currentSession.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: Date.now(),
              }
            : state.currentSession,
        })),
      
      clearAllSessions: () => 
        set({ chatSessions: [], currentSession: null }),
      
      importSessions: (sessions) => 
        set((state) => ({
          chatSessions: [...state.chatSessions, ...sessions],
          currentSession: state.currentSession || (sessions.length > 0 ? sessions[0] : null),
        })),
      
      setIsStreaming: (isStreaming) => 
        set({ isStreaming }),
      
      setPrepopulatedMessage: (message) => 
        set({ prepopulatedMessage: message }),
      
      // Search Actions
      setSearchQuery: (query) => 
        set({ searchQuery: query }),
      
      setSearchResults: (results) => 
        set({ searchResults: results }),
      
      setSearchFilters: (filters) => 
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),
      
      setIsSearching: (isSearching) => 
        set({ isSearching }),
      
      addToFavorites: (opportunityId) => 
        set((state) => ({
          favorites: [...state.favorites, opportunityId],
        })),
      
      removeFromFavorites: (opportunityId) => 
        set((state) => ({
          favorites: state.favorites.filter(id => id !== opportunityId),
        })),
      
      toggleFavorite: (opportunityId) => 
        set((state) => ({
          favorites: state.favorites.includes(opportunityId)
            ? state.favorites.filter(id => id !== opportunityId)
            : [...state.favorites, opportunityId],
        })),
      
      clearSearchResults: () => 
        set({ searchResults: [] }),
      
      // Vector Search Actions
      setVectorSearchResults: (results) => 
        set({ vectorSearchResults: results }),
      
      setSemanticSearchResults: (results) => 
        set({ semanticSearchResults: results }),
      
      setIsVectorSearching: (isSearching) => 
        set({ isVectorSearching: isSearching }),
      
      performVectorSearch: async (query, filters) => {
        set({ isVectorSearching: true });
        try {
          const params = new URLSearchParams({ q: query });
          if (filters?.type) params.append('type', filters.type.join(','));
          if (filters?.tags) params.append('tags', filters.tags.join(','));
          
          const response = await fetch(`/api/vector-search?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            set({ 
              vectorSearchResults: data.data.results,
              semanticSearchResults: data.data,
              isVectorSearching: false 
            });
          } else {
            set({ isVectorSearching: false });
          }
        } catch (error) {
          console.error('Vector search error:', error);
          set({ isVectorSearching: false });
        }
      },
      
      // Working List Actions
      setWorkingLists: (lists) => 
        set({ workingLists: lists }),
      
      setCurrentWorkingList: (list) => 
        set({ currentWorkingList: list }),
      
      setWorkingListItems: (items) => 
        set({ workingListItems: items }),
      
      setIsWorkingListLoading: (loading) => 
        set({ isWorkingListLoading: loading }),
      
      createWorkingList: async (list) => {
        set({ isWorkingListLoading: true });
        try {
          const response = await fetch('/api/working-lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(list),
          });
          
          if (response.ok) {
            const data = await response.json();
            const newList = data.data.list;
            set((state) => ({
              workingLists: [...state.workingLists, newList],
              isWorkingListLoading: false,
            }));
            return newList;
          } else {
            set({ isWorkingListLoading: false });
            throw new Error('Failed to create working list');
          }
        } catch (error) {
          set({ isWorkingListLoading: false });
          throw error;
        }
      },
      
      updateWorkingList: async (listId, updates) => {
        try {
          const response = await fetch('/api/working-lists', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listId, updates }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const updatedList = data.data.list;
            set((state) => ({
              workingLists: state.workingLists.map(list => 
                list.id === listId ? updatedList : list
              ),
              currentWorkingList: state.currentWorkingList?.id === listId 
                ? updatedList 
                : state.currentWorkingList,
            }));
          }
        } catch (error) {
          console.error('Update working list error:', error);
        }
      },
      
      deleteWorkingList: async (listId) => {
        try {
          const response = await fetch(`/api/working-lists?listId=${listId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            set((state) => ({
              workingLists: state.workingLists.filter(list => list.id !== listId),
              currentWorkingList: state.currentWorkingList?.id === listId 
                ? null 
                : state.currentWorkingList,
            }));
          }
        } catch (error) {
          console.error('Delete working list error:', error);
        }
      },
      
      addItemToWorkingList: async (listId, item) => {
        try {
          const response = await fetch('/api/working-lists/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listId, item }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const newItem = data.data.item;
            set((state) => ({
              workingListItems: [...state.workingListItems, newItem],
            }));
          }
        } catch (error) {
          console.error('Add item to working list error:', error);
        }
      },
      
      updateWorkingListItem: async (itemId, updates) => {
        try {
          const response = await fetch('/api/working-lists/items', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, updates }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const updatedItem = data.data.item;
            set((state) => ({
              workingListItems: state.workingListItems.map(item => 
                item.id === itemId ? updatedItem : item
              ),
            }));
          }
        } catch (error) {
          console.error('Update working list item error:', error);
        }
      },
      
      removeItemFromWorkingList: async (listId, itemId) => {
        try {
          const response = await fetch(`/api/working-lists/items?listId=${listId}&itemId=${itemId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            set((state) => ({
              workingListItems: state.workingListItems.filter(item => item.id !== itemId),
            }));
          }
        } catch (error) {
          console.error('Remove item from working list error:', error);
        }
      },
      
      
      
      // Company Profile Actions
      setCompanyProfile: (profile) => 
        set({ companyProfile: profile }),
      
      updateCompanyProfile: (updates) => 
        set((state) => ({
          companyProfile: state.companyProfile ? { ...state.companyProfile, ...updates, updatedAt: Date.now() } : null,
        })),
      
      setIsCompanyProfileLoading: (loading) => 
        set({ isCompanyProfileLoading: loading }),
      
      fetchSAMEntityData: async (ueiSAM) => {
        try {
          const samApiKey = get().samApiKey;
          if (!samApiKey) {
            throw new Error('SAM API key is required');
          }
          
          const params = new URLSearchParams({
            ueiSAM,
            samApiKey,
            limit: '1'
          });
          
          const response = await fetch(`/api/sam-entity?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.entities && data.data.entities.length > 0) {
              return data.data.entities[0];
            }
          }
          return null;
        } catch (error) {
          console.error('Failed to fetch SAM entity data:', error);
          return null;
        }
      },
      
      saveCompanyProfile: async (profile) => {
        try {
          // Save to localStorage for persistence
          const profiles = JSON.parse(localStorage.getItem('opensam-company-profiles') || '{}');
          profiles[profile.id] = profile;
          localStorage.setItem('opensam-company-profiles', JSON.stringify(profiles));
          
          // Update store
          set({ companyProfile: profile });
          
          // Trigger a refresh of saved profiles in the UI
          // This will be handled by the component's useEffect
          
          // Add to vector store for matching (server-side only)
          if (typeof window === 'undefined') {
            try {
              const { vectorStoreServerUtils } = await import('@/lib/vectorStore-server');
              await vectorStoreServerUtils.addCompanyProfile(profile);
              console.log('✅ Company profile added to vector store');
            } catch (vectorError) {
              console.warn('⚠️ Failed to add company profile to vector store:', vectorError);
            }
          } else {
            // In browser, make API call to add to vector store
            try {
              const response = await fetch('/api/company-profile/vectorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
              });
              
              if (response.ok) {
                console.log('✅ Company profile added to vector store via API');
              } else {
                console.warn('⚠️ Failed to add company profile to vector store via API');
              }
            } catch (apiError) {
              console.warn('⚠️ Failed to add company profile to vector store via API:', apiError);
            }
          }
        } catch (error) {
          console.error('Failed to save company profile:', error);
          throw error;
        }
      },
      
      enhanceCompanyProfile: async (companyName, website) => {
        try {
          const { llmConfig } = get();
          
          if (!llmConfig.apiKey || !llmConfig.model) {
            throw new Error('LLM configuration is required for company enhancement');
          }
          
          const response = await fetch('/api/company-enhance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${llmConfig.apiKey}`
            },
            body: JSON.stringify({
              companyName,
              website,
              llmConfig: {
                model: `${llmConfig.provider}:${llmConfig.model}`,
                apiKey: llmConfig.apiKey,
                temperature: llmConfig.temperature || 0.3,
                maxTokens: llmConfig.maxTokens || 2000
              }
            })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to enhance company profile');
          }
          
          const data = await response.json();
          return data.data;
        } catch (error) {
          console.error('Failed to enhance company profile:', error);
          throw error;
        }
      },
      
      // UI Actions
      setSidebarOpen: (open) => 
        set({ sidebarOpen: open }),
      
      setCurrentView: (view) => 
        set({ currentView: view }),
      
      setTheme: (theme) => 
        set({ theme }),
      
      // Settings Actions
      setSamApiKey: (apiKey) => {
        const { encryptionKey } = get();
        const encryptedKey = encryptionKey ? encryptData(apiKey, encryptionKey) : apiKey;
        set({ samApiKey: encryptedKey });
      },
      
      setEncryptionKey: (key) => 
        set({ encryptionKey: key }),
      
      updateSettings: (settings) => 
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      // Cache Actions
      setLastSearchCached: (cached, timestamp) => 
        set({ lastSearchCached: cached, lastSearchTimestamp: timestamp }),
      
      dismissCacheNotification: () => 
        set({ cacheNotificationDismissed: true }),
      
      // Utility Actions
      resetStore: () => 
        set(initialState),
      
      exportData: () => {
        const state = get();
        const exportData = {
          chatSessions: state.chatSessions,
          favorites: state.favorites,
          settings: state.settings,
          searchFilters: state.searchFilters,
        };
        return JSON.stringify(exportData, null, 2);
      },
      
      importData: (data) => {
        try {
          const importedData = JSON.parse(data);
          set((state) => ({
            ...state,
            ...importedData,
          }));
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },
      
      initializeStore: async () => {
        try {
          // Fetch configuration from server
          const response = await fetch('/api/config');
          if (response.ok) {
            const data = await response.json();
            const config = data.config;
            
            // Update API keys if they're available on the server
            const currentConfig = get().llmConfig;
            if (config.openai.hasKey && !currentConfig.apiKey) {
              set((state) => ({
                llmConfig: { ...state.llmConfig, apiKey: 'server-configured' }
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch config:', error);
        }
        
        const state = get();
        
        // Generate encryption key if not present
        if (!state.encryptionKey) {
          const key = generateEncryptionKey();
          set({ encryptionKey: key });
        }
        
        // Validate and update LLM config
        if (!state.llmConfig.apiKey) {
          // Try to load from localStorage if available
          try {
            const savedKey = localStorage.getItem('opensam-llm-key');
            if (savedKey && state.encryptionKey) {
              const decryptedKey = decryptData(savedKey, state.encryptionKey);
              set((state) => ({
                llmConfig: { ...state.llmConfig, apiKey: decryptedKey },
              }));
            }
          } catch {
            // Ignore decryption errors
          }
        }
      },

      loadSavedProfiles: async () => {
        try {
          console.log('🔄 Loading company profiles from vector store...');
          
          // Fetch profiles from vector store API
          const response = await fetch('/api/company-profiles');
          if (!response.ok) {
            throw new Error(`Failed to fetch profiles: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.success && data.data.profiles) {
            console.log(`✅ Loaded ${data.data.profiles.length} company profiles from vector store`);
            return data.data.profiles;
          } else {
            console.warn('⚠️ No profiles found in vector store');
            return [];
          }
        } catch (error) {
          console.error('❌ Failed to load profiles from vector store:', error);
          // Fallback to localStorage if vector store is unavailable
          try {
            const profiles = JSON.parse(localStorage.getItem('opensam-company-profiles') || '{}');
            console.log('🔄 Falling back to localStorage profiles');
            return Object.values(profiles);
          } catch (localStorageError) {
            console.error('❌ Failed to load profiles from localStorage:', localStorageError);
            return [];
          }
        }
      },

      loadProfile: (profileId: string) => {
        try {
          console.log(`🔄 Loading company profile with ID: ${profileId}`);
          const profiles = JSON.parse(localStorage.getItem('opensam-company-profiles') || '{}');
          const profile = profiles[profileId];
          if (profile) {
            console.log(`✅ Found company profile in localStorage: ${profile.entityName}`);
            set({ companyProfile: profile });
            
            // Also add to vector store for matching
            if (typeof window === 'undefined') {
              console.log(`🔄 Server-side: Adding company profile to vector store...`);
              // Server-side: direct vector store addition
              try {
                const { vectorStoreServerUtils } = require('@/lib/vectorStore-server');
                vectorStoreServerUtils.addCompanyProfile(profile).catch((error: any) => {
                  console.warn('⚠️ Failed to add company profile to vector store:', error);
                });
              } catch (vectorError) {
                console.warn('⚠️ Failed to import vector store utils:', vectorError);
              }
            } else {
              console.log(`🔄 Browser: Adding company profile to vector store via API...`);
              // Browser: API call to add to vector store
              fetch('/api/company-profile/vectorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
              }).then(response => {
                if (response.ok) {
                  console.log('✅ Company profile added to vector store via API');
                } else {
                  console.warn('⚠️ Failed to add company profile to vector store via API');
                }
              }).catch(apiError => {
                console.warn('⚠️ Failed to add company profile to vector store via API:', apiError);
              });
            }
            
            return profile;
          }
          console.warn(`⚠️ Company profile not found in localStorage for ID: ${profileId}`);
          return null;
        } catch (error) {
          console.error('Failed to load profile:', error);
          return null;
        }
      },
    }),
    {
      name: 'opensam-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        llmConfig: {
          ...state.llmConfig,
          apiKey: '', // Don't persist API key in localStorage
        },
        chatSessions: state.chatSessions,
        favorites: state.favorites,
        searchFilters: state.searchFilters,

        settings: state.settings,
        theme: state.theme,
        currentView: state.currentView,
        encryptionKey: state.encryptionKey,
      }),
    }
  )
);

// Selectors for optimized component re-renders
export const useCurrentSession = () => useAppStore((state) => state.currentSession);
export const useChatSessions = () => useAppStore((state) => state.chatSessions);
export const useLLMConfig = () => useAppStore((state) => state.llmConfig);
export const useSearchResults = () => useAppStore((state) => state.searchResults);
export const useSearchFilters = () => useAppStore((state) => state.searchFilters);

export const useUIState = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  currentView: state.currentView,
  theme: state.theme,
}));
export const useFavorites = () => useAppStore((state) => state.favorites);
export const useSettings = () => useAppStore((state) => state.settings);

// Vector Search Selectors
export const useVectorSearchResults = () => useAppStore((state) => state.vectorSearchResults);
export const useSemanticSearchResults = () => useAppStore((state) => state.semanticSearchResults);
export const useIsVectorSearching = () => useAppStore((state) => state.isVectorSearching);

// Working List Selectors
export const useWorkingLists = () => useAppStore((state) => state.workingLists);
export const useCurrentWorkingList = () => useAppStore((state) => state.currentWorkingList);
export const useWorkingListItems = () => useAppStore((state) => state.workingListItems);
export const useIsWorkingListLoading = () => useAppStore((state) => state.isWorkingListLoading);

// Company Profile Selectors
export const useCompanyProfile = () => useAppStore((state) => state.companyProfile);
export const useIsCompanyProfileLoading = () => useAppStore((state) => state.isCompanyProfileLoading);

// Initialize store on first load
if (typeof window !== 'undefined') {
  useAppStore.getState().initializeStore().catch(console.error);
}