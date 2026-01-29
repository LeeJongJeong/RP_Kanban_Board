import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Bindings } from '../bindings'
import { TicketService } from '../services/TicketService'

const app = new Hono<{ Bindings: Bindings }>()

// Schemas
const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  dbms_type: z.enum(['MySQL', 'PostgreSQL', 'MariaDB', 'MongoDB', 'Redis', 'SingleStore', 'HeatWave', 'EDB']),
  work_category: z.enum(['장애대응', '성능튜닝', '아키텍처설계', '정기점검', '패치업그레이드', '패치/업그레이드', '기술 미팅', '마이그레이션', 'Documentation']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  instance_host: z.string().optional().nullable(),
  instance_env: z.enum(['prod', 'stg', 'dev']).optional().default('prod'),
  instance_version: z.string().optional().nullable(),
  sla_minutes: z.number().optional().nullable(),
  assigned_to: z.number().optional().nullable(),
  priority: z.number().optional().default(3),
  week_start_date: z.string().optional().nullable(),
  week_end_date: z.string().optional().nullable(),
  year_week: z.string().optional().nullable(),
})

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  changed_by: z.number()
})

const assignSchema = z.object({
  assigned_to: z.number().nullable(),
  changed_by: z.number()
})

const commentSchema = z.object({
  engineer_id: z.number(),
  content: z.string().min(1),
  comment_type: z.enum(['note', 'solution', 'workaround', 'reference']).default('note')
})

// 티켓 목록 조회 (필터링 지원 + 주차 필터링)
app.get('/', async (c) => {
  try {
    const { DB } = c.env
    if (!DB) {
      console.error('DB binding is missing')
      return c.json({ error: 'Database binding missing' }, 500)
    }

    const service = new TicketService(DB)
    const filters = {
      status: c.req.query('status'),
      assigned_to: c.req.query('assigned_to'),
      dbms_type: c.req.query('dbms_type'),
      week_start_date: c.req.query('week_start_date'),
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    }

    const tickets = await service.findAll(filters)
    return c.json({ tickets })
  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// 티켓 상세 조회
app.get('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const service = new TicketService(DB)

  const ticket = await service.findById(ticketId)

  if (!ticket) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  const comments = await service.getComments(ticketId)

  return c.json({
    ticket,
    comments
  })
})

// 티켓 생성
app.post('/', zValidator('json', createTicketSchema), async (c) => {
  const { DB } = c.env
  const body = c.req.valid('json')
  const service = new TicketService(DB)

  const {
    title, description, dbms_type, work_category, severity,
    instance_host, instance_env, instance_version,
    sla_minutes, assigned_to, priority, week_start_date, week_end_date, year_week
  } = body

  const ticket_id = await service.create({
    title,
    description: description ?? undefined,
    dbms_type,
    work_category,
    severity,
    instance_host: instance_host ?? undefined,
    instance_env: instance_env ?? undefined,
    instance_version: instance_version ?? undefined,
    sla_minutes: sla_minutes ?? undefined,
    assigned_to: assigned_to ?? undefined,
    priority: priority ?? undefined,
    week_start_date: week_start_date ?? undefined,
    week_end_date: week_end_date ?? undefined,
    year_week: year_week ?? undefined
  })

  return c.json({
    success: true,
    ticket_id
  }, 201)
})

// 티켓 상태 변경
app.patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { status, changed_by } = c.req.valid('json')
  const service = new TicketService(DB)

  const success = await service.updateStatus(ticketId, status, changed_by)

  if (!success) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  return c.json({ success: true })
})

// 티켓 담당자 변경
app.patch('/:id/assign', zValidator('json', assignSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { assigned_to, changed_by } = c.req.valid('json')
  const service = new TicketService(DB)

  const success = await service.assign(ticketId, assigned_to, changed_by)

  if (!success) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  return c.json({ success: true })
})

// 티켓 수정
app.put('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()
  const service = new TicketService(DB)

  await service.update(ticketId, body)

  return c.json({ success: true })
})

// 티켓 삭제
app.delete('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const service = new TicketService(DB)

  await service.delete(ticketId)

  return c.json({ success: true })
})

// 코멘트 추가
app.post('/:id/comments', zValidator('json', commentSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { engineer_id, content, comment_type } = c.req.valid('json')
  const service = new TicketService(DB)

  const comment_id = await service.addComment(ticketId, engineer_id, content, comment_type)

  return c.json({
    success: true,
    comment_id
  }, 201)
})

export default app
