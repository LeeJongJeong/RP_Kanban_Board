/**
 * Manual migration script for adding user roles
 * Run this with: node scripts/migrate-user-roles.js
 */

async function runMigration() {
    console.log('⚠️  마이그레이션 안내');
    console.log('');
    console.log('이 스크립트는 로컬 개발 환경에서만 작동합니다.');
    console.log('프로덕션 환경에서는 Cloudflare Dashboard를 사용하세요.');
    console.log('');
    console.log('다음 SQL을 D1 데이터베이스에서 실행해야 합니다:');
    console.log('');
    console.log('-- users 테이블에 필드 추가');
    console.log('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT \'user\';');
    console.log('ALTER TABLE users ADD COLUMN engineer_id INTEGER;');
    console.log('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;');
    console.log('');
    console.log('-- 기존 사용자를 관리자로 승격 (username 변경 필요)');
    console.log('UPDATE users SET role = \'admin\' WHERE username = \'YOUR_USERNAME\';');
    console.log('');
    console.log('📋 실행 방법:');
    console.log('');
    console.log('1. 개발 서버 중단');
    console.log('2. .wrangler/state/v3/d1/ 폴더에서 SQLite 파일 찾기');
    console.log('3. sqlite3 명령으로 파일 열기');
    console.log('4. 위의 SQL 명령 실행');
    console.log('5. 개발 서버 재시작');
    console.log('');
    console.log('또는 Cloudflare Dashboard에서:');
    console.log('1. D1 → kanban-db 선택');
    console.log('2. Console 탭에서 SQL 실행');
}

runMigration();
