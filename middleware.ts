import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role?: string;
  exp?: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (typeof decoded.exp === 'number' && decoded.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const tokenRole = decoded.role;
    let userRole: unknown;
    if (userCookie) {
      try {
        userRole = JSON.parse(decodeURIComponent(userCookie))?.role;
      } catch {
        userRole = undefined;
      }
    }

    const role = (typeof tokenRole === 'string' ? tokenRole : (typeof userRole === 'string' ? userRole : '')).toLowerCase();
    if (role && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    if (userCookie) {
      try {
        const role = JSON.parse(decodeURIComponent(userCookie))?.role?.toLowerCase?.();
        if (role === 'admin') {
          return NextResponse.next();
        }
      } catch {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
