"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SupabaseChatService } from "@/lib/services/supabaseChatService";
import { useSession } from "next-auth/react";
import { generateUUID } from "@/lib/utils/uuid";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

const welcomeCards = [
  {
    title: "Analyze market trends",
    description:
      "Get insights on current market conditions and future predictions",
    prompt: "What are the current market trends in AI technology?",
  },
  {
    title: "Explain complex topics",
    description:
      "Break down difficult concepts into easy-to-understand explanations",
    prompt: "Explain quantum computing in simple terms",
  },
  {
    title: "Research latest news",
    description: "Find and summarize the most recent developments on any topic",
    prompt: "What are the latest developments in renewable energy?",
  },
  {
    title: "Compare solutions",
    description: "Analyze different options and provide detailed comparisons",
    prompt: "Compare React vs Vue.js for modern web development",
  },
];

interface ChatInterfaceProps {
  currentSessionId?: string | null;
  onSessionChange?: (sessionId: string) => void;
  className?: string;
}

export function ChatInterface({
  currentSessionId,
  onSessionChange,
  className,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    currentSessionId || null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when user is typing
  useEffect(() => {
    if (input.length > 0) {
      scrollToBottom();
    }
  }, [input]);

  // Load existing session messages
  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId);
    }
  }, [sessionId]);

  // Update session ID when prop changes
  useEffect(() => {
    setSessionId(currentSessionId || null);
  }, [currentSessionId]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const sessionData = await SupabaseChatService.loadSession(sessionId);
      if (sessionData) {
        const formattedMessages: Message[] = sessionData.messages.map(
          (msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.type === "user" ? "user" : "assistant",
            timestamp: msg.timestamp,
            sources: msg.sources || [],
          })
        );
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  };

  const createNewSession = async (): Promise<string> => {
    try {
      const newSession = await SupabaseChatService.createNewSession();
      const newSessionId = newSession.id;
      setSessionId(newSessionId);
      onSessionChange?.(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      const fallbackId = generateUUID(); // ✅ FIXED!
      setSessionId(fallbackId);
      onSessionChange?.(fallbackId);
      return fallbackId;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Ensure we have a session
    let currentSession = sessionId;
    if (!currentSession) {
      currentSession = await createNewSession();
    }

    const userMessage: Message = {
      id: generateUUID(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };
      console.log('User message being created:', userMessage); // Debug log


    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      await SupabaseChatService.saveMessage({
        sessionId: currentSession,
        type: "user",
        content: userMessage.content,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: currentSession,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateUUID(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save AI message to database
      await SupabaseChatService.saveMessage({
        sessionId: currentSession,
        type: "ai",
        content: assistantMessage.content,
        sources: data.sources,
        searchQuery: userMessage.content,
      });

      // Auto-generate title after first exchange
      if (messages.length === 0) {
        await SupabaseChatService.autoGenerateSessionTitle(currentSession);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCardClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Mini Perplexity
              </h1>
              <p className="text-muted-foreground text-lg">
                Ask me anything and get instant answers with sources
              </p>
            </div>

            {/* Welcome Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {welcomeCards.map((card, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleCardClick(card.prompt)}
                >
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Sources */}
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4">
                      {/* Heading */}
                      <h4 className="text-md font-semibold text-purple-600 mb-2">
                        Sources...
                      </h4>

                      {/* Overlapping circles */}
                      <div className="flex -space-x-4">
                        {message.sources.map((source, index) => {
                          const url = new URL(source.url);
                          const favicon = `${url.origin}/favicon.ico`;

                          return (
                            <a
                              key={index}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-purple-500 bg-white shadow hover:z-10 hover:scale-110 transition-transform"
                              title={source.title}
                            >
                              <img
                                src={favicon}
                                alt={url.hostname}
                                className="w-6 h-6"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "https://www.google.com/s2/favicons?domain=" +
                                    url.hostname;
                                }}
                              />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Searching and analyzing...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
