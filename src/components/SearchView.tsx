'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Plus, 
  Bookmark, 
  MessageSquare,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  FileText,
  Sparkles,
  List,
  CheckCircle,
  Clock,
  AlertCircle
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
import { Badge } from '@/components/ui/badge';

import { 
  useAppStore, 
  useSearchResults, 
  useSearchFilters, 
  useVectorSearchResults,
  useWorkingLists,
  useCurrentWorkingList
} from '@/stores/appStore';
import { SAMOpportunity, WorkingList, WorkingListItem } from '@/types';

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

// Preset search queries for quick access
const PRESET_QUERIES = [
  {
    id: 'ai-software',
    label: 'AI & Software Development',
    query: 'artificial intelligence software development',
    description: 'Find AI and software development contracts',
    icon: Sparkles
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    query: 'cybersecurity information security',
    description: 'Cybersecurity and information security opportunities',
    icon: Shield
  },
  {
    id: 'construction',
    label: 'Construction & Infrastructure',
    query: 'construction infrastructure building',
    description: 'Construction and infrastructure projects',
    icon: Building
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Medical',
    query: 'healthcare medical services',
    description: 'Healthcare and medical service contracts',
    icon: Heart
  },
  {
    id: 'small-business',
    label: 'Small Business Set-Asides',
    query: 'small business set-aside',
    description: 'Small business set-aside opportunities',
    icon: Users
  },
  {
    id: 'research',
    label: 'Research & Development',
    query: 'research development R&D',
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



export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showWorkingLists, setShowWorkingLists] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [newWorkingListName, setNewWorkingListName] = useState('');
  
  const searchResults = useSearchResults();
  const searchFilters = useSearchFilters();
  const vectorResults = useVectorSearchResults();
  const workingLists = useWorkingLists();
  const currentWorkingList = useCurrentWorkingList();
  
  const {
    setSearchQuery: setStoreSearchQuery,
    setSearchResults,
    setSearchFilters,
    setIsSearching,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    performVectorSearch,
    createWorkingList,
    addItemToWorkingList,
    setCurrentWorkingList
  } = useAppStore();

  // Perform search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Check if SAM API key is configured
    const samApiKey = process.env.NEXT_PUBLIC_SAM_API_KEY;
    if (!samApiKey) {
      alert('SAM.gov API key is not configured. Please set NEXT_PUBLIC_SAM_API_KEY in your environment variables.');
      return;
    }
    
    setIsSearching(true);
    try {
      // Set default date range if not provided (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
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
      
      const startDate = normalizeDate(searchFilters.startDate) || formatDateForSAM(thirtyDaysAgo);
      const endDate = normalizeDate(searchFilters.endDate) || formatDateForSAM(today);
      
      // Perform regular SAM.gov search
      const params = new URLSearchParams({
        q: searchQuery,
        startDate: startDate,
        endDate: endDate,
        limit: '50',
        samApiKey: samApiKey
      });
      
      const response = await fetch(`/api/sam-search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data.opportunities);
        } else {
          console.error('Search API error:', data.error);
          alert(`Search failed: ${data.error}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Search API error:', errorData);
        alert(`Search failed: ${errorData.error || 'Unknown error'}`);
      }
      
      // Perform vector search for additional context
      await performVectorSearch(searchQuery);
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle preset query selection
  const handlePresetQuery = (preset: typeof PRESET_QUERIES[0]) => {
    setSearchQuery(preset.query);
    setStoreSearchQuery(preset.query);
    handleSearch();
  };

  // Handle preset message for chat
  const handlePresetMessage = (preset: typeof PRESET_MESSAGES[0]) => {
    // This will be handled by the chat component
    // For now, we'll store it in localStorage for the chat to pick up
    localStorage.setItem('opensam-preset-message', preset.message);
    // Switch to chat view
    useAppStore.getState().setCurrentView('chat');
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            SAM.gov Search
          </CardTitle>
          <CardDescription>
            Search for government contracting opportunities with AI-powered semantic search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex space-x-2">
              <Input
                placeholder="Search for opportunities... (e.g., 'AI software development contracts')"
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Preset Queries
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWorkingLists(!showWorkingLists)}
              >
                <List className="h-4 w-4 mr-2" />
                Working Lists
              </Button>
              
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="text-sm font-medium">NAICS Code</label>
                  <Input placeholder="e.g., 541511" />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="DC">District of Columbia</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Agency</label>
                  <Input placeholder="e.g., Department of Defense" />
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
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePresetQuery(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon className="h-4 w-4 text-blue-600" />
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
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length})
            </h2>
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
                onPresetMessage={handlePresetMessage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vector Search Results */}
      {vectorResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Related Content
            </CardTitle>
            <CardDescription>
              AI-powered semantic search results from your stored data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vectorResults.slice(0, 5).map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.document.metadata.title}</h4>
                    <Badge variant="outline">
                      {Math.round(result.score * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.document.metadata.description}
                  </p>
                  {result.highlights && result.highlights.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>Highlights:</strong> {result.highlights.join('... ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !showFilters && !showPresets && !showWorkingLists && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No search results yet</h3>
            <p className="text-gray-600 mb-4">
              Enter a search query to find relevant opportunities
            </p>
            <Button onClick={() => setShowPresets(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Try Preset Queries
            </Button>
            
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
  onPresetMessage 
}: {
  opportunity: SAMOpportunity;
  isSelected: boolean;
  onToggleSelection: () => void;
  onAddToWorkingList: () => void;
  onToggleFavorite: () => void;
  onPresetMessage: (preset: typeof PRESET_MESSAGES[0]) => void;
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