// Database models and types for chat persistence

export interface Session {
  id: string;
  title: string;
  user_id?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  message_count: number;
  metadata: Record<string, any>;
  tags: string[];
}

export interface Message {
  id: string;
  session_id: string;
  type: 'user' | 'ai';
  content: string;
  created_at: Date;
  sequence_number: number;
  
  // AI response metadata
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
  
  // Search metadata
  search_query?: string;
  sources_count: number;
  
  // Feedback
  feedback_rating?: number;
  feedback_text?: string;
  is_helpful?: boolean;
  
  metadata: Record<string, any>;
}

export interface MessageSource {
  id: string;
  message_id: string;
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
  language: string;
  click_count: number;
  last_clicked_at?: Date;
  metadata: Record<string, any>;
}

export interface SearchAnalytics {
  id: string;
  session_id: string;
  query: string;
  results_count: number;
  search_duration_ms: number;
  provider: string;
  provider_metadata: Record<string, any>;
  clicked_sources: number[];
  time_spent_reading_ms?: number;
  created_at: Date;
}

export interface SessionSummary {
  id: string;
  session_id: string;
  summary_text: string;
  key_topics: string[];
  messages_summarized: number;
  summary_method: string;
  created_at: Date;
  token_count: number;
  compression_ratio: number;
}

export interface UserFeedback {
  id: string;
  message_id: string;
  session_id: string;
  feedback_type: 'thumbs_up' | 'thumbs_down' | 'report' | 'suggestion';
  rating?: number;
  feedback_text?: string;
  user_agent?: string;
  created_at: Date;
}

// Database query result types
export interface SessionWithMessages extends Session {
  messages: (Message & { sources: MessageSource[] })[];
}

export interface CreateSessionData {
  title?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CreateMessageData {
  session_id: string;
  type: 'user' | 'ai';
  content: string;
  sequence_number: number;
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
  search_query?: string;
  metadata?: Record<string, any>;
}

export interface CreateSourceData {
  message_id: string;
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
  metadata?: Record<string, any>;
}
