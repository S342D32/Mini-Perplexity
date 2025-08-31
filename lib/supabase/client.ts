import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          title: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          message_count: number;
          metadata: any;
          tags: string[];
        };
        Insert: {
          id?: string;
          title?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          message_count?: number;
          metadata?: any;
          tags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          message_count?: number;
          metadata?: any;
          tags?: string[];
        };
      };
      messages: {
        Row: {
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
          feedback_rating: number | null;
          feedback_text: string | null;
          is_helpful: boolean | null;
          metadata: any;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: 'user' | 'ai';
          content: string;
          created_at?: string;
          sequence_number: number;
          model_used?: string | null;
          tokens_used?: number | null;
          response_time_ms?: number | null;
          search_query?: string | null;
          sources_count?: number;
          feedback_rating?: number | null;
          feedback_text?: string | null;
          is_helpful?: boolean | null;
          metadata?: any;
        };
        Update: {
          id?: string;
          session_id?: string;
          type?: 'user' | 'ai';
          content?: string;
          created_at?: string;
          sequence_number?: number;
          model_used?: string | null;
          tokens_used?: number | null;
          response_time_ms?: number | null;
          search_query?: string | null;
          sources_count?: number;
          feedback_rating?: number | null;
          feedback_text?: string | null;
          is_helpful?: boolean | null;
          metadata?: any;
        };
      };
      message_sources: {
        Row: {
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
        };
        Insert: {
          id?: string;
          message_id: string;
          title: string;
          url: string;
          snippet: string;
          domain: string;
          favicon_url: string;
          published_date?: string | null;
          relevance_score?: number | null;
          display_order: number;
          content_type?: string | null;
          word_count?: number | null;
          language?: string;
          click_count?: number;
          last_clicked_at?: string | null;
          metadata?: any;
        };
        Update: {
          id?: string;
          message_id?: string;
          title?: string;
          url?: string;
          snippet?: string;
          domain?: string;
          favicon_url?: string;
          published_date?: string | null;
          relevance_score?: number | null;
          display_order?: number;
          content_type?: string | null;
          word_count?: number | null;
          language?: string;
          click_count?: number;
          last_clicked_at?: string | null;
          metadata?: any;
        };
      };
    };
  };
}
