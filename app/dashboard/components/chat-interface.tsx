"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Globe, Search, Send, Sparkles, User, Zap } from "lucide-react"
import * as React from "react"
import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: Array<{
    title: string
    url: string
    snippet: string
  }>
}

const welcomeCards = [
  {
    title: "Analyze market trends",
    description: "Get insights on current market conditions and future predictions",
    prompt: "What are the current market trends in AI technology?"
  },
  {
    title: "Explain complex topics", 
    description: "Break down difficult concepts into easy-to-understand explanations",
    prompt: "Explain quantum computing in simple terms"
  },
  {
    title: "Research latest news",
    description: "Find and summarize the most recent developments on any topic",
    prompt: "What are the latest developments in renewable energy?"
  },
  {
    title: "Compare solutions",
    description: "Analyze different options and provide detailed comparisons",
    prompt: "Compare React vs Vue.js for modern web development"
  }
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchStage, setSearchStage] = useState<'searching' | 'analyzing' | 'generating'>('searching')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-scroll when user is typing
  useEffect(() => {
    if (input.length > 0) {
      scrollToBottom()
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setSearchStage('searching')

    try {
      // Simulate search stages for better UX
      setTimeout(() => setSearchStage('analyzing'), 1000)
      setTimeout(() => setSearchStage('generating'), 2000)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        sources: data.sources || []
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        sources: []
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setSearchStage('searching')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCardClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

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
              <h1 className="text-3xl font-bold mb-2">Welcome to Mini Perplexity</h1>
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
                  <p className="text-sm text-muted-foreground">{card.description}</p>
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
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Sources:</h4>
                      <div className="grid gap-2">
                        {message.sources.map((source, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0" />
                              <div className="flex-1">
                                <a 
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-sm hover:underline"
                                >
                                  {source.title}
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {source.snippet}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Enhanced Loading indicator with stages */}
            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                    <Bot className="w-4 h-4 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-3">
                  {/* Animated icon based on stage */}
                  <div className="flex items-center gap-2">
                    {searchStage === 'searching' && (
                      <Search className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {searchStage === 'analyzing' && (
                      <Globe className="w-4 h-4 text-green-500 animate-pulse" />
                    )}
                    {searchStage === 'generating' && (
                      <Zap className="w-4 h-4 text-purple-500 animate-bounce" />
                    )}
                  </div>
                  
                  {/* Bouncing dots */}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                  
                  {/* Dynamic status text */}
                  <span className="text-sm text-muted-foreground">
                    {searchStage === 'searching' && '🔍 Searching the web...'}
                    {searchStage === 'analyzing' && '🧠 Analyzing results...'}
                    {searchStage === 'generating' && '✨ Generating response...'}
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
  )
}
