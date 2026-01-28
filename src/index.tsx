import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, verify } from 'hono/jwt'
import { getCookie, deleteCookie } from 'hono/cookie'
import { serveStatic } from 'hono/cloudflare-workers'
import { Bindings } from './bindings'
import { getLoginPage, getRegisterPage } from './views/authPages'
import { getAdminPage } from './views/adminPage'

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
    if (c.req.path.startsWith('/api/auth') || c.req.path.startsWith('/api/migrate-name')) {
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

    return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RP Kanban Board</title>
        <script>
            window.CURRENT_USER_ENGINEER_ID = ${currentUserEngineerId};
            window.CURRENT_USER_NAME = "${currentUserEngineerName || ''}";
            window.CURRENT_USER_ROLE = "${currentUserRole}";
            window.CURRENT_USER_USERNAME = "${currentUsername}";
            // Debug info
            console.log('Current User:', "${currentUsername}", 'Name:', "${currentUserEngineerName}", 'Role:', "${currentUserRole}");
        </script>
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
                            <!-- 기간 선택 -->
                            <div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 relative">
                                <i class="fas fa-calendar-alt text-gray-600"></i>
                                <select id="periodSelector" onchange="handlePeriodChange(this.value)" class="bg-transparent border-none focus:ring-0 outline-none cursor-pointer font-medium text-gray-700">
                                    <option value="current">이번 주</option>
                                    <option value="1m">최근 1달</option>
                                    <option value="3m">최근 3개월</option>
                                    <option value="custom">기간 선택</option>
                                </select>
                                
                                <!-- 날짜 범위 선택 모달 (Absolute Position) -->
                                <div id="dateRangeModal" class="hidden absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border p-4 z-50 w-72">
                                    <h3 class="font-bold text-gray-800 mb-3 text-sm">기간 직접 선택</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-xs text-gray-500 mb-1">시작일</label>
                                            <input type="date" id="customStartDate" class="w-full border rounded px-2 py-1 text-sm bg-gray-50">
                                        </div>
                                        <div>
                                            <label class="block text-xs text-gray-500 mb-1">종료일</label>
                                            <input type="date" id="customEndDate" class="w-full border rounded px-2 py-1 text-sm bg-gray-50">
                                        </div>
                                        <div class="flex justify-end space-x-2 pt-2">
                                            <button onclick="closeDateRangeModal()" class="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">취소</button>
                                            <button onclick="applyCustomDate()" class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">적용</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button onclick="openNewTicketModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                                <i class="fas fa-plus"></i>
                                <span>새 티켓</span>
                            </button>
                        </div>
                         <div class="flex items-center space-x-4">
                            <!-- User Name Display -->
                            ${currentUserEngineerName ? `
                            <div id="userProfileTrigger" onclick="openUserProfile()" class="flex items-center space-x-2 text-gray-700 font-bold text-base mr-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition">
                                <i class="fas fa-user-circle text-gray-500 text-xl"></i>
                                <span>${currentUserEngineerName}</span>
                            </div>
                            ` : ''}

                            <select id="viewMode" onchange="changeView()" class="border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white shadow-sm">
                                <option value="status">상태별 보기</option>
                                <option value="engineer">엔지니어별 보기</option>
                                <option value="dbms">DBMS별 보기</option>
                            </select>

                            <button onclick="toggleDashboard()" class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition shadow-sm font-medium">
                                <i class="fas fa-chart-pie"></i>
                                <span>대시보드</span>
                            </button>

                            ${currentUserRole === 'admin' ? `
                            <a href="/admin" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition shadow-sm font-medium">
                                <i class="fas fa-user-shield"></i>
                                <span>관리자</span>
                            </a>
                            ` : ''}

                            <!-- Divider -->
                            <div class="h-6 w-px bg-gray-300 mx-1"></div>

                            <a href="/api/auth/logout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition shadow-sm font-medium">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>로그아웃</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- 모바일 메뉴 -->
                    <div id="mobileMenu" class="hidden sm:hidden mt-3 space-y-2">
                        <!-- 주차/기간 선택 (Unified with Desktop) -->
                        <div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                            <i class="fas fa-calendar-alt text-gray-600 text-sm"></i>
                            <select id="periodSelectorMobile" onchange="handlePeriodChange(this.value)" class="bg-transparent border-none focus:ring-0 outline-none cursor-pointer text-sm font-medium text-gray-700 flex-1">
                                <option value="current">이번 주</option>
                                <option value="1m">최근 1달</option>
                                <option value="3m">최근 3개월</option>
                                <option value="custom">기간 선택</option>
                            </select>
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
                        
                        <a href="/api/auth/logout" class="block w-full bg-red-500 hover:bg-red-600 text-white text-center px-3 py-2 rounded-lg transition text-sm">
                            <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                        </a>
                        
                        <select id="viewModeMobile" onchange="changeView()" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                            <option value="status">상태별 보기</option>
                            <option value="engineer">엔지니어별 보기</option>
                            <option value="dbms">DBMS별 보기</option>
                        </select>
                    </div>
                </div>
            </header>

            <!-- User Info & Password Change Modal -->
            <div id="userInfoModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[100]">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900">내 정보</h3>
                        <button onclick="closeUserProfile()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <!-- Info Section -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="mb-2">
                                <label class="block text-xs text-gray-500">이름 (Display Name)</label>
                                <p class="font-medium text-gray-800" id="modalUserName">-</p>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500">아이디 (Username)</label>
                                <p class="font-medium text-gray-800" id="modalUserEmail">-</p>
                            </div>
                        </div>

                        <!-- Password Change Form -->
                        <div class="border-t pt-4">
                            <h4 class="text-sm font-bold text-gray-700 mb-3">비밀번호 변경</h4>
                            <form id="changePasswordForm" class="space-y-3">
                                <div>
                                    <input type="password" id="oldPassword" placeholder="현재 비밀번호" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                                </div>
                                <div>
                                    <input type="password" id="newPassword" placeholder="새 비밀번호" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                                </div>
                                <div>
                                    <input type="password" id="newPasswordConfirm" placeholder="새 비밀번호 확인" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                                </div>
                                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition text-sm">
                                    비밀번호 변경
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주차 선택 모달 -->
            <div id="weekPickerModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 py-8 sm:py-12 overflow-y-auto" onclick="if(event.target === this) closeWeekPicker()">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-md my-8" onclick="event.stopPropagation()">
                    <div class="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                        <h3 class="text-xl font-bold text-gray-800">주차 선택</h3>
                    </div>
                    <div class="p-4 sm:p-6">
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
            </div>

            <!-- 대시보드 모달 -->
            <div id="dashboardModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto" onclick="if(event.target === this) toggleDashboard()">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col" onclick="event.stopPropagation()">
                    <!-- 헤더 -->
                    <div class="flex items-center justify-between px-6 py-6 sm:px-8 border-b bg-gradient-to-r from-blue-50 to-white rounded-t-2xl sm:rounded-t-lg">
                        <div class="flex items-center gap-5">
                            <i class="fas fa-chart-line text-blue-600 text-3xl"></i>
                            <h2 class="text-2xl sm:text-3xl font-bold text-gray-800">
                                <span class="hidden sm:inline">운영 대시보드</span>
                                <span class="sm:hidden">대시보드</span>
                            </h2>
                        </div>
                        <button onclick="toggleDashboard()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                             <i class="fas fa-times text-2xl"></i>
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
            <div id="newTicketModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8 max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="p-4 sm:p-6">
                        <div class="flex justify-between items-center mb-3 sm:mb-4">
                            <h2 class="text-xl sm:text-2xl font-bold">새 티켓 생성</h2>
                            <button onclick="closeNewTicketModal()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
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
                                        <option value="기술 미팅">기술 미팅</option>
                                        <option value="마이그레이션">마이그레이션</option>
                                        <option value="Documentation">Documentation</option>
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
            <div id="ticketDetailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[120] flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto" onclick="if(event.target === this) closeTicketDetailModal()">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="p-4 sm:p-6">
                        <div class="flex justify-between items-start mb-4 sm:mb-6">
                            <h2 class="text-xl sm:text-2xl font-bold text-gray-800" id="detailTitle"></h2>
                            <div class="flex items-center space-x-2">
                                <!-- View Mode Buttons -->
                                <button id="btnTicketEdit" class="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50" title="수정">
                                    <i class="fas fa-edit text-xl"></i>
                                </button>
                                <button id="btnTicketDelete" class="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50" title="삭제">
                                    <i class="fas fa-trash-alt text-xl"></i>
                                </button>
                                <button id="btnTicketClose" onclick="closeTicketDetailModal()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100" title="닫기 desk">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                                
                                <!-- Edit Mode Buttons (Hidden by default) -->
                                <button id="btnTicketSave" class="hidden text-green-500 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-green-50" title="저장">
                                    <i class="fas fa-check text-xl"></i>
                                </button>
                                <button id="btnTicketCancel" class="hidden text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100" title="취소">
                                    <i class="fas fa-undo text-xl"></i>
                                </button>
                            </div>
                        </div>
                        <div id="ticketDetailContent"></div>
                    </div>
                </div>
            </div>

            <!-- SLA 위험 티켓 목록 모달 -->
            <div id="slaRiskModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[110] flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto" onclick="if(event.target === this) closeSlaRiskModal()">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="p-4 sm:p-6">
                        <div class="flex justify-between items-start mb-4 sm:mb-6">
                            <div class="flex items-center space-x-2 sm:space-x-3">
                                <i class="fas fa-exclamation-triangle text-2xl sm:text-3xl text-red-600"></i>
                                <h2 class="text-xl sm:text-2xl font-bold text-gray-800">SLA 위험 티켓 목록</h2>
                            </div>
                            <button onclick="closeSlaRiskModal()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100" title="닫기">
                                <i class="fas fa-times text-xl"></i>
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
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        
        <!-- Frontend Modular Scripts will go here later, for now keeping legacy app.js -->
        <script src="/static/app.js" type="module"></script>
        
        <!-- Robust Inline Script for Modal -->
        <script>
            // Define globally to ensure availability
            // RENAMING to openUserProfile to avoid collision with app.js modules
            window.openUserProfile = function() {
                console.log('openUserProfile (inline) triggered');
                var modal = document.getElementById('userInfoModal');
                if (!modal) {
                    console.error('Modal element not found');
                    return;
                }
                
                // Extract username from JWT
                var getCookie = function(name) {
                    var value = '; ' + document.cookie;
                    var parts = value.split('; ' + name + '=');
                    if (parts.length === 2) return parts.pop().split(';').shift();
                };
                
                var token = getCookie('auth_token');
                var username = '-';
                
                if (token) {
                    try {
                        // Decode JWT payload (middle part)
                        var payload = JSON.parse(atob(token.split('.')[1]));
                        username = payload.sub || '-';
                    } catch (e) {
                        console.error('Failed to decode JWT:', e);
                    }
                }
                
                // Populate info
                var userNameEl = document.getElementById('modalUserName');
                if (userNameEl) {
                    userNameEl.textContent = window.CURRENT_USER_NAME || username;
                }
                
                var userEmailEl = document.getElementById('modalUserEmail');
                if (userEmailEl) {
                    userEmailEl.textContent = username;
                }

                modal.classList.remove('hidden');
            };
            
            // Backward compatibility just in case
            window.openUserInfoModal = window.openUserProfile;

            window.closeUserProfile = function() {
                var modal = document.getElementById('userInfoModal');
                if (modal) modal.classList.add('hidden');
                
                var form = document.getElementById('changePasswordForm');
                if (form) form.reset();
            };
            window.closeUserInfoModal = window.closeUserProfile;

            // Double check event binding on load
            document.addEventListener('DOMContentLoaded', function() {
                var trigger = document.getElementById('userProfileTrigger');
                if (trigger) {
                    trigger.addEventListener('click', window.openUserProfile);
                    console.log('UserProfileTrigger bound successfully');
                } else {
                    console.warn('UserProfileTrigger not found on load');
                }
            });
        </script>
    </body>
    </html>
  `)
})

export default app
