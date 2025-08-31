const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database initialization script
async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../lib/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Create default session for testing
    const defaultSession = await pool.query(
      `INSERT INTO sessions (title, metadata) 
       VALUES ('Welcome Chat', '{"type": "welcome"}') 
       RETURNING id`
    );
    
    console.log('✅ Default session created:', defaultSession.rows[0].id);
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
