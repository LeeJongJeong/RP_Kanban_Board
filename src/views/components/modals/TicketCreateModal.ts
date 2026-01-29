
export const TicketCreateModal = () => {
    return `
    <!-- 티켓 생성 모달 -->
    <div id="newTicketModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4 py-8 sm:px-8 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8 max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="p-4 sm:p-6">
                <div class="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 class="text-xl sm:text-2xl font-bold">새 티켓 생성</h2>
                    <button onclick="closeNewTicketModal()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="newTicketForm" class="space-y-4">

                    <div>
                        <label class="block text-sm font-medium mb-1">제목 *</label>
                        <input type="text" name="title" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">설명</label>
                        <textarea name="description" rows="3" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">DBMS 유형 *</label>
                            <select name="dbms_type" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="MySQL">MySQL</option>
                                <option value="PostgreSQL">PostgreSQL</option>
                                <option value="MariaDB">MariaDB</option>
                                <option value="MongoDB">MongoDB</option>
                                <option value="Redis">Redis</option>
                                <option value="SingleStore">SingleStore</option>
                                <option value="HeatWave">HeatWave</option>
                                <option value="EDB">EDB</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">작업 카테고리 *</label>
                            <select name="work_category" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="장애대응">장애대응</option>
                                <option value="성능튜닝">성능튜닝</option>
                                <option value="아키텍처설계">아키텍처설계</option>
                                <option value="정기점검">정기점검</option>
                                <option value="패치업그레이드">패치/업그레이드</option>
                                <option value="기술 미팅">기술 미팅</option>
                                <option value="마이그레이션">마이그레이션</option>
                                <option value="Documentation">Documentation</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">심각도 *</label>
                            <select name="severity" required class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium" selected>Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">우선순위</label>
                            <select name="priority" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="1">1 - 최우선</option>
                                <option value="2">2 - 높음</option>
                                <option value="3" selected>3 - 보통</option>
                                <option value="4">4 - 낮음</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">호스트 IP</label>
                            <input type="text" name="instance_host" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">환경</label>
                            <select name="instance_env" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="prod">Production</option>
                                <option value="stg">Staging</option>
                                <option value="dev">Development</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">버전</label>
                            <input type="text" name="instance_version" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">SLA (분)</label>
                            <input type="number" name="sla_minutes" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">담당자</label>
                            <select name="assigned_to" id="assignedToSelect" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">미할당</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeNewTicketModal()" class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">취소</button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">생성</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
}
