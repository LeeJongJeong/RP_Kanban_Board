export const getAdminPage = (currentUser: any) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 페이지 - RP Kanban Board</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-user-shield text-blue-600"></i> 관리자 페이지
                </h1>
                <p class="text-gray-500 mt-1">사용자 계정을 관리합니다</p>
            </div>
            <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">
                <i class="fas fa-arrow-left"></i> 메인으로
            </a>
        </header>

        <!-- 사용자 관리 섹션 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">사용자 관리</h2>
                <button onclick="openCreateUserModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-user-plus"></i> 사용자 추가
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full" id="usersTable">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="p-3 text-left font-semibold">아이디</th>
                            <th class="p-3 text-left font-semibold">이름</th>
                            <th class="p-3 text-left font-semibold">직급</th>
                            <th class="p-3 text-left font-semibold">역할</th>
                            <th class="p-3 text-left font-semibold">상태</th>
                            <th class="p-3 text-left font-semibold">생성일</th>
                            <th class="p-3 text-center font-semibold">작업</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr>
                            <td colspan="6" class="p-4 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i> 로딩 중...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 사용자 생성/수정 모달 -->
    <div id="userModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold" id="modalTitle">사용자 추가</h3>
                    <button onclick="closeUserModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="userForm" class="space-y-4">
                    <input type="hidden" id="userId">
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">아이디 *</label>
                        <input type="text" id="username" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">이름 (Display Name)</label>
                        <input type="text" id="displayName" placeholder="이름을 입력하세요" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">직급</label>
                        <input type="text" id="jobTitle" placeholder="예: 팀장, 수석, 매니저" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    
                    <div id="passwordField">
                        <label class="block text-sm font-medium mb-1">비밀번호 *</label>
                        <input type="password" id="password" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        <p class="text-xs text-gray-500 mt-1">최소 8자 이상</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">역할 *</label>
                        <select id="role" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="user">일반 사용자</option>
                            <option value="admin">관리자</option>
                        </select>
                    </div>
                    

                    
                    <div class="flex items-center">
                        <input type="checkbox" id="isActive" checked class="mr-2">
                        <label for="isActive" class="text-sm font-medium">계정 활성화</label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeUserModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">취소</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">저장</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="/static/js/admin.js"></script>
</body>
</html>
`
