# Supabase Integration Fix Guide

## 🔧 Issues Resolved

### **User ID and Session Problems Fixed:**
- ✅ NextAuth and Supabase authentication bridge created
- ✅ User profile mapping system implemented
- ✅ Session persistence with proper user association
- ✅ Database schema updated for NextAuth compatibility

## 🚀 Quick Setup

**Run the SQL schema in Supabase:**
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `lib/supabase/schema.sql`
   - Execute the script

**Important:** The database tables (`sessions`, `messages`, `message_sources`, `user_profiles`) must be created in Supabase for the chat functionality to work.

### 2. **Environment Variables Required**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# API Keys
GEMINI_API_KEY="your_gemini_api_key"
TAVILY_API_KEY="your_tavily_api_key"

# NextAuth (existing)
POSTGRES_URL="your_postgres_connection_string"
```

### 3. **How It Works Now**

#### **User Authentication Flow:**
1. User logs in via NextAuth (existing system)
2. `UserBridge` maps NextAuth user to Supabase `user_profiles`
3. Chat sessions automatically associate with authenticated user
4. All messages and sources are properly linked to user

#### **Session Management:**
- Sessions auto-create when user starts chatting
- Messages persist to Supabase with user association
- Session titles auto-generate from first message
- Full chat history maintained per user

## 🔍 Testing Your Integration

### **Run Diagnostics:**
```typescript
import { SupabaseIntegrationTest } from '@/lib/test/supabase-integration-test';

// In your component or API route
const diagnostics = await SupabaseIntegrationTest.runDiagnostics();
console.log(diagnostics);
```

### **Manual Testing Steps:**
1. Login to your app with NextAuth
2. Start a new chat conversation
3. Check Supabase dashboard for:
   - New entry in `user_profiles` table
   - New session in `sessions` table with correct `user_id`
   - Messages in `messages` table linked to session

## 📊 Database Schema Overview

```sql
user_profiles (NEW)
├── nextauth_user_id (TEXT) - Links to NextAuth user
├── email, name
└── metadata

sessions
├── user_id (TEXT) - References user_profiles.nextauth_user_id
├── title, created_at, updated_at
└── message_count, metadata

messages
├── session_id - Links to sessions
├── type (user/ai), content
└── sequence_number, timestamps

message_sources
├── message_id - Links to messages
├── title, url, snippet
└── click tracking, metadata
```

## 🎯 Key Changes Made

1. **`lib/auth/user-bridge.ts`** - Bridges NextAuth and Supabase
2. **`lib/services/supabaseChatService.ts`** - Updated to use user bridge
3. **`app/api/chat/route.ts`** - Added authentication and user context
4. **`chat-interface.tsx`** - Integrated session persistence
5. **`app/layout.tsx`** - Added session provider wrapper
6. **`schema.sql`** - Updated for NextAuth compatibility

## ✅ Verification Checklist

- [ ] Supabase environment variables configured
- [ ] Updated schema executed in Supabase SQL Editor
- [ ] User can login via NextAuth
- [ ] Chat sessions create and persist
- [ ] Messages save with proper user association
- [ ] Session history loads correctly

Your user ID and session issues should now be resolved!
