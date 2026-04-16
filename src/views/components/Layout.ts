
export const Layout = (
    meta: {
        currentUserEngineerId: number | null,
        currentUserEngineerName: string | null,
        currentUserRole: string,
        currentUsername: string
    },
    content: string
) => {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RP Kanban Board</title>
        <script>
            window.CURRENT_USER_ENGINEER_ID = ${meta.currentUserEngineerId};
            window.CURRENT_USER_NAME = "${meta.currentUserEngineerName || ''}";
            window.CURRENT_USER_ROLE = "${meta.currentUserRole}";
            window.CURRENT_USER_USERNAME = "${meta.currentUsername}";
            // Debug info
            console.log('Current User:', "${meta.currentUsername}", 'Name:', "${meta.currentUserEngineerName}", 'Role:', "${meta.currentUserRole}");
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
          
          /* 상태별 티켓 색상 */
          .status-todo { background-color: #f9fafb; border-left: 4px solid #9ca3af !important; }
          .status-in_progress { background-color: #eff6ff; border-left: 4px solid #3b82f6 !important; }
          .status-review { background-color: #faf5ff; border-left: 4px solid #a855f7 !important; }
          .status-done { background-color: #f0fdf4; border-left: 4px solid #22c55e !important; }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app">
            ${content}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        
        <!-- Frontend Modular Scripts -->
        <script src="/static/app.js" type="module"></script>
        
        <!-- Robust Inline Script for Modal -->
        <script>
            // Define globally to ensure availability
            window.openUserProfile = function() {
                console.log('openUserProfile (inline) triggered');
                var modal = document.getElementById('userInfoModal');
                if (!modal) {
                    console.error('Modal element not found');
                    return;
                }
                
                var username = window.CURRENT_USER_USERNAME || '-';
                
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
            
            // Backward compatibility
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
                }
            });
        </script>
    </body>
    </html>
    `
}
