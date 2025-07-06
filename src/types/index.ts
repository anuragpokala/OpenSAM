/**
 * OpenSAM AI Dashboard Type Definitions
 * Comprehensive type system for the application
 */

// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic' | 'huggingface';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
  id?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: LLMProvider;
  ragContext?: {
    opportunities: Array<{ opportunity: SAMOpportunity; score: number }>;
    companyProfile: CompanyProfile;
  };
}

// SAM.gov Types
export interface SAMOpportunity {
  id: string;
  noticeId: string;
  title: string;
  description: string;
  synopsis: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAsideDescription: string;
  typeOfSetAside: string;
  responseDeadLine: string;
  naicsCode: string;
  naicsDescription: string;
  classificationCode: string;
  active: boolean;
  
  // Enhanced award information
  award?: {
    date: string;
    number: string;
    amount: number;
    awardeeUeiSAM: string;
    awardee: string;
    awardeeAddress?: string;
    contractNumber?: string;
    contractVehicle?: string;
    fundingSource?: string;
  };
  
  // Enhanced contact information
  pointOfContact?: Array<{
    fax: string;
    type: string;
    email: string;
    phone: string;
    title: string;
    fullName: string;
  }>;
  
  // Enhanced location information
  placeOfPerformance?: {
    streetAddress: string;
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name: string;
    };
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
  
  organizationType: string;
  officeAddress?: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  
  // Enhanced links and attachments
  links?: Array<{
    rel: string;
    href: string;
    title?: string;
    type?: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  
  // Enhanced metadata
  uiLink: string;
  relevanceScore?: number;
  isFavorite?: boolean;
  tags?: string[];
  
  // New fields
  estimatedValue?: number;
  contractVehicle?: string;
  fundingSource?: string;
  entityName?: string;
  hasAttachments?: boolean;
  awardStatus?: 'pending' | 'awarded' | 'cancelled';
  lastModified?: string;
  solicitationNumber?: string;
}

export interface SAMSearchFilters {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  naicsCode?: string;
  state?: string;
  agency?: string;
  type?: string;
  setAside?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
  // New enhanced filters
  entityName?: string;
  contractVehicle?: string;
  estimatedValue?: {
    min?: number;
    max?: number;
  };
  fundingSource?: string;
  classificationCode?: string;
  responseDeadline?: {
    from?: string | undefined;
    to?: string | undefined;
  };
  awardStatus?: 'pending' | 'awarded' | 'cancelled';
  hasAttachments?: boolean;
}

export interface SAMSearchResponse {
  opportunities: SAMOpportunity[];
  totalRecords: number;
  limit: number;
  offset: number;
  facets?: {
    naicsCodes: Array<{ code: string; count: number }>;
    states: Array<{ code: string; count: number }>;
    agencies: Array<{ name: string; count: number }>;
    types: Array<{ type: string; count: number }>;
  };
}

// Chat Types
export interface ChatMessage extends LLMMessage {
  id: string;
  isTyping?: boolean;
  attachments?: UploadedFile[];
  samResults?: SAMOpportunity[];
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  llmConfig: LLMConfig;
}

// Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: number;
  processed: boolean;
  embeddings?: number[];
  metadata?: {
    pages?: number;
    wordCount?: number;
    summary?: string;
    extractedData?: Record<string, any>;
  };
}

// Company Profile Types
export interface CompanyProfile {
  id: string;
  ueiSAM: string;
  entityName: string;
  description: string;
  businessTypes: string[];
  naicsCodes: string[];
  capabilities: string[];
  pastPerformance: string[];
  certifications: string[];
  contactInfo: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    website: string;
  };
  // AI-enhanced fields
  aiEnhanced?: {
    industry: string;
    companySize: string;
    foundingYear?: number;
    revenue?: string;
    employeeCount?: string;
    enhancedDescription: string;
    keyProducts: string[];
    targetMarkets: string[];
    competitiveAdvantages: string[];
    technologyStack?: string[];
    partnerships?: string[];
    awards?: string[];
    lastEnhanced: number;
  };
  samEntityData?: SAMEntityData;
  createdAt: number;
  updatedAt: number;
}

export interface SAMEntityData {
  // SAM.gov API response structure
  entityRegistration: {
    samRegistered: string;
    ueiSAM: string;
    entityEFTIndicator: string | null;
    cageCode: string;
    dodaac: string | null;
    legalBusinessName: string;
    dbaName: string | null;
    purposeOfRegistrationCode: string;
    purposeOfRegistrationDesc: string;
    registrationStatus: string;
    evsSource: string;
    registrationDate: string;
    lastUpdateDate: string;
    registrationExpirationDate: string;
    activationDate: string;
    ueiStatus: string;
    ueiExpirationDate: string | null;
    ueiCreationDate: string;
    publicDisplayFlag: string;
    exclusionStatusFlag: string;
    exclusionURL: string | null;
    dnbOpenData: string | null;
  };
  coreData: {
    entityInformation: {
      entityURL: string;
      entityDivisionName: string | null;
      entityDivisionNumber: string | null;
      entityStartDate: string;
      fiscalYearEndCloseDate: string;
      submissionDate: string;
    };
    physicalAddress: {
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      stateOrProvinceCode: string;
      zipCode: string;
      zipCodePlus4: string;
      countryCode: string;
    };
    mailingAddress: {
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      stateOrProvinceCode: string;
      zipCode: string;
      zipCodePlus4: string;
      countryCode: string;
    };
    congressionalDistrict: string;
    generalInformation: {
      entityStructureCode: string;
      entityStructureDesc: string;
      entityTypeCode: string;
      entityTypeDesc: string;
      profitStructureCode: string;
      profitStructureDesc: string;
      organizationStructureCode: string | null;
      organizationStructureDesc: string | null;
      stateOfIncorporationCode: string;
      stateOfIncorporationDesc: string;
      countryOfIncorporationCode: string;
      countryOfIncorporationDesc: string;
    };
    businessTypes: {
      businessTypeList: Array<{
        businessTypeCode: string;
        businessTypeDesc: string;
      }>;
      sbaBusinessTypeList: Array<{
        sbaBusinessTypeCode: string | null;
        sbaBusinessTypeDesc: string | null;
        certificationEntryDate: string | null;
        certificationExitDate: string | null;
      }>;
    };
    financialInformation: {
      creditCardUsage: string;
      debtSubjectToOffset: string;
    };
  };
  assertions: {
    goodsAndServices: {
      primaryNaics: string;
      naicsList: Array<{
        naicsCode: string;
        naicsDescription: string;
        sbaSmallBusiness: string;
        naicsException: string | null;
      }>;
      pscList: Array<{
        pscCode: string;
        pscDescription: string;
      }>;
    };
    disasterReliefData: {
      disasterRegistryFlag: string;
      bondingFlag: string;
      geographicalAreaServed: Array<{
        geographicalAreaServedStateCode: string | null;
        geographicalAreaServedStateName: string | null;
        geographicalAreaServedCountyCode: string | null;
        geographicalAreaServedCountyName: string | null;
        geographicalAreaServedmetropol: string | null;
        geographicalAreaServedmetropolitanStatisticalAreaName: string | null;
      }>;
    };
    ediInformation: {
      ediInformationFlag: string;
    };
  };
  pointsOfContact: {
    governmentBusinessPOC: {
      firstName: string;
      middleInitial: string | null;
      lastName: string;
      title: string | null;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      stateOrProvinceCode: string;
      zipCode: string;
      zipCodePlus4: string | null;
      countryCode: string;
    };
    electronicBusinessPOC: {
      firstName: string;
      middleInitial: string | null;
      lastName: string;
      title: string | null;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      stateOrProvinceCode: string;
      zipCode: string;
      zipCodePlus4: string | null;
      countryCode: string;
    };
    governmentBusinessAlternatePOC: {
      firstName: string | null;
      middleInitial: string | null;
      lastName: string | null;
      title: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      stateOrProvinceCode: string | null;
      zipCode: string | null;
      zipCodePlus4: string | null;
      countryCode: string | null;
    };
    electronicBusinessAlternatePOC: {
      firstName: string | null;
      middleInitial: string | null;
      lastName: string | null;
      title: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      stateOrProvinceCode: string | null;
      zipCode: string | null;
      zipCodePlus4: string | null;
      countryCode: string | null;
    };
    pastPerformancePOC: {
      firstName: string | null;
      middleInitial: string | null;
      lastName: string | null;
      title: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      stateOrProvinceCode: string | null;
      zipCode: string | null;
      zipCodePlus4: string | null;
      countryCode: string | null;
    };
    pastPerformanceAlternatePOC: {
      firstName: string | null;
      middleInitial: string | null;
      lastName: string | null;
      title: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      stateOrProvinceCode: string | null;
      zipCode: string | null;
      zipCodePlus4: string | null;
      countryCode: string | null;
    };
  };
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface ForecastData {
  historical: ChartDataPoint[];
  predicted: ChartDataPoint[];
  confidence?: {
    upper: ChartDataPoint[];
    lower: ChartDataPoint[];
  };
}

// Application State Types
export interface AppState {
  // LLM Configuration
  llmConfig: LLMConfig;
  llmProviders: {
    openai: { models: string[] };
    anthropic: { models: string[] };
    huggingface: { models: string[] };
  };
  
  // Chat State
  currentSession: ChatSession | null;
  chatSessions: ChatSession[];
  isStreaming: boolean;
  
  // Search State
  searchResults: SAMOpportunity[];
  searchFilters: SAMSearchFilters;
  searchQuery: string;
  isSearching: boolean;
  favorites: string[];
  
  // Vector Search State
  vectorSearchResults: VectorSearchResult[];
  semanticSearchResults: SemanticSearchResult | null;
  isVectorSearching: boolean;
  
  // Working List State
  workingLists: WorkingList[];
  currentWorkingList: WorkingList | null;
  workingListItems: WorkingListItem[];
  isWorkingListLoading: boolean;
  

  
  // Company Profile State
  companyProfile: CompanyProfile | null;
  isCompanyProfileLoading: boolean;
  
  // UI State
  sidebarOpen: boolean;
  currentView: 'chat' | 'search' | 'forecast' | 'upload' | 'vectorstore';
  theme: 'light' | 'dark';
  
  // Settings
  samApiKey: string;
  encryptionKey: string;
  settings: {
    autoSave: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  
  // Cache State
  lastSearchCached: boolean;
  lastSearchTimestamp: number | null;
  cacheNotificationDismissed: boolean;
  
  // Chat Prepopulated Message State
  prepopulatedMessage: string | null;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Embedding Types
export interface EmbeddingRequest {
  text: string;
  model?: string;
  provider: LLMProvider;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Utility Types
export interface KeyValuePair {
  key: string;
  value: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  error: string | null;
  code?: string;
  retry?: () => void;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
}

// Notification Types
export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

// Export utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonNullable<T> = T extends null | undefined ? never : T;

// Vector Storage Types
export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    type: 'opportunity' | 'entity' | 'document' | 'chat';
    source: string;
    title?: string;
    description?: string;
    tags?: string[];
    timestamp: number;
    [key: string]: any;
  };
  embedding: number[];
  similarity?: number;
}

export interface VectorSearchResult {
  document: VectorDocument;
  score: number;
  highlights?: string[];
}

export interface VectorSearchQuery {
  text: string;
  filters?: {
    type?: string[];
    tags?: string[];
    dateRange?: {
      from: number;
      to: number;
    };
  };
  limit?: number;
  threshold?: number;
}

// Working List Types
export interface WorkingListItem {
  id: string;
  type: 'opportunity' | 'entity' | 'document' | 'note';
  itemId: string;
  title: string;
  description?: string;
  status: 'active' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes: string[];
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface WorkingList {
  id: string;
  name: string;
  description?: string;
  items: string[]; // Array of item IDs
  tags: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  collaborators?: string[];
}

// Enhanced Search Types
export interface SemanticSearchResult {
  query: string;
  results: VectorSearchResult[];
  totalResults: number;
  searchTime: number;
  filters?: Record<string, any>;
}

export interface SearchAnalytics {
  query: string;
  results: number;
  filters: Record<string, any>;
  timestamp: number;
  sessionId?: string;
  userActions?: {
    clicked: string[];
    favorited: string[];
    addedToWorkingList: string[];
  };
}