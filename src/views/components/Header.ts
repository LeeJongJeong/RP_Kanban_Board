
export const Header = (currentUserEngineerName: string | null, currentUserRole: string) => {
    return `
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
    `
}
