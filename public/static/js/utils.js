export const DBMS_ICONS = {
    'MySQL': 'fa-database',
    'PostgreSQL': 'fa-database',
    'MariaDB': 'fa-database',
    'MongoDB': 'fa-leaf',
    'Redis': 'fa-bolt',
    'SingleStore': 'fa-server',
    'HeatWave': 'fa-fire',
    'EDB': 'fa-database'
};

export const SEVERITY_COLORS = {
    'critical': 'severity-critical',
    'high': 'severity-high',
    'medium': 'severity-medium',
    'low': 'severity-low'
};

export const STATUS_LABELS = {
    'todo': 'To-Do',
    'in_progress': 'In Progress',
    'review': 'Review',
    'done': 'Done'
};

export const STATUS_COLORS = {
    'todo': 'status-todo',
    'in_progress': 'status-in_progress',
    'review': 'status-review',
    'done': 'status-done'
};

export function getCurrentWeek() {
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

export function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getYearWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function showNotification(message, type = 'success') {
    // Simple toast notification implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg transition-opacity duration-300 z-[100] ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Helper to parse DB timestamp as UTC
function parseUTCDate(dateStr) {
    if (!dateStr) return null;
    // If string date looks like 'YYYY-MM-DD HH:MM:SS' without timezone, assume UTC
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
        return new Date(dateStr.replace(' ', 'T') + 'Z');
    }
    return new Date(dateStr);
}

export function formatDateTime(dateStr) {
    const d = parseUTCDate(dateStr);
    if (!d) return '-';
    return d.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export function getSLAStatus(ticket) {
    if (!ticket.sla_minutes || ticket.status === 'done') return null;

    const now = new Date();
    const startTime = parseUTCDate(ticket.started_at || ticket.created_at);

    if (!startTime) return null;

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
