import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/seller',
  '/admin',
  '/profile',
  '/settings',
  '/vehicles',
  '/bookings',
  '/earnings'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get locale from cookie or default to 'en'
  const locale = request.cookies.get('locale')?.value || 'en';
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // If it's a protected route, we'll let the client-side ProtectedRoute component handle the redirect
  // This is because we can't easily access the session from middleware with Better-auth
  
  // Return response with updated headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
};