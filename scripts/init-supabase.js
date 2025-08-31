const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase initialization script
async function initializeSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Initializing Supabase database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../lib/supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Note: For Supabase, you'll need to run the schema.sql manually in the Supabase SQL Editor
    // This script is mainly for verification and testing
    
    console.log('📋 Schema file ready at:', schemaPath);
    console.log('🔗 Please run the schema in your Supabase SQL Editor');
    console.log('🌐 Supabase Dashboard: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    
    // Test connection
    const { data, error } = await supabase.from('sessions').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Tables not yet created. Please run the schema in Supabase SQL Editor first.');
    } else {
      console.log('✅ Supabase connection successful');
      console.log('✅ Database tables are ready');
    }
    
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeSupabase();
}

module.exports = { initializeSupabase };
