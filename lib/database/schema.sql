-- Mini Perplexity Chat Database Schema
-- Supports session management, message persistence, and future model training

-- Sessions table - tracks individual chat conversations
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    user_id VARCHAR(255), -- For future user authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    
    -- Metadata for future features
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Indexing for performance
    INDEX idx_sessions_created_at (created_at DESC),
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_active (is_active)
);

-- Messages table - stores all user queries and AI responses
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('user', 'ai')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Message ordering within session
    sequence_number INTEGER NOT NULL,
    
    -- AI response metadata
    model_used VARCHAR(100), -- e.g., 'gpt-4', 'claude-3'
    tokens_used INTEGER,
    response_time_ms INTEGER,
    
    -- Search and sources metadata
    search_query TEXT, -- Original search query for AI responses
    sources_count INTEGER DEFAULT 0,
    
    -- Future training data
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    is_helpful BOOLEAN,
    
    -- Performance tracking
    metadata JSONB DEFAULT '{}',
    
    -- Indexing
    INDEX idx_messages_session_id (session_id),
    INDEX idx_messages_created_at (created_at DESC),
    INDEX idx_messages_type (type),
    INDEX idx_messages_sequence (session_id, sequence_number)
);

-- Sources table - stores search result sources for each AI response
CREATE TABLE message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Source details (from Tavily API)
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    snippet TEXT,
    domain VARCHAR(255),
    favicon_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    
    -- Source ranking and relevance
    relevance_score FLOAT,
    display_order INTEGER NOT NULL,
    
    -- Source metadata
    content_type VARCHAR(100), -- 'article', 'blog', 'documentation', etc.
    word_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    
    -- Performance tracking
    click_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Future features
    metadata JSONB DEFAULT '{}',
    
    -- Indexing
    INDEX idx_sources_message_id (message_id),
    INDEX idx_sources_domain (domain),
    INDEX idx_sources_display_order (message_id, display_order)
);

-- Search analytics - for improving search quality
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    search_duration_ms INTEGER,
    
    -- Search provider details
    provider VARCHAR(50), -- 'tavily', 'serp', etc.
    provider_metadata JSONB DEFAULT '{}',
    
    -- User interaction
    clicked_sources INTEGER[] DEFAULT '{}',
    time_spent_reading_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexing
    INDEX idx_analytics_session_id (session_id),
    INDEX idx_analytics_query (query),
    INDEX idx_analytics_created_at (created_at DESC)
);

-- Session summaries - for context management in long conversations
CREATE TABLE session_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    
    -- Summary content
    summary_text TEXT NOT NULL,
    key_topics TEXT[] DEFAULT '{}',
    
    -- Summary metadata
    messages_summarized INTEGER NOT NULL,
    summary_method VARCHAR(50), -- 'auto', 'manual', 'llm'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Context window management
    token_count INTEGER,
    compression_ratio FLOAT,
    
    -- Indexing
    INDEX idx_summaries_session_id (session_id),
    INDEX idx_summaries_created_at (created_at DESC)
);

-- User feedback - for model improvement
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    
    -- Feedback details
    feedback_type VARCHAR(50), -- 'thumbs_up', 'thumbs_down', 'report', 'suggestion'
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    
    -- Context
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexing
    INDEX idx_feedback_message_id (message_id),
    INDEX idx_feedback_session_id (session_id),
    INDEX idx_feedback_type (feedback_type)
);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions 
    SET updated_at = NOW(), 
        message_count = (
            SELECT COUNT(*) 
            FROM messages 
            WHERE session_id = NEW.session_id
        )
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session when messages are added
CREATE TRIGGER trigger_update_session_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_timestamp();

-- Function to generate session titles based on first message
CREATE OR REPLACE FUNCTION generate_session_title(session_uuid UUID)
RETURNS VARCHAR(255) AS $$
DECLARE
    first_message TEXT;
    generated_title VARCHAR(255);
BEGIN
    -- Get the first user message
    SELECT content INTO first_message
    FROM messages 
    WHERE session_id = session_uuid AND type = 'user'
    ORDER BY sequence_number ASC
    LIMIT 1;
    
    -- Generate title from first 50 characters
    IF first_message IS NOT NULL THEN
        generated_title := LEFT(first_message, 50);
        IF LENGTH(first_message) > 50 THEN
            generated_title := generated_title || '...';
        END IF;
    ELSE
        generated_title := 'New Chat';
    END IF;
    
    RETURN generated_title;
END;
$$ LANGUAGE plpgsql;
