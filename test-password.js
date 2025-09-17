const bcrypt = require('bcrypt');
const postgres = require('postgres');

async function testPassword() {
  const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
  
  try {
    // Get the user you just created
    const users = await sql`SELECT email, password FROM user_profiles WHERE email = 'nayaksourajit3@gmail.com'`;
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', user.email);
    console.log('Password hash length:', user.password.length);
    console.log('Password hash starts with:', user.password.substring(0, 10));
    
    // Test the password
    const testPassword = 'Admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('Password test result:', isValid);
    
    // Also test creating a new hash
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash for same password:', newHash);
    const newHashTest = await bcrypt.compare(testPassword, newHash);
    console.log('New hash test result:', newHashTest);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

testPassword();