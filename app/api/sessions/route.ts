import { NextRequest, NextResponse } from 'next/server';
import { SupabaseSessionQueries } from '@/lib/supabase/queries';

// GET /api/sessions - Get recent sessions for sidebar
export async function GET() {
  try {
    const sessions = await SupabaseSessionQueries.getRecentSessions(20);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await SupabaseSessionQueries.createSession({
      title: body.title,
      user_id: body.user_id,
      metadata: body.metadata,
      tags: body.tags
    });
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
