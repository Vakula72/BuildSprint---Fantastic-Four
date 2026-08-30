import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from './auth.config';
import NextAuth from 'next-auth';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request: NextRequest) {
  const session = (request as any).auth;
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  
  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect all non-public routes. Only explicit auth APIs are public.
  const isPublicRoute = request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/api/');

  if (!session && !isPublicRoute) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
