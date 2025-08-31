"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, MessageSquare, Search, BarChart3, Settings, LogOut, Sparkles } from "lucide-react"
import { handleSignOut } from "@/app/lib/actions"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { useState, useEffect } from 'react';
import { SupabaseChatService } from '@/lib/services/supabaseChatService';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const navigationItems = [
  {
    title: "Search",
    url: "/dashboard",
    icon: Search,
  },
  {
    title: "Analytics", 
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings", 
    icon: Settings,
  },
]

export function PerplexitySidebar() {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentChats();
  }, []);

  const loadRecentChats = async () => {
    try {
      const sessions = await SupabaseChatService.getRecentSessions();
      setRecentChats(sessions || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      // Fallback to empty array if Supabase not set up yet
      setRecentChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await SupabaseChatService.createNewSession();
      setRecentChats(prev => [newSession, ...prev]);
      // Navigate to new chat
      window.location.href = `/dashboard/chat/${newSession.id}`;
    } catch (error) {
      console.error('Error creating new chat:', error);
      // Fallback navigation
      window.location.href = '/dashboard/chat';
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Mini Perplexity</span>
        </div>
        
        {/* New Chat Button */}
        <div className="px-4 pb-2">
          <Button 
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-500"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Chats */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
              ) : recentChats.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">No chats yet</div>
              ) : (
                recentChats.map((chat: ChatSession) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/chat/${chat.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="truncate text-sm">{chat.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(chat.updated_at)}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <form action={handleSignOut}>
                <button type="submit" className="flex items-center gap-2 w-full">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
