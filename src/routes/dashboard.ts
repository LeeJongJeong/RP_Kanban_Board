import { Hono } from 'hono'
import { Bindings } from '../bindings'

const app = new Hono<{ Bindings: Bindings }>()

// 대시보드 통계 (부서장용)
app.get('/stats', async (c) => {
  const { DB } = c.env

  // 1. 상태별 티켓 수 (기존 유지)
  const statusCounts = await DB.prepare(`
    SELECT status, COUNT(*) as count
    FROM tickets
    GROUP BY status
  `).all()

  // 2. Severity별 티켓 수 (기존 유지)
  const severityCounts = await DB.prepare(`
    SELECT severity, COUNT(*) as count
    FROM tickets
    WHERE status != 'done'
    GROUP BY severity
  `).all()

  // 3. DBMS 타입별 티켓 수 (기존 유지)
  const dbmsTypeCounts = await DB.prepare(`
    SELECT dbms_type, COUNT(*) as count
    FROM tickets
    WHERE status != 'done'
    GROUP BY dbms_type
  `).all()

  // 4. 엔지니어별 작업 부하 (기존 유지)
  const engineerWorkload = await DB.prepare(`
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
  `).all()

  // 5. SLA 위반 위험 티켓 (기존 유지)
  const slaAtRiskTickets = await DB.prepare(`
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
  `).all()

  // --- V2 추가 지표 ---

  // 6. 주간 Velocity (이번 주 생성 vs 해결)
  const weeklyVelocity = await DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM tickets WHERE created_at >= date('now', 'weekday 0', '-7 days')) as created,
        (SELECT COUNT(*) FROM tickets WHERE status = 'done' AND resolved_at >= date('now', 'weekday 0', '-7 days')) as resolved
    `).first()

  // 7. 최근 30일 SLA 준수율
  const slaCompliance = await DB.prepare(`
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
    `).first()

  // 8. 평균 해결 시간 (MTTR) - 최근 30일, Severity별
  // 8. 평균 해결 시간 (MTTR) - 최근 30일, Severity별 (Fallback 적용)
  const mttrStats = await DB.prepare(`
      SELECT 
        severity,
        AVG((julianday(COALESCE(resolved_at, updated_at)) - julianday(COALESCE(started_at, created_at))) * 24 * 60) as avg_minutes
      FROM tickets
      WHERE status = 'done'
      AND COALESCE(resolved_at, updated_at) >= date('now', '-30 days')
      GROUP BY severity
    `).all()

  // 9. 미할당 Critical/High 티켓 (긴급)
  const unassignedCriticals = await DB.prepare(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE status IN ('todo', 'in_progress') 
      AND severity IN ('critical', 'high') 
      AND assigned_to IS NULL
    `).first()

  // 10. Stalled Tickets (3일 이상 업데이트 없는 진행 중 티켓)
  const stalledTickets = await DB.prepare(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE status = 'in_progress' 
      AND updated_at <= date('now', '-3 days')
    `).first()

  // 11. 주간 추세 (최근 7일 일별 생성/해결)
  const weeklyTrend = await DB.prepare(`
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
    `).all()


  const slaAtRisk = {
    count: slaAtRiskTickets.results.length,
    tickets: slaAtRiskTickets.results
  }

  return c.json({
    status_counts: statusCounts.results,
    severity_counts: severityCounts.results,
    dbms_type_counts: dbmsTypeCounts.results,
    engineer_workload: engineerWorkload.results,
    sla_at_risk: slaAtRisk,
    // V2 Metrics
    weekly_velocity: weeklyVelocity,
    sla_compliance: slaCompliance,
    mttr_stats: mttrStats.results,
    unassigned_criticals: unassignedCriticals,
    stalled_tickets: stalledTickets,
    weekly_trend: weeklyTrend.results
  })
})

export default app
