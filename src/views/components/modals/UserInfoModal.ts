
export const UserInfoModal = () => {
    return `
    <!-- User Info & Password Change Modal -->
    <div id="userInfoModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[100]">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900">내 정보</h3>
                <button onclick="closeUserProfile()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-6">
                <!-- Info Section -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="mb-2">
                        <label class="block text-xs text-gray-500">이름 (Display Name)</label>
                        <p class="font-medium text-gray-800" id="modalUserName">-</p>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500">아이디 (Username)</label>
                        <p class="font-medium text-gray-800" id="modalUserEmail">-</p>
                    </div>
                </div>

                <!-- Password Change Form -->
                <div class="border-t pt-4">
                    <h4 class="text-sm font-bold text-gray-700 mb-3">비밀번호 변경</h4>
                    <form id="changePasswordForm" class="space-y-3">
                        <div>
                            <input type="password" id="oldPassword" placeholder="현재 비밀번호" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                        </div>
                        <div>
                            <input type="password" id="newPassword" placeholder="새 비밀번호" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                        </div>
                        <div>
                            <input type="password" id="newPasswordConfirm" placeholder="새 비밀번호 확인" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition text-sm">
                            비밀번호 변경
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `
}
