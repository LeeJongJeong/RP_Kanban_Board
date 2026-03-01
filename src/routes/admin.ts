import { Hono } from 'hono'
import { Bindings } from '../bindings'
import { adminOnly } from '../middleware/admin'
import { successResponse, errorResponse } from '../types/api'
import bcrypt from 'bcryptjs'

const app = new Hono<{ Bindings: Bindings }>()

// Apply admin-only middleware to all routes
app.use('/*', adminOnly)

// Get all users with their engineer info
app.get('/users', async (c) => {
    try {
        const result = await c.env.DB.prepare(`
      SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.is_active, 
        u.created_at,
        u.engineer_id,
        u.display_name,
        u.job_title,
        e.name as engineer_name, 
        e.email as engineer_email
      FROM users u
      LEFT JOIN engineers e ON u.engineer_id = e.id
      ORDER BY u.created_at DESC
    `).all()

        return c.json(successResponse(result.results))
    } catch (e) {
        console.error('Failed to fetch users:', e)
        return c.json(errorResponse('Failed to fetch users'), 500)
    }
})

// Create new user
app.post('/users', async (c) => {
    try {
        const body = await c.req.json()
        const { username, password, role = 'user', display_name, job_title } = body

        if (!username || !password) {
            return c.json(errorResponse('Username and password required'), 400)
        }

        // Check if username already exists
        const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
            .bind(username)
            .first()

        if (existing) {
            return c.json(errorResponse('Username already exists'), 409)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Auto-create engineer record
        let engineerId = null;
        if (display_name && job_title) {
            const engineerName = `${display_name} ${job_title}`;
            const email = `${username}@company.com`; // Default email format

            try {
                const result = await c.env.DB.prepare(`
                    INSERT INTO engineers (name, email, role, is_active)
                    VALUES (?, ?, ?, 1)
                    RETURNING id
                `).bind(engineerName, email, 'engineer').first<{ id: number }>();

                if (result) {
                    engineerId = result.id;
                }
            } catch (engError) {
                console.error('Failed to auto-create engineer:', engError);
                // Continue creating user even if engineer creation fails (optional strategy)
            }
        }

        // Insert new user
        await c.env.DB.prepare(`
      INSERT INTO users (username, password, role, engineer_id, is_active, display_name, job_title)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).bind(username, hashedPassword, role, engineerId, display_name || null, job_title || null).run()

        return c.json(successResponse({ message: 'User created successfully' }), 201)
    } catch (e) {
        console.error('Failed to create user:', e)
        return c.json(errorResponse('Failed to create user'), 500)
    }
})

// Update user
app.put('/users/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json()
        const { role, is_active, display_name, job_title } = body

        // 마지막 관리자 역할 강등 또는 비활성화 방지
        const targetUser = await c.env.DB.prepare(
            'SELECT role, is_active FROM users WHERE id = ?'
        ).bind(id).first<{ role: string; is_active: number }>()

        if (targetUser?.role === 'admin') {
            const isDowngrading = role !== 'admin'
            const isDeactivating = is_active === 0
            if (isDowngrading || isDeactivating) {
                const adminCount = await c.env.DB.prepare(
                    "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin' AND is_active = 1"
                ).first<{ cnt: number }>()
                if ((adminCount?.cnt ?? 0) <= 1) {
                    return c.json(errorResponse('마지막 관리자의 권한을 변경하거나 비활성화할 수 없습니다'), 400)
                }
            }
        }

        await c.env.DB.prepare(`
      UPDATE users
      SET role = ?, is_active = ?, display_name = ?, job_title = ?
      WHERE id = ?
    `).bind(role, is_active, display_name || null, job_title || null, id).run()

        return c.json(successResponse({ message: 'User updated successfully' }))
    } catch (e) {
        console.error('Failed to update user:', e)
        return c.json(errorResponse('Failed to update user'), 500)
    }
})

// Reset user password
app.put('/users/:id/reset-password', async (c) => {
    try {
        const id = c.req.param('id')
        const body = await c.req.json()
        const { new_password } = body

        if (!new_password || new_password.length < 8) {
            return c.json(errorResponse('Password must be at least 8 characters'), 400)
        }

        const hashedPassword = await bcrypt.hash(new_password, 10)

        await c.env.DB.prepare(`
      UPDATE users SET password = ? WHERE id = ?
    `).bind(hashedPassword, id).run()

        return c.json(successResponse({ message: 'Password reset successfully' }))
    } catch (e) {
        console.error('Failed to reset password:', e)
        return c.json(errorResponse('Failed to reset password'), 500)
    }
})

// Delete user
app.delete('/users/:id', async (c) => {
    try {
        const id = c.req.param('id')

        // Prevent deleting yourself
        const token = c.get('user')
        if (!token?.sub) {
            return c.json(errorResponse('Unauthorized'), 401)
        }
        const currentUser = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
            .bind(token.sub)
            .first<{ id: number }>()

        if (currentUser && currentUser.id.toString() === id) {
            return c.json(errorResponse('Cannot delete your own account'), 400)
        }

        // 마지막 관리자 삭제 방지
        const targetUser = await c.env.DB.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(id).first<{ role: string }>()

        if (targetUser?.role === 'admin') {
            const adminCount = await c.env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin' AND is_active = 1"
            ).first<{ cnt: number }>()
            if ((adminCount?.cnt ?? 0) <= 1) {
                return c.json(errorResponse('마지막 관리자는 삭제할 수 없습니다'), 400)
            }
        }

        await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

        return c.json(successResponse({ message: 'User deleted successfully' }))
    } catch (e) {
        console.error('Failed to delete user:', e)
        return c.json(errorResponse('Failed to delete user'), 500)
    }
})

// Get all engineers for assignment
app.get('/engineers', async (c) => {
    try {
        const result = await c.env.DB.prepare(`
      SELECT id, name, email, role
      FROM engineers
      WHERE is_active = 1
      ORDER BY name
    `).all()

        return c.json(successResponse(result.results))
    } catch (e) {
        console.error('Failed to fetch engineers:', e)
        return c.json(errorResponse('Failed to fetch engineers'), 500)
    }
})

export default app
