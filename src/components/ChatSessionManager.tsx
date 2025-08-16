'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Clock,
  Search,
  X,
  Download,
  Upload,
  FileText,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ChatSession, ChatMessage } from '@/types';
import { useAppStore, useCurrentSession, useChatSessions } from '@/stores/appStore';
import { cn, generateId } from '@/lib/utils';

interface ChatSessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'recent' | 'with-messages' | 'empty';

export function ChatSessionManager({ isOpen, onClose }: ChatSessionManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const currentSession = useCurrentSession();
  const chatSessions = useChatSessions();
  const { 
    createChatSession, 
    setCurrentSession, 
    updateSession, 
    deleteSession,
    clearAllSessions,
    importSessions
  } = useAppStore();

  // Filter sessions based on search query and active filter
  const filteredSessions = useMemo(() => {
    let filtered = chatSessions.filter(session =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply additional filters
    switch (activeFilter) {
      case 'recent':
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(session => session.updatedAt > oneWeekAgo);
        break;
      case 'with-messages':
        filtered = filtered.filter(session => session.messages.length > 0);
        break;
      case 'empty':
        filtered = filtered.filter(session => session.messages.length === 0);
        break;
      default:
        break;
    }

    // Sort by most recent first
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chatSessions, searchQuery, activeFilter]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Get session preview (first few words of last message)
  const getSessionPreview = (session: ChatSession) => {
    if (session.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = session.messages[session.messages.length - 1];
    const preview = lastMessage.content.substring(0, 50);
    return preview + (lastMessage.content.length > 50 ? '...' : '');
  };

  // Handle creating new session
  const handleCreateSession = () => {
    const newSession = createChatSession();
    onClose();
  };

  // Handle switching to a session
  const handleSwitchSession = (session: ChatSession) => {
    setCurrentSession(session);
    onClose();
  };

  // Handle editing session title
  const handleEditSession = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  // Handle saving edited title
  const handleSaveEdit = () => {
    if (editingSessionId && editTitle.trim()) {
      updateSession(editingSessionId, { title: editTitle.trim() });
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  // Handle deleting session
  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      deleteSession(sessionId);
    }
  };

  // Handle clearing all sessions
  const handleClearAllSessions = () => {
    if (confirm('Are you sure you want to delete all chat sessions? This action cannot be undone.')) {
      clearAllSessions();
    }
  };

  // Handle exporting sessions
  const handleExportSessions = () => {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        sessions: chatSessions
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opensam-chat-sessions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export sessions:', error);
      alert('Failed to export sessions. Please try again.');
    }
  };

  // Handle importing sessions
  const handleImportSessions = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.sessions && Array.isArray(data.sessions)) {
              importSessions(data.sessions);
              alert(`Successfully imported ${data.sessions.length} sessions!`);
            } else {
              throw new Error('Invalid file format');
            }
          } catch (error) {
            console.error('Failed to import sessions:', error);
            alert('Failed to import sessions. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Chat Sessions</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSession}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All', count: chatSessions.length },
              { key: 'recent', label: 'Recent', count: chatSessions.filter(s => s.updatedAt > Date.now() - (7 * 24 * 60 * 60 * 1000)).length },
              { key: 'with-messages', label: 'With Messages', count: chatSessions.filter(s => s.messages.length > 0).length },
              { key: 'empty', label: 'Empty', count: chatSessions.filter(s => s.messages.length === 0).length }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.key as FilterType)}
                className="text-xs flex-1"
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-70">({filter.count})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm">
                {searchQuery ? 'No sessions found' : 'No chat sessions yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSession}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create your first session
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className={cn(
                    "mb-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                    currentSession?.id === session.id && "ring-2 ring-blue-500 bg-blue-500/10"
                  )}
                  onClick={() => handleSwitchSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                              className="text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={!editTitle.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-foreground truncate">
                                {session.title}
                              </h3>
                              {session.messages.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {session.messages.length} messages
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {getSessionPreview(session)}
                            </p>
                            <div className="flex items-center space-x-1 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(session.updatedAt)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {editingSessionId !== session.id && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSession(session);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredSessions.length > 0 && (
          <div className="p-4 border-t border-border bg-muted">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportSessions}
                  className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                  title="Export sessions"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImportSessions}
                  className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                  title="Import sessions"
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllSessions}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 