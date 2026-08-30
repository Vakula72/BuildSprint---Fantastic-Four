import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { verifyPassword } from '@/lib/auth-utils';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with email:', credentials?.email);
        try {
          const user = await verifyPassword(
            credentials?.email as string,
            credentials?.password as string
          );
          console.log('[Auth] verifyPassword result:', user ? 'USER OK' : 'NULL - login failed');
          return user ?? null;
        } catch (err) {
          console.error('[Auth] CRASH inside authorize:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});
