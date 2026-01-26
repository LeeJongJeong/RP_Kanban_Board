// ==================== Global State ====================
let allTickets = [];
let allEngineers = [];
let currentView = 'status';
let draggedTicket = null;
let currentWeekStart = null;  // 현재 선택된 주의 시작일
let currentWeekEnd = null;    // 현재 선택된 주의 종료일

// ==================== Constants ====================
const DBMS_ICONS = {
  'MySQL': 'fa-database',
  'PostgreSQL': 'fa-database',
  'MariaDB': 'fa-database',
  'MongoDB': 'fa-leaf',
  'Redis': 'fa-bolt',
  'SingleStore': 'fa-server',
  'HeatWave': 'fa-fire',
  'EDB': 'fa-database'
};

const SEVERITY_COLORS = {
  'critical': 'severity-critical',
  'high': 'severity-high',
  'medium': 'severity-medium',
  'low': 'severity-low'
};

const STATUS_LABELS = {
  'todo': 'To-Do',
  'in_progress': 'In Progress',
  'review': 'Review',
  'done': 'Done'
};

// ==================== Week Management ====================
function getCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  
  // 일요일(0)을 7로 변환하여 계산
  const dayOfWeek = day === 0 ? 7 : day;
  
  // 이번 주 월요일 계산 (1=월요일, 7=일요일)
  const diff = dayOfWeek - 1;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday,
    end: sunday
  };
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYearWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function updateWeekSelector() {
  const selector = document.getElementById('weekSelector');
  if (!selector) return;
  
  // 현재 옵션들 저장
  const currentValue = selector.value;
  
  // 최근 8주 옵션 생성
  const options = [];
  const now = new Date();
  
  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) - (i * 7);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startStr = formatDate(weekStart);
    const endStr = formatDate(weekEnd);
    const label = i === 0 ? '이번 주' : 
                  i === 1 ? '지난 주' : 
                  `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    
    options.push({
      value: startStr,
      label: label,
      startDate: startStr,
      endDate: endStr
    });
  }
  
  // 셀렉터 업데이트
  selector.innerHTML = options.map(opt => 
    `<option value="${opt.value}" data-start="${opt.startDate}" data-end="${opt.endDate}">${opt.label}</option>`
  ).join('');
  
  // 기존 값 복원 또는 이번 주 선택
  if (currentValue && selector.querySelector(`option[value="${currentValue}"]`)) {
    selector.value = currentValue;
  } else {
    selector.value = options[0].value;
  }
}

function changeWeek() {
  const selector = document.getElementById('weekSelector');
  const selectedOption = selector.options[selector.selectedIndex];
  
  currentWeekStart = selectedOption.dataset.start;
  currentWeekEnd = selectedOption.dataset.end;
  
  loadTickets();
}

function showWeekPicker() {
  document.getElementById('weekPickerModal').classList.remove('hidden');
  
  // 오늘 날짜로 초기화 (가장 가까운 월요일)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  
  document.getElementById('customWeekStart').value = formatDate(monday);
}

function closeWeekPicker() {
  document.getElementById('weekPickerModal').classList.add('hidden');
}

function applyCustomWeek() {
  const startInput = document.getElementById('customWeekStart');
  const startDate = new Date(startInput.value);
  
  // 월요일이 아니면 가장 가까운 월요일로 조정
  const day = startDate.getDay();
  if (day !== 1) {
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
  }
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  currentWeekStart = formatDate(startDate);
  currentWeekEnd = formatDate(endDate);
  
  // 셀렉터에 커스텀 옵션 추가
  const selector = document.getElementById('weekSelector');
  const customOption = document.createElement('option');
  customOption.value = currentWeekStart;
  customOption.dataset.start = currentWeekStart;
  customOption.dataset.end = currentWeekEnd;
  customOption.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (커스텀)`;
  customOption.selected = true;
  
  // 기존 커스텀 옵션 제거
  const existingCustom = selector.querySelector('option[value*="커스텀"]');
  if (existingCustom) existingCustom.remove();
  
  selector.insertBefore(customOption, selector.firstChild);
  
  closeWeekPicker();
  loadTickets();
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  // 이번 주로 초기화
  const thisWeek = getCurrentWeek();
  currentWeekStart = formatDate(thisWeek.start);
  currentWeekEnd = formatDate(thisWeek.end);
  
  console.log('초기화:', currentWeekStart, '~', currentWeekEnd);
  
  updateWeekSelector();
  
  await loadEngineers();
  await loadTickets();  // loadTickets 내부에서 renderKanbanBoard() 호출됨
});

// ==================== Data Loading ====================
async function loadEngineers() {
  try {
    const response = await axios.get('/api/engineers');
    allEngineers = response.data.engineers;
    
    // 담당자 선택 드롭다운 업데이트
    const select = document.getElementById('assignedToSelect');
    if (select) {
      select.innerHTML = '<option value="">미할당</option>';
      allEngineers.forEach(engineer => {
        const option = document.createElement('option');
        option.value = engineer.id;
        option.textContent = `${engineer.name} (${engineer.role})`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('엔지니어 로딩 실패:', error);
    showNotification('엔지니어 정보를 불러오지 못했습니다.', 'error');
  }
}

async function loadTickets() {
  try {
    // 주차 필터링 적용
    let url = '/api/tickets';
    if (currentWeekStart && currentWeekEnd) {
      url += `?week_start_date=${currentWeekStart}&week_end_date=${currentWeekEnd}`;
    }
    
    const response = await axios.get(url);
    allTickets = response.data.tickets;
    renderKanbanBoard();
  } catch (error) {
    console.error('티켓 로딩 실패:', error);
    showNotification('티켓 정보를 불러오지 못했습니다.', 'error');
  }
}

// ==================== View Rendering ====================
function renderKanbanBoard() {
  const board = document.getElementById('kanbanBoard');
  
  if (currentView === 'status') {
    renderStatusView(board);
  } else if (currentView === 'engineer') {
    renderEngineerView(board);
  } else if (currentView === 'dbms') {
    renderDBMSView(board);
  }
}

function renderStatusView(board) {
  const statuses = ['todo', 'in_progress', 'review', 'done'];
  
  board.innerHTML = statuses.map(status => {
    const tickets = allTickets.filter(t => t.status === status);
    return `
      <div class="kanban-column bg-white rounded-lg shadow-sm p-4" 
           data-status="${status}"
           ondrop="handleDrop(event, '${status}')"
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-gray-700">
            ${STATUS_LABELS[status]}
          </h3>
          <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-semibold">
            ${tickets.length}
          </span>
        </div>
        <div class="space-y-3">
          ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderEngineerView(board) {
  board.innerHTML = allEngineers.map(engineer => {
    const tickets = allTickets.filter(t => t.assigned_to === engineer.id && t.status !== 'done');
    const wipPercentage = engineer.wip_limit > 0 ? (tickets.length / engineer.wip_limit * 100).toFixed(0) : 0;
    const wipColor = wipPercentage >= 100 ? 'text-red-600' : wipPercentage >= 80 ? 'text-orange-600' : 'text-green-600';
    
    return `
      <div class="kanban-column bg-white rounded-lg shadow-sm p-4"
           data-engineer="${engineer.id}"
           ondrop="handleEngineerDrop(event, ${engineer.id})"
           ondragover="handleDragOver(event)"
           ondragleave="handleDragLeave(event)">
        <div class="mb-4">
          <h3 class="font-bold text-lg text-gray-700">${engineer.name}</h3>
          <p class="text-sm text-gray-500">${engineer.role}</p>
          <div class="mt-2 flex items-center space-x-2">
            <span class="${wipColor} font-semibold">${tickets.length} / ${engineer.wip_limit}</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min(wipPercentage, 100)}%"></div>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderDBMSView(board) {
  const dbmsTypes = [...new Set(allTickets.map(t => t.dbms_type))];
  
  board.innerHTML = dbmsTypes.map(dbms => {
    const tickets = allTickets.filter(t => t.dbms_type === dbms && t.status !== 'done');
    return `
      <div class="kanban-column bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-gray-700 flex items-center space-x-2">
            <i class="fas ${DBMS_ICONS[dbms] || 'fa-database'} text-blue-600"></i>
            <span>${dbms}</span>
          </h3>
          <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-semibold">
            ${tickets.length}
          </span>
        </div>
        <div class="space-y-3">
          ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderTicketCard(ticket) {
  const severityClass = SEVERITY_COLORS[ticket.severity] || 'severity-medium';
  const slaStatus = getSLAStatus(ticket);
  
  return `
    <div class="ticket-card bg-white border rounded-lg p-3 shadow-sm hover:shadow-md"
         draggable="true"
         data-ticket-id="${ticket.id}"
         ondragstart="handleDragStart(event, ${ticket.id})"
         ondragend="handleDragEnd(event)"
         onclick="openTicketDetail(${ticket.id})">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center space-x-2 flex-1">
          <span class="text-xs font-semibold ${severityClass} px-2 py-1 rounded">
            ${ticket.severity.toUpperCase()}
          </span>
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            ${ticket.dbms_type}
          </span>
        </div>
        <span class="text-xs text-gray-500">
          #${ticket.id}
        </span>
      </div>
      
      <h4 class="font-semibold text-gray-800 mb-2 line-clamp-2">${ticket.title}</h4>
      
      <div class="flex items-center space-x-2 text-xs text-gray-600 mb-2">
        <i class="fas fa-tag"></i>
        <span>${ticket.work_category}</span>
      </div>
      
      ${ticket.instance_host ? `
        <div class="flex items-center space-x-2 text-xs text-gray-600 mb-2">
          <i class="fas fa-server"></i>
          <span>${ticket.instance_host} (${ticket.instance_env})</span>
        </div>
      ` : ''}
      
      ${slaStatus ? `
        <div class="flex items-center space-x-2 text-xs mb-2 ${slaStatus.colorClass}">
          <i class="fas fa-clock"></i>
          <span>${slaStatus.text}</span>
        </div>
      ` : ''}
      
      ${ticket.assigned_to_name ? `
        <div class="flex items-center space-x-2 text-xs text-gray-600 mt-3 pt-2 border-t">
          <i class="fas fa-user"></i>
          <span>${ticket.assigned_to_name}</span>
        </div>
      ` : `
        <div class="flex items-center space-x-2 text-xs text-gray-400 mt-3 pt-2 border-t">
          <i class="fas fa-user-slash"></i>
          <span>미할당</span>
        </div>
      `}
    </div>
  `;
}

// ==================== SLA 계산 ====================
function getSLAStatus(ticket) {
  if (!ticket.sla_minutes || ticket.status === 'done') return null;
  
  const now = new Date();
  const startTime = ticket.started_at ? new Date(ticket.started_at) : new Date(ticket.created_at);
  const elapsedMinutes = (now - startTime) / 1000 / 60;
  const remainingMinutes = ticket.sla_minutes - elapsedMinutes;
  
  let colorClass = 'sla-safe';
  let text = '';
  
  if (remainingMinutes <= 0) {
    colorClass = 'sla-danger';
    text = `SLA 초과 ${Math.abs(remainingMinutes).toFixed(0)}분`;
  } else if (remainingMinutes / ticket.sla_minutes < 0.2) {
    colorClass = 'sla-danger';
    text = `SLA ${remainingMinutes.toFixed(0)}분 남음`;
  } else if (remainingMinutes / ticket.sla_minutes < 0.5) {
    colorClass = 'sla-warning';
    text = `SLA ${remainingMinutes.toFixed(0)}분 남음`;
  } else {
    colorClass = 'sla-safe';
    text = `SLA ${remainingMinutes.toFixed(0)}분 남음`;
  }
  
  return { colorClass, text };
}

// ==================== Drag & Drop ====================
function handleDragStart(event, ticketId) {
  draggedTicket = allTickets.find(t => t.id === ticketId);
  event.currentTarget.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.currentTarget.innerHTML);
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  
  // 모든 drag-over 클래스 제거
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  
  const column = event.currentTarget;
  if (!column.classList.contains('drag-over')) {
    column.classList.add('drag-over');
  }
}

function handleDragLeave(event) {
  const column = event.currentTarget;
  if (!column.contains(event.relatedTarget)) {
    column.classList.remove('drag-over');
  }
}

async function handleDrop(event, newStatus) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  
  if (!draggedTicket || draggedTicket.status === newStatus) {
    draggedTicket = null;
    return;
  }
  
  try {
    await axios.patch(`/api/tickets/${draggedTicket.id}/status`, {
      status: newStatus,
      changed_by: 1 // TODO: 실제 로그인 사용자 ID
    });
    
    showNotification('티켓 상태가 변경되었습니다.', 'success');
    await loadTickets();
    renderKanbanBoard();
  } catch (error) {
    console.error('상태 변경 실패:', error);
    showNotification('상태 변경에 실패했습니다.', 'error');
  }
  
  draggedTicket = null;
}

async function handleEngineerDrop(event, engineerId) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  
  if (!draggedTicket || draggedTicket.assigned_to === engineerId) {
    draggedTicket = null;
    return;
  }
  
  try {
    await axios.patch(`/api/tickets/${draggedTicket.id}/assign`, {
      assigned_to: engineerId,
      changed_by: 1 // TODO: 실제 로그인 사용자 ID
    });
    
    showNotification('담당자가 변경되었습니다.', 'success');
    await loadTickets();
    renderKanbanBoard();
  } catch (error) {
    console.error('담당자 변경 실패:', error);
    showNotification('담당자 변경에 실패했습니다.', 'error');
  }
  
  draggedTicket = null;
}

// ==================== View Switching ====================
function changeView() {
  currentView = document.getElementById('viewMode').value;
  renderKanbanBoard();
}

// ==================== Ticket Detail Modal ====================
async function openTicketDetail(ticketId) {
  const modal = document.getElementById('ticketDetailModal');
  const titleEl = document.getElementById('detailTitle');
  const contentEl = document.getElementById('ticketDetailContent');
  
  modal.classList.remove('hidden');
  titleEl.textContent = '로딩 중...';
  contentEl.innerHTML = '<div class="spinner mx-auto"></div>';
  
  try {
    const response = await axios.get(`/api/tickets/${ticketId}`);
    const { ticket, comments } = response.data;
    
    titleEl.textContent = ticket.title;
    
    contentEl.innerHTML = `
      <div class="space-y-6">
        <!-- 기본 정보 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">상태</label>
            <p class="mt-1">${STATUS_LABELS[ticket.status]}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">담당자</label>
            <p class="mt-1">${ticket.assigned_to_name || '미할당'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">DBMS</label>
            <p class="mt-1">${ticket.dbms_type}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">작업 카테고리</label>
            <p class="mt-1">${ticket.work_category}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">심각도</label>
            <p class="mt-1">
              <span class="text-xs font-semibold ${SEVERITY_COLORS[ticket.severity]} px-2 py-1 rounded">
                ${ticket.severity.toUpperCase()}
              </span>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">우선순위</label>
            <p class="mt-1">P${ticket.priority}</p>
          </div>
        </div>
        
        <!-- 설명 -->
        ${ticket.description ? `
          <div>
            <label class="text-sm font-medium text-gray-600">설명</label>
            <p class="mt-1 text-gray-700 whitespace-pre-wrap">${ticket.description}</p>
          </div>
        ` : ''}
        
        <!-- 인스턴스 정보 -->
        ${ticket.instance_host ? `
          <div>
            <label class="text-sm font-medium text-gray-600">인스턴스 정보</label>
            <div class="mt-1 bg-gray-50 p-3 rounded">
              <p><strong>호스트:</strong> ${ticket.instance_host}</p>
              <p><strong>환경:</strong> ${ticket.instance_env}</p>
              ${ticket.instance_version ? `<p><strong>버전:</strong> ${ticket.instance_version}</p>` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- SLA 정보 -->
        ${ticket.sla_minutes ? `
          <div>
            <label class="text-sm font-medium text-gray-600">SLA 정보</label>
            <div class="mt-1 bg-gray-50 p-3 rounded">
              <p><strong>목표 시간:</strong> ${ticket.sla_minutes}분</p>
              ${ticket.started_at ? `<p><strong>시작 시간:</strong> ${new Date(ticket.started_at).toLocaleString('ko-KR')}</p>` : ''}
              ${ticket.resolved_at ? `<p><strong>해결 시간:</strong> ${new Date(ticket.resolved_at).toLocaleString('ko-KR')}</p>` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- 코멘트 -->
        <div>
          <label class="text-sm font-medium text-gray-600 mb-2 block">코멘트 (${comments.length})</label>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            ${comments.length > 0 ? comments.map(comment => `
              <div class="bg-gray-50 p-3 rounded">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-sm">${comment.engineer_name}</span>
                  <span class="text-xs text-gray-500">${new Date(comment.created_at).toLocaleString('ko-KR')}</span>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">${comment.content}</p>
                <span class="text-xs text-gray-500 mt-2 inline-block">[${comment.comment_type}]</span>
              </div>
            `).join('') : '<p class="text-gray-500 text-sm">코멘트가 없습니다.</p>'}
          </div>
        </div>
        
        <!-- 액션 버튼 -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button onclick="closeTicketDetailModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
            닫기
          </button>
          <button onclick="deleteTicket(${ticket.id})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            삭제
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('티켓 상세 조회 실패:', error);
    contentEl.innerHTML = '<p class="text-red-600">티켓 정보를 불러오지 못했습니다.</p>';
  }
}

function closeTicketDetailModal() {
  document.getElementById('ticketDetailModal').classList.add('hidden');
}

async function deleteTicket(ticketId) {
  if (!confirm('정말로 이 티켓을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/tickets/${ticketId}`);
    showNotification('티켓이 삭제되었습니다.', 'success');
    closeTicketDetailModal();
    await loadTickets();
    renderKanbanBoard();
  } catch (error) {
    console.error('티켓 삭제 실패:', error);
    showNotification('티켓 삭제에 실패했습니다.', 'error');
  }
}

// ==================== New Ticket Modal ====================
function openNewTicketModal() {
  document.getElementById('newTicketModal').classList.remove('hidden');
}

function closeNewTicketModal() {
  document.getElementById('newTicketModal').classList.add('hidden');
  document.getElementById('newTicketForm').reset();
}

document.getElementById('newTicketForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  // 빈 문자열을 null로 변환
  Object.keys(data).forEach(key => {
    if (data[key] === '') data[key] = null;
  });
  
  // 숫자 필드 변환
  if (data.priority) data.priority = parseInt(data.priority);
  if (data.sla_minutes) data.sla_minutes = parseInt(data.sla_minutes);
  if (data.assigned_to) data.assigned_to = parseInt(data.assigned_to);
  
  // 현재 선택된 주차 정보 추가
  if (currentWeekStart && currentWeekEnd) {
    data.week_start_date = currentWeekStart;
    data.week_end_date = currentWeekEnd;
    data.year_week = getYearWeek(new Date(currentWeekStart));
  }
  
  try {
    await axios.post('/api/tickets', data);
    showNotification('새 티켓이 생성되었습니다.', 'success');
    closeNewTicketModal();
    await loadTickets();
  } catch (error) {
    console.error('티켓 생성 실패:', error);
    showNotification('티켓 생성에 실패했습니다.', 'error');
  }
});

// ==================== Dashboard ====================
async function toggleDashboard() {
  const modal = document.getElementById('dashboardModal');
  const content = document.getElementById('dashboardContent');
  
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="spinner mx-auto"></div>';
    
    try {
      const response = await axios.get('/api/dashboard/stats');
      const stats = response.data;
      
      content.innerHTML = `
        <div class="grid grid-cols-2 gap-6">
          <!-- 상태별 티켓 -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="font-bold text-lg mb-3">상태별 티켓</h3>
            <div class="space-y-2">
              ${stats.status_counts.map(item => `
                <div class="flex justify-between items-center">
                  <span>${STATUS_LABELS[item.status]}</span>
                  <span class="font-bold">${item.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 심각도별 티켓 -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="font-bold text-lg mb-3">심각도별 티켓 (진행중)</h3>
            <div class="space-y-2">
              ${stats.severity_counts.map(item => `
                <div class="flex justify-between items-center">
                  <span class="${SEVERITY_COLORS[item.severity]} px-2 py-1 rounded text-xs">${item.severity.toUpperCase()}</span>
                  <span class="font-bold">${item.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- DBMS별 티켓 -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="font-bold text-lg mb-3">DBMS별 티켓 (진행중)</h3>
            <div class="space-y-2">
              ${stats.dbms_type_counts.map(item => `
                <div class="flex justify-between items-center">
                  <span><i class="fas ${DBMS_ICONS[item.dbms_type]} mr-2"></i>${item.dbms_type}</span>
                  <span class="font-bold">${item.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 엔지니어 작업 부하 -->
          <div class="bg-white border rounded-lg p-4">
            <h3 class="font-bold text-lg mb-3">엔지니어 작업 부하</h3>
            <div class="space-y-3">
              ${stats.engineer_workload.map(item => {
                const percentage = (item.current_wip / item.wip_limit * 100).toFixed(0);
                const barColor = percentage >= 100 ? 'bg-red-600' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-600';
                return `
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span>${item.name}</span>
                      <span>${item.current_wip} / ${item.wip_limit}</span>
                    </div>
                    <div class="bg-gray-200 rounded-full h-2">
                      <div class="${barColor} h-2 rounded-full transition-all" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        
        <!-- SLA 위험 경고 -->
        ${stats.sla_at_risk.count > 0 ? `
          <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center space-x-2 text-red-700">
              <i class="fas fa-exclamation-triangle text-2xl"></i>
              <div>
                <p class="font-bold">SLA 위험 경고</p>
                <p class="text-sm">현재 <strong>${stats.sla_at_risk.count}건</strong>의 티켓이 SLA 초과 위험에 있습니다.</p>
              </div>
            </div>
          </div>
        ` : ''}
      `;
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      content.innerHTML = '<p class="text-red-600">대시보드 데이터를 불러오지 못했습니다.</p>';
    }
  } else {
    modal.classList.add('hidden');
  }
}

// ==================== Notifications ====================
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== Global Exports for Inline Handlers ====================
// HTML inline 이벤트 핸들러를 위해 함수들을 전역으로 노출
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleEngineerDrop = handleEngineerDrop;
window.openTicketDetail = openTicketDetail;
window.closeTicketDetail = closeTicketDetail;
window.changeView = changeView;
window.showDashboard = showDashboard;
window.openNewTicketModal = openNewTicketModal;
window.closeNewTicketModal = closeNewTicketModal;
window.openWeekPickerModal = openWeekPickerModal;
window.closeWeekPickerModal = closeWeekPickerModal;
window.selectWeek = selectWeek;
