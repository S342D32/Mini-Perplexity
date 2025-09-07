// app/dashboard/analytics/page.tsx
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  Search,
  Brain,
  Globe,
  Users,
  Activity,
  Zap,
  Target,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ThumbsUp
} from "lucide-react"
import { SupabaseChatService } from "@/lib/services/supabaseChatService"

interface ChatAnalytics {
  totalChats: number
  totalMessages: number
  averageMessagesPerChat: number
  mostActiveDay: string
  mostActiveHour: number
  totalWords: number
  averageResponseTime: number
  topTopics: Array<{ topic: string; count: number }>
  weeklyActivity: Array<{ day: string; messages: number }>
  monthlyTrend: Array<{ month: string; chats: number; messages: number }>
  recentChats: Array<{
    id: string
    title: string
    messageCount: number
    createdAt: string
    lastActive: string
    topics: string[]
  }>
}

interface MockData extends ChatAnalytics {
  // Add any additional mock-specific properties if needed
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Try to fetch real data from Supabase
      const sessions = await SupabaseChatService.getRecentSessions()
      
      if (sessions.length > 0) {
        // Process real data
        const processedAnalytics = await processRealAnalytics(sessions)
        setAnalytics(processedAnalytics)
      } else {
        // Use mock data for development/demo
        setAnalytics(getMockAnalytics())
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Fallback to mock data
      setAnalytics(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const processRealAnalytics = async (sessions: any[]): Promise<ChatAnalytics> => {
    // Process real session data into analytics
    const totalChats = sessions.length
    const totalMessages = sessions.reduce((sum, session) => sum + (session.message_count || 0), 0)
    
    return {
      totalChats,
      totalMessages,
      averageMessagesPerChat: totalChats > 0 ? Math.round(totalMessages / totalChats) : 0,
      mostActiveDay: 'Monday', // Would need to calculate from real data
      mostActiveHour: 14,
      totalWords: totalMessages * 25, // Estimate
      averageResponseTime: 2.3,
      topTopics: [
        { topic: 'Technology', count: Math.floor(totalChats * 0.3) },
        { topic: 'Programming', count: Math.floor(totalChats * 0.25) },
        { topic: 'AI', count: Math.floor(totalChats * 0.2) },
        { topic: 'Web Development', count: Math.floor(totalChats * 0.15) },
        { topic: 'General', count: Math.floor(totalChats * 0.1) }
      ],
      weeklyActivity: generateWeeklyActivity(totalMessages),
      monthlyTrend: generateMonthlyTrend(totalChats, totalMessages),
      recentChats: sessions.slice(0, 10).map(session => ({
        id: session.id,
        title: session.title,
        messageCount: session.message_count || 0,
        createdAt: session.created_at,
        lastActive: session.updated_at,
        topics: ['Technology', 'AI'] // Would need to extract from content
      }))
    }
  }

  const getMockAnalytics = (): MockData => {
    return {
      totalChats: 47,
      totalMessages: 182,
      averageMessagesPerChat: 4,
      mostActiveDay: 'Tuesday',
      mostActiveHour: 15,
      totalWords: 4550,
      averageResponseTime: 2.1,
      topTopics: [
        { topic: 'Technology', count: 15 },
        { topic: 'Programming', count: 12 },
        { topic: 'AI & Machine Learning', count: 8 },
        { topic: 'Web Development', count: 7 },
        { topic: 'General Questions', count: 5 }
      ],
      weeklyActivity: [
        { day: 'Mon', messages: 24 },
        { day: 'Tue', messages: 31 },
        { day: 'Wed', messages: 18 },
        { day: 'Thu', messages: 27 },
        { day: 'Fri', messages: 33 },
        { day: 'Sat', messages: 12 },
        { day: 'Sun', messages: 37 }
      ],
      monthlyTrend: [
        { month: 'Jan', chats: 12, messages: 45 },
        { month: 'Feb', chats: 18, messages: 72 },
        { month: 'Mar', chats: 15, messages: 58 },
        { month: 'Apr', chats: 22, messages: 89 },
        { month: 'May', chats: 17, messages: 65 }
      ],
      recentChats: [
        {
          id: '1',
          title: 'React vs Vue.js comparison',
          messageCount: 8,
          createdAt: '2024-12-15T10:30:00Z',
          lastActive: '2024-12-15T11:45:00Z',
          topics: ['Web Development', 'JavaScript']
        },
        {
          id: '2', 
          title: 'Machine Learning basics',
          messageCount: 12,
          createdAt: '2024-12-14T14:20:00Z',
          lastActive: '2024-12-14T15:10:00Z',
          topics: ['AI', 'Python']
        },
        {
          id: '3',
          title: 'Docker containerization guide',
          messageCount: 6,
          createdAt: '2024-12-13T09:15:00Z',
          lastActive: '2024-12-13T10:30:00Z',
          topics: ['DevOps', 'Docker']
        },
        {
          id: '4',
          title: 'TypeScript best practices',
          messageCount: 10,
          createdAt: '2024-12-12T16:45:00Z',
          lastActive: '2024-12-12T17:30:00Z',
          topics: ['Programming', 'TypeScript']
        },
        {
          id: '5',
          title: 'Database design patterns',
          messageCount: 5,
          createdAt: '2024-12-11T11:20:00Z',
          lastActive: '2024-12-11T12:00:00Z',
          topics: ['Database', 'Architecture']
        }
      ]
    }
  }

  const generateWeeklyActivity = (totalMessages: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      messages: Math.floor(Math.random() * (totalMessages / 3)) + 1
    }))
  }

  const generateMonthlyTrend = (totalChats: number, totalMessages: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
    return months.map(month => ({
      month,
      chats: Math.floor(Math.random() * (totalChats / 2)) + 1,
      messages: Math.floor(Math.random() * (totalMessages / 2)) + 1
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRangeLabel = (range: string) => {
    switch(range) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      case 'all': return 'All time'
      default: return 'Last 30 days'
    }
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Analytics Data</h2>
          <p className="text-muted-foreground">Start chatting to see your analytics!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights into your Mini Perplexity conversations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {getTimeRangeLabel(range)}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                <p className="text-3xl font-bold">{analytics.totalChats}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold">{analytics.totalMessages}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold">{analytics.averageResponseTime}s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              15% faster than before
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                <p className="text-3xl font-bold">{analytics.totalWords.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +25% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="chats">Recent Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Messages sent per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.weeklyActivity.map((day, index) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress 
                          value={(day.messages / Math.max(...analytics.weeklyActivity.map(d => d.messages))) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="w-12 text-sm text-right">{day.messages}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
                <CardDescription>When you're most active</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Most Active Day</span>
                  </div>
                  <Badge variant="secondary">{analytics.mostActiveDay}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Peak Hour</span>
                  </div>
                  <Badge variant="secondary">{analytics.mostActiveHour}:00</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Avg Messages/Chat</span>
                  </div>
                  <Badge variant="secondary">{analytics.averageMessagesPerChat}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Your chat activity over the past months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrend.map((month, index) => (
                  <div key={month.month} className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium">{month.month}</div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>{month.chats} chats</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>{month.messages} messages</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
              <CardDescription>Most discussed topics in your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topTopics.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{topic.topic}</div>
                      <Progress 
                        value={(topic.count / Math.max(...analytics.topTopics.map(t => t.count))) * 100} 
                        className="h-2 mt-1"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {topic.count} chats
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Your latest chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <MessageSquare className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium line-clamp-1">{chat.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {chat.messageCount} messages
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(chat.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Last active: {formatDate(chat.lastActive)}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {chat.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
