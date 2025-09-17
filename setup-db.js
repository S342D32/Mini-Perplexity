const postgres = require('postgres');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
  
  try {
    console.log('Creating user_profiles table...');
    
    // Create table
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
    
    console.log('✅ Table created');
    
    // Check if test user exists
    const existingUser = await sql`SELECT * FROM user_profiles WHERE email = 'test@example.com'`;
    
    if (existingUser.length === 0) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await sql`
        INSERT INTO user_profiles (name, email, password, nextauth_user_id)
        VALUES ('Test User', 'test@example.com', ${hashedPassword}, 'TEST01')
      `;
      
      console.log('✅ Test user created: test@example.com / password123');
    } else {
      console.log('✅ Test user already exists: test@example.com / password123');
    }
    
    // List all users
    const users = await sql`SELECT id, name, email, nextauth_user_id FROM user_profiles`;
    console.log('Current users:', users);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();