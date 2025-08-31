import { supabase } from './client';
import { Session, Message, MessageSource } from '@/lib/database/models';

export interface SupabaseSession {
  id: string;
  title: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count: number;
  metadata: any;
  tags: string[];
}

export interface SupabaseMessage {
  id: string;
  session_id: string;
  type: 'user' | 'ai';
  content: string;
  created_at: string;
  sequence_number: number;
  model_used: string | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  search_query: string | null;
  sources_count: number;
  metadata: any;
}

export interface SupabaseMessageSource {
  id: string;
  message_id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  favicon_url: string;
  published_date: string | null;
  relevance_score: number | null;
  display_order: number;
  content_type: string | null;
  word_count: number | null;
  language: string;
  click_count: number;
  last_clicked_at: string | null;
  metadata: any;
}

export class SupabaseSessionQueries {
  // Create new session
  static async createSession(data: {
    title?: string;
    user_id?: string;
    metadata?: any;
    tags?: string[];
  }): Promise<SupabaseSession> {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        title: data.title || 'New Chat',
        user_id: data.user_id || null,
        metadata: data.metadata || {},
        tags: data.tags || []
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }

  // Get session with messages and sources
  static async getSessionWithMessages(sessionId: string) {
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: true });

    if (messagesError) throw messagesError;

    // Get sources for all messages
    const messageIds = messages.map(m => m.id);
    const { data: sources, error: sourcesError } = await supabase
      .from('message_sources')
      .select('*')
      .in('message_id', messageIds)
      .order('display_order', { ascending: true });

    if (sourcesError) throw sourcesError;

    // Group sources by message_id
    const sourcesByMessage = sources.reduce((acc, source) => {
      if (!acc[source.message_id]) acc[source.message_id] = [];
      acc[source.message_id].push(source);
      return acc;
    }, {} as Record<string, SupabaseMessageSource[]>);

    // Combine messages with their sources
    const messagesWithSources = messages.map(message => ({
      ...message,
      sources: sourcesByMessage[message.id] || []
    }));

    return {
      session,
      messages: messagesWithSources
    };
  }

  // Get recent sessions
  static async getRecentSessions(limit: number = 20): Promise<SupabaseSession[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Update session title
  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }

  // Auto-generate session title from first message
  static async autoGenerateTitle(sessionId: string): Promise<string> {
    const { data: firstMessage, error } = await supabase
      .from('messages')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', 'user')
      .order('sequence_number', { ascending: true })
      .limit(1)
      .single();

    if (error || !firstMessage) return 'New Chat';

    const title = firstMessage.content.length > 50 
      ? firstMessage.content.substring(0, 50) + '...'
      : firstMessage.content;

    await this.updateSessionTitle(sessionId, title);
    return title;
  }
}

export class SupabaseMessageQueries {
  // Save message
  static async saveMessage(data: {
    session_id: string;
    type: 'user' | 'ai';
    content: string;
    sequence_number: number;
    model_used?: string;
    tokens_used?: number;
    response_time_ms?: number;
    search_query?: string;
    metadata?: any;
  }): Promise<SupabaseMessage> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        session_id: data.session_id,
        type: data.type,
        content: data.content,
        sequence_number: data.sequence_number,
        model_used: data.model_used || null,
        tokens_used: data.tokens_used || null,
        response_time_ms: data.response_time_ms || null,
        search_query: data.search_query || null,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  }

  // Get next sequence number for a session
  static async getNextSequenceNumber(sessionId: string): Promise<number> {
    const { data, error } = await supabase
      .from('messages')
      .select('sequence_number')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0].sequence_number + 1 : 1;
  }

  // Get recent messages for context
  static async getRecentMessagesForContext(
    sessionId: string, 
    maxMessages: number = 10
  ): Promise<SupabaseMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: false })
      .limit(maxMessages);

    if (error) throw error;
    return data.reverse(); // Return in chronological order
  }
}

export class SupabaseSourceQueries {
  // Save sources for a message
  static async saveSources(
    messageId: string, 
    sources: Array<{
      title: string;
      url: string;
      snippet: string;
      domain: string;
      favicon_url: string;
      published_date?: Date;
      relevance_score?: number;
      display_order: number;
      content_type?: string;
      word_count?: number;
      language?: string;
      metadata?: any;
    }>
  ): Promise<SupabaseMessageSource[]> {
    const sourcesToInsert = sources.map(source => ({
      message_id: messageId,
      title: source.title,
      url: source.url,
      snippet: source.snippet,
      domain: source.domain,
      favicon_url: source.favicon_url,
      published_date: source.published_date?.toISOString() || null,
      relevance_score: source.relevance_score || null,
      display_order: source.display_order,
      content_type: source.content_type || null,
      word_count: source.word_count || null,
      language: source.language || 'en',
      metadata: source.metadata || {}
    }));

    const { data, error } = await supabase
      .from('message_sources')
      .insert(sourcesToInsert)
      .select();

    if (error) throw error;

    // Update sources count in message
    await supabase
      .from('messages')
      .update({ sources_count: sources.length })
      .eq('id', messageId);

    return data;
  }

  // Track source click
  static async trackSourceClick(sourceId: string): Promise<void> {
    const { error } = await supabase
      .rpc('increment_source_clicks', { source_id: sourceId });

    if (error) throw error;
  }
}
