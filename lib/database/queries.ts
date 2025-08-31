import pool from './connection';
import {
  Session,
  Message,
  MessageSource,
  SessionWithMessages,
  CreateSessionData,
  CreateMessageData,
  CreateSourceData,
  SearchAnalytics
} from './models';

// Session Management
export class SessionQueries {
  // Create new session
  static async createSession(data: CreateSessionData): Promise<Session> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO sessions (title, user_id, metadata, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          data.title || 'New Chat',
          data.user_id || null,
          JSON.stringify(data.metadata || {}),
          data.tags || []
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get session by ID with messages and sources
  static async getSessionWithMessages(sessionId: string): Promise<SessionWithMessages | null> {
    const client = await pool.connect();
    try {
      // Get session
      const sessionResult = await client.query(
        'SELECT * FROM sessions WHERE id = $1',
        [sessionId]
      );
      
      if (sessionResult.rows.length === 0) return null;
      
      // Get messages with sources
      const messagesResult = await client.query(
        `SELECT 
          m.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', s.id,
                'title', s.title,
                'url', s.url,
                'snippet', s.snippet,
                'domain', s.domain,
                'favicon_url', s.favicon_url,
                'published_date', s.published_date,
                'display_order', s.display_order
              ) ORDER BY s.display_order
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'
          ) as sources
         FROM messages m
         LEFT JOIN message_sources s ON m.id = s.message_id
         WHERE m.session_id = $1
         GROUP BY m.id
         ORDER BY m.sequence_number ASC`,
        [sessionId]
      );

      const session = sessionResult.rows[0];
      const messages = messagesResult.rows.map((row: any) => ({
        ...row,
        sources: row.sources || []
      }));

      return { ...session, messages };
    } finally {
      client.release();
    }
  }

  // Get recent sessions for sidebar
  static async getRecentSessions(limit: number = 20): Promise<Session[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM sessions 
         WHERE is_active = true 
         ORDER BY updated_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Update session title
  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE sessions SET title = $1, updated_at = NOW() WHERE id = $2',
        [title, sessionId]
      );
    } finally {
      client.release();
    }
  }

  // Auto-generate session title from first message
  static async autoGenerateTitle(sessionId: string): Promise<string> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT generate_session_title($1) as title',
        [sessionId]
      );
      
      const title = result.rows[0].title;
      await this.updateSessionTitle(sessionId, title);
      return title;
    } finally {
      client.release();
    }
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    } finally {
      client.release();
    }
  }
}

// Message Management
export class MessageQueries {
  // Save user message
  static async saveMessage(data: CreateMessageData): Promise<Message> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO messages (
          session_id, type, content, sequence_number, model_used, 
          tokens_used, response_time_ms, search_query, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.session_id,
          data.type,
          data.content,
          data.sequence_number,
          data.model_used || null,
          data.tokens_used || null,
          data.response_time_ms || null,
          data.search_query || null,
          JSON.stringify(data.metadata || {})
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get next sequence number for session
  static async getNextSequenceNumber(sessionId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq FROM messages WHERE session_id = $1',
        [sessionId]
      );
      return result.rows[0].next_seq;
    } finally {
      client.release();
    }
  }

  // Get recent messages for context (with token limit consideration)
  static async getRecentMessagesForContext(
    sessionId: string, 
    maxMessages: number = 10
  ): Promise<Message[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM messages 
         WHERE session_id = $1 
         ORDER BY sequence_number DESC 
         LIMIT $2`,
        [sessionId, maxMessages]
      );
      return result.rows.reverse(); // Return in chronological order
    } finally {
      client.release();
    }
  }
}

// Source Management
export class SourceQueries {
  // Save sources for a message
  static async saveSources(messageId: string, sources: CreateSourceData[]): Promise<MessageSource[]> {
    const client = await pool.connect();
    try {
      const results: MessageSource[] = [];
      
      for (const source of sources) {
        const result = await client.query(
          `INSERT INTO message_sources (
            message_id, title, url, snippet, domain, favicon_url,
            published_date, relevance_score, display_order, content_type,
            word_count, language, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            messageId,
            source.title,
            source.url,
            source.snippet,
            source.domain,
            source.favicon_url,
            source.published_date || null,
            source.relevance_score || null,
            source.display_order,
            source.content_type || null,
            source.word_count || null,
            source.language || 'en',
            JSON.stringify(source.metadata || {})
          ]
        );
        results.push(result.rows[0]);
      }

      // Update sources count in message
      await client.query(
        'UPDATE messages SET sources_count = $1 WHERE id = $2',
        [sources.length, messageId]
      );

      return results;
    } finally {
      client.release();
    }
  }

  // Track source click
  static async trackSourceClick(sourceId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE message_sources 
         SET click_count = click_count + 1, last_clicked_at = NOW() 
         WHERE id = $1`,
        [sourceId]
      );
    } finally {
      client.release();
    }
  }
}

// Analytics
export class AnalyticsQueries {
  // Save search analytics
  static async saveSearchAnalytics(data: {
    session_id: string;
    query: string;
    results_count: number;
    search_duration_ms: number;
    provider: string;
    provider_metadata?: Record<string, any>;
  }): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO search_analytics (
          session_id, query, results_count, search_duration_ms, 
          provider, provider_metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.session_id,
          data.query,
          data.results_count,
          data.search_duration_ms,
          data.provider,
          JSON.stringify(data.provider_metadata || {})
        ]
      );
    } finally {
      client.release();
    }
  }
}

// Memory Management
export class MemoryQueries {
  // Create session summary for long conversations
  static async createSessionSummary(
    sessionId: string,
    summaryText: string,
    keyTopics: string[],
    messagesSummarized: number,
    tokenCount: number
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO session_summaries (
          session_id, summary_text, key_topics, messages_summarized,
          summary_method, token_count, compression_ratio
         )
         VALUES ($1, $2, $3, $4, 'auto', $5, $6)`,
        [
          sessionId,
          summaryText,
          keyTopics,
          messagesSummarized,
          tokenCount,
          messagesSummarized / tokenCount // Simple compression ratio
        ]
      );
    } finally {
      client.release();
    }
  }

  // Get session summary for context
  static async getSessionSummary(sessionId: string): Promise<string | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT summary_text FROM session_summaries 
         WHERE session_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [sessionId]
      );
      return result.rows[0]?.summary_text || null;
    } finally {
      client.release();
    }
  }
}
