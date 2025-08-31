# Mini Perplexity Database Setup

## Overview
Complete database persistence system for chat sessions, messages, sources, and analytics.

## Quick Setup

### 1. Install Dependencies
```bash
npm install pg @types/pg
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and configure:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/mini_perplexity
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb mini_perplexity

# Initialize schema
node scripts/init-db.js
```

## Features Implemented

### ✅ Database Schema
- **Sessions**: Chat conversation tracking
- **Messages**: User queries and AI responses
- **Message Sources**: Search result sources with metadata
- **Search Analytics**: Performance and usage tracking
- **Session Summaries**: Context management for long conversations
- **User Feedback**: Model improvement data

### ✅ API Endpoints
- `GET /api/sessions` - List recent sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Load session with messages
- `PUT /api/sessions/[id]` - Update session title
- `DELETE /api/sessions/[id]` - Delete session
- `POST /api/messages` - Save message with sources

### ✅ UI Components
- **ChatInterface**: Circular source icons (ChatGPT style)
- **ChatHistory**: Sidebar with grouped sessions
- **ChatSidebar**: Collapsible sidebar with history
- **SourcesPanel**: Modal for viewing source details

### ✅ Features
- **Session Management**: Auto-create, load, delete sessions
- **Message Persistence**: Save all user/AI messages
- **Source Display**: Circular icons with favicons
- **Chat History**: Grouped by date (Today, Yesterday, etc.)
- **Context Loading**: Fetch recent messages for continuity
- **Auto-titling**: Generate session titles from first message

## Database Tables

### Sessions
- Session tracking with metadata
- Auto-updating timestamps and message counts
- Support for user authentication (future)

### Messages
- User queries and AI responses
- Sequence ordering within sessions
- Model metadata (tokens, response time)
- Feedback tracking for training

### Message Sources
- Search result sources from Tavily API
- Favicon URLs and published dates
- Click tracking and analytics
- Relevance scoring

## Usage

### Creating New Chat
```typescript
const newSession = await ChatService.createNewSession();
setCurrentSessionId(newSession.id);
```

### Saving Messages
```typescript
await ChatService.saveMessage({
  sessionId,
  type: 'user',
  content: userQuery
});
```

### Loading Session
```typescript
const sessionData = await ChatService.loadSession(sessionId);
setMessages(sessionData.messages);
```

## Future Enhancements
- User authentication integration
- Message embeddings for semantic search
- Advanced analytics dashboard
- Model fine-tuning pipeline
- Export/import conversations
