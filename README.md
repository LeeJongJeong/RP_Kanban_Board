# RP Kanban Board

## 프로젝트 개요

오픈소스 데이터베이스(MySQL, PostgreSQL, MariaDB, MongoDB, Redis 등) 기술 지원 및 컨설팅 조직을 위한 **전문 칸반 보드 시스템**입니다. 단순한 티켓 관리를 넘어, DB 엔지니어링 업무의 특수성(긴급 장애 대응, SLA 관리, WIP 제한 등)을 반영한 지능형 운영 도구입니다.

### 주요 특징

- 📅 **주 단위 관리**: 이번 주 티켓 자동 표시 및 주차별 필터링 (최근 8주 + 커스텀 선택)
- 🎯 **DB 엔지니어링 특화**: DBMS 유형, 작업 카테고리, 인스턴스 정보, Severity 등 DB 전문 필드
- ⏱️ **SLA 타이머**: 실시간 카운트다운으로 긴급 장애 대응 시간 추적
- 👥 **WIP 제한**: 엔지니어별 동시 작업 수 제한으로 과부하 방지
- 📊 **Multi-View**: 상태별/엔지니어별/DBMS별 뷰 전환
- 🖱️ **드래그 앤 드롭**: 직관적인 티켓 상태 변경 및 담당자 할당
- 📈 **운영 대시보드**: 부서장을 위한 실시간 리소스 현황 및 SLA 위험 모니터링
- 📱 **모바일 최적화**: 스마트폰과 태블릿에서 완벽하게 작동하는 반응형 디자인

## 현재 완료된 기능

### ✅ 핵심 기능
1. **주 단위 관리**
   - 첫 화면: 이번 주(월~일) 티켓만 자동 표시
   - 주차 선택: 최근 8주 빠른 선택 + 커스텀 날짜 선택
   - 자동 주차 할당: 새 티켓 생성 시 현재 선택된 주차로 자동 할당

2. **칸반 보드**
   - 4가지 상태 컬럼: To-Do, In-Progress, Review, Done
   - 드래그 앤 드롭으로 티켓 상태 변경 (데스크톱)
   - 터치 드래그 앤 드롭 지원 (모바일)
   - 실시간 SLA 타이머 표시 (안전/경고/위험 색상 구분)
   - Severity 뱃지 (Critical, High, Medium, Low)
   - 반응형 레이아웃 (1~4열 자동 조정)

3. **Multi-View 시스템**
   - 상태별 보기: 워크플로우 진행 상황 추적
   - 엔지니어별 보기: 개인별 작업 부하 시각화 (WIP 게이지)
   - DBMS별 보기: 기술 스택별 업무 분포 확인

4. **티켓 관리**
   - 티켓 생성/수정/삭제
   - DB 특화 필드: DBMS 유형 (MySQL, PostgreSQL, MariaDB, MongoDB, Redis, SingleStore, HeatWave, EDB)
   - 작업 카테고리: 장애대응, 성능튜닝, 아키텍처설계, 정기점검, 패치/업그레이드
   - 인스턴스 정보: 호스트 IP, 환경 (Prod/Stg/Dev), 버전
   - 우선순위 및 심각도 관리

5. **엔지니어 관리**
   - 담당자 할당 (드래그 앤 드롭 지원)
   - WIP 제한 설정 (엔지니어별)
   - 역할 구분: Manager, Engineer, Consultant

6. **운영 대시보드**
   - 상태별 티켓 수 통계
   - 심각도별 티켓 분포
   - DBMS별 작업 부하
   - 엔지니어별 WIP 현황 (게이지 바)
   - SLA 위험 경고 (임계치 초과 티켓 표시 및 상세 정보)

7. **코멘트 시스템**
   - 티켓별 기술 노트 작성
   - 코멘트 타입: note, solution, workaround, reference
   - 시간 순 정렬

8. **히스토리 추적**
   - 티켓 상태 변경 이력
   - 담당자 변경 이력
   - 변경 시간 및 변경자 기록

9. **모바일 최적화** ✨ NEW
   - 반응형 헤더 (햄버거 메뉴)
   - 터치 드래그 앤 드롭
   - 1~4열 자동 레이아웃
   - 모바일 최적화 티켓 카드
   - 모달 크기 자동 조정
   - 상세 가이드: [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md)

### 팀 구성 및 담당 DBMS
- **DS1T 팀 (9명)**: PostgreSQL, EDB, MongoDB, SingleStore 담당
  - 최영준, 이성인, 김태관, 김정환, 최용규, 김지은, 강홍용, 서원길, 김지현
- **DS2T 팀 (9명)**: MySQL, MariaDB, Redis, HeatWave 담당
  - 임종민, 이소라, 한수현, 고재훈, 추건우, 엄혜진, 배재준, 박재원, 장희수
- **총 인원**: 18명 (WIP 제한: 각 3건)

## URL 및 엔드포인트

### 로컬 개발 환경
- **메인 URL**: https://3000-iujhixdesu0m50di9n6ao-2e77fc33.sandbox.novita.ai
- **API 베이스**: https://3000-iujhixdesu0m50di9n6ao-2e77fc33.sandbox.novita.ai/api

### 팀 구성
- **DS1T 팀**: 최영준, 이성인, 김태관, 김정환, 최용규, 김지은, 강홍용, 서원길, 김지현 (9명)
- **DS2T 팀**: 임종민, 이소라, 한수현, 고재훈, 추건우, 엄혜진, 배재준, 박재원, 장희수 (9명)
- **총 인원**: 18명 (WIP 제한: 각 3건)

### API 엔드포인트

#### 엔지니어 관리
- `GET /api/engineers` - 엔지니어 목록 조회
- `GET /api/engineers/:id/wip` - 엔지니어별 현재 WIP 카운트

#### 티켓 관리
- `GET /api/tickets` - 티켓 목록 (필터링: status, assigned_to, dbms_type)
- `GET /api/tickets/:id` - 티켓 상세 조회 (코멘트 포함)
- `POST /api/tickets` - 새 티켓 생성
- `PUT /api/tickets/:id` - 티켓 수정
- `PATCH /api/tickets/:id/status` - 티켓 상태 변경
- `PATCH /api/tickets/:id/assign` - 담당자 할당
- `DELETE /api/tickets/:id` - 티켓 삭제
- `POST /api/tickets/:id/comments` - 코멘트 추가

#### 대시보드
- `GET /api/dashboard/stats` - 운영 통계 (상태별/Severity별/DBMS별/엔지니어 부하/SLA 위험)

## 데이터 아키텍처

### 데이터 모델

#### 1. Engineers (엔지니어)
```sql
- id: 엔지니어 ID
- name: 이름
- email: 이메일
- role: 역할 (manager, engineer, consultant)
- wip_limit: WIP 제한 (기본: 3)
- is_active: 활성 상태
```

#### 2. Tickets (티켓)
```sql
- id: 티켓 ID
- title: 제목
- description: 설명
- status: 상태 (todo, in_progress, review, done)
- dbms_type: DBMS 유형
- work_category: 작업 카테고리
- severity: 심각도 (critical, high, medium, low)
- instance_host: 대상 호스트 IP
- instance_env: 환경 (prod, stg, dev)
- instance_version: DB 버전
- sla_minutes: SLA 목표 시간 (분)
- started_at: 작업 시작 시간
- resolved_at: 해결 완료 시간
- assigned_to: 담당자 ID
- priority: 우선순위 (1-4)
```

#### 3. Comments (코멘트)
```sql
- id: 코멘트 ID
- ticket_id: 티켓 ID
- engineer_id: 작성자 ID
- content: 내용
- comment_type: 타입 (note, solution, workaround, reference)
```

#### 4. Ticket_History (이력)
```sql
- id: 히스토리 ID
- ticket_id: 티켓 ID
- changed_by: 변경자 ID
- field_name: 변경 필드
- old_value: 이전 값
- new_value: 새 값
- changed_at: 변경 시간
```

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스
- **로컬 개발**: `--local` 플래그로 `.wrangler/state/v3/d1` 에 로컬 SQLite 사용

## 사용자 가이드

### 1. 티켓 생성
1. 상단의 **"새 티켓"** 버튼 클릭
2. 필수 항목 입력:
   - 제목
   - DBMS 유형 (MySQL, PostgreSQL 등)
   - 작업 카테고리 (장애대응, 성능튜닝 등)
   - 심각도 (Critical, High, Medium, Low)
3. 선택 항목 입력:
   - 인스턴스 정보 (IP, 환경, 버전)
   - SLA 목표 시간 (분 단위)
   - 담당자
4. **"생성"** 버튼 클릭

### 2. 티켓 상태 변경 (드래그 앤 드롭)
1. 티켓 카드를 클릭하여 드래그 시작
2. 원하는 상태 컬럼 (To-Do, In-Progress, Review, Done)으로 드롭
3. 자동으로 상태 변경 및 히스토리 기록

### 3. 담당자 할당
- **방법 1 (드래그 앤 드롭)**: 엔지니어별 보기에서 티켓을 원하는 엔지니어 컬럼으로 드롭
- **방법 2 (편집)**: 티켓 상세 화면에서 담당자 선택

### 4. Multi-View 전환
- 상단 우측 드롭다운에서 선택:
  - **상태별 보기**: 워크플로우 진행 상황 확인
  - **엔지니어별 보기**: 팀원별 작업 부하 확인
  - **DBMS별 보기**: 기술 스택별 업무 분포 확인

### 5. 운영 대시보드 (부서장용)
1. 상단의 **"대시보드"** 버튼 클릭
2. 확인 가능한 정보:
   - 상태별 티켓 수
   - 심각도별 티켓 분포
   - DBMS별 작업 부하
   - 엔지니어별 WIP 현황 (게이지 바)
   - SLA 위험 경고 (임계치 초과 시 빨간색 경고)

### 6. SLA 타이머 이해
- **녹색 (Safe)**: SLA 여유 시간 50% 이상
- **주황색 (Warning)**: SLA 여유 시간 20-50%
- **빨간색 (Danger)**: SLA 여유 시간 20% 미만 또는 초과

## 기술 스택

### 백엔드
- **Hono** v4.11.5 - 경량 웹 프레임워크
- **Cloudflare Workers** - 엣지 서버리스 런타임
- **Cloudflare D1** - 분산 SQLite 데이터베이스

### 프론트엔드
- **Vanilla JavaScript** - 순수 JS (프레임워크 없음)
- **TailwindCSS** (CDN) - 유틸리티 우선 CSS
- **Font Awesome** (CDN) - 아이콘
- **Axios** (CDN) - HTTP 클라이언트

### 개발 도구
- **Vite** v6.4.1 - 빌드 도구
- **Wrangler** v4.60.0 - Cloudflare CLI
- **PM2** - 프로세스 관리 (로컬 개발)
- **TypeScript** - 타입 안정성

## 배포

### 현재 시스템 상태

### 현재 시스템 상태

**팀 구성**:
- DS1T 팀 (9명): PostgreSQL, EDB, MongoDB, SingleStore 담당
  - 최영준, 이성인, 김태관, 김정환, 최용규, 김지은, 강홍용, 서원길, 김지현
- DS2T 팀 (9명): MySQL, MariaDB, Redis, HeatWave 담당
  - 임종민, 이소라, 한수현, 고재훈, 추건우, 엄혜진, 배재준, 박재원, 장희수

**티켓**: 16건 (팀별 DBMS 매핑 완료)
- **DS1T 담당 (9건)**:
  - PostgreSQL: 3건 (슬로우 쿼리 튜닝 [최영준], Connection Pool 최적화 [이성인], HA 구성 [김지은])
  - EDB: 2건 (마이그레이션 [김태관], Failover Manager [김정환])
  - MongoDB: 2건 (Sharding 설계 [최용규], Atlas Search 최적화 [강홍용])
  - SingleStore: 2건 (클러스터 성능 분석 [서원길], Columnstore 압축 [김지현])

- **DS2T 담당 (7건)**:
  - MySQL: 2건 (Replication Lag [임종민], 8.4 업그레이드 [이소라])
  - MariaDB: 2건 (헬스체크 [고재훈], MaxScale 구성 [박재원])
  - Redis: 2건 (Cluster 패치 [추건우], Sentinel 테스트 [엄혜진])
  - HeatWave: 1건 (Parallel Load 최적화 [배재준])

**상태별 분포**:
- In-Progress: 4건 (DS1T 2건 + DS2T 2건)
- Review: 4건 (DS1T 2건 + DS2T 2건)
- Todo: 7건 (DS1T 5건 + DS2T 2건)
- Done: 1건 (DS2T 1건)

**작업 부하**:
- DS1T: 9건 / 27건 가능 (33% 사용률)
- DS2T: 6건 / 27건 가능 (22% 사용률)
- 전체: 15건 / 54건 가능 (28% 사용률)

### 로컬 개발 환경 실행

```bash
# 1. 의존성 설치
npm install

# 2. 데이터베이스 마이그레이션
npm run db:migrate:local

# 3. 샘플 데이터 삽입
npm run db:seed

# 4. 빌드
npm run build

# 5. PM2로 서비스 시작
pm2 start ecosystem.config.cjs

# 6. 로그 확인
pm2 logs --nostream

# 7. 서비스 중지
pm2 stop webapp
```

### Cloudflare Pages 배포 (프로덕션)

```bash
# 1. Cloudflare 인증 설정 (최초 1회)
npx wrangler login

# 2. D1 데이터베이스 생성 (최초 1회)
npx wrangler d1 create webapp-production

# 3. wrangler.jsonc에 database_id 업데이트

# 4. 프로덕션 마이그레이션
npx wrangler d1 migrations apply webapp-production

# 5. 배포
npm run deploy
```

## 향후 개발 계획 (미구현 기능)

### Phase 2: 고급 기능
- [ ] **사용자 인증**: 로그인/로그아웃, 역할 기반 권한 관리
- [ ] **실시간 협업**: WebSocket 기반 실시간 업데이트
- [ ] **알림 시스템**: Slack/이메일 통합, SLA 임박 알림
- [ ] **검색 기능**: 전체 텍스트 검색, 고급 필터링
- [ ] **파일 첨부**: 스크린샷, 로그 파일 첨부 (Cloudflare R2)

### Phase 3: AI/지능화
- [ ] **LLM 통합**: 과거 이력 검색 및 해결 가이드 제안
- [ ] **자동 분류**: 티켓 제목/설명 기반 자동 카테고리/Severity 추천
- [ ] **예측 분석**: SLA 초과 위험 예측, 리소스 부하 예측

### Phase 4: 확장성
- [ ] **Data Service Platform 연동**: 모니터링 시스템 통합
- [ ] **Custom Workflow**: 팀별 맞춤형 워크플로우 설정
- [ ] **API Gateway**: 외부 시스템 통합 (Jira, ServiceNow 등)
- [ ] **보고서 생성**: 월간/주간 리포트 자동 생성

### Phase 5: 모바일 고도화 (예정)
- [ ] **PWA 지원**: 오프라인 모드 및 홈 화면 추가
- [ ] **제스처 지원**: 스와이프로 상태 변경
- [ ] **햅틱 피드백**: 터치 반응 강화
- [ ] **다크 모드**: 야간 작업 환경 지원
- [ ] **음성 명령**: 핸즈프리 티켓 생성

## 프로젝트 구조

```
webapp/
├── src/
│   └── index.tsx               # Hono 백엔드 (API + HTML 렌더링)
├── public/
│   └── static/
│       ├── app.js              # 프론트엔드 JavaScript
│       └── style.css           # 커스텀 CSS
├── migrations/
│   ├── 0001_initial_schema.sql     # D1 데이터베이스 스키마
│   └── 0002_add_week_management.sql # 주차 관리 필드 추가
├── seed.sql                        # 샘플 데이터
├── ecosystem.config.cjs            # PM2 설정
├── wrangler.jsonc                  # Cloudflare 설정
├── vite.config.ts                  # Vite 빌드 설정
├── package.json                    # 의존성 및 스크립트
├── DRAG_AND_DROP_TEST.md           # 드래그 앤 드롭 가이드
├── SLA_RISK_FEATURE.md             # SLA 위험 기능 가이드
├── MOBILE_OPTIMIZATION.md          # 모바일 최적화 가이드
├── MODAL_FIX_LOG.md                # 모달 위치 조정 로그
├── DEPLOYMENT_GUIDE.md             # 배포 가이드
└── README.md                       # 이 문서
```

## 개발자 정보

- **프로젝트명**: RP Kanban Board
- **버전**: v3.4.1 (모달 위치 조정)
- **최종 업데이트**: 2026-01-26
- **현재 주차**: 2026-01-26 ~ 2026-02-01 (2026-W05)
- **샘플 데이터**: 16개 티켓, 18명 엔지니어
- **라이선스**: MIT

## 📖 추가 문서

- [모바일 최적화 가이드](./MOBILE_OPTIMIZATION.md): 반응형 디자인 및 터치 이벤트 구현 세부사항 ✨ NEW
- [드래그 앤 드롭 테스트 가이드](./DRAG_AND_DROP_TEST.md): 드래그 앤 드롭 기능 사용법 및 기술 구현
- [SLA 위험 경고 상세 정보 기능](./SLA_RISK_FEATURE.md): SLA 위험 티켓 목록 모달 사용 가이드
- [배포 가이드](./DEPLOYMENT_GUIDE.md): 프로덕션 배포 및 데이터베이스 설정 가이드

## 추천 다음 단계

1. **사용자 인증 추가**: 실제 프로덕션 사용을 위한 로그인 시스템 구현
2. **Slack 통합**: 긴급 티켓 생성 시 Slack 알림 전송
3. **PWA 지원**: 오프라인 모드 및 홈 화면 추가로 네이티브 앱처럼 사용 ✨ 모바일 완료 후 추천
4. **성능 모니터링**: Cloudflare Analytics 통합
5. **백업 전략**: D1 데이터 정기 백업 스크립트 작성
3. **모바일 최적화**: 반응형 디자인 개선 (현재는 데스크톱 중심)
4. **성능 모니터링**: Cloudflare Analytics 통합
5. **백업 전략**: D1 데이터 정기 백업 스크립트 작성

---

**문의 및 피드백**: 디사피엔스 (DB엔지니어, 컨설턴트)
