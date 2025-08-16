import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PROFILE_TEMPLATES, 
  ProfileTemplate, 
  getAllCategories, 
  searchTemplates,
  getTemplatesByCategory 
} from '@/lib/profile-templates';
import { Check, Search, Sparkles, TrendingUp, Users, Award } from 'lucide-react';

interface TemplateSelectorProps {
  onTemplateSelect: (template: ProfileTemplate) => void;
  onClose: () => void;
}

export function TemplateSelector({ onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);

  const categories = ['all', ...getAllCategories()];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? searchTemplates(searchQuery)
    : getTemplatesByCategory(selectedCategory).filter(template =>
        searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleTemplateSelect = (template: ProfileTemplate) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
      onClose();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return '💻';
      case 'Construction': return '🏗️';
      case 'Healthcare': return '🏥';
      case 'Logistics': return '🚚';
      case 'Professional Services': return '📋';
      case 'Research': return '🔬';
      default: return '📄';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Smart Profile Templates</h2>
              <p className="text-sm text-muted-foreground">
                Choose a template to get started with pre-filled fields and industry guidance
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close</span>
            ×
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Template List */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            {/* Search and Filters */}
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {category === 'all' ? 'All Categories' : (
                      <>
                        <span className="mr-1">{getCategoryIcon(category)}</span>
                        {category}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="px-4 pb-4 space-y-3">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {template.estimatedValue}
                          </div>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel - Template Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Template Header */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{selectedTemplate.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {selectedTemplate.estimatedValue}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedTemplate.commonOpportunities.length} opportunities
                    </div>
                  </div>
                </div>

                {/* Template Details */}
                <div className="space-y-4">
                  {/* Business Types */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Business Types
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.fields.businessTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* NAICS Codes */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">NAICS Codes</h4>
                    <div className="space-y-1">
                      {selectedTemplate.fields.naicsCodes.slice(0, 3).map((code, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {code}
                        </div>
                      ))}
                      {selectedTemplate.fields.naicsCodes.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{selectedTemplate.fields.naicsCodes.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Key Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.fields.capabilities.slice(0, 6).map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {selectedTemplate.fields.capabilities.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedTemplate.fields.capabilities.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Pro Tips</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Opportunities */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Common Opportunities</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.commonOpportunities.map((opportunity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {opportunity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-border">
                  <Button 
                    onClick={handleApplyTemplate}
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Apply Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Template</h3>
                  <p className="text-sm">
                    Choose a template from the left panel to see details and apply it to your profile
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 