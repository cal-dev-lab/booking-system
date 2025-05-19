import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for your custom token cookie name
  const token = request.cookies.get('jwtToken')?.value;

  // If token exists and user tries to visit /login, redirect to /admin
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login'],
};

