
export const SlaRiskModal = () => {
    return `
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
    `
}
