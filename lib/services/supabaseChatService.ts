import {
  SupabaseSessionQueries,
  SupabaseMessageQueries,
  SupabaseSourceQueries,
} from "@/lib/supabase/queries";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserBridge } from "@/lib/auth/user-bridge";
import { SupabaseMiddleware } from "@/lib/supabase/middleware";
import { generateUUID } from "@/lib/utils/uuid";

export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  sources?: any[];
}

export interface SaveMessageOptions {
  sessionId: string;
  type: "user" | "ai";
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  searchQuery?: string;
  sources?: any[];
}

export class SupabaseChatService {
  // Get current user ID using NextAuth bridge
  static async getCurrentUserId(): Promise<string | null> {
    try {
      return await UserBridge.getUserIdForSupabase();
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  }

  // Create new chat session with proper validation
  static async createNewSession(title?: string): Promise<any> {
    console.log("Creating new session with title:", title);

    if (!isSupabaseConfigured) {
      // Return mock session with proper UUID
      const mockSession = {
        id: generateUUID(),
        title: title || "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: null,
        is_active: true,
        message_count: 0,
        metadata: {},
        tags: [],
      };
      console.log("Returning mock session:", mockSession);
      return mockSession;
    }

    try {
      return await SupabaseMiddleware.withUserContext(async () => {
        const userId = await this.getCurrentUserId();
        console.log("Creating session for user ID:", userId);

        const session = await SupabaseSessionQueries.createSession({
          title: title || "New Chat",
          user_id: userId || undefined, // Allow null user_id if no user context
        });

        console.log("Session created successfully:", session);
        return session;
      });
    } catch (error) {
      console.error("Error creating session:", error);
      // Return fallback session on error
      return {
        id: generateUUID(),
        title: title || "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: null,
        is_active: true,
        message_count: 0,
        metadata: {},
        tags: [],
      };
    }
  }

  // Load session with all messages
  static async loadSession(sessionId: string): Promise<{
    session: any;
    messages: ChatMessage[];
  } | null> {
    if (!sessionId || sessionId.trim() === "") {
      console.error("Invalid session ID provided");
      return null;
    }

    try {
      console.log("Loading session:", sessionId);

      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, returning null");
        return null;
      }

      return await SupabaseMiddleware.withUserContext(async () => {
        const sessionData = await SupabaseSessionQueries.getSessionWithMessages(
          sessionId
        );

        if (!sessionData) {
          console.log("No session data found");
          return null;
        }

        const messages: ChatMessage[] = sessionData.messages.map(
          (msg: any) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            sources: msg.sources || [],
          })
        );

        console.log(
          "Session loaded successfully with",
          messages.length,
          "messages"
        );

        return {
          session: sessionData.session,
          messages,
        };
      });
    } catch (error) {
      console.error("Error loading session:", error);
      return null;
    }
  }

  // Save message to database with comprehensive validation
  static async saveMessage(options: SaveMessageOptions): Promise<ChatMessage> {
    console.log("Saving message with options:", options);

    // Validate required fields
    if (!options.content || options.content.trim() === "") {
      throw new Error("Message content cannot be empty");
    }

    if (!options.sessionId || options.sessionId.trim() === "") {
      throw new Error("Session ID is required");
    }

    if (!options.type || !["user", "ai"].includes(options.type)) {
      throw new Error('Message type must be either "user" or "ai"');
    }

    try {
      if (!isSupabaseConfigured) {
        // Return mock message for non-configured environments
        const mockMessage: ChatMessage = {
          id: generateUUID(),
          type: options.type,
          content: options.content.trim(),
          timestamp: new Date(),
          sources: options.sources || [],
        };
        console.log("Returning mock message:", mockMessage);
        return mockMessage;
      }

      return await SupabaseMiddleware.withUserContext(async () => {
        // Get the next sequence number
        const sequenceNumber =
          await SupabaseMessageQueries.getNextSequenceNumber(options.sessionId);
        console.log("Next sequence number:", sequenceNumber);

        // Prepare message data
        const messageData = {
          session_id: options.sessionId,
          type: options.type,
          content: options.content.trim(), // Ensure content is trimmed
          sequence_number: sequenceNumber,
          model_used: options.modelUsed || undefined,
          tokens_used: options.tokensUsed || undefined,
          response_time_ms: options.responseTimeMs || undefined,
          search_query: options.searchQuery || undefined,
          metadata: {
            sources_count: (options.sources || []).length,
            saved_at: new Date().toISOString(),
          },
        };

        console.log("Saving message with data:", messageData);

        // Save message
        const savedMessage = await SupabaseMessageQueries.saveMessage(
          messageData
        );
        console.log("Message saved successfully:", savedMessage);

        // Save sources if provided
        let sources: any[] = [];
        if (options.sources && options.sources.length > 0) {
          console.log("Saving", options.sources.length, "sources");

          const sourcesData = options.sources.map((source, index) => ({
            title: source.title || "Untitled",
            url: source.url || "#",
            snippet: source.snippet || "No snippet available",
            domain: source.domain || this.extractDomain(source.url),
            favicon_url:
              source.favicon ||
              source.favicon_url ||
              this.getFaviconUrl(source.url),
            published_date: source.publishedDate
              ? new Date(source.publishedDate)
              : undefined,
            relevance_score: source.score || 0,
            display_order: index + 1,
            content_type: source.content_type || "article",
            word_count: source.word_count || null,
            language: source.language || "en",
            metadata: source.metadata || {},
          }));

          sources = await SupabaseSourceQueries.saveSources(
            savedMessage.id,
            sourcesData
          );
          console.log("Sources saved successfully:", sources.length);
        }

        return {
          id: savedMessage.id,
          type: savedMessage.type,
          content: savedMessage.content,
          timestamp: new Date(savedMessage.created_at),
          sources,
        };
      });
    } catch (error) {
      console.error("Error saving message:", error);
      throw new Error(
        `Failed to save message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Helper method to extract domain from URL
  private static extractDomain(url?: string): string {
    if (!url) return "unknown";
    try {
      return new URL(url).hostname;
    } catch {
      return "unknown";
    }
  }

  // Helper method to get favicon URL
  private static getFaviconUrl(url?: string): string {
    if (!url) return "";
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return "";
    }
  }

  // Get recent sessions for sidebar
  static async getRecentSessions(): Promise<any[]> {
    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, returning empty sessions");
        return [];
      }

      return await SupabaseMiddleware.withUserContext(async () => {
        const sessions = await SupabaseSessionQueries.getRecentSessions(20);
        console.log("Retrieved", sessions.length, "recent sessions");
        return sessions;
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  }

  // Auto-generate session title after first exchange
  static async autoGenerateSessionTitle(sessionId: string): Promise<string> {
    if (!sessionId || sessionId.trim() === "") {
      console.error("Invalid session ID for title generation");
      return "New Chat";
    }

    try {
      if (!isSupabaseConfigured) {
        return "New Chat";
      }

      console.log("Auto-generating title for session:", sessionId);
      const title = await SupabaseSessionQueries.autoGenerateTitle(sessionId);
      console.log("Generated title:", title);
      return title;
    } catch (error) {
      console.error("Error generating title:", error);
      return "New Chat";
    }
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId || sessionId.trim() === "") {
      throw new Error("Session ID is required");
    }

    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, skipping session deletion");
        return;
      }

      await SupabaseMiddleware.withUserContext(async () => {
        console.log("Deleting session:", sessionId);
        await SupabaseSessionQueries.deleteSession(sessionId);
        console.log("Session deleted successfully");
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      throw new Error(
        `Failed to delete session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get conversation context for LLM
  static async getConversationContext(
    sessionId: string,
    maxMessages: number = 10
  ): Promise<ChatMessage[]> {
    if (!sessionId || sessionId.trim() === "") {
      console.error("Invalid session ID for context retrieval");
      return [];
    }

    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      console.log("Getting conversation context for session:", sessionId);
      const messages = await SupabaseMessageQueries.getRecentMessagesForContext(
        sessionId,
        maxMessages
      );

      const contextMessages = messages.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        sources: [],
      }));

      console.log("Retrieved", contextMessages.length, "context messages");
      return contextMessages;
    } catch (error) {
      console.error("Error getting context:", error);
      return [];
    }
  }

  // Utility method to validate session exists
  static async validateSession(sessionId: string): Promise<boolean> {
    if (!sessionId || sessionId.trim() === "") {
      return false;
    }

    try {
      if (!isSupabaseConfigured) {
        return true; // Assume valid in non-configured environments
      }

      const sessionData = await this.loadSession(sessionId);
      return sessionData !== null;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  }
}
