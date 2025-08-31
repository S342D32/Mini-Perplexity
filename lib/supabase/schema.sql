-- Supabase Chat Persistence Schema
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'New Chat',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}'
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sequence_number INTEGER NOT NULL,
    model_used TEXT,
    tokens_used INTEGER,
    response_time_ms INTEGER,
    search_query TEXT,
    sources_count INTEGER DEFAULT 0,
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    is_helpful BOOLEAN,
    metadata JSONB DEFAULT '{}'
);

-- Message sources table
CREATE TABLE message_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    snippet TEXT,
    domain TEXT,
    favicon_url TEXT,
    published_date TIMESTAMPTZ,
    relevance_score REAL,
    display_order INTEGER NOT NULL,
    content_type TEXT,
    word_count INTEGER,
    language TEXT DEFAULT 'en',
    click_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Search analytics table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    search_duration_ms INTEGER,
    provider TEXT,
    provider_metadata JSONB DEFAULT '{}',
    clicked_sources INTEGER[] DEFAULT '{}',
    time_spent_reading_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at DESC);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sequence ON messages(session_id, sequence_number);

CREATE INDEX idx_sources_message_id ON message_sources(message_id);
CREATE INDEX idx_sources_display_order ON message_sources(message_id, display_order);

CREATE INDEX idx_analytics_session_id ON search_analytics(session_id);
CREATE INDEX idx_analytics_created_at ON search_analytics(created_at DESC);

-- Function to update session timestamp and message count
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions 
    SET 
        updated_at = NOW(),
        message_count = (
            SELECT COUNT(*) 
            FROM messages 
            WHERE session_id = NEW.session_id
        )
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update sessions
CREATE TRIGGER trigger_update_session_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_on_message();

-- Row Level Security (RLS) policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from their sessions" ON messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions" ON messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

-- Message sources policies
CREATE POLICY "Users can view sources from their messages" ON message_sources
    FOR SELECT USING (
        message_id IN (
            SELECT m.id FROM messages m
            JOIN sessions s ON m.session_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sources to their messages" ON message_sources
    FOR INSERT WITH CHECK (
        message_id IN (
            SELECT m.id FROM messages m
            JOIN sessions s ON m.session_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Search analytics policies
CREATE POLICY "Users can view their search analytics" ON search_analytics
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their search analytics" ON search_analytics
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

-- Function to increment source clicks
CREATE OR REPLACE FUNCTION increment_source_clicks(source_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE message_sources 
  SET click_count = click_count + 1,
      last_clicked_at = NOW()
  WHERE id = source_id;
END;
$$ LANGUAGE plpgsql;
