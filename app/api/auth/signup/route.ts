import { generateUniqueUserId } from '@/lib/utils/generateUserId';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Dynamic imports to avoid client-side bundling
    const { default: postgres } = await import('postgres');
    const { default: bcrypt } = await import('bcrypt');
    
    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
    
    const { name, email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Check if user already exists in user_profiles table
    const existingUsers = await sql`
      SELECT id FROM user_profiles WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Generate unique user ID
    const uniqueUserId = await generateUniqueUserId(sql);
    
    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into user_profiles table with all required fields
    const result = await sql`
      INSERT INTO user_profiles (name, email, password, nextauth_user_id, created_at, updated_at) 
      VALUES (${name || ''}, ${email}, ${hash}, ${uniqueUserId}, NOW(), NOW())
      RETURNING id, email, name, nextauth_user_id
    `;

    return NextResponse.json({ 
      success: true, 
      user: result[0] 
    });
  } catch (err: unknown) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}