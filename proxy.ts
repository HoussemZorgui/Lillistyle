import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for admin cookie
        const adminSession = request.cookies.get('admin_session');

        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth/')) {
        const authToken = request.cookies.get('auth-token');
        if (authToken) {
            // Check if user is admin to redirect appropriately
            const adminSession = request.cookies.get('admin_session');
            if (adminSession?.value === 'true') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.redirect(new URL('/account', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/auth/:path*'],
};
