import { SessionQueries, MessageQueries, SourceQueries, AnalyticsQueries } from '@/lib/database/queries';
import { Session, Message, MessageSource, CreateSourceData } from '@/lib/database/models';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
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

export class ChatService {
  // Create new chat session
  static async createNewSession(title?: string): Promise<Session> {
    return await SessionQueries.createSession({
      title: title || 'New Chat'
    });
  }

  // Load session with all messages
  static async loadSession(sessionId: string): Promise<{
    session: Session;
    messages: ChatMessage[];
  } | null> {
    const sessionWithMessages = await SessionQueries.getSessionWithMessages(sessionId);
    
    if (!sessionWithMessages) return null;

    const messages: ChatMessage[] = sessionWithMessages.messages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.created_at,
      sources: msg.sources
    }));

    return {
      session: sessionWithMessages,
      messages
    };
  }

  // Save message to database
  static async saveMessage(options: SaveMessageOptions): Promise<ChatMessage> {
    const sequenceNumber = await MessageQueries.getNextSequenceNumber(options.sessionId);

    // Save message
    const savedMessage = await MessageQueries.saveMessage({
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
    let sources: MessageSource[] = [];
    if (options.sources && options.sources.length > 0) {
      const sourcesData: CreateSourceData[] = options.sources.map((source, index) => ({
        message_id: savedMessage.id,
        title: source.title,
        url: source.url,
        snippet: source.snippet,
        domain: source.domain,
        favicon_url: source.favicon,
        published_date: source.publishedDate ? new Date(source.publishedDate) : undefined,
        relevance_score: source.score,
        display_order: index + 1,
        content_type: source.content_type,
        word_count: source.word_count,
        language: source.language || 'en'
      }));

      sources = await SourceQueries.saveSources(savedMessage.id, sourcesData);
    }

    return {
      id: savedMessage.id,
      type: savedMessage.type,
      content: savedMessage.content,
      timestamp: savedMessage.created_at,
      sources
    };
  }

  // Get recent sessions for sidebar
  static async getRecentSessions(): Promise<Session[]> {
    return await SessionQueries.getRecentSessions(20);
  }

  // Auto-generate session title after first exchange
  static async autoGenerateSessionTitle(sessionId: string): Promise<string> {
    return await SessionQueries.autoGenerateTitle(sessionId);
  }

  // Get conversation context for LLM (recent messages)
  static async getConversationContext(
    sessionId: string, 
    maxMessages: number = 10
  ): Promise<ChatMessage[]> {
    const messages = await MessageQueries.getRecentMessagesForContext(sessionId, maxMessages);
    
    return messages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.created_at,
      sources: []
    }));
  }

  // Track search analytics
  static async trackSearch(
    sessionId: string,
    query: string,
    resultsCount: number,
    duration: number,
    provider: string = 'tavily'
  ): Promise<void> {
    await AnalyticsQueries.saveSearchAnalytics({
      session_id: sessionId,
      query,
      results_count: resultsCount,
      search_duration_ms: duration,
      provider
    });
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    await SessionQueries.deleteSession(sessionId);
  }
}
