
export const DashboardModal = () => {
    return `
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
    `
}
