# 프로덕션 배포 가이드

## 📊 현재 데이터 저장 방식

### 개발 환경 (현재)

**데이터베이스**: Cloudflare D1 (SQLite 기반)
- **위치**: `.wrangler/state/v3/d1/` (로컬 파일 시스템)
- **모드**: `--local` 플래그 사용
- **데이터 지속성**: 로컬 개발 환경에만 존재
- **특징**: 
  - 로컬 SQLite 파일로 저장
  - 서버 재시작 시에도 데이터 유지
  - 네트워크 없이 빠른 개발 가능

```bash
# 현재 로컬 데이터베이스 파일 위치
/home/user/webapp/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/...
```

**현재 실행 명령**:
```bash
npx wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000
```

### 데이터 구조

4개의 테이블로 구성:

1. **engineers** (엔지니어 정보)
   - 18명의 DS1T/DS2T 팀원
   - 이름, 이메일, 역할, WIP 제한

2. **tickets** (티켓 정보)
   - 16개의 샘플 티켓
   - 제목, 설명, 상태, DBMS 타입, 심각도, SLA 등

3. **comments** (코멘트)
   - 티켓별 기술 노트 및 해결 방법

4. **ticket_history** (이력)
   - 티켓 상태 변경 히스토리

## 🚀 프로덕션 배포 방법

### ⚠️ **중요: 별도 데이터베이스 준비 불필요!**

Cloudflare D1은 **서버리스 데이터베이스**이므로, 별도의 데이터베이스 서버를 준비할 필요가 **없습니다**.

Cloudflare가 자동으로:
- ✅ 데이터베이스 인스턴스 생성
- ✅ 전 세계 엣지 네트워크에 분산 저장
- ✅ 자동 백업 및 복구
- ✅ 고가용성 보장

### 1단계: Cloudflare API 키 설정

**이미 완료된 경우 스킵 가능**

```bash
# Cloudflare API 키 확인
npx wrangler whoami
```

실패 시:
1. Deploy 탭에서 Cloudflare API 키 설정
2. 또는 `setup_cloudflare_api_key` 도구 실행

### 2단계: 프로덕션 D1 데이터베이스 생성

```bash
# 1. 프로덕션 데이터베이스 생성
npx wrangler d1 create webapp-production

# 출력 예시:
# ✅ Successfully created DB 'webapp-production'!
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "webapp-production"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**중요**: `database_id`를 복사하세요!

### 3단계: wrangler.jsonc 업데이트

복사한 `database_id`를 설정 파일에 추가:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "rp-kanban-board",
  "compatibility_date": "2026-01-25",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "여기에-복사한-database-id-입력"  // ← 여기 수정!
    }
  ]
}
```

### 4단계: 프로덕션 데이터베이스에 스키마 적용

```bash
# 1. 마이그레이션 적용 (스키마 생성)
npx wrangler d1 migrations apply webapp-production

# 프롬프트에서 'y' 입력하여 확인
# ✅ Migration 0001_initial_schema.sql applied successfully
```

### 5단계: (선택사항) 초기 데이터 입력

**옵션 A: 샘플 데이터 사용** (테스트/데모용)
```bash
# seed.sql의 샘플 데이터 입력
npx wrangler d1 execute webapp-production --file=./seed.sql

# ✅ 18명 엔지니어 + 16개 샘플 티켓 생성됨
```

**옵션 B: 빈 데이터베이스로 시작** (실제 운영용)
```bash
# 아무것도 하지 않음
# 사용자가 UI에서 직접 엔지니어 등록 및 티켓 생성
```

**옵션 C: 커스텀 데이터 입력**
```bash
# 1. custom_data.sql 파일 작성
cat > custom_data.sql << 'SQL'
-- 실제 팀원 정보 입력
INSERT INTO engineers (name, email, role, wip_limit) VALUES 
  ('홍길동', 'hong@company.com', 'manager', 5),
  ('김철수', 'kim@company.com', 'engineer', 3);
  -- ... 더 추가
SQL

# 2. 프로덕션 DB에 적용
npx wrangler d1 execute webapp-production --file=./custom_data.sql
```

### 6단계: Cloudflare Pages 프로젝트 생성

```bash
# 1. 프로젝트 생성 (최초 1회만)
npx wrangler pages project create rp-kanban-board \
  --production-branch main \
  --compatibility-date 2026-01-25

# ✅ Created project 'rp-kanban-board'
```

### 7단계: 프로덕션 배포

```bash
# 1. 프로젝트 빌드
npm run build

# 2. Cloudflare Pages에 배포
npx wrangler pages deploy dist --project-name rp-kanban-board

# ✅ 배포 성공!
# 
# 🌍 프로덕션 URL: https://rp-kanban-board.pages.dev
# 🌍 브랜치 URL: https://main.rp-kanban-board.pages.dev
```

### 8단계: 배포 확인

```bash
# 1. 프로덕션 데이터베이스 확인
npx wrangler d1 execute webapp-production --command="SELECT COUNT(*) as engineer_count FROM engineers"

# 2. 브라우저에서 접속
# https://rp-kanban-board.pages.dev
```

## 📋 배포 체크리스트

```
배포 전 확인사항:
□ Cloudflare API 키 설정 완료
□ 프로덕션 D1 데이터베이스 생성
□ wrangler.jsonc에 database_id 설정
□ 마이그레이션 적용 완료
□ 초기 데이터 입력 (선택)
□ 프로젝트 빌드 성공
□ Cloudflare Pages 프로젝트 생성

배포 후 확인사항:
□ 프로덕션 URL 접속 가능
□ 엔지니어 목록 표시 확인
□ 티켓 생성/수정/삭제 테스트
□ 드래그 앤 드롭 작동 확인
□ 대시보드 통계 표시 확인
□ SLA 위험 경고 작동 확인
```

## 🔐 환경 변수 및 시크릿 (선택사항)

향후 API 키 등이 필요한 경우:

```bash
# 시크릿 추가 (예: 외부 API 키)
npx wrangler pages secret put API_KEY --project-name rp-kanban-board

# 시크릿 목록 확인
npx wrangler pages secret list --project-name rp-kanban-board

# 시크릿 삭제
npx wrangler pages secret delete API_KEY --project-name rp-kanban-board
```

## 🌍 커스텀 도메인 연결 (선택사항)

```bash
# 1. 커스텀 도메인 추가
npx wrangler pages domain add kanban.your-domain.com --project-name rp-kanban-board

# 2. DNS 설정
# Cloudflare 대시보드에서 제공하는 CNAME 레코드를 DNS에 추가

# 예시:
# kanban.your-domain.com CNAME rp-kanban-board.pages.dev
```

## 💾 데이터 백업 및 복구

### 백업 방법

```bash
# 1. 프로덕션 데이터베이스 전체 백업
npx wrangler d1 export webapp-production --output=backup-$(date +%Y%m%d).sql

# 2. 특정 테이블만 백업
npx wrangler d1 execute webapp-production \
  --command="SELECT * FROM tickets" \
  --json > tickets_backup.json
```

### 복구 방법

```bash
# 1. SQL 파일로 복구
npx wrangler d1 execute webapp-production --file=backup-20260126.sql

# 2. 특정 데이터만 복구
npx wrangler d1 execute webapp-production --file=restore_tickets.sql
```

## 📊 데이터베이스 관리 명령어

```bash
# 1. 데이터베이스 목록 확인
npx wrangler d1 list

# 2. 테이블 구조 확인
npx wrangler d1 execute webapp-production \
  --command="SELECT sql FROM sqlite_master WHERE type='table'"

# 3. 데이터 조회
npx wrangler d1 execute webapp-production \
  --command="SELECT * FROM engineers LIMIT 10"

# 4. 데이터 수정
npx wrangler d1 execute webapp-production \
  --command="UPDATE tickets SET status='done' WHERE id=1"

# 5. 데이터 삭제
npx wrangler d1 execute webapp-production \
  --command="DELETE FROM tickets WHERE status='done' AND resolved_at < date('now', '-30 days')"
```

## 🔄 CI/CD 자동 배포 (선택사항)

### GitHub Actions 예시

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rp-kanban-board
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 💰 비용 (Cloudflare D1 무료 티어)

**무료 한도** (2024년 기준):
- ✅ 읽기: 500만 쿼리/월
- ✅ 쓰기: 10만 쿼리/월
- ✅ 스토리지: 5GB
- ✅ 데이터베이스: 10개

**일반적인 사용 예상**:
- 18명 팀 × 월 평균 1000개 티켓 = 약 5000 쓰기/월
- 대시보드 조회 100회/일 = 약 3000 읽기/월
- **결론**: 무료 티어로 충분!

## 🔧 트러블슈팅

### 문제 1: 마이그레이션 실패
```bash
# 원인: 이미 적용된 마이그레이션
# 해결: 마이그레이션 상태 확인
npx wrangler d1 migrations list webapp-production

# 강제 재적용 (주의!)
npx wrangler d1 execute webapp-production --file=./migrations/0001_initial_schema.sql
```

### 문제 2: 배포 후 데이터 없음
```bash
# 원인: 프로덕션 DB에 데이터 미입력
# 해결: seed.sql 실행
npx wrangler d1 execute webapp-production --file=./seed.sql
```

### 문제 3: 로컬과 프로덕션 DB 불일치
```bash
# 로컬 DB 리셋 후 프로덕션과 동기화
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply webapp-production --local
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

## 📚 참고 문서

- [Cloudflare D1 공식 문서](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages 배포 가이드](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)

---
**작성일**: 2026-01-26  
**버전**: v3.3.1
