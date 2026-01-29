
export const WeekPickerModal = () => {
    return `
    <!-- 주차 선택 모달 -->
    <div id="weekPickerModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 py-8 sm:py-12 overflow-y-auto" onclick="if(event.target === this) closeWeekPicker()">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-md my-8" onclick="event.stopPropagation()">
            <div class="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                <h3 class="text-xl font-bold text-gray-800">주차 선택</h3>
            </div>
            <div class="p-4 sm:p-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">시작일 (월요일)</label>
                        <input type="date" id="customWeekStart" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button onclick="closeWeekPicker()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">취소</button>
                        <button onclick="applyCustomWeek()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">적용</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}
