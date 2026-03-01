# RP Kanban Board

DB 기술지원/컨설팅 조직을 위한 **운영 특화 칸반 보드**입니다.  
일반 이슈 트래커가 아니라, DB 업무에서 중요한 **SLA, Severity, WIP, DBMS 분류, 주간/기간 관리**를 중심으로 설계되었습니다.

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [현재 구현 기능](#현재-구현-기능)
3. [아키텍처](#아키텍처)
4. [빠른 시작 (로컬 실행)](#빠른-시작-로컬-실행)
5. [환경 변수 및 런타임](#환경-변수-및-런타임)
6. [API 요약](#api-요약)
7. [데이터 모델](#데이터-모델)
8. [마이그레이션/시드](#마이그레이션시드)
9. [프로젝트 구조](#프로젝트-구조)
10. [운영/개발 시 참고사항](#운영개발-시-참고사항)

---

## 프로젝트 개요

- **백엔드**: Cloudflare Workers + Hono
- **DB**: Cloudflare D1 (SQLite)
- **프론트엔드**: 서버 템플릿 렌더링 + Vanilla JS 모듈
- **인증**: JWT(`auth_token` 쿠키), Role 기반 권한(`admin`, `user`)

이 앱은 다음 시나리오를 기본으로 합니다.

- 장애/성능 이슈 티켓을 생성하고 보드에서 상태 전환
- 티켓 담당자를 엔지니어에게 할당
- 주간/기간 단위로 티켓 조회
- 관리자는 운영 지표(대시보드)로 SLA 위험과 팀 부하를 점검

---

## 현재 구현 기능

### 1) 인증/권한
- 로그인/로그아웃/회원가입
- 비밀번호 변경
- 관리자 전용 API + 관리자 화면(`/admin`) 접근 제어

### 2) 티켓 관리
- 생성/조회/상세/수정/삭제
- 상태 전환: `todo` → `in_progress` → `review` → `done`
- 담당자 할당/해제
- 티켓 코멘트 작성(`note`, `solution`, `workaround`, `reference`)
- 변경 이력(`ticket_history`) 기록

### 3) 보드/뷰
- 상태별 보기
- 엔지니어별 보기
- DBMS별 보기
- 드래그 앤 드롭(데스크톱/모바일 터치)

### 4) 운영 대시보드
- 상태별/심각도별/DBMS별 집계
- 엔지니어별 WIP
- SLA 위험 티켓
- 주간 Velocity, SLA 준수율, MTTR, Stalled Ticket, 최근 7일 추세

---

## 아키텍처

### Backend
- Hono 앱 진입: `src/index.tsx`
- 라우트 분리:
  - `src/routes/auth.ts`
  - `src/routes/tickets.ts`
  - `src/routes/engineers.ts`
  - `src/routes/dashboard.ts`
  - `src/routes/admin.ts`
- 서비스 계층:
  - `src/services/TicketService.ts`
  - `src/services/EngineerService.ts`
  - `src/services/DashboardService.ts`

### Frontend
- HTML 템플릿 컴포넌트: `src/views/*`
- 정적 리소스: `public/static/*`
- 앱 초기화: `public/static/app.js`
- 액션/렌더/API 모듈:
  - `public/static/js/actions.js`
  - `public/static/js/render.js`
  - `public/static/js/api.js`
  - `public/static/js/store.js`

---

## 빠른 시작 (로컬 실행)

### 사전 요구사항
- Node.js 18+
- npm
- Wrangler CLI 사용 가능 환경

### 설치

```bash
npm install
```

### DB 준비 (로컬 D1)

```bash
npm run db:migrate:local
npm run db:seed
```

### 빌드 및 실행

```bash
npm run build
npm run dev:sandbox
```

- 기본 포트: `3000`
- 로컬 D1 파일은 Wrangler local state를 사용합니다.

### 자주 쓰는 스크립트

```bash
npm run dev              # Vite 개발 서버
npm run build            # 프로덕션 빌드
npm run preview          # wrangler pages dev
npm run deploy           # Cloudflare Pages 배포
npm run db:migrate:local # 로컬 D1 마이그레이션
npm run db:seed          # 로컬 D1 시드 입력
npm run db:reset         # 로컬 D1 초기화 + 마이그레이션 + 시드
npm run clean-port       # 3000 포트 종료
```

---

## 환경 변수 및 런타임

앱은 Workers 바인딩을 사용합니다.

- `DB`: D1 바인딩
- `JWT_SECRET`: JWT 서명/검증 시크릿

`wrangler.jsonc`의 D1/바인딩 설정을 실제 환경에 맞게 관리하세요.

---

## API 요약

> 인증 제외 `/api/*`는 JWT 쿠키 인증이 필요합니다.

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `PUT /api/auth/password`
- `GET /api/auth/logout`

### Tickets
- `GET /api/tickets`
  - query: `status`, `assigned_to`, `dbms_type`, `week_start_date`, `start_date`, `end_date`
- `GET /api/tickets/:id`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `PATCH /api/tickets/:id/assign`
- `DELETE /api/tickets/:id`
- `POST /api/tickets/:id/comments`

### Engineers
- `GET /api/engineers`
- `GET /api/engineers/:id/wip`

### Dashboard
- `GET /api/dashboard/stats`

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `PUT /api/admin/users/:id/reset-password`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/engineers`

---

## 데이터 모델

### engineers
- `name`, `email`, `role`, `wip_limit`, `is_active`

### tickets
- 기본: `title`, `description`, `status`, `priority`
- DB 특화: `dbms_type`, `work_category`, `severity`
- 인스턴스: `instance_host`, `instance_env`, `instance_version`
- SLA: `sla_minutes`, `started_at`, `resolved_at`
- 담당자/기간: `assigned_to`, `week_start_date`, `week_end_date`, `year_week`

### comments
- `ticket_id`, `engineer_id`, `content`, `comment_type`

### ticket_history
- `ticket_id`, `changed_by`, `field_name`, `old_value`, `new_value`

### users
- `username`, `password(hash)`, `role`, `engineer_id`, `is_active`, `display_name`, `job_title`

---

## 마이그레이션/시드

적용 순서:

1. `migrations/0001_initial_schema.sql`
2. `migrations/0002_users_and_auth.sql`
3. `migrations/0003_dashboard_tuning.sql`
4. `migrations/0004_ticket_list_tuning.sql`

샘플 데이터:

- `seed.sql`

---

## 프로젝트 구조

```txt
RP_Kanban_Board/
├── src/
│   ├── index.tsx
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── views/
│   └── types/
├── public/
│   ├── static/
│   │   ├── app.js
│   │   ├── style.css
│   │   └── js/
├── migrations/
├── seed.sql
├── wrangler.jsonc
├── vite.config.ts
└── package.json
```

---

## 운영/개발 시 참고사항

- 현재 프론트는 React/Vue SPA가 아니라, **서버 템플릿 + 정적 JS 모듈** 구조입니다.
- 관리자 기능은 `/api/admin/*`와 `/admin` 페이지 양쪽에서 role 검증을 수행합니다.
- 로컬 테스트 시 쿠키/HTTPS/브라우저 보안 정책 영향을 받을 수 있으니, `dev:sandbox` 경로를 우선 권장합니다.

---

필요하면 다음 단계로 README에 **요청/응답 예시(JSON)**, **운영 체크리스트**, **트러블슈팅(로그인/쿠키/마이그레이션 실패)** 섹션까지 추가해드릴 수 있습니다.
