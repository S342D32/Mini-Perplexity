import { SupabaseSessionQueries, SupabaseMessageQueries, SupabaseSourceQueries, SupabaseSession, SupabaseMessage } from '@/lib/supabase/queries';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: any[];
}

export interface SaveMessageOptions {
  sessionId: string;
  type: 'user' | 'ai';
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  searchQuery?: string;
  sources?: any[];
}

export class SupabaseChatService {
  // Get current user ID
  static async getCurrentUserId(): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  // Create new chat session
  static async createNewSession(title?: string): Promise<any> {
    if (!isSupabaseConfigured) {
      // Return mock session when Supabase not configured
      return {
        id: `mock-${Date.now()}`,
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    const userId = await this.getCurrentUserId();
    
    return await SupabaseSessionQueries.createSession({
      title: title || 'New Chat',
      user_id: userId || undefined
    });
  }

  // Load session with all messages
  static async loadSession(sessionId: string): Promise<{
    session: any;
    messages: ChatMessage[];
  } | null> {
    try {
      const sessionData = await SupabaseSessionQueries.getSessionWithMessages(sessionId);
      
      if (!sessionData) return null;

      const messages: ChatMessage[] = sessionData.messages.map((msg: any) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        sources: msg.sources || []
      }));

      return {
        session: sessionData.session,
        messages
      };
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Save message to database
  static async saveMessage(options: SaveMessageOptions): Promise<ChatMessage> {
    const sequenceNumber = await SupabaseMessageQueries.getNextSequenceNumber(options.sessionId);

    // Save message
    const savedMessage = await SupabaseMessageQueries.saveMessage({
      session_id: options.sessionId,
      type: options.type,
      content: options.content,
      sequence_number: sequenceNumber,
      model_used: options.modelUsed,
      tokens_used: options.tokensUsed,
      response_time_ms: options.responseTimeMs,
      search_query: options.searchQuery
    });

    // Save sources if provided
    let sources: any[] = [];
    if (options.sources && options.sources.length > 0) {
      const sourcesData = options.sources.map((source, index) => ({
        title: source.title,
        url: source.url,
        snippet: source.snippet,
        domain: source.domain,
        favicon_url: source.favicon || source.favicon_url,
        published_date: source.publishedDate ? new Date(source.publishedDate) : undefined,
        relevance_score: source.score,
        display_order: index + 1,
        content_type: source.content_type,
        word_count: source.word_count,
        language: source.language || 'en'
      }));

      sources = await SupabaseSourceQueries.saveSources(savedMessage.id, sourcesData);
      // Sources are saved, no need to track clicks during creation
    }

    return {
      id: savedMessage.id,
      type: savedMessage.type,
      content: savedMessage.content,
      timestamp: new Date(savedMessage.created_at),
      sources
    };
  }

  // Get recent sessions for sidebar
  static async getRecentSessions(): Promise<any[]> {
    try {
      return await SupabaseSessionQueries.getRecentSessions(20);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  // Auto-generate session title after first exchange
  static async autoGenerateSessionTitle(sessionId: string): Promise<string> {
    try {
      return await SupabaseSessionQueries.autoGenerateTitle(sessionId);
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    await SupabaseSessionQueries.deleteSession(sessionId);
  }

  // Get conversation context for LLM
  static async getConversationContext(
    sessionId: string, 
    maxMessages: number = 10
  ): Promise<ChatMessage[]> {
    try {
      const messages = await SupabaseMessageQueries.getRecentMessagesForContext(sessionId, maxMessages);
      
      return messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        sources: []
      }));
    } catch (error) {
      console.error('Error getting context:', error);
      return [];
    }
  }
}
