import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Authentication Middleware
 * Extracts and validates user from authorization header
 */
export async function authenticate(request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
        return null;
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

/**
 * Require authentication middleware
 * Throws error if user is not authenticated
 */
export async function requireAuth(request) {
    const user = await authenticate(request);

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}
