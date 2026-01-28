-- 마이그레이션 SQL 명령어
-- 이 파일의 내용을 Cloudflare Dashboard D1 Console에서 실행하거나
-- 로컬 SQLite 도구로 실행하세요

-- Step 1: users 테이블에 새 컬럼 추가
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN engineer_id INTEGER;
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Step 2: 기존 사용자를 관리자로 승격 (사용자 이름을 실제 값으로 변경)
-- UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME_HERE';

-- 또는 새 관리자 계정 생성 (비밀번호: admin123)
-- INSERT INTO users (username, password, role, is_active) 
-- VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 1);
