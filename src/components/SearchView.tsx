'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Plus, 
  Bookmark, 
  Calendar,
  MapPin,
  Building,
  DollarSign,
  FileText,
  Sparkles,
  List,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { CacheIndicator, CacheNotification } from '@/components/ui/cache-indicator';
import { LoadingSpinner, ButtonSpinner } from '@/components/ui/loading-spinner';

import { 
  useAppStore, 
  useSearchResults, 
  useSearchFilters, 
  useVectorSearchResults,
  useWorkingLists,
  useCurrentWorkingList,
  useCompanyProfile,
  useLLMConfig
} from '@/stores/appStore';
import { SAMOpportunity, WorkingList, WorkingListItem } from '@/types';
import { NAICS_CODES, OPPORTUNITY_TYPES, getNAICSCodesByIndustry, getOpportunityTypesByCategory } from '@/lib/naics-mapping';

// Custom icon components
const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const Microscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const Target = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

// Preset search queries for quick access using NAICS codes
const PRESET_QUERIES = [
  {
    id: 'it-software',
    label: 'IT & Software Development',
    naicsCodes: ['541511', '541512', '541519'],
    opportunityTypes: ['Solicitation', 'Request for Proposal (RFP)', 'Combined Synopsis/Solicitation'],
    description: 'Find IT and software development contracts using NAICS codes',
    icon: Sparkles
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity & Information Security',
    naicsCodes: ['541511', '541512', '541519', '561621'],
    opportunityTypes: ['Solicitation', 'Request for Proposal (RFP)'],
    description: 'Cybersecurity and information security opportunities',
    icon: Shield
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Medical',
    naicsCodes: ['621111', '621210', '621310', '621511', '621512'],
    opportunityTypes: ['Solicitation', 'Request for Proposal (RFP)'],
    description: 'Healthcare and medical service contracts',
    icon: Heart
  },
  {
    id: 'construction',
    label: 'Construction & Infrastructure',
    naicsCodes: ['236220', '237310', '238110', '238210'],
    opportunityTypes: ['Solicitation', 'Invitation for Bid (IFB)'],
    description: 'Construction and infrastructure projects',
    icon: Building
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing & Engineering',
    naicsCodes: ['332997', '333611', '333612', '333613'],
    opportunityTypes: ['Solicitation', 'Request for Quote (RFQ)'],
    description: 'Manufacturing and engineering contracts',
    icon: Target
  },
  {
    id: 'professional-services',
    label: 'Professional Services',
    naicsCodes: ['541611', '541612', '541613', '541614'],
    opportunityTypes: ['Solicitation', 'Request for Proposal (RFP)'],
    description: 'Professional and consulting services',
    icon: Users
  },
  {
    id: 'small-business',
    label: 'Small Business Set-Asides',
    naicsCodes: [],
    opportunityTypes: ['Small Business Set-Aside', '8(a) Business Development Program'],
    description: 'Small business set-aside opportunities',
    icon: Users
  },
  {
    id: 'research-development',
    label: 'Research & Development',
    naicsCodes: ['541715', '541720'],
    opportunityTypes: ['Research and Development', 'Innovation'],
    description: 'Research and development contracts',
    icon: Microscope
  }
];

// Preset chat messages for quick analysis
const PRESET_MESSAGES = [
  {
    id: 'analyze-opportunity',
    label: 'Analyze Opportunity',
    message: 'Please analyze this opportunity and provide key insights about requirements, timeline, and potential challenges.',
    icon: FileText
  },
  {
    id: 'competitor-analysis',
    label: 'Competitor Analysis',
    message: 'What are the key competitors for this type of opportunity and what are their strengths?',
    icon: Users
  },
  {
    id: 'proposal-strategy',
    label: 'Proposal Strategy',
    message: 'What would be an effective proposal strategy for this opportunity?',
    icon: Target
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment',
    message: 'What are the potential risks and challenges associated with this opportunity?',
    icon: AlertTriangle
  },
  {
    id: 'pricing-strategy',
    label: 'Pricing Strategy',
    message: 'What factors should be considered when developing a pricing strategy for this opportunity?',
    icon: DollarSign
  }
];

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalResults,
  resultsPerPage 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults: number;
  resultsPerPage: number;
}) {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {startResult} to {endResult} of {totalResults} results
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [naicsSearch, setNaicsSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showWorkingLists, setShowWorkingLists] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [newWorkingListName, setNewWorkingListName] = useState('');
  const [opportunityMatches, setOpportunityMatches] = useState<Record<string, number>>({});
  const [loadingMatches, setLoadingMatches] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  
  // Date filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    startDate: '',
    endDate: ''
  });
  
  const searchResults = useSearchResults();
  const searchFilters = useSearchFilters();
  const workingLists = useWorkingLists();
  const currentWorkingList = useCurrentWorkingList();
  const companyProfile = useCompanyProfile();
  const llmConfig = useLLMConfig();
  
  const {
    setSearchQuery: setStoreSearchQuery,
    setSearchResults,
    setSearchFilters,
    setIsSearching,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    createWorkingList,
    addItemToWorkingList,
    setCurrentWorkingList,
    setPrepopulatedMessage,
    setCurrentView,
    // Cache actions
    setLastSearchCached,
    dismissCacheNotification,
    lastSearchCached,
    lastSearchTimestamp,
    cacheNotificationDismissed,
    // State
    isSearching
  } = useAppStore();

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, titleSearch, naicsSearch, advancedFilters]);

  // Perform search with enhanced filters and pagination
  const performSearch = async (page: number = 1) => {
    // Check if SAM API key is configured
    const samApiKey = process.env.NEXT_PUBLIC_SAM_API_KEY;
    if (!samApiKey) {
      alert('SAM.gov API key is not configured. Please set NEXT_PUBLIC_SAM_API_KEY in your environment variables.');
      return;
    }
    
    setIsSearching(true);
    try {
      // Set default date range if not provided (current year for better results)
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      
      // Format dates as MM/dd/yyyy for SAM.gov API
      const formatDateForSAM = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };
      
      // Convert date string to MM/dd/yyyy format if needed
      const normalizeDate = (dateStr: string | null | undefined): string | undefined => {
        if (!dateStr) return undefined;
        
        // If already in MM/dd/yyyy format, return as is
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
          return dateStr;
        }
        
        // If in YYYY-MM-DD format, convert to MM/dd/yyyy
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [year, month, day] = dateStr.split('-');
          return `${month}/${day}/${year}`;
        }
        
        // Try to parse as Date and format
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return formatDateForSAM(date);
        }
        
        return undefined;
      };
      
      const startDate = normalizeDate(advancedFilters.startDate) || formatDateForSAM(startOfYear);
      const endDate = normalizeDate(advancedFilters.endDate) || formatDateForSAM(today);
      
      // Build search parameters
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
        limit: resultsPerPage.toString(),
        offset: ((page - 1) * resultsPerPage).toString(),
        samApiKey: samApiKey
      });
      
      // Add title search if provided
      if (titleSearch.trim()) {
        params.append('q', titleSearch.trim());
      }
      
      // Add NAICS codes if provided
      if (naicsSearch.trim()) {
        const naicsCodes = naicsSearch.split(',').map(code => code.trim()).filter(code => code);
        naicsCodes.forEach(code => {
          params.append('naicsCode', code);
        });
      }
      

      
      const response = await fetch(`/api/sam-search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data.opportunities);
          setTotalResults(data.data.totalRecords || data.data.opportunities.length);
          setCurrentPage(page);
          
          // Track cache status
          setLastSearchCached(data.cached || false, data.timestamp);
          // Reset cache notification dismissal for new searches
          if (data.cached && cacheNotificationDismissed) {
            useAppStore.setState({ cacheNotificationDismissed: false });
          }
        } else {
          console.error('Search API error:', data.error);
          alert(`Search failed: ${data.error}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Search API error:', errorData);
        alert(`Search failed: ${errorData.error || 'Unknown error'}`);
      }
      
      // Clear any existing opportunity matches when performing new search
      setOpportunityMatches({});
      setLoadingMatches(new Set());
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    performSearch(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    performSearch(page);
  };

  // Handle preset query selection
  const handlePresetQuery = (preset: typeof PRESET_QUERIES[0]) => {
    // Set NAICS codes (take the first one for simplicity)
    setNaicsSearch(preset.naicsCodes[0] || '');
    
    // Build a descriptive search query for display
    const queryParts = [];
    if (preset.naicsCodes.length > 0) {
      queryParts.push(`NAICS: ${preset.naicsCodes[0]}`);
    }
    
    const displayQuery = queryParts.join(' | ');
    setSearchQuery(displayQuery);
    setStoreSearchQuery(displayQuery);
    
    // Perform search
    setTimeout(() => performSearch(1), 100);
  };

  // Handle preset message for chat
  const handlePresetMessage = (preset: typeof PRESET_MESSAGES[0], opportunity?: SAMOpportunity) => {
    let message = preset.message;
    
    // If opportunity is provided, include its details in the message
    if (opportunity) {
      const opportunityDetails = `
Opportunity Details:
- Title: ${opportunity.title}
- Type: ${opportunity.type}
- NAICS Code: ${opportunity.naicsCode}
- Synopsis: ${opportunity.synopsis}
- Response Deadline: ${opportunity.responseDeadLine}
- Location: ${opportunity.placeOfPerformance?.state?.name || 'Not specified'}
- Estimated Value: ${opportunity.estimatedValue ? `$${opportunity.estimatedValue.toLocaleString()}` : 'Not specified'}
- Set-Aside: ${opportunity.typeOfSetAsideDescription || 'Not specified'}

${preset.message}`;
      
      message = opportunityDetails;
    }
    
    // Set the prepopulated message and navigate to chat
    setPrepopulatedMessage(message);
    setCurrentView('chat');
  };

  // Add opportunity to working list
  const handleAddToWorkingList = async (opportunity: SAMOpportunity, listId?: string) => {
    try {
      if (!listId) {
        // Create new working list
        const newList = await createWorkingList({
          name: newWorkingListName || `Opportunities - ${new Date().toLocaleDateString()}`,
          description: `Working list for ${opportunity.title}`,
          items: [],
          tags: [opportunity.naicsCode, opportunity.type].filter(Boolean),
          isPublic: false,
          createdBy: 'user'
        });
        listId = newList.id;
        setNewWorkingListName('');
      }
      
      await addItemToWorkingList(listId, {
        type: 'opportunity',
        itemId: opportunity.id,
        title: opportunity.title,
        description: opportunity.synopsis,
        status: 'active',
        priority: 'medium',
        tags: [opportunity.naicsCode, opportunity.type].filter(Boolean),
        notes: [`Added from search on ${new Date().toLocaleDateString()}`],
        metadata: { opportunity }
      });
      
    } catch (error) {
      console.error('Failed to add to working list:', error);
    }
  };

  // Toggle opportunity selection
  const toggleOpportunitySelection = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  // Add multiple opportunities to working list
  const handleAddMultipleToWorkingList = async (listId?: string) => {
    const opportunities = searchResults.filter(opp => selectedOpportunities.includes(opp.id));
    
    for (const opportunity of opportunities) {
      await handleAddToWorkingList(opportunity, listId);
    }
    
    setSelectedOpportunities([]);
  };

  // Calculate company profile match for an opportunity
  const calculateCompanyMatch = async (opportunityId: string) => {
    if (!companyProfile || loadingMatches.has(opportunityId) || opportunityMatches[opportunityId] !== undefined) {
      return;
    }

    setLoadingMatches(prev => new Set(prev).add(opportunityId));
    
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyProfile,
          opportunityId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.matchScore !== undefined) {
          setOpportunityMatches(prev => ({
            ...prev,
            [opportunityId]: data.data.matchScore
          }));
        }
      }
    } catch (error) {
      console.error('Failed to calculate company match:', error);
    } finally {
      setLoadingMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setTitleSearch('');
    setNaicsSearch('');
    setAdvancedFilters({
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setStoreSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = titleSearch || naicsSearch || 
    Object.values(advancedFilters).some(value => value !== '');

  // Test function to verify search functionality
  const testSearch = async () => {
    console.log('🧪 Testing search functionality...');
    
    // Test title search
    setTitleSearch('software development');
    setNaicsSearch('541511');
    
    // Perform test search
    setTimeout(() => {
      performSearch(1);
      console.log('✅ Test search initiated');
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Enhanced SAM.gov Search
          </CardTitle>
          <CardDescription>
            Search for government contracting opportunities using SAM.gov API with title search and NAICS codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by title or keywords... (e.g., 'software development', 'AI services')"
                  className="flex-1"
                  value={titleSearch}
                  onChange={(e) => {
                    setTitleSearch(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchSuggestions(titleSearch.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ButtonSpinner size="sm" />
                  </div>
                )}
                
                {/* Search Suggestions */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Search Suggestions</div>
                      {PRESET_QUERIES
                        .filter(preset => 
                          preset.label.toLowerCase().includes(titleSearch.toLowerCase()) ||
                          preset.description.toLowerCase().includes(titleSearch.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((preset) => (
                          <div
                            key={preset.id}
                            className="p-2 rounded cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => {
                              setShowSearchSuggestions(false);
                              handlePresetQuery(preset);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <preset.icon className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{preset.label}</p>
                                <p className="text-xs text-muted-foreground">{preset.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <ButtonSpinner size="sm" />
                    <span className="ml-2">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* NAICS Code Search */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="NAICS code (e.g., 541511, 518210)"
                  className="flex-1 pl-10"
                  value={naicsSearch}
                  onChange={(e) => setNaicsSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                disabled={isSearching}
              >
                <Filter className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                disabled={isSearching}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Preset Queries
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWorkingLists(!showWorkingLists)}
                disabled={isSearching}
              >
                <List className="h-4 w-4 mr-2" />
                Working Lists
              </Button>
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  disabled={isSearching}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              
              <Button variant="outline" size="sm" disabled={isSearching}>
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
              
              <Button variant="outline" size="sm" disabled={isSearching}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={testSearch}
                disabled={isSearching}
              >
                🧪 Test Search
              </Button>
            </div>

            {/* Date Range Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    type="date" 
                    value={advancedFilters.startDate}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    type="date" 
                    value={advancedFilters.endDate}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Preset Queries Panel */}
            {showPresets && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Search Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PRESET_QUERIES.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <Card 
                        key={preset.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          isSearching ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        onClick={() => !isSearching && handlePresetQuery(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            {isSearching ? (
                              <ButtonSpinner size="sm" />
                            ) : (
                              <Icon className="h-4 w-4 text-blue-600" />
                            )}
                            <h4 className="font-medium">{preset.label}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Working Lists Panel */}
            {showWorkingLists && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Working Lists</h3>
                  <Button size="sm" onClick={() => setNewWorkingListName('New List')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New List
                  </Button>
                </div>
                
                {workingLists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workingLists.map((list) => (
                      <Card key={list.id} className="cursor-pointer hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{list.name}</h4>
                            <Badge variant="secondary">{list.items.length} items</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{list.description}</p>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setCurrentWorkingList(list)}
                            >
                              View
                            </Button>
                            {selectedOpportunities.length > 0 && (
                              <Button 
                                size="sm"
                                onClick={() => handleAddMultipleToWorkingList(list.id)}
                              >
                                Add Selected ({selectedOpportunities.length})
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No working lists yet. Create one to get started!</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {isSearching && (
        <Card>
          <CardContent className="p-12">
            <LoadingSpinner 
              size="lg" 
              text="Searching for opportunities..." 
              variant="default"
            />
          </CardContent>
        </Card>
      )}
      
      {searchResults.length > 0 && !isSearching && (
        <div className="space-y-4">
          {/* Cache Notification */}
          {lastSearchCached && !cacheNotificationDismissed && (
            <CacheNotification
              cached={lastSearchCached}
              timestamp={lastSearchTimestamp || undefined}
              onDismiss={dismissCacheNotification}
              className="mb-4"
            />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  Search Results ({totalResults})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} opportunities
                </p>
              </div>
              {lastSearchCached && (
                <CacheIndicator
                  cached={lastSearchCached}
                  timestamp={lastSearchTimestamp || undefined}
                  variant="subtle"
                />
              )}
            </div>
            {selectedOpportunities.length > 0 && (
              <div className="flex space-x-2">
                <Button 
                  size="sm"
                  onClick={() => handleAddMultipleToWorkingList()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected to New List
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedOpportunities([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {searchResults.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isSelected={selectedOpportunities.includes(opportunity.id)}
                onToggleSelection={() => toggleOpportunitySelection(opportunity.id)}
                onAddToWorkingList={() => handleAddToWorkingList(opportunity)}
                onToggleFavorite={() => toggleFavorite(opportunity.id)}
                onPresetMessage={(preset) => handlePresetMessage(preset, opportunity)}
                companyProfile={companyProfile}
                opportunityMatches={opportunityMatches}
                loadingMatches={loadingMatches}
                calculateCompanyMatch={calculateCompanyMatch}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalResults > resultsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalResults / resultsPerPage)}
              onPageChange={handlePageChange}
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && !showFilters && !showPresets && !showWorkingLists && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No search results yet</h3>
            <p className="text-gray-600 mb-4">
              Enter a title search or NAICS codes to find relevant opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => setShowPresets(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Try Preset Queries
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
            
            {/* API Key Setup Notice */}
            {!process.env.NEXT_PUBLIC_SAM_API_KEY && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  🔧 Setup Required
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Search functionality requires a SAM.gov API key. Please configure your API keys to start searching.
                </p>
                <div className="text-xs text-yellow-600">
                  <p>1. Create a <code>.env.local</code> file in the project root</p>
                  <p>2. Add: <code>NEXT_PUBLIC_SAM_API_KEY=your_api_key_here</code></p>
                  <p>3. Restart the development server</p>
                  <p>See <code>SEARCH_SETUP.md</code> for detailed instructions.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Opportunity Card Component
function OpportunityCard({ 
  opportunity, 
  isSelected, 
  onToggleSelection, 
  onAddToWorkingList, 
  onToggleFavorite,
  onPresetMessage,
  companyProfile,
  opportunityMatches,
  loadingMatches,
  calculateCompanyMatch
}: {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onToggleSelection: () => void;
  onAddToWorkingList: () => void;
  onToggleFavorite: () => void;
  onPresetMessage: (preset: typeof PRESET_MESSAGES[0]) => void;
  companyProfile: any;
  opportunityMatches: Record<string, number>;
  loadingMatches: Set<string>;
  calculateCompanyMatch: (opportunityId: string) => void;
}) {
  return (
    <Card className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                className="rounded"
              />
              <h3 className="text-lg font-semibold line-clamp-2">{opportunity.title}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{opportunity.naicsCode}</Badge>
              <Badge variant="outline">{opportunity.type}</Badge>
              {opportunity.placeOfPerformance?.state?.name && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {opportunity.placeOfPerformance.state.name}
                </Badge>
              )}
              {opportunity.active && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              {/* Company Profile Match */}
              {companyProfile && (
                <div className="flex items-center space-x-2">
                  {loadingMatches.has(opportunity.id) ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      Calculating...
                    </Badge>
                  ) : opportunityMatches[opportunity.id] !== undefined ? (
                    <Badge 
                      variant="outline" 
                      className={`${
                        opportunityMatches[opportunity.id] >= 0.8 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : opportunityMatches[opportunity.id] >= 0.6 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {Math.round(opportunityMatches[opportunity.id] * 100)}% Match
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => calculateCompanyMatch(opportunity.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Calculate Match
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{opportunity.synopsis}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {opportunity.responseDeadLine && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Due: {new Date(opportunity.responseDeadLine).toLocaleDateString()}</span>
                </div>
              )}
              {opportunity.estimatedValue && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <span>${opportunity.estimatedValue.toLocaleString()}</span>
                </div>
              )}
              {opportunity.organizationType && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{opportunity.organizationType}</span>
                </div>
              )}
              {opportunity.hasAttachments && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Has Attachments</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
            >
              <Star className={`h-4 w-4 ${opportunity.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddToWorkingList}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Preset Messages */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Quick Analysis</h4>
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onPresetMessage(preset)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 