// Admin page functionality

let engineers = [];
let users = [];
let editingUserId = null;

// Load users on page load
document.addEventListener('DOMContentLoaded', async () => {
    // await loadEngineers(); // No longer needed
    await loadUsers();
});


// function updateEngineerDropdown() { ... } // Removed


// Load users
async function loadUsers() {
    try {
        const response = await axios.get('/api/admin/users');
        if (response.data.success) {
            users = response.data.data;
            renderUsers();
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        showError('사용자 목록을 불러오지 못했습니다.');
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-4 text-center text-gray-500">
          등록된 사용자가 없습니다.
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = users.map(user => `
    <tr class="border-b hover:bg-gray-50">
      <td class="p-3">${user.username}</td>
      <td class="p-3 font-medium text-gray-700">${user.display_name || user.engineer_name || user.username}</td>
      <td class="p-3">
        <span class="px-2 py-1 rounded text-sm ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
          ${user.role === 'admin' ? '관리자' : '사용자'}
        </span>
      </td>
      <td class="p-3">${user.job_title || '-'}</td>
      <td class="p-3">
        <span class="px-2 py-1 rounded text-sm ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          ${user.is_active ? '활성' : '비활성'}
        </span>
      </td>
      <td class="p-3 text-sm">${new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
      <td class="p-3 text-center">
        <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-800 mx-1" title="수정">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="toggleUserStatus(${user.id}, ${user.is_active})" class="text-yellow-600 hover:text-yellow-800 mx-1" title="${user.is_active ? '비활성화' : '활성화'}">
          <i class="fas fa-toggle-${user.is_active ? 'on' : 'off'}"></i>
        </button>
        <button onclick="resetPassword(${user.id})" class="text-purple-600 hover:text-purple-800 mx-1" title="비밀번호 리셋">
          <i class="fas fa-key"></i>
        </button>
        <button onclick="deleteUser(${user.id}, '${user.username}')" class="text-red-600 hover:text-red-800 mx-1" title="삭제">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Open create user modal
function openCreateUserModal() {
    document.getElementById('modalTitle').textContent = '사용자 추가';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('username').disabled = false;
    document.getElementById('displayName').value = '';
    document.getElementById('jobTitle').value = '';
    document.getElementById('passwordField').classList.remove('hidden');
    document.getElementById('password').required = true;
    document.getElementById('userModal').classList.remove('hidden');
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    editingUserId = userId;
    document.getElementById('modalTitle').textContent = '사용자 수정';
    document.getElementById('userId').value = userId;
    document.getElementById('username').value = user.username;
    document.getElementById('username').disabled = true;
    document.getElementById('displayName').value = user.display_name || '';
    document.getElementById('jobTitle').value = user.job_title || '';
    document.getElementById('role').value = user.role;
    // document.getElementById('engineerId').value = user.engineer_id || '';
    document.getElementById('isActive').checked = user.is_active === 1;

    // Hide password field when editing
    document.getElementById('passwordField').classList.add('hidden');
    document.getElementById('password').required = false;

    document.getElementById('userModal').classList.remove('hidden');
}

// Close modal
function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    editingUserId = null;
}

// Handle form submission
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const displayName = document.getElementById('displayName').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    // const engineerId = document.getElementById('engineerId').value || null; // Removed
    const isActive = document.getElementById('isActive').checked ? 1 : 0;

    try {
        if (editingUserId) {
            // Update user
            await axios.put(`/api/admin/users/${editingUserId}`, {
                role,
                // engineer_id: engineerId,
                is_active: isActive,
                display_name: displayName,
                job_title: jobTitle
            });
            showSuccess('사용자가 수정되었습니다.');
        } else {
            // Create user
            await axios.post('/api/admin/users', {
                username,
                password,
                role,
                // engineer_id: engineerId,
                display_name: displayName,
                job_title: jobTitle
            });
            showSuccess('사용자가 생성되었습니다.');
        }

        closeUserModal();
        await loadUsers();
    } catch (error) {
        console.error('Failed to save user:', error);
        const message = error.response?.data?.error || '사용자 저장에 실패했습니다.';
        showError(message);
    }
});

// Toggle user status
async function toggleUserStatus(userId, currentStatus) {
    const user = users.find(u => u.id === userId);
    const newStatus = currentStatus ? 0 : 1;

    if (!confirm(`${user.username} 계정을 ${newStatus ? '활성화' : '비활성화'}하시겠습니까?`)) {
        return;
    }

    try {
        await axios.put(`/api/admin/users/${userId}`, {
            role: user.role,
            engineer_id: user.engineer_id,
            is_active: newStatus
        });
        showSuccess(`계정이 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
        await loadUsers();
    } catch (error) {
        console.error('Failed to toggle status:', error);
        showError('상태 변경에 실패했습니다.');
    }
}

// Reset password
async function resetPassword(userId) {
    const user = users.find(u => u.id === userId);
    const newPassword = prompt(`${user.username}의 새 비밀번호를 입력하세요 (최소 8자):`);

    if (!newPassword) return;

    if (newPassword.length < 8) {
        showError('비밀번호는 최소 8자 이상이어야 합니다.');
        return;
    }

    try {
        await axios.put(`/api/admin/users/${userId}/reset-password`, {
            new_password: newPassword
        });
        showSuccess('비밀번호가 리셋되었습니다.');
    } catch (error) {
        console.error('Failed to reset password:', error);
        showError('비밀번호 리셋에 실패했습니다.');
    }
}

// Delete user
async function deleteUser(userId, username) {
    if (!confirm(`정말로 ${username} 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }

    try {
        await axios.delete(`/api/admin/users/${userId}`);
        showSuccess('사용자가 삭제되었습니다.');
        await loadUsers();
    } catch (error) {
        console.error('Failed to delete user:', error);
        const message = error.response?.data?.error || '사용자 삭제에 실패했습니다.';
        showError(message);
    }
}

// Notification helpers
function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

// Close modal on backdrop click
document.getElementById('userModal').addEventListener('click', (e) => {
    if (e.target.id === 'userModal') {
        closeUserModal();
    }
});
