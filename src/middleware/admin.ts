import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { Bindings } from '../bindings'

/**
 * Admin-only middleware
 * Checks if the authenticated user has admin role
 */
export async function adminOnly(c: Context<{ Bindings: Bindings }>, next: Next) {
    const token = getCookie(c, 'auth_token')

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256')

        // Check if user has admin role
        if (payload.role !== 'admin') {
            return c.json({ error: 'Forbidden: Admin access required' }, 403)
        }

        // Store user info in context for later use
        c.set('user', payload)

        await next()
    } catch (e) {
        console.error('Admin middleware auth failed:', e)
        return c.json({ error: 'Invalid or expired token' }, 401)
    }
}
