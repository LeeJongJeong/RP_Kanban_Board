
import { D1Database } from '@cloudflare/workers-types'
import { Ticket, TicketWithEngineer, CommentWithEngineer } from '../types/models'

export interface CreateTicketParams {
  title: string;
  description?: string;
  dbms_type: string;
  work_category: string;
  severity: string;
  instance_host?: string;
  instance_env?: string;
  instance_version?: string;
  sla_minutes?: number;
  assigned_to?: number;
  priority?: number;
  week_start_date?: string;
  week_end_date?: string;
  year_week?: string;
}

export interface UpdateTicketParams {
  title?: string;
  description?: string;
  severity?: string;
  priority?: number;
  instance_host?: string;
  instance_env?: string;
  instance_version?: string;
  sla_minutes?: number;
  dbms_type?: string;
  work_category?: string;
}

export interface TicketFilters {
  status?: string;
  assigned_to?: string;
  dbms_type?: string;
  week_start_date?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export class TicketService {
  constructor(private db: D1Database) { }

  async findAll(filters: TicketFilters): Promise<TicketWithEngineer[]> {
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

    if (filters.status) {
      query += ` AND t.status = ?`
      params.push(filters.status)
    }

    if (filters.assigned_to) {
      query += ` AND t.assigned_to = ?`
      params.push(filters.assigned_to)
    }

    if (filters.dbms_type) {
      query += ` AND t.dbms_type = ?`
      params.push(filters.dbms_type)
    }

    if (filters.start_date && filters.end_date) {
      // date() 함수 사용 제거하여 일반 인덱스(idx_tickets_created_at 등) 활용 가능하게 변경
      // 입력된 날짜 문자열에 시간을 붙여서 비교 (Start: 00:00:00, End: 23:59:59)
      query += ` AND t.created_at >= ? AND t.created_at <= ?`
      params.push(`${filters.start_date} 00:00:00`, `${filters.end_date} 23:59:59`)
    } else if (filters.week_start_date) {
      query += ` AND t.week_start_date = ?`
      params.push(filters.week_start_date)
    }

    query += ` ORDER BY t.priority ASC, t.created_at DESC`

    const limit = Math.min(filters.limit ?? 200, 500)
    const offset = filters.offset ?? 0
    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const result = await this.db.prepare(query).bind(...params).all<TicketWithEngineer>()
    return result.results || []
  }

  async findById(id: number | string): Promise<TicketWithEngineer | null> {
    return await this.db.prepare(`
        SELECT 
          t.*,
          e.name as assigned_to_name,
          e.email as assigned_to_email
        FROM tickets t
        LEFT JOIN engineers e ON t.assigned_to = e.id
        WHERE t.id = ?
      `).bind(id).first<TicketWithEngineer>()
  }

  async getComments(ticketId: number | string): Promise<CommentWithEngineer[]> {
    const result = await this.db.prepare(`
        SELECT 
          c.*,
          e.name as engineer_name
        FROM comments c
        JOIN engineers e ON c.engineer_id = e.id
        WHERE c.ticket_id = ?
        ORDER BY c.created_at DESC
      `).bind(ticketId).all<CommentWithEngineer>()
    return result.results || []
  }

  async create(data: CreateTicketParams): Promise<number> {
    const result = await this.db.prepare(`
        INSERT INTO tickets (
          title, description, status, dbms_type, work_category, severity,
          instance_host, instance_env, instance_version, sla_minutes,
          assigned_to, priority, week_start_date, week_end_date, year_week
        ) VALUES (?, ?, 'todo', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
      data.title, data.description || '', data.dbms_type, data.work_category, data.severity,
      data.instance_host || null, data.instance_env || 'prod', data.instance_version || null,
      data.sla_minutes || null, data.assigned_to || null, data.priority || 3,
      data.week_start_date || null, data.week_end_date || null, data.year_week || null
    ).run()

    return result.meta.last_row_id as number;
  }

  async updateStatus(id: number | string, status: string, changedBy: number): Promise<boolean> {
    const currentTicket = await this.findById(id);
    if (!currentTicket) return false;

    const updates: string[] = ['status = ?']
    const params: any[] = [status]

    if (status === 'in_progress' && !currentTicket.started_at) {
      updates.push('started_at = CURRENT_TIMESTAMP')
    }

    if (status === 'done') {
      updates.push('resolved_at = CURRENT_TIMESTAMP')
    } else {
      updates.push('resolved_at = NULL')
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    await this.db.prepare(`
        UPDATE tickets 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...params).run()

    if (changedBy > 0) {
      try { await this.logHistory(Number(id), changedBy, 'status', currentTicket.status, status) } catch { /* non-fatal */ }
    }
    return true;
  }

  async assign(id: number | string, assignedTo: number | null, changedBy: number): Promise<boolean> {
    const currentTicket = await this.findById(id);
    if (!currentTicket) return false;

    await this.db.prepare(`
        UPDATE tickets
        SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(assignedTo, id).run()

    if (changedBy > 0) {
      const oldVal = currentTicket.assigned_to?.toString() || 'null';
      const newVal = assignedTo?.toString() || 'null';
      try { await this.logHistory(Number(id), changedBy, 'assigned_to', oldVal, newVal) } catch { /* non-fatal */ }
    }
    return true;
  }

  async update(id: number | string, data: UpdateTicketParams): Promise<boolean> {
    const exists = await this.db.prepare('SELECT id FROM tickets WHERE id = ?').bind(id).first()
    if (!exists) return false;

    // 제공된 필드만 업데이트 (undefined 필드는 건너뜀)
    const fieldMap: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      severity: data.severity,
      priority: data.priority,
      instance_host: data.instance_host,
      instance_env: data.instance_env,
      instance_version: data.instance_version,
      sla_minutes: data.sla_minutes,
      dbms_type: data.dbms_type,
      work_category: data.work_category,
    }

    const setClauses: string[] = []
    const params: unknown[] = []
    for (const [col, val] of Object.entries(fieldMap)) {
      if (val !== undefined) {
        setClauses.push(`${col} = ?`)
        params.push(val)
      }
    }

    if (setClauses.length === 0) return true; // 변경할 필드 없음

    setClauses.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    await this.db.prepare(
      `UPDATE tickets SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...params).run()

    return true;
  }

  async delete(id: number | string): Promise<void> {
    await this.db.prepare(`DELETE FROM tickets WHERE id = ?`).bind(id).run()
  }

  async addComment(ticketId: number | string, engineerId: number, content: string, type: string): Promise<number> {
    const result = await this.db.prepare(`
        INSERT INTO comments (ticket_id, engineer_id, content, comment_type)
        VALUES (?, ?, ?, ?)
      `).bind(ticketId, engineerId, content, type).run()

    return result.meta.last_row_id as number;
  }

  private async logHistory(ticketId: number, changedBy: number, fieldName: string, oldValue: string, newValue: string) {
    await this.db.prepare(`
        INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
        VALUES (?, ?, ?, ?, ?)
      `).bind(ticketId, changedBy, fieldName, oldValue, newValue).run()
  }
}
