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

// Mock data for recent chats
const recentChats = [
  {
    id: "1",
    title: "AI in healthcare trends",
    timestamp: "2 hours ago",
  },
  {
    id: "2", 
    title: "Best React frameworks 2025",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    title: "Machine learning basics",
    timestamp: "3 days ago",
  },
  {
    id: "4",
    title: "Climate change solutions",
    timestamp: "1 week ago",
  },
]

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
          <Button className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-500">
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
              {recentChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/dashboard/chat/${chat.id}`}>
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="truncate text-sm">{chat.title}</span>
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
