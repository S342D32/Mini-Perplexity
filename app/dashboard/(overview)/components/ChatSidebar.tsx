'use client';

import { useState } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import ChatHistory from './ChatHistory';

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  isOpen,
  onToggle
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-lg font-semibold text-white">Mini Perplexity</h1>
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChatHistory
            currentSessionId={currentSessionId}
            onSessionSelect={onSessionSelect}
            onNewChat={onNewChat}
          />
        </div>
      </div>
    </>
  );
}
