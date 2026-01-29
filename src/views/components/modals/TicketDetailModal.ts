
export const TicketDetailModal = () => {
    return `
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
    `
}
