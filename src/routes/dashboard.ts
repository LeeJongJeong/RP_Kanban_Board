import { Hono } from 'hono'
import { Bindings } from '../bindings'
import { DashboardService } from '../services/DashboardService'

const app = new Hono<{ Bindings: Bindings }>()

// 대시보드 통계 (부서장용)
app.get('/stats', async (c) => {
  const { DB } = c.env
  const service = new DashboardService(DB)
  const stats = await service.getDashboardStats()

  return c.json(stats)
})

export default app
