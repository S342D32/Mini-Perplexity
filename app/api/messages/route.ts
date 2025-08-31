import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMessageQueries, SupabaseSourceQueries } from '@/lib/supabase/queries';
import { Database } from '@/lib/supabase/client';

type SupabaseMessageSource = Database['public']['Tables']['message_sources']['Row'];

// POST /api/messages - Save message and sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, type, content, model_used, tokens_used, response_time_ms, search_query, sources } = body;

    // Get next sequence number
    const sequence_number = await SupabaseMessageQueries.getNextSequenceNumber(session_id);

    // Save message
    const message = await SupabaseMessageQueries.saveMessage({
      session_id,
      type,
      content,
      sequence_number,
      model_used,
      tokens_used,
      response_time_ms,
      search_query
    });

    // Save sources if provided (for AI messages)
    let savedSources: SupabaseMessageSource[] = [];
    if (sources && sources.length > 0) {
      const sourcesData = sources.map((source: any, index: number) => ({
        message_id: message.id,
        title: source.title,
        url: source.url,
        snippet: source.snippet,
        domain: source.domain,
        favicon_url: source.favicon,
        published_date: source.publishedDate ? new Date(source.publishedDate) : null,
        relevance_score: source.score,
        display_order: index + 1,
        content_type: source.content_type,
        word_count: source.word_count,
        language: source.language || 'en'
      }));

      savedSources = await SupabaseSourceQueries.saveSources(message.id, sourcesData);
    }

    return NextResponse.json({ 
      message: {
        ...message,
        sources: savedSources
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
