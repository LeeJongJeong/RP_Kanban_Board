# 마이그레이션 실행 가이드

## 현재 상황

SQLite3 CLI가 설치되어 있지 않아 자동 마이그레이션이 불가능합니다.
다음 중 한 가지 방법을 선택하여 수동으로 마이그레이션을 진행하세요.

---

## ✅ 방법 1: Wrangler CLI 사용 (권장)

개발 서버를 **중단**하고 실행:

```powershell
# 개발 서버 중단 (Ctrl+C)
npx wrangler d1 execute kanban-db --local --command="ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';"
npx wrangler d1 execute kanban-db --local --command="ALTER TABLE users ADD COLUMN engineer_id INTEGER;"
npx wrangler d1 execute kanban-db --local --command="ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;"
```

그 후 개발 서버 재시작:
```powershell
npm run dev:sandbox
```

---

## ✅ 방법 2: Cloudflare Dashboard 사용 (프로덕션)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속
2. **D1** 섹션 선택
3. `kanban-db` 데이터베이스 선택
4. **Console** 탭으로 이동
5. 다음 SQL 실행:

```sql
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN engineer_id INTEGER;
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;
```

---

## ✅ 방법 3: SQLite 도구 설치 후 실행 (고급)

### SQLite 설치:
```powershell
# Chocolatey 사용
choco install sqlite

# 또는 수동 다운로드
# https://www.sqlite.org/download.html
```

### 마이그레이션 실행:
```powershell
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/e993b053914139252fc8763f76a28fcc45d9848e0dfb3ece0dfd1e73808a52de.sqlite < migrations/MANUAL_MIGRATION_GUIDE.sql
```

---

## 관리자 계정 생성

마이그레이션 완료 후 관리자 계정을 만드세요:

### Option A: 기존 계정 승격
```sql
UPDATE users SET role = 'admin' WHERE username = '기존사용자명';
```

### Option B: 새 관리자 계정 생성 (비밀번호: admin123)
```sql
INSERT INTO users (username, password, role, is_active) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 1);
```

---

## 검증

마이그레이션 성공 확인:

```sql
-- 테이블 구조 확인
PRAGMA table_info(users);

-- 관리자 계정 확인
SELECT username, role, is_active FROM users WHERE role = 'admin';
```

---

## 🚀 테스트

1. 브라우저에서 로그인 페이지 접속
2. 관리자 계정으로 로그인
3. 헤더에 "관리자" 버튼 확인
4. `/admin` 페이지로 이동
5. 사용자 관리 기능 테스트

---

## 문제 해결

### "duplicate column name" 에러
이미 마이그레이션이 실행되었습니다. 건너뛰세요.

### 로그인 후 "관리자" 버튼이 보이지 않음
JWT 토큰을 재발급받기 위해 재로그인하세요.

### 403 Forbidden
사용자의 role이 'admin'인지 확인하세요.
