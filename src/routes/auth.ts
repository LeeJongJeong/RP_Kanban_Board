import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { Bindings } from '../bindings'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse } from '../types/api'

const app = new Hono<{ Bindings: Bindings }>()

app.put('/password', async (c) => {
    try {
        const token = getCookie(c, 'auth_token')
        if (!token) {
            return c.json(errorResponse('Unauthorized'), 401)
        }

        let username: string;
        try {
            const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
            username = payload.sub as string
        } catch (e) {
            console.error('JWT verification failed:', e)
            return c.json(errorResponse('Invalid token'), 401)
        }

        const body = await c.req.json()
        const { oldPassword, newPassword } = body

        if (!oldPassword || !newPassword) {
            return c.json(errorResponse('Old and new passwords required'), 400)
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return c.json(errorResponse('새 비밀번호는 최소 8자 이상이어야 합니다.'), 400)
        }

        let user: any;
        try {
            user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?')
                .bind(username)
                .first()
        } catch (e) {
            console.error('Database query failed:', e)
            return c.json(errorResponse('Internal server error'), 500)
        }

        if (!user) {
            return c.json(errorResponse('User not found'), 404)
        }

        const validPassword = await bcrypt.compare(oldPassword, user.password)

        if (!validPassword) {
            return c.json(errorResponse('현재 비밀번호가 일치하지 않습니다.'), 401)
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10)

        try {
            await c.env.DB.prepare('UPDATE users SET password = ? WHERE username = ?')
                .bind(newHashedPassword, username)
                .run()
        } catch (e) {
            console.error('Password update failed:', e)
            return c.json(errorResponse('Failed to update password'), 500)
        }

        return c.json(successResponse({ message: '비밀번호가 성공적으로 변경되었습니다.' }))
    } catch (e) {
        console.error('Unexpected error in password change:', e)
        return c.json(errorResponse('Internal server error'), 500)
    }
})

app.post('/register', async (c) => {
    try {
        const body = await c.req.json()
        const { username, password, engineer_name } = body

        if (!username || !password) {
            return c.json(errorResponse('Username and password required'), 400)
        }

        // Validate password strength
        if (password.length < 8) {
            return c.json(errorResponse('비밀번호는 최소 8자 이상이어야 합니다.'), 400)
        }

        // Check if user exists
        let existingUser;
        try {
            existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?')
                .bind(username)
                .first()
        } catch (e) {
            console.error('Database query failed during user check:', e)
            return c.json(errorResponse('Internal server error'), 500)
        }

        if (existingUser) {
            return c.json(errorResponse('Username already exists'), 409)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const displayName = engineer_name || username

        try {
            await c.env.DB.batch([
                c.env.DB.prepare('INSERT INTO users (username, password) VALUES (?, ?)').bind(username, hashedPassword),
                c.env.DB.prepare('INSERT INTO engineers (name, email, role, is_active) VALUES (?, ?, ?, 1)').bind(displayName, `${username}@internal.local`, 'engineer')
            ])
        } catch (e) {
            console.error('Failed to create user and engineer:', e)
            return c.json(errorResponse('Failed to register user'), 500)
        }

        return c.json(successResponse({ message: 'User registered successfully and added as engineer' }), 201)
    } catch (e) {
        console.error('Unexpected error in registration:', e)
        return c.json(errorResponse('Internal server error'), 500)
    }
})

app.post('/login', async (c) => {
    try {
        const body = await c.req.json()
        const { username, password } = body

        if (!username || !password) {
            return c.json(errorResponse('Username and password required'), 400)
        }

        let user: any;
        try {
            user = await c.env.DB.prepare(`
                SELECT u.*, e.name as engineer_name 
                FROM users u 
                LEFT JOIN engineers e ON u.engineer_id = e.id 
                WHERE u.username = ?
            `)
                .bind(username)
                .first()
        } catch (e) {
            console.error('Database query failed during login:', e)
            return c.json(errorResponse('Internal server error'), 500)
        }

        if (!user) {
            return c.json(errorResponse('Invalid credentials'), 401)
        }

        // Check if account is active
        if (user.is_active === 0) {
            return c.json(errorResponse('Account is disabled'), 403)
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return c.json(errorResponse('Invalid credentials'), 401)
        }

        // Generate JWT with role
        let token: string;
        try {
            const displayName = user.display_name || user.engineer_name || user.username;
            token = await sign({
                sub: user.username,
                role: user.role || 'user',
                name: displayName,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
            }, c.env.JWT_SECRET)
        } catch (e) {
            console.error('JWT signing failed:', e)
            return c.json(errorResponse('Failed to generate authentication token'), 500)
        }

        setCookie(c, 'auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            path: '/'
        })

        return c.json(successResponse({ message: 'Login successful' }))
    } catch (e) {
        console.error('Unexpected error in login:', e)
        return c.json(errorResponse('Internal server error'), 500)
    }
})

app.get('/logout', (c) => {
    deleteCookie(c, 'auth_token')
    return c.redirect('/login')
})

export default app
