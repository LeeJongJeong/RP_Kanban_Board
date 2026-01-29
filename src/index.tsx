import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, verify } from 'hono/jwt'
import { getCookie, deleteCookie } from 'hono/cookie'
import { serveStatic } from 'hono/cloudflare-workers'
import { Bindings } from './bindings'
import { getLoginPage, getRegisterPage } from './views/authPages'
import { getAdminPage } from './views/adminPage'
import { getKanbanBoardPage } from './views/kanbanBoard'

// Import Routes
import auth from './routes/auth'
import tickets from './routes/tickets'
import engineers from './routes/engineers'
import dashboard from './routes/dashboard'
import admin from './routes/admin'

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// JWT Authentication for API
app.use('/api/*', (c, next) => {
    if (c.req.path.startsWith('/api/auth')) {
        return next()
    }
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
        cookie: 'auth_token',
        alg: 'HS256'
    })
    return jwtMiddleware(c, next)
})

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// Mount Routes
app.route('/api/auth', auth)
app.route('/api/tickets', tickets)
app.route('/api/engineers', engineers)
app.route('/api/dashboard', dashboard)
app.route('/api/admin', admin)

// ==================== Frontend ====================



app.get('/login', (c) => c.html(getLoginPage()))
app.get('/register', (c) => c.html(getRegisterPage()))

// Admin page route (requires admin role)
app.get('/admin', async (c) => {
    const token = getCookie(c, 'auth_token')
    if (!token) {
        return c.redirect('/login')
    }

    try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
        if (payload.role !== 'admin') {
            return c.html('<h1>403 Forbidden</h1><p>관리자 권한이 필요합니다.</p>', 403)
        }

        return c.html(getAdminPage(payload))
    } catch (e) {
        return c.redirect('/login')
    }
})

app.get('/', async (c) => {
    const token = getCookie(c, 'auth_token')
    if (!token) {
        return c.redirect('/login')
    }

    let currentUserEngineerId = null;
    let currentUserEngineerName = null;
    let currentUserRole = 'user';
    let currentUsername = '';
    try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
        if (payload && payload.sub) {
            currentUserRole = payload.role || 'user';
            currentUsername = payload.sub;

            // Fetch user details including display_name and linked engineer info
            const user: any = await c.env.DB.prepare(`
                SELECT u.engineer_id, u.display_name, e.name as engineer_name
                FROM users u
                LEFT JOIN engineers e ON u.engineer_id = e.id
                WHERE u.username = ?
            `)
                .bind(payload.sub)
                .first();

            if (user) {
                currentUserEngineerId = user.engineer_id;
                currentUserEngineerName = user.display_name || user.engineer_name || payload.sub;
            } else {
                // Fallback: use username if user record not found (should be rare)
                currentUserEngineerName = payload.sub;
            }
        }
    } catch (e) {
        console.error("Auth check failed in root handler", e);
        deleteCookie(c, 'auth_token');
        return c.redirect('/login');
    }

    return c.html(getKanbanBoardPage(
        currentUserEngineerId,
        currentUserEngineerName,
        currentUserRole,
        currentUsername
    ))
})


export default app
