-- 실제 DS1T/DS2T 팀 엔지니어 데이터
-- DS1T: PostgreSQL, EDB, MongoDB, SingleStore 담당
-- DS2T: MySQL, MariaDB, Redis, HeatWave 담당
INSERT INTO engineers (name, email, role, wip_limit) VALUES 
  -- DS1T 팀 (9명) - PostgreSQL, EDB, MongoDB, SingleStore
  ('최영준', 'youngjun.choi@company.com', 'engineer', 3),
  ('이성인', 'sungin.lee@company.com', 'engineer', 3),
  ('김태관', 'taegwan.kim@company.com', 'engineer', 3),
  ('김정환', 'junghwan.kim@company.com', 'engineer', 3),
  ('최용규', 'yongkyu.choi@company.com', 'engineer', 3),
  ('김지은', 'jieun.kim@company.com', 'engineer', 3),
  ('강홍용', 'hongyong.kang@company.com', 'engineer', 3),
  ('서원길', 'wongil.seo@company.com', 'engineer', 3),
  ('김지현', 'jihyun.kim@company.com', 'engineer', 3),
  
  -- DS2T 팀 (9명) - MySQL, MariaDB, Redis, HeatWave
  ('임종민', 'jongmin.lim@company.com', 'engineer', 3),
  ('이소라', 'sora.lee@company.com', 'engineer', 3),
  ('한수현', 'soohyun.han@company.com', 'engineer', 3),
  ('고재훈', 'jaehoon.ko@company.com', 'engineer', 3),
  ('추건우', 'gunwoo.chu@company.com', 'engineer', 3),
  ('엄혜진', 'hyejin.eom@company.com', 'engineer', 3),
  ('배재준', 'jaejun.bae@company.com', 'engineer', 3),
  ('박재원', 'jaewon.park@company.com', 'engineer', 3),
  ('장희수', 'heesu.jang@company.com', 'engineer', 3);

-- 샘플 티켓 데이터 (팀 역할에 맞게 재매핑)
INSERT INTO tickets (
  title, description, status, dbms_type, work_category, severity, 
  instance_host, instance_env, instance_version, sla_minutes, 
  assigned_to, priority, started_at
) VALUES 
  -- DS2T 티켓들 (MySQL, MariaDB, Redis, HeatWave)
  (
    'MySQL Replication Lag 발생 긴급 조치', 
    'Production 환경에서 Replication Lag가 300초 이상 발생. 즉시 원인 분석 및 조치 필요.',
    'in_progress',
    'MySQL',
    '장애대응',
    'critical',
    '10.20.30.100',
    'prod',
    'MySQL 8.0.35',
    60,
    10,  -- 임종민 (DS2T - MySQL 담당)
    1,
    datetime('now', '-15 minutes')
  ),
  (
    'MySQL 8.0 to 8.4 업그레이드 계획',
    'Legacy MySQL 8.0.28 서버를 8.4 LTS로 업그레이드. 호환성 검증 및 다운타임 최소화 전략 수립.',
    'todo',
    'MySQL',
    '패치업그레이드',
    'high',
    '10.20.30.110',
    'prod',
    'MySQL 8.0.28',
    NULL,
    11,  -- 이소라 (DS2T - MySQL 담당)
    2,
    NULL
  ),
  (
    'MariaDB 정기 헬스체크',
    '월간 정기 점검: 백업 상태, Replication 상태, InnoDB Buffer Pool 사용률 확인.',
    'review',
    'MariaDB',
    '정기점검',
    'low',
    '10.20.30.150',
    'prod',
    'MariaDB 10.11.6',
    NULL,
    13,  -- 고재훈 (DS2T - MariaDB 담당)
    4,
    datetime('now', '-2 hours')
  ),
  (
    'Redis Cluster 패치 적용',
    'Redis 7.2.4 보안 패치 적용 및 재시작 계획 수립.',
    'done',
    'Redis',
    '패치업그레이드',
    'medium',
    '10.20.30.50',
    'prod',
    'Redis 7.2.3',
    NULL,
    14,  -- 추건우 (DS2T - Redis 담당)
    3,
    datetime('now', '-1 day')
  ),
  (
    'Redis Sentinel 장애 조치 테스트',
    'Redis Sentinel 환경에서 Master 다운 시 자동 Failover 시나리오 테스트.',
    'review',
    'Redis',
    '정기점검',
    'medium',
    '10.20.30.51',
    'stg',
    'Redis 7.2.4',
    NULL,
    15,  -- 엄혜진 (DS2T - Redis 담당)
    3,
    datetime('now', '-3 hours')
  ),
  (
    'HeatWave Auto Parallel Load 최적화',
    'MySQL HeatWave 클러스터의 Auto Parallel Load 성능 최적화. 대용량 데이터 로딩 시간 단축.',
    'in_progress',
    'HeatWave',
    '성능튜닝',
    'high',
    '10.20.30.300',
    'prod',
    'MySQL HeatWave 8.0.35',
    240,
    16,  -- 배재준 (DS2T - HeatWave 담당)
    2,
    datetime('now', '-45 minutes')
  ),
  (
    'MariaDB MaxScale 로드밸런싱 설정',
    'MaxScale을 이용한 Read/Write Split 구성 및 Connection Pool 최적화.',
    'todo',
    'MariaDB',
    '아키텍처설계',
    'medium',
    NULL,
    'stg',
    'MariaDB 11.2 + MaxScale 23.08',
    NULL,
    17,  -- 박재원 (DS2T - MariaDB 담당)
    3,
    NULL
  ),
  
  -- DS1T 티켓들 (PostgreSQL, EDB, MongoDB, SingleStore)
  (
    'PostgreSQL 슬로우 쿼리 성능 튜닝',
    '고객사 보고된 특정 쿼리의 실행 시간이 10초 이상 소요. Index 추가 및 쿼리 최적화 필요.',
    'in_progress',
    'PostgreSQL',
    '성능튜닝',
    'high',
    '10.20.30.200',
    'prod',
    'PostgreSQL 15.4',
    240,
    1,  -- 최영준 (DS1T - PostgreSQL 담당)
    2,
    datetime('now', '-30 minutes')
  ),
  (
    'PostgreSQL Connection Pool 최적화',
    'pgBouncer 설정 최적화로 Connection Pool 효율 개선.',
    'todo',
    'PostgreSQL',
    '성능튜닝',
    'medium',
    '10.20.30.201',
    'prod',
    'PostgreSQL 15.4',
    180,
    2,  -- 이성인 (DS1T - PostgreSQL 담당)
    2,
    NULL
  ),
  (
    'PostgreSQL 16 HA 구성 (Patroni + etcd)',
    'Patroni와 etcd를 활용한 PostgreSQL 고가용성 클러스터 구축.',
    'todo',
    'PostgreSQL',
    '아키텍처설계',
    'high',
    NULL,
    'stg',
    'PostgreSQL 16.1',
    NULL,
    6,  -- 김지은 (DS1T - PostgreSQL 담당)
    2,
    NULL
  ),
  (
    'EDB Postgres Advanced 마이그레이션',
    'Oracle에서 EDB Postgres Advanced Server로 마이그레이션. 호환성 패키지 및 PL/SQL 변환 작업.',
    'in_progress',
    'EDB',
    '아키텍처설계',
    'critical',
    NULL,
    'stg',
    'EDB 16',
    NULL,
    3,  -- 김태관 (DS1T - EDB 담당)
    1,
    datetime('now', '-2 hours')
  ),
  (
    'EDB Failover Manager 구성',
    'EDB Postgres Advanced Server의 자동 Failover 설정 및 테스트.',
    'review',
    'EDB',
    '정기점검',
    'medium',
    '10.20.30.220',
    'stg',
    'EDB 16 + EFM 4.8',
    NULL,
    4,  -- 김정환 (DS1T - EDB 담당)
    3,
    datetime('now', '-1 hour')
  ),
  (
    'MongoDB Sharding 아키텍처 설계',
    '신규 프로젝트의 MongoDB Sharding 전략 수립 및 샤드 키 선정.',
    'todo',
    'MongoDB',
    '아키텍처설계',
    'medium',
    NULL,
    'dev',
    'MongoDB 7.0',
    NULL,
    5,  -- 최용규 (DS1T - MongoDB 담당)
    3,
    NULL
  ),
  (
    'MongoDB Atlas Search 인덱스 최적화',
    'Full-text search 성능 개선을 위한 Atlas Search 인덱스 튜닝.',
    'review',
    'MongoDB',
    '성능튜닝',
    'low',
    '10.20.30.230',
    'prod',
    'MongoDB 7.0 Atlas',
    NULL,
    7,  -- 강홍용 (DS1T - MongoDB 담당)
    4,
    datetime('now', '-4 hours')
  ),
  (
    'SingleStore 클러스터 성능 분석',
    'SingleStore 분산 쿼리 성능 저하 이슈. Leaf Node 리소스 사용률 분석 필요.',
    'in_progress',
    'SingleStore',
    '성능튜닝',
    'high',
    '10.20.30.250',
    'prod',
    'SingleStore 8.5',
    180,
    8,  -- 서원길 (DS1T - SingleStore 담당)
    2,
    datetime('now', '-1 hour')
  ),
  (
    'SingleStore Columnstore 압축 최적화',
    'Columnstore 테이블의 압축률 개선 및 스토리지 비용 절감.',
    'todo',
    'SingleStore',
    '성능튜닝',
    'medium',
    '10.20.30.251',
    'prod',
    'SingleStore 8.5',
    NULL,
    9,  -- 김지현 (DS1T - SingleStore 담당)
    3,
    NULL
  );

-- 샘플 코멘트 데이터
INSERT INTO comments (ticket_id, engineer_id, content, comment_type) VALUES 
  -- MySQL 관련 (DS2T)
  (1, 10, 'Replication Lag 원인 분석 중: Slave 서버의 Disk I/O가 100%에 근접. Slow Query Log 확인 필요.', 'note'),
  (1, 10, 'Workaround: read_only 쿼리를 Master로 임시 우회. Slave 재구성 예정.', 'workaround'),
  
  -- MariaDB 관련 (DS2T)
  (3, 13, '백업 상태 정상, Replication 1초 이하 정상, Buffer Pool 사용률 78% 양호.', 'note'),
  
  -- Redis 관련 (DS2T)
  (4, 14, 'Redis 7.2.4 패치 적용 완료. 재시작 후 클러스터 상태 정상 확인.', 'solution'),
  (5, 15, 'Sentinel 자동 Failover 정상 작동 확인. Failover 시간 2.3초 소요.', 'solution'),
  
  -- HeatWave 관련 (DS2T)
  (6, 16, 'Parallel Load Thread 32 → 64로 증가. 로딩 시간 40% 단축 확인.', 'note'),
  
  -- PostgreSQL 관련 (DS1T)
  (8, 1, 'Explain Analyze 결과: Seq Scan이 발생. B-tree 인덱스 추가 권장.', 'note'),
  (9, 2, 'pgBouncer pool_mode를 transaction으로 변경. Connection 재사용률 85% 향상.', 'solution'),
  
  -- EDB 관련 (DS1T)
  (11, 3, 'Oracle PL/SQL → EDB SPL 변환 완료. 호환성 패키지 edb_redwood_date 적용.', 'note'),
  (12, 4, 'EFM 자동 Failover 테스트 성공. Failover 시간 평균 5.2초.', 'solution'),
  
  -- MongoDB 관련 (DS1T)
  (14, 7, 'Atlas Search 인덱스 analyzer를 lucene.korean으로 변경. 검색 정확도 개선.', 'solution'),
  
  -- SingleStore 관련 (DS1T)
  (15, 8, 'SingleStore Leaf Node CPU 사용률 90% 이상. 쿼리 실행 계획 분석 중.', 'note'),
  (15, 8, 'Solution: Columnstore Key 재설계로 분산 쿼리 효율 25% 개선.', 'solution');

-- 샘플 히스토리 데이터
INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value) VALUES 
  -- DS2T 티켓 이력
  (1, 10, 'status', 'todo', 'in_progress'),
  (3, 13, 'status', 'in_progress', 'review'),
  (4, 14, 'status', 'in_progress', 'done'),
  (4, 14, 'resolved_at', NULL, datetime('now', '-1 day')),
  (5, 15, 'status', 'in_progress', 'review'),
  (6, 16, 'status', 'todo', 'in_progress'),
  
  -- DS1T 티켓 이력
  (8, 1, 'status', 'todo', 'in_progress'),
  (11, 3, 'status', 'todo', 'in_progress'),
  (12, 4, 'status', 'in_progress', 'review'),
  (14, 7, 'status', 'in_progress', 'review'),
(15, 8, 'status', 'todo', 'in_progress');

-- ============================================
-- 기본 관리자 계정
-- ============================================
-- 비밀번호: admin123 (bcrypt 해시 Update)
INSERT INTO users (username, password, role, display_name, job_title, is_active) VALUES 
  ('admin', '$2b$10$XbHk6SDpgZOzH5/plJq1/.bmqcbXbFuaOuuxUPSntLuGeb1f88ttO', 'admin', '시스템 관리자', '관리자', 1);

-- ============================================
-- 2026년 2월 추가 샘플 데이터 (30건)
-- 기간: 2026-02-02 ~ 2026-02-10
-- 분포: Done(9), Review(3), In-Progress(12), To-Do(6)
-- ============================================
INSERT INTO tickets (
  title, description, status, dbms_type, work_category, severity, 
  instance_host, instance_env, instance_version, sla_minutes, 
  assigned_to, priority, started_at, resolved_at
) VALUES
  -- DONE (9건) - 2월 2일 ~ 6일 완료
  (
    'User Table Alter Lock Issue', '프로덕션 DB 유저 테이블 컬럼 추가 중 메타데이터 락 대기 발생. 트랜잭션 수동 킬 조치.',
    'done', 'MySQL', '장애대응', 'critical', '10.20.30.101', 'prod', 'MySQL 8.0.35', 60, 10, 1, 
    datetime('now', '-8 days'), datetime('now', '-8 days', '+2 hours')
  ),
  (
    'Session Store Memory Spike', 'Redis 세션 스토어 메모리 사용량 급증(85%). 임시로 maxmemory-policy 변경 및 모니터링.',
    'done', 'Redis', '장애대응', 'high', '10.20.30.52', 'prod', 'Redis 7.0.12', 120, 14, 2,
    datetime('now', '-7 days'), datetime('now', '-7 days', '+4 hours')
  ),
  (
    'Vacuum Failure on Order DB', '주문 DB 자동 Vacuum 실패 알람. 트랜잭션 ID 랩어라운드 방지를 위해 수동 Vacuum Full 수행.',
    'done', 'PostgreSQL', '정기점검', 'medium', '10.20.30.202', 'prod', 'PostgreSQL 14.9', NULL, 1, 3,
    datetime('now', '-7 days'), datetime('now', '-7 days', '+5 hours')
  ),
  (
    'Oplog Size Adjustment', 'MongoDB Oplog 윈도우가 3시간으로 감소. Oplog 사이즈 50GB로 증설 작업.',
    'done', 'MongoDB', '성능튜닝', 'low', '10.20.30.231', 'stg', 'MongoDB 6.0', NULL, 5, 4,
    datetime('now', '-6 days'), datetime('now', '-6 days', '+1 hour')
  ),
  (
    'Slave Lag Check', '새벽 배치 작업 중 Slave Lag 10초 발생 확인. 배치 쿼리 튜닝 가이드 전달.',
    'done', 'MariaDB', '기술지원', 'low', '10.20.30.151', 'prod', 'MariaDB 10.6', NULL, 13, 4,
    datetime('now', '-6 days'), datetime('now', '-6 days', '+30 minutes')
  ),
  (
    'License Key Update', 'EDB PAS 라이선스 만료 30일 전 알림. 신규 라이선스 키 발급 및 적용.',
    'done', 'EDB', '유지보수', 'high', '10.20.30.221', 'prod', 'EDB 15', NULL, 3, 2,
    datetime('now', '-5 days'), datetime('now', '-5 days', '+10 minutes')
  ),
  (
    'Pipeline Ingestion Delay', 'SingleStore 파이프라인 데이터 적재 지연. 카프카 파티션 불균형 확인 및 리밸런싱.',
    'done', 'SingleStore', '성능튜닝', 'medium', '10.20.30.252', 'prod', 'SingleStore 8.1', 180, 8, 3,
    datetime('now', '-5 days'), datetime('now', '-5 days', '+3 hours')
  ),
  (
    'Cluster Resize', 'HeatWave 노드 2개 추가 증설 작업. 쿼리 오프로드 성능 30% 향상 목표.',
    'done', 'HeatWave', '아키텍처설계', 'medium', '10.20.30.301', 'prod', 'HeatWave 8.0', NULL, 16, 3,
    datetime('now', '-4 days'), datetime('now', '-4 days', '+6 hours')
  ),
  (
    'Role Permission Audit', 'DB 접근 권한 전수 조사 및 퇴사자 계정 삭제 처리.',
    'done', 'PostgreSQL', '보안점검', 'low', '10.20.30.203', 'prod', 'PostgreSQL 15', NULL, 2, 4,
    datetime('now', '-4 days'), datetime('now', '-4 days', '+4 hours')
  ),

  -- REVIEW (3건) - 2월 9일 ~ 10일
  (
    'Slow Query Indexing - Auth', '인증 서비스 로그인 쿼리 느림 현상. Users 테이블 email 컬럼 복합 인덱스 추가 검토 요청.',
    'review', 'MySQL', '성능튜닝', 'high', '10.20.30.102', 'prod', 'MySQL 8.0', 120, 11, 2,
    datetime('now', '-1 day'), NULL
  ),
  (
    'Cache Eviction Policy Change', 'Redis 캐시 정책 allkeys-lru에서 volatile-lru로 변경 제안 검토.',
    'review', 'Redis', '아키텍처설계', 'medium', '10.20.30.53', 'dev', 'Redis 7.0', NULL, 15, 3,
    datetime('now', '-20 hours'), NULL
  ),
  (
    'Collection Sharding migration', '대용량 로그 컬렉션 샤딩 키 변경(Hashed -> Range) 마이그레이션 계획서 리뷰.',
    'review', 'MongoDB', '아키텍처설계', 'critical', '10.20.30.232', 'prod', 'MongoDB 7.0', NULL, 7, 1,
    datetime('now', '-2 hours'), NULL
  ),

  -- IN_PROGRESS (12건) - 2월 8일 ~ 10일
  (
    'Binlog Retention Policy Change', '디스크 공간 확보를 위해 Binlog 보관 주기 7일에서 3일로 단축 적용 중.',
    'in_progress', 'MySQL', '유지보수', 'low', '10.20.30.103', 'prod', 'MySQL 8.0', NULL, 18, 4,
    datetime('now', '-2 days'), NULL
  ),
  (
    'PostGIS Extension Upgrade', 'GIS 서비스 고도화를 위해 PostGIS 3.3 -> 3.4 업그레이드 작업 진행 중.',
    'in_progress', 'PostgreSQL', '패치업그레이드', 'medium', '10.20.30.204', 'dev', 'PostgreSQL 16', NULL, 6, 3,
    datetime('now', '-2 days'), NULL
  ),
  (
    'Galera Cluster Node Sync', 'Galera Cluster Node 3번 재기동 후 SST 동기화 지연 현상 분석 중.',
    'in_progress', 'MariaDB', '장애대응', 'high', '10.20.30.152', 'prod', 'MariaDB 10.11', 60, 17, 2,
    datetime('now', '-1 day'), NULL
  ),
  (
    'Sentinel Config Drift', 'Sentinel 설정 파일과 런타임 설정 불일치 확인. 설정 파일 동기화 작업.',
    'in_progress', 'Redis', '유지보수', 'medium', '10.20.30.54', 'prod', 'Redis 7.0', NULL, 14, 3,
    datetime('now', '-1 day'), NULL
  ),
  (
    'PL/SQL Function Debugging', '금융 정산 프로시저 오류 디버깅 지원 요청. 변수 타입 불일치 확인 중.',
    'in_progress', 'EDB', '기술지원', 'high', '10.20.30.222', 'dev', 'EDB 15', 120, 4, 2,
    datetime('now', '-1 day'), NULL
  ),
  (
    'Aggregator Node High CPU', 'SingleStore Aggregator 노드 CPU 95% 지속. 쿼리 플랜 캐시 초기화 검토 중.',
    'in_progress', 'SingleStore', '장애대응', 'critical', '10.20.30.253', 'prod', 'SingleStore 8.1', 30, 9, 1,
    datetime('now', '-5 hours'), NULL
  ),
  (
    'Analytics Engine Error 3022', 'HeatWave Analytics 엔진 에러 로그 분석. 오라클 SR 오픈 예정.',
    'in_progress', 'HeatWave', '장애대응', 'high', '10.20.30.302', 'prod', 'HeatWave 8.0', 120, 16, 2,
    datetime('now', '-4 hours'), NULL
  ),
  (
    'Hidden Node Configuration', '백업 전용 Hidden Node 구성 작업. 복제 지연 없이 백업 수행 목적.',
    'in_progress', 'MongoDB', '아키텍처설계', 'low', '10.20.30.233', 'prod', 'MongoDB 6.0', NULL, 5, 4,
    datetime('now', '-3 hours'), NULL
  ),
  (
    'Connection Storm Mitigation', '이벤트 시작 후 DB 커넥션 5000개 급증. Max Connection 조정 및 쓰로틀링 적용 중.',
    'in_progress', 'MySQL', '장애대응', 'critical', '10.20.30.104', 'prod', 'MySQL 8.0', 10, 10, 1,
    datetime('now', '-1 hour'), NULL
  ),
  (
    'Sequence Wrap-around preventative', '메인 테이블 PK Sequence MAX 값 90% 도달. BIGINT 변경 작업 계획 수립 중.',
    'in_progress', 'PostgreSQL', '유지보수', 'medium', '10.20.30.205', 'prod', 'PostgreSQL 14', NULL, 2, 3,
    datetime('now', '-30 minutes'), NULL
  ),
  (
    'Lua Script Optimization', 'Redis Lua 스크립트 실행 시간 500ms 초과. 로직 최적화 가이드 작성.',
    'in_progress', 'Redis', '성능튜닝', 'medium', '10.20.30.55', 'dev', 'Redis 7.0', NULL, 15, 3,
    datetime('now', '-10 minutes'), NULL
  ),
  (
    'Audit Plugin Install', '보안 감사 요건 충족을 위해 MariaDB Audit Plugin 설치 및 테스트.',
    'in_progress', 'MariaDB', '보안점검', 'low', '10.20.30.153', 'stg', 'MariaDB 10.6', NULL, 13, 4,
    datetime('now', '-5 minutes'), NULL
  ),

  -- TO_DO (6건) - 2월 10일
  (
    'Q1 Security Patch Planning', '1분기 정기 보안 패치 일정 수립 및 대상 서버 목록 현행화.',
    'todo', 'MySQL', '패치업그레이드', 'high', NULL, 'all', NULL, NULL, 12, 2,
    NULL, NULL
  ),
  (
    'New Schema Design Review', '신규 정산 시스템 DB 스키마 모델링 리뷰 요청.',
    'todo', 'PostgreSQL', '아키텍처설계', 'medium', NULL, 'dev', 'PostgreSQL 16', NULL, 1, 3,
    NULL, NULL
  ),
  (
    'Backup Verification Drill', '분기별 백업 데이터 복구 모의 훈련 계획.',
    'todo', 'MongoDB', '정기점검', 'medium', NULL, 'prod', NULL, NULL, 7, 3,
    NULL, NULL
  ),
  (
    'Key Expiration Audit', 'TTL 설정되지 않은 오래된 키 전수 조사.',
    'todo', 'Redis', '유지보수', 'low', '10.20.30.56', 'prod', 'Redis 7.0', NULL, 14, 4,
    NULL, NULL
  ),
  (
    'Migration Assessment for HR DB', '인사 시스템 오라클 -> EDB 전환 타당성 검토.',
    'todo', 'EDB', '컨설팅', 'high', NULL, 'n/a', NULL, NULL, 3, 2,
    NULL, NULL
  ),
  (
    'Memory Manager Tuning', 'SingleStore 메모리 사용 효율화를 위한 파라미터 튜닝 테스트.',
    'todo', 'SingleStore', '성능튜닝', 'medium', '10.20.30.254', 'dev', 'SingleStore 8.1', NULL, 9, 3,
    NULL, NULL
  );
