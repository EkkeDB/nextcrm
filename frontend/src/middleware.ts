// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/dashboard': [],
  '/contracts': [],
  '/contacts': [],
  '/settings': [],
  '/admin': ['admin'],
  '/admin/*': ['admin'],
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/access-denied',
];

// API routes that should be proxied
const API_ROUTES = ['/api'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return Object.keys(PROTECTED_ROUTES).some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function getRequiredRoles(pathname: string): string[] {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (route.endsWith('*')) {
      if (pathname.startsWith(route.slice(0, -1))) {
        return [...roles]; // Convert readonly array to mutable array
      }
    } else if (pathname === route || pathname.startsWith(`${route}/`)) {
      return [...roles]; // Convert readonly array to mutable array
    }
  }
  return [];
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Handle API routes - let them pass through
  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  const isAuthenticated = !!accessToken;


  // Public routes - allow access
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from login page
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      // Store the attempted URL to redirect back after login
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/') {
        loginUrl.searchParams.set('returnUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // TODO: Role-based access control would require decoding JWT
    // For now, we'll let the client-side components handle role checks
    // In production, you might want to decode the JWT here to check roles
    
    return NextResponse.next();
  }

  // Default: redirect to dashboard for authenticated users, login for others
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Fallback: allow the request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};