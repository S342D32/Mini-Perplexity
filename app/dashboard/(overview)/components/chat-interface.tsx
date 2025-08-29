'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onChatToggle?: (isActive: boolean) => void;
  className?: string;
}

export default function ChatInterface({ onChatToggle, className = '' }: ChatInterfaceProps) {
  const [isChatMode, setIsChatMode] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick action cards data
  const quickActions = [
    {
      title: "Revenue Analysis",
      description: "Analyze current revenue trends",
      icon: ChartBarIcon,
      query: "Show me the revenue analysis for this month",
      color: "text-blue-400"
    },
    {
      title: "Customer Insights", 
      description: "Get customer behavior insights",
      icon: UsersIcon,
      query: "What are the key customer insights from recent data?",
      color: "text-green-400"
    },
    {
      title: "Financial Overview",
      description: "Summary of financial metrics",
      icon: CurrencyDollarIcon,
      query: "Give me a financial overview of the business",
      color: "text-yellow-400"
    },
    {
      title: "Growth Opportunities",
      description: "Identify potential growth areas",
      icon: SparklesIcon,
      query: "What growth opportunities should we focus on?",
      color: "text-purple-400"
    }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  // Notify parent component when chat mode changes
  useEffect(() => {
    onChatToggle?.(isChatMode);
  }, [isChatMode, onChatToggle]);

  const handleQuickAction = (actionQuery: string) => {
    setQuery(actionQuery);
    // handleSubmit(null, actionQuery);
  };

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const currentQuery = customQuery || query.trim();
    if (!currentQuery) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuery,
      timestamp: new Date()
    };

    setIsChatMode(true);
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Simulate API call (replace with your actual search pipeline)
    try {
      // This is where you'd call your actual API
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   body: JSON.stringify({ query: currentQuery }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // const data = await response.json();

      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Here's what I found about: "${currentQuery}"\n\nThis is a simulated response. In your actual implementation, this would contain:\n\n• Search results from multiple sources\n• AI-generated summary\n• Citations and references\n• Related follow-up questions\n\nYou can integrate this with your search pipeline (Tavily API + OpenAI) to get real results.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsChatMode(false);
    setQuery('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      
      {/* Chat Header - Mobile friendly */}
      {isChatMode && (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">AI Assistant</h2>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
        {!isChatMode ? (
          // Welcome State
          <div className="mx-auto max-w-4xl h-full flex flex-col justify-center">
            <div className="text-center mb-6 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
                What can I help you with?
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 px-4">
                Ask me anything about your business data and analytics
              </p>
            </div>

            {/* Quick Actions - Mobile responsive grid */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-12">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-start space-x-3 sm:space-x-4 rounded-xl bg-gray-800/50 border border-gray-700 p-3 sm:p-4 lg:p-6 text-left hover:bg-gray-800 hover:border-gray-600 transition-all group min-h-[80px] sm:min-h-[100px]"
                >
                  <div className="flex-shrink-0 mt-1">
                    <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-400 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-md lg:max-w-2xl rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                  message.type === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your business data..."
                className="w-full resize-none rounded-2xl bg-gray-800 border border-gray-600 px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm sm:text-base max-h-32 min-h-[40px] sm:min-h-[44px]"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {query.trim() && !isLoading && (
                <button
                  type="submit"
                  className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 rounded-xl bg-purple-600 p-1.5 sm:p-2 text-white hover:bg-purple-500 transition-colors"
                >
                  <PaperAirplaneIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
            {!query.trim() && !isLoading && (
              <button
                type="button"
                className="rounded-xl bg-gray-800 border border-gray-600 p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </form>
          
          {/* Input hints - Mobile friendly */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
