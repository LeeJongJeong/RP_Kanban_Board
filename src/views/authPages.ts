export const getLoginPage = () => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 - RP Kanban Board</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div class="text-center mb-8">
            <i class="fas fa-database text-blue-600 text-4xl mb-4"></i>
            <h1 class="text-2xl font-bold text-gray-800">RP Kanban Board</h1>
            <p class="text-gray-500 mt-2">서비스 이용을 위해 로그인해주세요.</p>
        </div>

        <form id="loginForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                <input type="text" id="username" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input type="password" id="password" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div id="errorMessage" class="hidden text-red-500 text-sm text-center"></div>
            
            <div class="flex items-center mb-4">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer">
                <label for="remember-me" class="ml-2 block text-sm text-gray-700 cursor-pointer">
                    로그인 상태 유지
                </label>
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                로그인
            </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
            계정이 없으신가요? <a href="/register" class="text-blue-600 hover:underline font-medium">회원가입</a>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            const errorDiv = document.getElementById('errorMessage');

            try {
                const response = await axios.post('/api/auth/login', { username, password, rememberMe });
                // Handle standardized response format
                if (response.data.success) {
                    window.location.href = '/';
                } else {
                    errorDiv.textContent = response.data.error || '로그인에 실패했습니다.';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = error.response?.data?.error || '로그인에 실패했습니다.';
                errorDiv.classList.remove('hidden');
            }
        });
    </script>
</body>
</html>
`

export const getRegisterPage = () => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입 - RP Kanban Board</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div class="text-center mb-8">
            <i class="fas fa-user-plus text-green-600 text-4xl mb-4"></i>
            <h1 class="text-2xl font-bold text-gray-800">회원가입</h1>
            <p class="text-gray-500 mt-2">새로운 계정을 생성합니다.</p>
        </div>

        <form id="registerForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                <input type="text" id="username" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">이름 (표시명)</label>
                <input type="text" id="engineerName" placeholder="홍길동" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input type="password" id="password" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input type="password" id="passwordConfirm" required class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div id="errorMessage" class="hidden text-red-500 text-sm text-center"></div>
            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                가입하기
            </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
            이미 계정이 있으신가요? <a href="/login" class="text-green-600 hover:underline font-medium">로그인</a>
        </div>
    </div>

    <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const engineer_name = document.getElementById('engineerName').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('passwordConfirm').value;
            const errorDiv = document.getElementById('errorMessage');

            if (password !== passwordConfirm) {
                errorDiv.textContent = '비밀번호가 일치하지 않습니다.';
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                const response = await axios.post('/api/auth/register', { username, password, engineer_name });
                // Handle standardized response format
                if (response.data.success) {
                    alert('가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
                    window.location.href = '/login';
                } else {
                    errorDiv.textContent = response.data.error || '회원가입에 실패했습니다.';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = error.response?.data?.error || '회원가입에 실패했습니다.';
                errorDiv.classList.remove('hidden');
            }
        });
    </script>
</body>
</html>
`
