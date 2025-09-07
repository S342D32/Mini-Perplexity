import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";

async function getUser(email: string): Promise<User | undefined> {
  // Dynamic import to avoid client-side bundling
  const { default: postgres } = await import('postgres');
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
  
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Dynamic import to avoid client-side bundling
  const { default: bcrypt } = await import('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await verifyPassword(password, user.password);
          if (passwordsMatch) return user;
        }
        console.log("Invalid credentials");

        return null;
      },
    }),
  ],
});
