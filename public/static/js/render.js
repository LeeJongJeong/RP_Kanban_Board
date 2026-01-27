import { store } from './store.js';
import { STATUS_LABELS, SEVERITY_COLORS, DBMS_ICONS, getSLAStatus } from './utils.js';

export function renderKanbanBoard() {
  const board = document.getElementById('kanbanBoard');
  if (!board) return;

  // 데이터 없음 처리 (모바일/데스크톱 공통)
  if (store.allTickets.length === 0) {
    board.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-gray-400 w-full sm:col-span-2 lg:col-span-4">
                <i class="fas fa-inbox text-5xl mb-4 text-gray-300"></i>
                <p class="text-lg">해당 기간에 조회된 데이터가 없습니다.</p>
                <p class="text-sm mt-2">기간을 변경하거나 새 티켓을 생성해보세요.</p>
            </div>
        `;
    return;
  }

  if (store.currentView === 'status') {
    renderStatusView(board);
  } else if (store.currentView === 'engineer') {
    renderEngineerView(board);
  } else if (store.currentView === 'dbms') {
    renderDBMSView(board);
  }
}

function renderStatusView(board) {
  const statuses = ['todo', 'in_progress', 'review', 'done'];

  board.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 min-w-min">
      ${statuses.map(status => {
    const tickets = store.allTickets.filter(t => t.status === status);
    return `
          <div class="kanban-column bg-white rounded-lg shadow-sm p-3 sm:p-4 min-w-[280px] sm:min-w-0" 
               data-status="${status}"
               ondrop="handleDrop(event, '${status}')"
               ondragover="handleDragOver(event)"
               ondragleave="handleDragLeave(event)">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h3 class="font-bold text-base sm:text-lg text-gray-700">
                ${STATUS_LABELS[status]}
              </h3>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                ${tickets.length}
              </span>
            </div>
            <div class="space-y-2 sm:space-y-3">
              ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function renderEngineerView(board) {
  board.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      ${store.allEngineers.map(engineer => {
    const tickets = store.allTickets.filter(t => t.assigned_to === engineer.id && t.status !== 'done');
    const wipPercentage = engineer.wip_limit > 0 ? (tickets.length / engineer.wip_limit * 100).toFixed(0) : 0;
    const wipColor = wipPercentage >= 100 ? 'text-red-600' : wipPercentage >= 80 ? 'text-orange-600' : 'text-green-600';

    return `
          <div class="kanban-column bg-white rounded-lg shadow-sm p-3 sm:p-4 min-w-[280px] sm:min-w-0"
               data-engineer="${engineer.id}"
               ondrop="handleEngineerDrop(event, ${engineer.id})"
               ondragover="handleDragOver(event)"
               ondragleave="handleDragLeave(event)">
            <div class="mb-3 sm:mb-4">
              <h3 class="font-bold text-base sm:text-lg text-gray-700">${engineer.name}</h3>
              <p class="text-xs sm:text-sm text-gray-500">${engineer.role}</p>
              <div class="mt-2 flex items-center space-x-2">
                <span class="${wipColor} font-semibold text-sm">${tickets.length} / ${engineer.wip_limit}</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min(wipPercentage, 100)}%"></div>
                </div>
              </div>
            </div>
            <div class="space-y-2 sm:space-y-3">
              ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function renderDBMSView(board) {
  const dbmsTypes = [...new Set(store.allTickets.map(t => t.dbms_type))];

  board.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      ${dbmsTypes.map(dbms => {
    const tickets = store.allTickets.filter(t => t.dbms_type === dbms && t.status !== 'done');
    return `
          <div class="kanban-column bg-white rounded-lg shadow-sm p-3 sm:p-4 min-w-[280px] sm:min-w-0"
               ondrop="return false" 
               ondragover="return false"> 
            <!-- Note: DBMS view might not support drag to change DBMS usually, keeping simple -->
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h3 class="font-bold text-base sm:text-lg text-gray-700 flex items-center space-x-2">
                <i class="fas ${DBMS_ICONS[dbms] || 'fa-database'} text-blue-600"></i>
                <span>${dbms}</span>
              </h3>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                ${tickets.length}
              </span>
            </div>
            <div class="space-y-2 sm:space-y-3">
              ${tickets.map(ticket => renderTicketCard(ticket)).join('')}
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function renderTicketCard(ticket) {
  const severityClass = SEVERITY_COLORS[ticket.severity] || 'severity-medium';
  const slaStatus = getSLAStatus(ticket);

  return `
    <div class="ticket-card bg-white border rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
         draggable="true"
         data-ticket-id="${ticket.id}"
         ondragstart="handleDragStart(event, ${ticket.id})"
         ondragend="handleDragEnd(event)"
         onclick="openTicketDetail(${ticket.id})"
         ontouchstart="handleTouchStart(event, ${ticket.id})"
         ontouchmove="handleTouchMove(event)"
         ontouchend="handleTouchEnd(event)">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center space-x-1 sm:space-x-2 flex-1 flex-wrap gap-1">
          <span class="text-[10px] sm:text-xs font-semibold ${severityClass} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
            ${ticket.severity.toUpperCase()}
          </span>
          <span class="text-[10px] sm:text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
            ${ticket.dbms_type}
          </span>
        </div>
        <span class="text-[10px] sm:text-xs text-gray-500 ml-1">
          #${ticket.id}
        </span>
      </div>
      
      <h4 class="font-semibold text-sm sm:text-base text-gray-800 mb-2 line-clamp-2">${ticket.title}</h4>
      
      <div class="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">
        <i class="fas fa-tag"></i>
        <span class="truncate">${ticket.work_category}</span>
      </div>
      
      ${ticket.instance_host ? `
        <div class="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">
          <i class="fas fa-server"></i>
          <span class="truncate">${ticket.instance_host} (${ticket.instance_env})</span>
        </div>
      ` : ''}
      
      ${slaStatus ? `
        <div class="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs mb-1 sm:mb-2 ${slaStatus.colorClass}">
          <i class="fas fa-clock"></i>
          <span class="truncate">${slaStatus.text}</span>
        </div>
      ` : ''}
      
      ${ticket.assigned_to_name ? `
        <div class="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-gray-600 mt-2 sm:mt-3 pt-2 border-t">
          <i class="fas fa-user"></i>
          <span class="truncate">${ticket.assigned_to_name}</span>
        </div>
      ` : `
        <div class="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3 pt-2 border-t">
          <i class="fas fa-user-slash"></i>
          <span>미할당</span>
        </div>
      `}
    </div>
  `;
}
