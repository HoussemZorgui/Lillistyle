import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
    userId: number;
    email: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Create JWT token
export async function createToken(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as JWTPayload;
    } catch (error) {
        return null;
    }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    return verifyToken(token);
}

// Set auth cookie
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

// Clear auth cookie
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    cookieStore.delete('admin_session');
}
