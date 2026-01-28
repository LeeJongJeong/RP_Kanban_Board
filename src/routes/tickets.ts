import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Bindings } from '../bindings'

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

    const status = c.req.query('status')
    const assignedTo = c.req.query('assigned_to')
    const dbmsType = c.req.query('dbms_type')
    const weekStartDate = c.req.query('week_start_date') // Legacy: specific week start
    const startDate = c.req.query('start_date')          // Range start
    const endDate = c.req.query('end_date')              // Range end

    let query = `
        SELECT 
          t.*,
          e.name as assigned_to_name,
          e.email as assigned_to_email
        FROM tickets t
        LEFT JOIN engineers e ON t.assigned_to = e.id
        WHERE 1=1
      `
    const params: any[] = []

    if (status) {
      query += ` AND t.status = ?`
      params.push(status)
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = ?`
      params.push(assignedTo)
    }

    if (dbmsType) {
      query += ` AND t.dbms_type = ?`
      params.push(dbmsType)
    }

    // 날짜 범위 필터링 (start_date ~ end_date)
    if (startDate && endDate) {
      query += ` AND date(t.created_at) >= ? AND date(t.created_at) <= ?`
      params.push(startDate, endDate)
    }
    // 기존 주차 필터링 (하위 호환성 유지)
    else if (weekStartDate) {
      query += ` AND t.week_start_date = ?`
      params.push(weekStartDate)
    }

    query += ` ORDER BY t.priority ASC, t.created_at DESC`

    const result = await DB.prepare(query).bind(...params).all()

    return c.json({ tickets: result.results })
  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// 티켓 상세 조회
app.get('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')

  const ticket = await DB.prepare(`
    SELECT 
      t.*,
      e.name as assigned_to_name,
      e.email as assigned_to_email
    FROM tickets t
    LEFT JOIN engineers e ON t.assigned_to = e.id
    WHERE t.id = ?
  `).bind(ticketId).first()

  if (!ticket) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  // 코멘트 조회
  const comments = await DB.prepare(`
    SELECT 
      c.*,
      e.name as engineer_name
    FROM comments c
    JOIN engineers e ON c.engineer_id = e.id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at DESC
  `).bind(ticketId).all()

  return c.json({
    ticket,
    comments: comments.results
  })
})

// 티켓 생성
app.post('/', zValidator('json', createTicketSchema), async (c) => {
  const { DB } = c.env
  const body = c.req.valid('json')

  const {
    title, description, dbms_type, work_category, severity,
    instance_host, instance_env, instance_version,
    sla_minutes, assigned_to, priority, week_start_date, week_end_date, year_week
  } = body

  const result = await DB.prepare(`
    INSERT INTO tickets (
      title, description, status, dbms_type, work_category, severity,
      instance_host, instance_env, instance_version, sla_minutes,
      assigned_to, priority, week_start_date, week_end_date, year_week
    ) VALUES (?, ?, 'todo', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    title, description || '', dbms_type, work_category, severity,
    instance_host || null, instance_env || 'prod', instance_version || null,
    sla_minutes || null, assigned_to || null, priority || 3,
    week_start_date || null, week_end_date || null, year_week || null
  ).run()

  return c.json({
    success: true,
    ticket_id: result.meta.last_row_id
  }, 201)
})

// 티켓 상태 변경
app.patch('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { status, changed_by } = c.req.valid('json')

  // 현재 티켓 상태 조회
  const currentTicket = await DB.prepare(`
    SELECT status FROM tickets WHERE id = ?
  `).bind(ticketId).first() as any

  if (!currentTicket) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  // 상태 업데이트
  const updates: string[] = ['status = ?']
  const params: any[] = [status]

  // in_progress로 변경시 started_at 설정
  if (status.toLowerCase() === 'in progress' && !currentTicket.started_at) {
    updates.push('started_at = CURRENT_TIMESTAMP')
  }

  // done으로 변경시 resolved_at 설정, 그 외에는 초기화
  if (status.toLowerCase() === 'done') {
    updates.push('resolved_at = CURRENT_TIMESTAMP')
  } else {
    updates.push('resolved_at = NULL')
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  params.push(ticketId)

  await DB.prepare(`
    UPDATE tickets 
    SET ${updates.join(', ')}
    WHERE id = ?
  `).bind(...params).run()

  // 히스토리 기록
  await DB.prepare(`
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
    VALUES (?, ?, 'status', ?, ?)
  `).bind(ticketId, changed_by, currentTicket.status, status).run()

  return c.json({ success: true })
})

// 티켓 담당자 변경
app.patch('/:id/assign', zValidator('json', assignSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { assigned_to, changed_by } = c.req.valid('json')

  // 현재 담당자 조회
  const currentTicket = await DB.prepare(`
    SELECT assigned_to FROM tickets WHERE id = ?
  `).bind(ticketId).first() as any

  if (!currentTicket) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  // 담당자 업데이트
  await DB.prepare(`
    UPDATE tickets 
    SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(assigned_to || null, ticketId).run()

  // 히스토리 기록
  await DB.prepare(`
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
    VALUES (?, ?, 'assigned_to', ?, ?)
  `).bind(
    ticketId,
    changed_by,
    currentTicket.assigned_to?.toString() || 'null',
    assigned_to?.toString() || 'null'
  ).run()

  return c.json({ success: true })
})

// 티켓 수정
app.put('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()

  const {
    title, description, severity, priority,
    instance_host, instance_env, instance_version,
    sla_minutes, dbms_type, work_category
  } = body

  await DB.prepare(`
    UPDATE tickets 
    SET 
      title = ?,
      description = ?,
      severity = ?,
      priority = ?,
      instance_host = ?,
      instance_env = ?,
      instance_version = ?,
      sla_minutes = ?,
      dbms_type = ?,
      work_category = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    title, description, severity, priority,
    instance_host, instance_env, instance_version,
    sla_minutes, dbms_type, work_category, ticketId
  ).run()

  return c.json({ success: true })
})

// 티켓 삭제
app.delete('/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')

  await DB.prepare(`DELETE FROM tickets WHERE id = ?`).bind(ticketId).run()

  return c.json({ success: true })
})

// 코멘트 추가
app.post('/:id/comments', zValidator('json', commentSchema), async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const { engineer_id, content, comment_type } = c.req.valid('json')

  const result = await DB.prepare(`
    INSERT INTO comments (ticket_id, engineer_id, content, comment_type)
    VALUES (?, ?, ?, ?)
  `).bind(ticketId, engineer_id, content, comment_type).run()

  return c.json({
    success: true,
    comment_id: result.meta.last_row_id
  }, 201)
})

export default app
