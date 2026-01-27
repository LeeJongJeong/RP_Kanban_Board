import { Hono } from 'hono'
import { Bindings } from '../bindings'

const app = new Hono<{ Bindings: Bindings }>()

// 엔지니어 목록 조회
app.get('/', async (c) => {
    const { DB } = c.env
    const result = await DB.prepare(`
    SELECT id, name, email, role, wip_limit, is_active 
    FROM engineers 
    WHERE is_active = 1
    ORDER BY name
  `).all()

    return c.json({ engineers: result.results })
})

// 엔지니어별 현재 WIP 카운트 조회
app.get('/:id/wip', async (c) => {
    const { DB } = c.env
    const engineerId = c.req.param('id')

    const result = await DB.prepare(`
    SELECT COUNT(*) as current_wip
    FROM tickets 
    WHERE assigned_to = ? AND status IN ('todo', 'in_progress', 'review')
  `).bind(engineerId).first()

    return c.json(result)
})

export default app
