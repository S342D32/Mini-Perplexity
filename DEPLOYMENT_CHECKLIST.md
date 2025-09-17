# Deployment Checklist

## Environment Variables (CRITICAL)

### 1. Set these in your deployment platform:

```bash
# Database
POSTGRES_URL=your_production_postgres_url
POSTGRES_PRISMA_URL=your_production_postgres_url
POSTGRES_URL_NON_POOLING=your_production_postgres_url

# NextAuth (MOST IMPORTANT)
AUTH_SECRET=your_production_auth_secret
# DO NOT set AUTH_URL - let NextAuth auto-detect

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
GEMINI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
```

### 2. Generate new AUTH_SECRET for production:
```bash
openssl rand -base64 32
```

## Database Setup

1. Ensure `user_profiles` table exists in production database
2. Run this SQL in your production database:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nextauth_user_id VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nextauth_id ON user_profiles(nextauth_user_id);
```

## Common Deployment Issues

1. **AUTH_SECRET missing** - Generate and set in production
2. **AUTH_URL hardcoded** - Remove it, let NextAuth auto-detect
3. **Database connection** - Ensure production DB URL is correct
4. **CORS issues** - NextAuth handles this automatically
5. **Environment variables** - Double-check all are set correctly

## Testing After Deployment

1. Visit `/test-auth` to test authentication
2. Try signup with new email
3. Try login with created account
4. Check server logs for any errors