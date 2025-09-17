const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function initUserProfiles() {
  try {
    console.log('Creating user_profiles table...');
    
    // Create user_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nextauth_user_id VARCHAR(10) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_nextauth_id ON user_profiles(nextauth_user_id)`;

    // Create update trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER trigger_update_user_profiles_updated_at
          BEFORE UPDATE ON user_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_user_profiles_updated_at();
    `;

    console.log('✅ user_profiles table created successfully');
    
    // Check if old users table exists and show migration info
    const oldUsersTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (oldUsersTable[0].exists) {
      console.log('⚠️  Old "users" table detected. Consider migrating data to user_profiles table.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user_profiles table:', error);
    process.exit(1);
  }
}

initUserProfiles();