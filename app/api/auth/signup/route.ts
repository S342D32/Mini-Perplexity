// app/api/auth/signup/route.ts
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Remove this line - don't generate UUID
    // const userId = crypto.randomUUID();
    
    const hash = await bcrypt.hash(password, 10);

    // Let the database auto-generate the integer ID
    await sql`
      INSERT INTO users (email, password) VALUES (${email}, ${hash})
    `;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
