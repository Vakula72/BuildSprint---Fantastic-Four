import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { authConfig } from './auth.config';
import { db } from '@/lib/db/store';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from '@/lib/db/schema';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

function getDbClient() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const sqlite = new Database(path.join(dataDir, 'copilot.db'));
  return drizzle(sqlite, { schema: { users } });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const dbClient = getDbClient();
          const userRows = await dbClient
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          const user = userRows[0];
          if (!user || !user.passwordHash) return null;

          // Dynamic import to avoid edge runtime issues
          const bcrypt = await import('bcryptjs');
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
          };
        } catch (err) {
          console.error('[Auth] Error during credentials authorize:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Auto-create user record for OAuth providers
      if (account?.provider === 'google' && user.email) {
        try {
          const dbClient = getDbClient();
          const existing = await dbClient
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (existing.length === 0) {
            await dbClient.insert(users).values({
              id: user.id ?? randomUUID(),
              email: user.email,
              name: user.name ?? user.email,
              passwordHash: null,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('[Auth] Error creating OAuth user:', err);
        }
      }
      return true;
    },
  },
});
