
import { D1Database } from '@cloudflare/workers-types'

export class DashboardService {
    constructor(private db: D1Database) { }

    async getDashboardStats() {
        // 1. 상태별 티켓 수
        const q1 = this.db.prepare(`
            SELECT status, COUNT(*) as count
            FROM tickets
            GROUP BY status
        `)

        // 2. Severity별 티켓 수
        const q2 = this.db.prepare(`
            SELECT severity, COUNT(*) as count
            FROM tickets
            WHERE status != 'done'
            GROUP BY severity
        `)

        // 3. DBMS 타입별 티켓 수
        const q3 = this.db.prepare(`
            SELECT dbms_type, COUNT(*) as count
            FROM tickets
            WHERE status != 'done'
            GROUP BY dbms_type
        `)

        // 4. 엔지니어별 작업 부하
        const q4 = this.db.prepare(`
            SELECT 
              e.id,
              e.name,
              e.wip_limit,
              COUNT(t.id) as current_wip
            FROM engineers e
            LEFT JOIN tickets t ON e.id = t.assigned_to AND t.status IN ('todo', 'in_progress', 'review')
            WHERE e.is_active = 1
            GROUP BY e.id, e.name, e.wip_limit
            ORDER BY current_wip DESC
        `)

        // 5. SLA 위반 위험 티켓
        const q5 = this.db.prepare(`
            SELECT 
              t.id,
              t.title,
              t.status,
              t.severity,
              t.dbms_type,
              t.sla_minutes,
              t.started_at,
              t.created_at,
              e.name as assigned_to_name,
              CAST((julianday('now') - julianday(COALESCE(t.started_at, t.created_at))) * 24 * 60 AS INTEGER) as elapsed_minutes
            FROM tickets t
            LEFT JOIN engineers e ON t.assigned_to = e.id
            WHERE 
              t.status IN ('todo', 'in_progress') 
              AND t.sla_minutes IS NOT NULL
              AND t.severity IN ('critical', 'high')
              AND (
                (t.started_at IS NOT NULL AND 
                 (julianday('now') - julianday(t.started_at)) * 24 * 60 > t.sla_minutes * 0.8)
                OR
                (t.started_at IS NULL AND 
                 (julianday('now') - julianday(t.created_at)) * 24 * 60 > t.sla_minutes * 0.5)
              )
            ORDER BY t.severity DESC, elapsed_minutes DESC
        `)

        // 6. 주간 Velocity
        const q6 = this.db.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM tickets WHERE created_at >= date('now', 'weekday 0', '-7 days')) as created,
                (SELECT COUNT(*) FROM tickets WHERE status = 'done' AND resolved_at >= date('now', 'weekday 0', '-7 days')) as resolved
        `)

        // 7. 최근 30일 SLA 준수율
        const q7 = this.db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE 
                WHEN (julianday(resolved_at) - julianday(started_at)) * 24 * 60 <= sla_minutes THEN 1 
                ELSE 0 
                END) as met
            FROM tickets 
            WHERE status = 'done' 
            AND resolved_at >= date('now', '-30 days')
            AND sla_minutes IS NOT NULL
        `)

        // 8. 평균 해결 시간 (MTTR)
        const q8 = this.db.prepare(`
            SELECT 
                severity,
                AVG((julianday(COALESCE(resolved_at, updated_at)) - julianday(COALESCE(started_at, created_at))) * 24 * 60) as avg_minutes
            FROM tickets
            WHERE status = 'done'
            AND COALESCE(resolved_at, updated_at) >= date('now', '-30 days')
            GROUP BY severity
        `)

        // 9. 미할당 Critical/High 티켓
        const q9 = this.db.prepare(`
            SELECT COUNT(*) as count 
            FROM tickets 
            WHERE status IN ('todo', 'in_progress') 
            AND severity IN ('critical', 'high') 
            AND assigned_to IS NULL
        `)

        // 10. Stalled Tickets
        const q10 = this.db.prepare(`
            SELECT COUNT(*) as count 
            FROM tickets 
            WHERE status = 'in_progress' 
            AND updated_at <= date('now', '-3 days')
        `)

        // 11. 주간 추세
        const q11 = this.db.prepare(`
            WITH RECURSIVE dates(date) AS (
                VALUES(date('now', '-6 days'))
                UNION ALL
                SELECT date(date, '+1 day')
                FROM dates
                WHERE date < date('now')
            )
            SELECT 
                dates.date,
                (SELECT COUNT(*) FROM tickets WHERE date(created_at) = dates.date) as created,
                (SELECT COUNT(*) FROM tickets WHERE date(COALESCE(resolved_at, updated_at)) = dates.date AND status = 'done') as resolved
            FROM dates
        `)

        // Execute batch
        const results = await this.db.batch([q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11])

        return {
            status_counts: results[0].results,
            severity_counts: results[1].results,
            dbms_type_counts: results[2].results,
            engineer_workload: results[3].results,
            sla_at_risk: {
                count: results[4].results.length,
                tickets: results[4].results
            },
            weekly_velocity: results[5].results[0], // first() equivalent
            sla_compliance: results[6].results[0],  // first() equivalent
            mttr_stats: results[7].results,
            unassigned_criticals: results[8].results[0], // first() equivalent
            stalled_tickets: results[9].results[0],      // first() equivalent
            weekly_trend: results[10].results
        }
    }
}
