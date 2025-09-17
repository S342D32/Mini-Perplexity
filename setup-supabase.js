const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

async function setupSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('Setting up user_profiles table in Supabase...');
    
    // Check if test user exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'test@example.com')
      .single();
    
    if (!existingUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          nextauth_user_id: 'TEST01'
        })
        .select();
      
      if (error) {
        console.error('❌ Error creating user:', error);
      } else {
        console.log('✅ Test user created: test@example.com / password123');
      }
    } else {
      console.log('✅ Test user already exists: test@example.com / password123');
    }
    
    // List all users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, name, email, nextauth_user_id');
    
    console.log('Current users:', users);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupSupabase();