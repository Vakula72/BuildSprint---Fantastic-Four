import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [], // Providers are strictly defined in auth.ts to avoid double definition issues in Next.js 15
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/signup');
      const isPublic =
        nextUrl.pathname === '/' ||
        nextUrl.pathname.startsWith('/api/auth');

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/jobs', nextUrl));
        return true;
      }
      if (isPublic) return true;
      if (!isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
};
