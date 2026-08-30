import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

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
          // Dynamically import the Node-only logic inside the authorize function
          const { verifyPassword } = await import('@/lib/auth-utils');
          const user = await verifyPassword(credentials?.email as string, credentials?.password as string);
          
          if (!user) {
             return null;
          }

          return user;
        } catch (err) {
          console.error('AUTH_CRASH: ', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});
