'use client';

import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  TrashIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { SupabaseChatService } from '@/lib/services/supabaseChatService';
import { Session } from '@/lib/database/models';

interface ChatHistoryProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
}

export default function ChatHistory({ 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  className = '' 
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessions = await SupabaseChatService.getRecentSessions();
      setSessions(sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await SupabaseChatService.createNewSession();
      
      // Update local state
      setSessions(prev => [newSession, ...prev]);
      
      // Notify parent component
      onNewChat();
      onSessionSelect(newSession.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await SupabaseChatService.deleteSession(sessionId);
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, create new one
      if (sessionId === currentSessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
    
    setActiveDropdown(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return messageDate.toLocaleDateString();
  };

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: Session[] } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.updated_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month';
      } else {
        groupKey = 'Older';
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });
    
    return groups;
  };

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
      >
        <PlusIcon className="h-5 w-5" />
        New Chat
      </button>

      {/* Chat History */}
      <div className="space-y-4">
        {Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
          <div key={groupName}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {groupName}
            </h3>
            <div className="space-y-1">
              {groupSessions.map((session) => (
                <div key={session.id} className="relative group">
                  <button
                    onClick={() => onSessionSelect(session.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      currentSessionId === session.id
                        ? 'bg-purple-600/20 border border-purple-600/30 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.message_count} messages • {formatDate(session.updated_at)}
                      </p>
                    </div>
                  </button>
                  
                  {/* Options dropdown */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === session.id ? null : session.id);
                      }}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    >
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === session.id && (
                      <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No chat history yet</p>
            <p className="text-xs text-gray-500 mt-1">Start a conversation to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
