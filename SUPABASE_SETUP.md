# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note your project URL and anon key

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# API Keys
OPENAI_API_KEY="your_openai_api_key_here"
TAVILY_API_KEY="your_tavily_api_key_here"
```

## 3. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `lib/supabase/schema.sql`
4. Run the SQL to create tables and policies

## 4. Authentication Setup

The app uses Supabase Auth. Make sure to:

1. Enable Email authentication in Supabase Auth settings
2. Configure your site URL in Auth settings
3. Set up redirect URLs for development and production

## 5. Test the Setup

Run the initialization script to verify everything is working:

```bash
npm run init-supabase
```

## 6. Start Development

```bash
npm run dev
```

## Features Included

- **Chat Sessions**: Persistent chat sessions with auto-generated titles
- **Message History**: All user and AI messages saved with timestamps
- **Source Management**: Web sources with click tracking and metadata
- **User Authentication**: Row-level security ensures users only see their data
- **Search Analytics**: Track search queries and performance metrics
- **Mobile Responsive**: Collapsible sidebar works on all devices

## Database Schema

- `sessions`: Chat sessions with metadata and user association
- `messages`: Individual messages in conversations
- `message_sources`: Web sources attached to AI responses
- `search_analytics`: Search performance and usage tracking

All tables include Row Level Security (RLS) policies to protect user data.
