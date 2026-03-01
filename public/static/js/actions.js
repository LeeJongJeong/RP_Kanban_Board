import API from './api.js';
import { store } from './store.js';
import { renderKanbanBoard } from './render.js';
import { showNotification, formatDate, getYearWeek, STATUS_LABELS, DBMS_ICONS, getCurrentWeek, formatDateTime, escapeHtml } from './utils.js';

// ==================== Data Loading ====================
export async function loadEngineers() {
  try {
    const data = await API.getEngineers();
    store.setEngineers(data.engineers);

    // 담당자 선택 드롭다운 업데이트
    const select = document.getElementById('assignedToSelect');
    if (select) {
      select.innerHTML = '<option value="">미할당</option>';
      store.allEngineers.forEach(engineer => {
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

export async function loadTickets() {
  try {
    const params = {};
    // 날짜 범위 필터링 우선
    if (store.startDate && store.endDate) {
      console.log('Loading tickets with range:', store.startDate, '~', store.endDate);
      params.start_date = store.startDate;
      params.end_date = store.endDate;
    }
    // 기존 주차 로직 (Fallback)
    else if (store.currentWeekStart && store.currentWeekEnd) {
      params.week_start_date = store.currentWeekStart;
      params.week_end_date = store.currentWeekEnd;
    }

    const data = await API.getTickets(params);
    store.setTickets(data.tickets);
    renderKanbanBoard();
  } catch (error) {
    console.error('티켓 로딩 실패:', error);
    showNotification('티켓 정보를 불러오지 못했습니다.', 'error');

    // 에러 발생 시 스피너 제거 및 에러 메시지 표시
    const board = document.getElementById('kanbanBoard');
    if (board) {
      board.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-red-500 w-full sm:col-span-2 lg:col-span-4">
            <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
            <p class="text-lg">데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p class="text-sm mt-2 text-gray-500">잠시 후 다시 시도해주세요.</p>
        </div>
      `;
    }
  }
}

// ==================== Drag & Drop ====================
export function handleDragStart(event, ticketId) {
  store.draggedTicket = store.allTickets.find(t => t.id === ticketId);
  event.currentTarget.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.currentTarget.innerHTML);
}

export function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.classList.remove('drag-over');
  });
}

export function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const column = event.currentTarget;
  if (!column.classList.contains('drag-over')) {
    column.classList.add('drag-over');
  }
}

export function handleDragLeave(event) {
  const column = event.currentTarget;
  if (!column.contains(event.relatedTarget)) {
    column.classList.remove('drag-over');
  }
}

export async function handleDrop(event, newStatus) {
  event.preventDefault && event.preventDefault();
  if (event.currentTarget) event.currentTarget.classList.remove('drag-over');

  // Mobile touch event support (draggedTicket might be set by touch logic)
  if (!store.draggedTicket) return;

  if (store.draggedTicket.status === newStatus) {
    store.draggedTicket = null;
    return;
  }

  try {
    await API.updateTicketStatus(store.draggedTicket.id, newStatus);
    showNotification('티켓 상태가 변경되었습니다.', 'success');
    await loadTickets();
  } catch (error) {
    console.error('상태 변경 실패:', error);
    showNotification('상태 변경에 실패했습니다.', 'error');
  }

  store.draggedTicket = null;
}

export async function handleEngineerDrop(event, engineerId) {
  event.preventDefault && event.preventDefault();
  if (event.currentTarget) event.currentTarget.classList.remove('drag-over');

  if (!store.draggedTicket || store.draggedTicket.assigned_to === engineerId) {
    store.draggedTicket = null;
    return;
  }

  try {
    await API.assignTicket(store.draggedTicket.id, engineerId);
    showNotification('담당자가 변경되었습니다.', 'success');
    await loadTickets();
  } catch (error) {
    console.error('담당자 변경 실패:', error);
    showNotification('담당자 변경에 실패했습니다.', 'error');
  }

  store.draggedTicket = null;
}

// ==================== View Switching ====================
export function changeView() {
  const viewMode = document.getElementById('viewMode') || document.getElementById('viewModeMobile');
  if (!viewMode) return;

  store.setView(viewMode.value);

  const otherViewMode = viewMode.id === 'viewMode'
    ? document.getElementById('viewModeMobile')
    : document.getElementById('viewMode');

  if (otherViewMode) otherViewMode.value = store.currentView;

  renderKanbanBoard();
}

// ==================== Week Management ====================
export function changeWeek() {
  const selector = document.getElementById('weekSelector') || document.getElementById('weekSelectorMobile');
  if (!selector) return;

  const selectedOption = selector.options[selector.selectedIndex];
  store.setWeek(selectedOption.dataset.start, selectedOption.dataset.end);

  const otherSelector = selector.id === 'weekSelector'
    ? document.getElementById('weekSelectorMobile')
    : document.getElementById('weekSelector');

  if (otherSelector) otherSelector.value = selector.value;

  loadTickets();
}

export function updateWeekSelector(options) {
  const selector = document.getElementById('weekSelector');
  const selectorMobile = document.getElementById('weekSelectorMobile');
  if (!selector && !selectorMobile) return;

  const optionsHtml = options.map(opt =>
    `<option value="${opt.value}" data-start="${opt.startDate}" data-end="${opt.endDate}">${opt.label}</option>`
  ).join('');

  if (selector) selector.innerHTML = optionsHtml;
  if (selectorMobile) selectorMobile.innerHTML = optionsHtml;

  // Set initial value
  if (selector) selector.value = options[0].value;
  if (selectorMobile) selectorMobile.value = options[0].value;

  // Initial week set
  store.setWeek(options[0].startDate, options[0].endDate);
}

export function showWeekPicker() {
  document.getElementById('weekPickerModal').classList.remove('hidden');
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  document.getElementById('customWeekStart').value = formatDate(monday);
}

export function closeWeekPicker() {
  document.getElementById('weekPickerModal').classList.add('hidden');
}

export function applyCustomWeek() {
  const startInput = document.getElementById('customWeekStart');
  const startDate = new Date(startInput.value);

  // Adjust to Monday
  const day = startDate.getDay();
  if (day !== 1) {
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  store.setWeek(startStr, endStr);

  // Add option to selector
  const selector = document.getElementById('weekSelector');
  const customOption = document.createElement('option');
  customOption.value = startStr;
  customOption.dataset.start = startStr;
  customOption.dataset.end = endStr;
  customOption.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (커스텀)`;
  customOption.selected = true;

  const existingCustom = selector.querySelector('option[value*="커스텀"]');
  if (existingCustom) existingCustom.remove();

  selector.insertBefore(customOption, selector.firstChild);

  closeWeekPicker();
  loadTickets();
}



// ==================== Modals and Forms ====================
export async function openTicketDetail(ticketId) {
  const modal = document.getElementById('ticketDetailModal');
  const titleEl = document.getElementById('detailTitle');
  const contentEl = document.getElementById('ticketDetailContent');

  modal.classList.remove('hidden');
  titleEl.textContent = '로딩 중...';
  contentEl.innerHTML = '<div class="spinner mx-auto"></div>';

  try {
    const data = await API.getTicketDetail(ticketId);
    const { ticket, comments } = data;

    titleEl.textContent = ticket.title;

    // Bind Top Action Buttons
    const btnEdit = document.getElementById('btnTicketEdit');
    const btnDelete = document.getElementById('btnTicketDelete');
    const btnClose = document.getElementById('btnTicketClose');
    const btnSave = document.getElementById('btnTicketSave');
    const btnCancel = document.getElementById('btnTicketCancel');

    // Reset visibility (View Mode)
    if (btnEdit) { btnEdit.onclick = () => window.enableEditMode(ticket); btnEdit.classList.remove('hidden'); }
    if (btnDelete) { btnDelete.onclick = () => window.deleteTicket(ticket.id); btnDelete.classList.remove('hidden'); }
    if (btnClose) { btnClose.classList.remove('hidden'); }
    if (btnSave) { btnSave.onclick = () => window.saveTicketChanges(ticket.id); btnSave.classList.add('hidden'); }
    if (btnCancel) { btnCancel.onclick = () => openTicketDetail(ticket.id); btnCancel.classList.add('hidden'); }

    // Using innerHTML based rendering for modal content as in original code
    // This part could be also moved to render.js but for simplicity keeping it here 
    // or reusing the logic. To keep separation, I'll inline the HTML generation here mostly identical to original
    // but imports colors/labels from utils.

    // ... (HTML generation logic same as original app.js)
    // For brevity I will implement it fully.

    // Exposed function for Status Change (Mobile/Desktop)
    window.updateTicketStatus = async (ticketId, newStatus) => {
      if (!confirm('상태를 변경하시겠습니까?')) {
        // Revert selection if cancelled (trickier with inline reload, but acceptable for MVP)
        await openTicketDetail(ticketId); // Reload modal to revert UI
        return;
      }

      try {
        await API.updateTicketStatus(ticketId, newStatus);

        showNotification('상태가 변경되었습니다.', 'success');

        // Refresh Board
        await loadTickets();

        // Refresh Modal (to update timestamps etc if needed, or just keep it open)
        // Ideally we re-fetch detail, but for status change, just visual update is often enough.
        // But let's reload detail to show updated "Updated At" time.
        await openTicketDetail(ticketId);

      } catch (e) {
        console.error(e);
        showNotification('상태 변경 실패: ' + e.message, 'error');
      }
    };



    contentEl.innerHTML = `
      <div class="space-y-6">
        <!-- 1. Key Info Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">상태</label>
              <select onchange="window.updateTicketStatus(${ticket.id}, this.value)" class="font-medium bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 w-full text-sm">
                 ${Object.entries(STATUS_LABELS).map(([key, label]) =>
      `<option value="${key}" ${key === ticket.status ? 'selected' : ''}>${label}</option>`
    ).join('')}
              </select>
           </div>
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">담당자</label>
              <div class="font-medium">${escapeHtml(ticket.assigned_to_name) || '미할당'}</div>
           </div>
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">DBMS</label>
              <div class="font-medium">${ticket.dbms_type}</div>
           </div>
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">작업 카테고리</label>
              <div class="font-medium">${ticket.work_category}</div>
           </div>
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">심각도</label>
              <div class="font-medium"><span class="text-xs font-semibold px-2 py-1 rounded bg-gray-200">${ticket.severity.toUpperCase()}</span></div>
           </div>
           <div class="col-span-1">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">우선순위</label>
              <div class="font-medium">P${ticket.priority}</div>
           </div>
        </div>

            <!-- 2. Instance & SLA Info (If exists) -->
        ${ticket.instance_host ? `
        <div>
           <h3 class="text-sm font-bold text-gray-700 mb-2">인스턴스 정보</h3>
           <div class="bg-gray-50 p-3 rounded text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p><span class="text-gray-500">호스트:</span> ${escapeHtml(ticket.instance_host)}</p>
              <p><span class="text-gray-500">환경:</span> ${escapeHtml(ticket.instance_env)}</p>
              ${ticket.instance_version ? `<p><span class="text-gray-500">버전:</span> ${escapeHtml(ticket.instance_version)}</p>` : ''}
           </div>
        </div>` : ''}

        ${ticket.sla_minutes ? `
        <div>
           <h3 class="text-sm font-bold text-gray-700 mb-2">SLA 정보</h3>
           <div class="bg-gray-50 p-3 rounded text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                  <p><span class="text-gray-500">목표 시간:</span> ${ticket.sla_minutes}분</p>
              </div>
              <div class="space-y-1">
                  ${ticket.started_at ? `<p><span class="text-gray-500">시작 시간:</span> ${formatDateTime(ticket.started_at)}</p>` : ''}
                  ${ticket.resolved_at && ticket.status.toLowerCase() === 'done' ? `<p><span class="text-gray-500">종료 시간:</span> ${formatDateTime(ticket.resolved_at)}</p>` : ''}
              </div>
           </div>
        </div>` : ''}

        <!-- 3. Description (Bottom) -->
        <div>
           <h3 class="text-sm font-bold text-gray-700 mb-2">설명</h3>
           <div class="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap min-h-[80px] text-sm">${escapeHtml(ticket.description) || '내용 없음'}</div>
        </div>

        <!-- 4. Dates (Bottom) -->
        <div class="grid grid-cols-2 gap-6 border-t pt-4">
           <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">생성 일시</label>
              <p class="font-medium text-gray-900 text-sm">${formatDateTime(ticket.created_at)}</p>
           </div>
           <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">최근 업데이트</label>
              <p class="font-medium text-gray-900 text-sm">${formatDateTime(ticket.updated_at)}</p>
           </div>
        </div>

        <!-- 5. Comments -->
        <div class="border-t pt-4">
           <label class="text-sm font-bold text-gray-700 mb-3 block">코멘트 (${comments.length})</label>
           <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
             ${comments.length > 0 ? comments.map(comment => `
               <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                 <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-sm text-blue-900">${comment.engineer_name}</span>
                    <span class="text-xs text-blue-500">${formatDateTime(comment.created_at)}</span>
                 </div>
                 <p class="text-sm text-gray-800 whitespace-pre-wrap">${escapeHtml(comment.content)}</p>
                 <span class="text-xs text-blue-400 mt-2 inline-block px-1.5 py-0.5 bg-white rounded border border-blue-200">${comment.comment_type}</span>
               </div>
             `).join('') : '<p class="text-gray-500 text-sm italic py-2">등록된 코멘트가 없습니다.</p>'}
           </div>
        </div>


      </div>
    `;

  } catch (error) {
    console.error('티켓 상세 조회 실패:', error);
    contentEl.innerHTML = '<p class="text-red-600">티켓 정보를 불러오지 못했습니다.</p>';
  }
}

export function closeTicketDetailModal() {
  document.getElementById('ticketDetailModal').classList.add('hidden');
}

export async function deleteTicket(ticketId) {
  if (!confirm('정말로 이 티켓을 삭제하시겠습니까?')) return;

  try {
    await API.deleteTicket(ticketId);
    showNotification('티켓이 삭제되었습니다.', 'success');
    closeTicketDetailModal();
    await loadTickets();
  } catch (error) {
    console.error('티켓 삭제 실패:', error);
    showNotification('티켓 삭제에 실패했습니다.', 'error');
  }
}

export function openNewTicketModal() {
  document.getElementById('newTicketModal').classList.remove('hidden');

  // Auto-select current user if available
  if (window.CURRENT_USER_ENGINEER_ID) {
    const select = document.getElementById('assignedToSelect');
    if (select) {
      select.value = window.CURRENT_USER_ENGINEER_ID;
    }
  }
}

export function closeNewTicketModal() {
  document.getElementById('newTicketModal').classList.add('hidden');
  document.getElementById('newTicketForm').reset();
}

export async function submitNewTicket(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  // Null and Type conversion
  Object.keys(data).forEach(key => {
    if (data[key] === '') data[key] = null;
  });
  if (data.priority) data.priority = parseInt(data.priority);
  if (data.sla_minutes) data.sla_minutes = parseInt(data.sla_minutes);
  if (data.assigned_to) data.assigned_to = parseInt(data.assigned_to);
  if (data.assigned_to) data.assigned_to = parseInt(data.assigned_to);

  // Always assign to current week
  const currentWeek = getCurrentWeek();
  data.week_start_date = formatDate(currentWeek.start);
  data.week_end_date = formatDate(currentWeek.end);
  data.year_week = getYearWeek(new Date());

  try {
    await API.createTicket(data);
    showNotification('새 티켓이 생성되었습니다.', 'success');
    closeNewTicketModal();
    await loadTickets();
  } catch (error) {
    console.error('티켓 생성 실패:', error);
    showNotification('티켓 생성에 실패했습니다.', 'error');
  }
}

// ==================== Dashboard ====================
export async function toggleDashboard() {
  const modal = document.getElementById('dashboardModal');
  const content = document.getElementById('dashboardContent');
  if (!modal || !content) return;

  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="spinner mx-auto"></div>';

    try {
      const stats = await API.getDashboardStats();
      console.log('Dashboard Stats:', stats);

      // Store SLA data globally to avoid inline HTML escaping issues
      window.currentSlaData = stats.sla_at_risk;

      // --- Helper for formatting numbers ---
      const fmt = (n) => n ? n.toLocaleString() : '0';

      // --- Calculate Top Row Metrics ---
      // 1. Total Active: (todo + in_progress)
      const totalActive = stats.status_counts.reduce((acc, curr) =>
        (curr.status === 'todo' || curr.status === 'in_progress') ? acc + curr.count : acc, 0);

      // 2. Velocity
      const created = stats.weekly_velocity?.created || 0;
      const resolved = stats.weekly_velocity?.resolved || 0;

      // 3. SLA Compliance
      const slaTotal = stats.sla_compliance?.total || 0;
      const slaMet = stats.sla_compliance?.met || 0;
      const slaRate = slaTotal > 0 ? Math.round((slaMet / slaTotal) * 100) : 100;

      // 4. Critical Risk (Unassigned)
      const riskCount = stats.unassigned_criticals?.count || 0;


      content.innerHTML = `
        <div class="space-y-6">
        
          <!-- ZONE 1: Summary Cards (Top Row) -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1: Total Active -->
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span class="text-gray-500 text-sm font-medium">현재 진행 중 티켓</span>
              <div class="flex items-end justify-between mt-2">
                <span class="text-3xl font-bold text-blue-600">${fmt(totalActive)}</span>
                <i class="fas fa-ticket-alt text-gray-200 text-2xl"></i>
              </div>
            </div>

            <!-- Card 2: Weekly Velocity -->
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span class="text-gray-500 text-sm font-medium">주간 속도 (생성/해결)</span>
              <div class="flex items-end justify-between mt-2">
                <div class="flex items-baseline space-x-1">
                  <span class="text-2xl font-bold text-gray-800">${fmt(created)}</span>
                  <span class="text-gray-400 text-sm">/</span>
                  <span class="text-2xl font-bold text-green-600">${fmt(resolved)}</span>
                </div>
                <div class="text-xs font-semibold px-2 py-1 rounded bg-gray-100 ${created > resolved ? 'text-red-500' : 'text-green-500'}">
                  ${created > resolved ? 'LOAD ↑' : 'GOOD'}
                </div>
              </div>
            </div>

            <!-- Card 3: SLA Compliance -->
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span class="text-gray-500 text-sm font-medium">SLA 준수율 (30일)</span>
              <div class="flex items-end justify-between mt-2">
                <span class="text-3xl font-bold ${slaRate >= 95 ? 'text-green-600' : slaRate >= 80 ? 'text-orange-500' : 'text-red-600'}">${slaRate}%</span>
                 <div class="text-xs text-gray-400">
                  ${slaMet} / ${slaTotal}
                </div>
              </div>
            </div>

            <!-- Card 4: Critical Risk -->
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div class="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
              <span class="text-gray-500 text-sm font-medium relative z-10">미할당 (Critical/High)</span>
              <div class="flex items-end justify-between mt-2 relative z-10">
                <span class="text-3xl font-bold text-red-600">${fmt(riskCount)}</span>
                ${riskCount > 0 ? '<i class="fas fa-exclamation-circle text-red-500 text-xl animate-pulse"></i>' : '<i class="fas fa-check-circle text-green-400 text-xl"></i>'}
              </div>
            </div>
          </div>

          <!-- ZONE 2: Trends & Analytics (Charts) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Weekly Trend Chart -->
            <div class="bg-white p-5 rounded-xl border shadow-sm">
              <h3 class="font-bold text-gray-800 text-lg mb-4">주간 업무 흐름</h3>
              <div class="h-64 relative">
                <canvas id="weeklyTrendChart"></canvas>
              </div>
            </div>

            <!-- Efficiency & MTTR -->
            <div class="bg-white p-5 rounded-xl border shadow-sm">
              <h3 class="font-bold text-gray-800 text-lg mb-4">평균 해결 시간 (분)</h3>
              <div class="h-64 relative">
                <canvas id="mttrChart"></canvas>
              </div>
            </div>
          </div>

          <!-- ZONE 3 & 4: Operations Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Engineer Workload (Left, 2 cols) -->
            <div class="lg:col-span-2 bg-white p-5 rounded-xl border shadow-sm">
               <h3 class="font-bold text-gray-800 text-lg mb-4 flex items-center">
                <span class="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                엔지니어 작업 부하 현황
              </h3>
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                ${stats.engineer_workload.map(eng => {
        const pct = Math.min(100, Math.round((eng.current_wip / eng.wip_limit) * 100));
        const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-green-500';
        return `
                    <div class="border rounded-lg p-3">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700">${eng.name}</span>
                        <span class="text-xs font-bold text-gray-500">${eng.current_wip}/${eng.wip_limit}</span>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="${color} h-2 rounded-full" style="width: ${pct}%"></div>
                      </div>
                    </div>
                  `;
      }).join('')}
               </div>
            </div>

            <!-- Action Alerts (Right, 1 col) -->
            <div class="space-y-4">
              
              <!-- SLA Alert Card -->
               ${stats.sla_at_risk.count > 0 ? `
                <div class="bg-red-50 border border-red-200 rounded-xl p-5 cursor-pointer hover:bg-red-100 transition group"
                     onclick="showSlaRiskDetails()">
                  <div class="flex items-center space-x-3 mb-2">
                     <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                     <h4 class="font-bold text-red-800">SLA 위험 경고</h4>
                  </div>
                  <p class="text-sm text-red-700 mb-3">
                    총 <strong class="text-lg">${stats.sla_at_risk.count}건</strong>의 티켓이 지연 위험
                  </p>
                  <div class="text-xs text-red-500 font-semibold group-hover:underline">상세 보기 →</div>
                </div>
              ` : `
                <div class="bg-green-50 border border-green-200 rounded-xl p-5">
                   <div class="flex items-center space-x-3 text-green-700">
                     <i class="fas fa-check-circle text-xl"></i>
                     <h4 class="font-bold">SLA 상태 양호</h4>
                  </div>
                  <p class="text-sm text-green-600 mt-2">위험군 티켓이 없습니다.</p>
                </div>
              `}

              <!-- Stalled Tickets Alert -->
              <div class="bg-orange-50 border border-orange-200 rounded-xl p-5">
                 <div class="flex items-center justify-between mb-2">
                   <div class="flex items-center space-x-3 text-orange-800">
                     <i class="fas fa-hourglass-half text-xl"></i>
                     <h4 class="font-bold">장기 미활동 (3일+)</h4>
                   </div>
                   <span class="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">In-Progress</span>
                </div>
                <div class="text-3xl font-bold text-orange-700 mt-2">
                  ${stats.stalled_tickets?.count || 0}
                  <span class="text-sm font-normal text-orange-600 ml-1">건</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      // Render Charts
      setTimeout(() => {
        renderDashboardCharts(stats);
      }, 100);

    } catch (error) {
      console.error('대시보드 실패', error);
      content.innerHTML = '<div class="p-8 text-center text-red-600"><i class="fas fa-exclamation-circle text-4xl mb-4"></i><p>데이터 로드 중 오류가 발생했습니다.</p></div>';
    }
  } else {
    modal.classList.add('hidden');
  }
}

// Chart Rendering Helper
function renderDashboardCharts(stats) {
  // 1. Weekly Trend (Line)
  const trendCtx = document.getElementById('weeklyTrendChart');
  if (trendCtx) {
    const labels = stats.weekly_trend.map(d => d.date.substring(5)); // MM-DD
    const createdData = stats.weekly_trend.map(d => d.created);
    const resolvedData = stats.weekly_trend.map(d => d.resolved);

    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '생성됨',
            data: createdData,
            borderColor: '#3B82F6', // Blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: '해결됨',
            data: resolvedData,
            borderColor: '#10B981', // Green-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. MTTR (Bar)
  const mttrCtx = document.getElementById('mttrChart');
  if (mttrCtx) {
    const mttrData = { critical: 0, high: 0, medium: 0, low: 0 };
    stats.mttr_stats.forEach(s => {
      if (mttrData[s.severity] !== undefined) mttrData[s.severity] = Math.round(s.avg_minutes);
    });

    new Chart(mttrCtx, {
      type: 'bar',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          label: '평균 소요 시간 (분)',
          data: [mttrData.critical, mttrData.high, mttrData.medium, mttrData.low],
          backgroundColor: [
            'rgba(220, 38, 38, 0.7)', // Red
            'rgba(249, 115, 22, 0.7)', // Orange
            'rgba(234, 179, 8, 0.7)', // Yellow
            'rgba(34, 197, 94, 0.7)'  // Green
          ],
          borderColor: [
            'rgb(220, 38, 38)',
            'rgb(249, 115, 22)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal Bar
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }
}

export function showSlaRiskDetails(slaData) {
  const data = slaData || window.currentSlaData;
  if (!data) return;

  const modal = document.getElementById('slaRiskModal');
  const content = document.getElementById('slaRiskContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  const tickets = data.tickets || [];

  if (tickets.length === 0) {
    content.innerHTML = '<p class="text-gray-500 text-center py-8">위험 티켓이 없습니다.</p>';
    return;
  }

  content.innerHTML = `
     <div class="space-y-4">
       ${tickets.map(ticket => `
         <div class="border border-red-300 rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer" onclick="openTicketDetail(${ticket.id})">
           <h3 class="font-bold text-gray-800 mb-2">#${ticket.id} ${ticket.title}</h3>
           <div class="text-red-600 text-sm">SLA ${ticket.sla_minutes}분 / 경과 ${ticket.elapsed_minutes}분</div>
         </div>
       `).join('')}
     </div>
   `;
}

export function closeSlaRiskModal() {
  document.getElementById('slaRiskModal').classList.add('hidden');
}

export function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) mobileMenu.classList.toggle('hidden');
}

// Touch Handling
let touchStartX = 0;
let touchStartY = 0;
let touchTicketId = null;
let touchElement = null;

export function handleTouchStart(event, ticketId) {
  touchTicketId = ticketId;
  touchElement = event.currentTarget;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchElement.classList.add('opacity-75', 'scale-95');

  store.draggedTicket = store.allTickets.find(t => t.id === ticketId);
}

export function handleTouchMove(event) {
  if (!touchTicketId) return;
  event.preventDefault();
  const touch = event.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);
  if (deltaX > 20 || deltaY > 20) {
    touchElement.classList.add('dragging');
  }
}

export function handleTouchEnd(event) {
  if (!touchTicketId || !touchElement) return;
  const touch = event.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  let dropTarget = targetElement;
  while (dropTarget && !dropTarget.classList.contains('kanban-column')) {
    dropTarget = dropTarget.parentElement;
  }

  if (dropTarget) {
    const newStatus = dropTarget.dataset.status;
    const newEngineerId = dropTarget.dataset.engineer;

    if (newStatus) handleDrop({ preventDefault: () => { } }, newStatus);
    else if (newEngineerId) handleEngineerDrop({ preventDefault: () => { } }, parseInt(newEngineerId));
  }

  touchElement.classList.remove('opacity-75', 'scale-95', 'dragging');
  touchTicketId = null;
  touchElement = null;
}

// ==================== Date Selection Logic ====================
// ==================== Date Selection Logic ====================
export function handlePeriodChange(period) {
  const now = new Date();
  let startDate, endDate;

  // Sync Selectors
  const desktopSelector = document.getElementById('periodSelector');
  const mobileSelector = document.getElementById('periodSelectorMobile');

  if (desktopSelector && desktopSelector.value !== period) desktopSelector.value = period;
  if (mobileSelector && mobileSelector.value !== period) mobileSelector.value = period;

  if (period === 'custom') {
    const modal = document.getElementById('dateRangeModal');
    console.log('Custom period selected, modal element:', modal);
    if (modal) {
      modal.classList.remove('hidden');
      // Ensure modal is visible by checking parent visibility
      modal.style.display = 'block';
    } else {
      console.error('dateRangeModal not found in DOM');
      showNotification('날짜 선택 모달을 찾을 수 없습니다. 페이지를 새로고침해주세요.', 'error');
    }
    return; // Wait for user custom input
  }

  if (period === 'current') {
    // Use existing week logic
    const week = getCurrentWeek();
    startDate = formatDate(week.start);
    endDate = formatDate(week.end);
  } else if (period === '1m') {
    endDate = formatDate(now);
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    startDate = formatDate(start);
  } else if (period === '3m') {
    endDate = formatDate(now);
    const start = new Date(now);
    start.setMonth(now.getMonth() - 3);
    startDate = formatDate(start);
  }

  // Update Store & Reload
  store.startDate = startDate;
  store.endDate = endDate;

  // Close modal if open (just in case)
  closeDateRangeModal();

  loadTickets();
}

export function closeDateRangeModal() {
  const modal = document.getElementById('dateRangeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = '';
  }
}

export function applyCustomDate() {
  const startInput = document.getElementById('customStartDate');
  const endInput = document.getElementById('customEndDate');

  if (!startInput.value || !endInput.value) {
    showNotification('시작일과 종료일을 모두 선택해주세요.', 'error');
    return;
  }

  if (startInput.value > endInput.value) {
    showNotification('시작일은 종료일보다 이전이어야 합니다.', 'error');
    return;
  }

  store.startDate = startInput.value;
  store.endDate = endInput.value;

  closeDateRangeModal();
  loadTickets();
}

// ==================== Edit Mode Logic ====================
export function enableEditMode(ticket) {
  const contentEl = document.getElementById('ticketDetailContent');

  // Toggle Buttons
  document.getElementById('btnTicketEdit').classList.add('hidden');
  document.getElementById('btnTicketDelete').classList.add('hidden');
  document.getElementById('btnTicketClose').classList.add('hidden');
  document.getElementById('btnTicketSave').classList.remove('hidden');
  document.getElementById('btnTicketCancel').classList.remove('hidden');

  // Render Form
  contentEl.innerHTML = `
    <form id="editTicketForm" class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700">제목</label>
        <input type="text" name="title" value="${ticket.title}" class="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500" required>
      </div>

      <!-- Grid for selects -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">DBMS</label>
          <select name="dbms_type" class="w-full border rounded px-3 py-2 mt-1">
             ${['MySQL', 'PostgreSQL', 'MariaDB', 'MongoDB', 'Redis', 'SingleStore', 'HeatWave', 'EDB'].map(t =>
    `<option value="${t}" ${t === ticket.dbms_type ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700">심각도</label>
           <select name="severity" class="w-full border rounded px-3 py-2 mt-1">
              <option value="critical" ${ticket.severity === 'critical' ? 'selected' : ''}>Critical</option>
              <option value="high" ${ticket.severity === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${ticket.severity === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${ticket.severity === 'low' ? 'selected' : ''}>Low</option>
           </select>
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700">우선순위</label>
           <select name="priority" class="w-full border rounded px-3 py-2 mt-1">
              ${[1, 2, 3, 4, 5].map(p => `<option value="${p}" ${p === ticket.priority ? 'selected' : ''}>P${p}</option>`).join('')}
           </select>
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700">작업 카테고리</label>
           <select name="work_category" class="w-full border rounded px-3 py-2 mt-1">
              ${['장애대응', '성능튜닝', '아키텍처설계', '정기점검', '패치/업그레이드', '기술 미팅', '마이그레이션', 'Documentation'].map(c =>
      `<option value="${c}" ${c === ticket.work_category ? 'selected' : ''}>${c}</option>`).join('')}
           </select>
        </div>
      </div>

      <!-- Instance Info -->
      <div class="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 class="font-medium text-sm text-gray-700">인스턴스 정보</h4>
        <div class="grid grid-cols-2 gap-4">
           <div>
              <label class="block text-xs text-gray-500">Host</label>
              <input type="text" name="instance_host" value="${ticket.instance_host || ''}" class="w-full border rounded px-2 py-1 text-sm">
           </div>
           <div>
              <label class="block text-xs text-gray-500">Env</label>
              <select name="instance_env" class="w-full border rounded px-2 py-1 text-sm">
                 <option value="prod" ${ticket.instance_env === 'prod' ? 'selected' : ''}>Prod</option>
                 <option value="stg" ${ticket.instance_env === 'stg' ? 'selected' : ''}>Stg</option>
                 <option value="dev" ${ticket.instance_env === 'dev' ? 'selected' : ''}>Dev</option>
              </select>
           </div>
           <div>
              <label class="block text-xs text-gray-500">Version</label>
              <input type="text" name="instance_version" value="${ticket.instance_version || ''}" class="w-full border rounded px-2 py-1 text-sm">
           </div>
           <div>
              <label class="block text-xs text-gray-500">SLA (분)</label>
              <input type="number" name="sla_minutes" value="${ticket.sla_minutes || ''}" class="w-full border rounded px-2 py-1 text-sm">
           </div>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700">설명</label>
        <textarea name="description" rows="5" class="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500">${ticket.description || ''}</textarea>
      </div>
    </form>
  `;
}

export async function saveTicketChanges(ticketId) {
  const form = document.getElementById('editTicketForm');
  if (!form) return;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Type conversions
  if (data.sla_minutes) data.sla_minutes = parseInt(data.sla_minutes);
  if (data.priority) data.priority = parseInt(data.priority);

  try {
    await API.updateTicket(ticketId, data);
    showNotification('티켓이 수정되었습니다.', 'success');
    // Reload View Mode
    await openTicketDetail(ticketId);
    // Reload Board to reflect changes (e.g. title/priority)
    await loadTickets();
  } catch (e) {
    console.error('수정 실패:', e);
    showNotification('수정 실패: ' + e.message, 'error');
  }
}

// ==================== User Info & Password Change ====================
export function openUserInfoModal() {
  const modal = document.getElementById('userInfoModal');
  if (!modal) return;

  // Use server-rendered username from window object
  const username = window.CURRENT_USER_USERNAME || '-';

  // Populate info
  const userNameEl = document.getElementById('modalUserName');
  if (userNameEl) userNameEl.textContent = window.CURRENT_USER_NAME || username;

  const userEmailEl = document.getElementById('modalUserEmail');
  if (userEmailEl) userEmailEl.textContent = username;

  modal.classList.remove('hidden');
}

export function closeUserInfoModal() {
  const modal = document.getElementById('userInfoModal');
  if (modal) modal.classList.add('hidden');
  const form = document.getElementById('changePasswordForm');
  if (form) form.reset();
}

// Bind password change form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('changePasswordForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPassword = document.getElementById('oldPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('newPasswordConfirm').value;

      if (newPassword !== confirmPassword) {
        showNotification('새 비밀번호가 일치하지 않습니다.', 'error');
        return;
      }

      try {
        const response = await API.changePassword(oldPassword, newPassword);
        // Handle standardized response format
        if (response.success) {
          const message = response.data?.message || '비밀번호가 성공적으로 변경되었습니다.';
          showNotification(message, 'success');
          closeUserInfoModal();
        } else {
          showNotification(response.error || '비밀번호 변경 실패', 'error');
        }
      } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        // Extract error from standardized response or fallback
        const errorMsg = error.response?.data?.error || error.response?.data?.message || '비밀번호 변경 실패';
        showNotification(errorMsg, 'error');
      }
    });
  }

  // Bind User Profile Trigger
  const profileTrigger = document.getElementById('userProfileTrigger');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
      openUserInfoModal();
    });
  }
});

// Expose to window for onclick
window.openUserInfoModal = openUserInfoModal;
window.closeUserInfoModal = closeUserInfoModal;
