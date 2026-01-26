import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== API Routes ====================

// 엔지니어 목록 조회
app.get('/api/engineers', async (c) => {
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
app.get('/api/engineers/:id/wip', async (c) => {
  const { DB } = c.env
  const engineerId = c.req.param('id')
  
  const result = await DB.prepare(`
    SELECT COUNT(*) as current_wip
    FROM tickets 
    WHERE assigned_to = ? AND status IN ('todo', 'in_progress', 'review')
  `).bind(engineerId).first()
  
  return c.json(result)
})

// 티켓 목록 조회 (필터링 지원 + 주차 필터링)
app.get('/api/tickets', async (c) => {
  const { DB } = c.env
  const status = c.req.query('status')
  const assignedTo = c.req.query('assigned_to')
  const dbmsType = c.req.query('dbms_type')
  const weekStartDate = c.req.query('week_start_date') // 주 시작일
  const weekEndDate = c.req.query('week_end_date')     // 주 종료일
  
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
  
  // 주차 필터링 (week_start_date가 지정된 경우)
  if (weekStartDate && weekEndDate) {
    query += ` AND t.week_start_date = ? AND t.week_end_date = ?`
    params.push(weekStartDate, weekEndDate)
  } else if (weekStartDate) {
    // week_start_date만 있는 경우
    query += ` AND t.week_start_date = ?`
    params.push(weekStartDate)
  }
  
  query += ` ORDER BY t.priority ASC, t.created_at DESC`
  
  const result = await DB.prepare(query).bind(...params).all()
  
  return c.json({ tickets: result.results })
})

// 티켓 상세 조회
app.get('/api/tickets/:id', async (c) => {
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
app.post('/api/tickets', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const {
    title, description, dbms_type, work_category, severity,
    instance_host, instance_env, instance_version,
    sla_minutes, assigned_to, priority, week_start_date, week_end_date, year_week
  } = body
  
  // 필수 필드 검증
  if (!title || !dbms_type || !work_category || !severity) {
    return c.json({ error: 'Required fields missing' }, 400)
  }
  
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
app.patch('/api/tickets/:id/status', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()
  const { status, changed_by } = body
  
  if (!status || !changed_by) {
    return c.json({ error: 'status and changed_by required' }, 400)
  }
  
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
  if (status === 'in_progress' && !currentTicket.started_at) {
    updates.push('started_at = CURRENT_TIMESTAMP')
  }
  
  // done으로 변경시 resolved_at 설정
  if (status === 'done') {
    updates.push('resolved_at = CURRENT_TIMESTAMP')
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
app.patch('/api/tickets/:id/assign', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()
  const { assigned_to, changed_by } = body
  
  if (!changed_by) {
    return c.json({ error: 'changed_by required' }, 400)
  }
  
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
app.put('/api/tickets/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()
  
  const {
    title, description, severity, priority,
    instance_host, instance_env, instance_version,
    sla_minutes
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
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    title, description, severity, priority,
    instance_host, instance_env, instance_version,
    sla_minutes, ticketId
  ).run()
  
  return c.json({ success: true })
})

// 티켓 삭제
app.delete('/api/tickets/:id', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  
  await DB.prepare(`DELETE FROM tickets WHERE id = ?`).bind(ticketId).run()
  
  return c.json({ success: true })
})

// 코멘트 추가
app.post('/api/tickets/:id/comments', async (c) => {
  const { DB } = c.env
  const ticketId = c.req.param('id')
  const body = await c.req.json()
  
  const { engineer_id, content, comment_type } = body
  
  if (!engineer_id || !content) {
    return c.json({ error: 'engineer_id and content required' }, 400)
  }
  
  const result = await DB.prepare(`
    INSERT INTO comments (ticket_id, engineer_id, content, comment_type)
    VALUES (?, ?, ?, ?)
  `).bind(ticketId, engineer_id, content, comment_type || 'note').run()
  
  return c.json({ 
    success: true, 
    comment_id: result.meta.last_row_id 
  }, 201)
})

// 대시보드 통계 (부서장용)
app.get('/api/dashboard/stats', async (c) => {
  const { DB } = c.env
  
  // 상태별 티켓 수
  const statusCounts = await DB.prepare(`
    SELECT status, COUNT(*) as count
    FROM tickets
    GROUP BY status
  `).all()
  
  // Severity별 티켓 수
  const severityCounts = await DB.prepare(`
    SELECT severity, COUNT(*) as count
    FROM tickets
    WHERE status != 'done'
    GROUP BY severity
  `).all()
  
  // DBMS 타입별 티켓 수
  const dbmsTypeCounts = await DB.prepare(`
    SELECT dbms_type, COUNT(*) as count
    FROM tickets
    WHERE status != 'done'
    GROUP BY dbms_type
  `).all()
  
  // 엔지니어별 작업 부하
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
  
  // SLA 위반 위험 티켓 (긴급) - 상세 정보 포함
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
  
  const slaAtRisk = {
    count: slaAtRiskTickets.results.length,
    tickets: slaAtRiskTickets.results
  }
  
  return c.json({
    status_counts: statusCounts.results,
    severity_counts: severityCounts.results,
    dbms_type_counts: dbmsTypeCounts.results,
    engineer_workload: engineerWorkload.results,
    sla_at_risk: slaAtRisk
  })
})

// ==================== Frontend ====================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RP Kanban Board</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
        <style>
          /* 드래그 앤 드롭 스타일 */
          .kanban-column {
            min-height: 500px;
            transition: background-color 0.2s;
          }
          .kanban-column.drag-over {
            background-color: #e0f2fe;
          }
          .ticket-card {
            cursor: grab;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .ticket-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .ticket-card.dragging {
            opacity: 0.5;
            cursor: grabbing;
          }
          
          /* Severity 뱃지 색상 */
          .severity-critical { background: #dc2626; color: white; }
          .severity-high { background: #f97316; color: white; }
          .severity-medium { background: #eab308; color: white; }
          .severity-low { background: #10b981; color: white; }
          
          /* 로딩 애니메이션 */
          .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* SLA 타이머 색상 */
          .sla-safe { color: #10b981; }
          .sla-warning { color: #f97316; }
          .sla-danger { color: #dc2626; }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm border-b sticky top-0 z-50">
                <div class="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
                    <!-- 타이틀 -->
                    <div class="flex items-center justify-between mb-3 sm:mb-0">
                        <div class="flex items-center space-x-2 sm:space-x-3">
                            <i class="fas fa-database text-blue-600 text-xl sm:text-2xl"></i>
                            <h1 class="text-lg sm:text-2xl font-bold text-gray-800">RP Kanban Board</h1>
                        </div>
                        <!-- 모바일 메뉴 토글 -->
                        <button onclick="toggleMobileMenu()" class="sm:hidden text-gray-600 hover:text-gray-800">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- 데스크톱 메뉴 -->
                    <div class="hidden sm:flex items-center justify-between mt-3">
                        <div class="flex items-center space-x-4">
                            <!-- 주차 선택 -->
                            <div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                                <i class="fas fa-calendar-week text-gray-600"></i>
                                <select id="weekSelector" onchange="changeWeek()" class="bg-transparent border-none focus:ring-0 outline-none cursor-pointer font-medium text-gray-700">
                                    <option value="current">이번 주</option>
                                </select>
                                <button onclick="showWeekPicker()" class="text-blue-600 hover:text-blue-700">
                                    <i class="fas fa-calendar-alt"></i>
                                </button>
                            </div>
                            
                            <button onclick="openNewTicketModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                                <i class="fas fa-plus"></i>
                                <span>새 티켓</span>
                            </button>
                        </div>
                        <div class="flex items-center space-x-4">
                            <select id="viewMode" onchange="changeView()" class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="status">상태별 보기</option>
                                <option value="engineer">엔지니어별 보기</option>
                                <option value="dbms">DBMS별 보기</option>
                            </select>
                            <button onclick="toggleDashboard()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                                <i class="fas fa-chart-pie"></i>
                                <span>대시보드</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 모바일 메뉴 -->
                    <div id="mobileMenu" class="hidden sm:hidden mt-3 space-y-2">
                        <!-- 주차 선택 -->
                        <div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                            <i class="fas fa-calendar-week text-gray-600 text-sm"></i>
                            <select id="weekSelectorMobile" onchange="changeWeek()" class="bg-transparent border-none focus:ring-0 outline-none cursor-pointer text-sm font-medium text-gray-700 flex-1">
                                <option value="current">이번 주</option>
                            </select>
                            <button onclick="showWeekPicker()" class="text-blue-600 hover:text-blue-700">
                                <i class="fas fa-calendar-alt text-sm"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="openNewTicketModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition text-sm">
                                <i class="fas fa-plus"></i>
                                <span>새 티켓</span>
                            </button>
                            <button onclick="toggleDashboard()" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition text-sm">
                                <i class="fas fa-chart-pie"></i>
                                <span>대시보드</span>
                            </button>
                        </div>
                        
                        <select id="viewModeMobile" onchange="changeView()" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                            <option value="status">상태별 보기</option>
                            <option value="engineer">엔지니어별 보기</option>
                            <option value="dbms">DBMS별 보기</option>
                        </select>
                    </div>
                </div>
            </header>

            <!-- 주차 선택 모달 -->
            <div id="weekPickerModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 my-4 sm:my-8">
                    <h3 class="text-xl font-bold mb-4">주차 선택</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">시작일 (월요일)</label>
                            <input type="date" id="customWeekStart" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button onclick="closeWeekPicker()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">취소</button>
                            <button onclick="applyCustomWeek()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">적용</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 대시보드 모달 -->
            <div id="dashboardModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl my-4 sm:my-8 flex flex-col max-h-[90vh]">
                    <!-- 고정 헤더 -->
                    <div class="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white rounded-t-lg z-10">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
                            <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                            운영 대시보드
                        </h2>
                        <button onclick="toggleDashboard()" class="text-gray-500 hover:text-gray-700 transition">
                            <i class="fas fa-times text-xl sm:text-2xl"></i>
                        </button>
                    </div>
                    <!-- 스크롤 가능한 컨텐츠 -->
                    <div class="overflow-y-auto flex-1 p-4 sm:p-6">
                        <div id="dashboardContent" class="space-y-4 sm:space-y-6">
                            <div class="spinner mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 티켓 생성 모달 -->
            <div id="newTicketModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] sm:max-h-[85vh] overflow-y-auto my-4 sm:my-8">
                    <div class="p-4 sm:p-6">
                        <h2 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">새 티켓 생성</h2>
                        <form id="newTicketForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">제목 *</label>
                                <input type="text" name="title" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">설명</label>
                                <textarea name="description" rows="3" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">DBMS 유형 *</label>
                                    <select name="dbms_type" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="MySQL">MySQL</option>
                                        <option value="PostgreSQL">PostgreSQL</option>
                                        <option value="MariaDB">MariaDB</option>
                                        <option value="MongoDB">MongoDB</option>
                                        <option value="Redis">Redis</option>
                                        <option value="SingleStore">SingleStore</option>
                                        <option value="HeatWave">HeatWave</option>
                                        <option value="EDB">EDB</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">작업 카테고리 *</label>
                                    <select name="work_category" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="장애대응">장애대응</option>
                                        <option value="성능튜닝">성능튜닝</option>
                                        <option value="아키텍처설계">아키텍처설계</option>
                                        <option value="정기점검">정기점검</option>
                                        <option value="패치업그레이드">패치/업그레이드</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">심각도 *</label>
                                    <select name="severity" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">우선순위</label>
                                    <select name="priority" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="1">1 - 최우선</option>
                                        <option value="2">2 - 높음</option>
                                        <option value="3" selected>3 - 보통</option>
                                        <option value="4">4 - 낮음</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">호스트 IP</label>
                                    <input type="text" name="instance_host" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">환경</label>
                                    <select name="instance_env" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="prod">Production</option>
                                        <option value="stg">Staging</option>
                                        <option value="dev">Development</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">버전</label>
                                    <input type="text" name="instance_version" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">SLA (분)</label>
                                    <input type="number" name="sla_minutes" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">담당자</label>
                                    <select name="assigned_to" id="assignedToSelect" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="">미할당</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex justify-end space-x-3 pt-4">
                                <button type="button" onclick="closeNewTicketModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">취소</button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">생성</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- 티켓 상세 모달 -->
            <div id="ticketDetailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] sm:max-h-[85vh] overflow-y-auto my-4 sm:my-8">
                    <div class="p-4 sm:p-6">
                        <div class="flex justify-between items-start mb-4 sm:mb-6">
                            <h2 class="text-xl sm:text-2xl font-bold text-gray-800" id="detailTitle"></h2>
                            <button onclick="closeTicketDetailModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        <div id="ticketDetailContent"></div>
                    </div>
                </div>
            </div>

            <!-- SLA 위험 티켓 목록 모달 -->
            <div id="slaRiskModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] sm:max-h-[85vh] overflow-y-auto my-4 sm:my-8">
                    <div class="p-4 sm:p-6">
                        <div class="flex justify-between items-start mb-4 sm:mb-6">
                            <div class="flex items-center space-x-2 sm:space-x-3">
                                <i class="fas fa-exclamation-triangle text-2xl sm:text-3xl text-red-600"></i>
                                <h2 class="text-xl sm:text-2xl font-bold text-gray-800">SLA 위험 티켓 목록</h2>
                            </div>
                            <button onclick="closeSlaRiskModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        <div id="slaRiskContent"></div>
                    </div>
                </div>
            </div>

            <!-- 메인 칸반 보드 -->
            <main class="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
                <div id="kanbanBoard">
                    <div class="spinner mx-auto"></div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
