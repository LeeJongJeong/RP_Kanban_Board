import { Hono } from 'hono'
import { Bindings } from '../bindings'
import { EngineerService } from '../services/EngineerService'

const app = new Hono<{ Bindings: Bindings }>()

// 엔지니어 목록 조회
app.get('/', async (c) => {
  const { DB } = c.env
  const service = new EngineerService(DB)
  const engineers = await service.findAllActive()

  return c.json({ engineers })
})

// 엔지니어별 현재 WIP 카운트 조회
app.get('/:id/wip', async (c) => {
  const { DB } = c.env
  const engineerId = c.req.param('id')
  const service = new EngineerService(DB)

  const result = await service.getWipCount(engineerId)

  return c.json(result)
})

export default app
