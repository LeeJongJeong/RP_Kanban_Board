-- 실제 DS1T/DS2T 팀 엔지니어 데이터
INSERT INTO engineers (name, email, role, wip_limit) VALUES 
  -- DS1T 팀 (9명)
  ('최영준', 'youngjun.choi@company.com', 'engineer', 3),
  ('이성인', 'sungin.lee@company.com', 'engineer', 3),
  ('김태관', 'taegwan.kim@company.com', 'engineer', 3),
  ('김정환', 'junghwan.kim@company.com', 'engineer', 3),
  ('최용규', 'yongkyu.choi@company.com', 'engineer', 3),
  ('김지은', 'jieun.kim@company.com', 'engineer', 3),
  ('강홍용', 'hongyong.kang@company.com', 'engineer', 3),
  ('서원길', 'wongil.seo@company.com', 'engineer', 3),
  ('김지현', 'jihyun.kim@company.com', 'engineer', 3),
  
  -- DS2T 팀 (9명)
  ('임종민', 'jongmin.lim@company.com', 'engineer', 3),
  ('이소라', 'sora.lee@company.com', 'engineer', 3),
  ('한수현', 'soohyun.han@company.com', 'engineer', 3),
  ('고재훈', 'jaehoon.ko@company.com', 'engineer', 3),
  ('추건우', 'gunwoo.chu@company.com', 'engineer', 3),
  ('엄혜진', 'hyejin.eom@company.com', 'engineer', 3),
  ('배재준', 'jaejun.bae@company.com', 'engineer', 3),
  ('박재원', 'jaewon.park@company.com', 'engineer', 3),
  ('장희수', 'heesu.jang@company.com', 'engineer', 3);

-- 샘플 티켓 데이터 (DS1T/DS2T 팀원에게 분산 할당)
INSERT INTO tickets (
  title, description, status, dbms_type, work_category, severity, 
  instance_host, instance_env, instance_version, sla_minutes, 
  assigned_to, priority, started_at
) VALUES 
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
    1,  -- 최영준 (DS1T)
    1,
    datetime('now', '-15 minutes')
  ),
  (
    'PostgreSQL 슬로우 쿼리 성능 튜닝',
    '고객사 보고된 특정 쿼리의 실행 시간이 10초 이상 소요. Index 추가 및 쿼리 최적화 필요.',
    'todo',
    'PostgreSQL',
    '성능튜닝',
    'high',
    '10.20.30.200',
    'prod',
    'PostgreSQL 15.4',
    240,
    10,  -- 임종민 (DS2T)
    2,
    NULL
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
    3,  -- 김태관 (DS1T)
    3,
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
    13,  -- 고재훈 (DS2T)
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
    6,  -- 김지은 (DS1T)
    3,
    datetime('now', '-1 day')
  ),
  (
    'PostgreSQL Connection Pool 최적화',
    'pgBouncer 설정 최적화로 Connection Pool 효율 개선.',
    'in_progress',
    'PostgreSQL',
    '성능튜닝',
    'medium',
    '10.20.30.201',
    'prod',
    'PostgreSQL 15.4',
    180,
    11,  -- 이소라 (DS2T)
    2,
    datetime('now', '-30 minutes')
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
    2,  -- 이성인 (DS1T)
    2,
    NULL
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
    7,  -- 강홍용 (DS1T)
    2,
    datetime('now', '-1 hour')
  ),
  (
    'EDB Postgres Advanced 마이그레이션',
    'Oracle에서 EDB Postgres Advanced Server로 마이그레이션. 호환성 패키지 및 PL/SQL 변환 작업.',
    'todo',
    'EDB',
    '아키텍처설계',
    'medium',
    NULL,
    'stg',
    'EDB 16',
    NULL,
    15,  -- 엄혜진 (DS2T)
    3,
    NULL
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
    14,  -- 추건우 (DS2T)
    3,
    datetime('now', '-3 hours')
  );

-- 샘플 코멘트 데이터
INSERT INTO comments (ticket_id, engineer_id, content, comment_type) VALUES 
  (1, 1, 'Replication Lag 원인 분석 중: Slave 서버의 Disk I/O가 100%에 근접. Slow Query Log 확인 필요.', 'note'),
  (1, 1, 'Workaround: read_only 쿼리를 Master로 임시 우회. Slave 재구성 예정.', 'workaround'),
  (4, 13, '백업 상태 정상, Replication 1초 이하 정상, Buffer Pool 사용률 78% 양호.', 'note'),
  (5, 6, 'Redis 7.2.4 패치 적용 완료. 재시작 후 클러스터 상태 정상 확인.', 'solution'),
  (8, 7, 'SingleStore Leaf Node CPU 사용률 90% 이상. 쿼리 실행 계획 분석 중.', 'note'),
  (10, 14, 'Sentinel 자동 Failover 정상 작동 확인. Failover 시간 2.3초 소요.', 'solution');

-- 샘플 히스토리 데이터
INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value) VALUES 
  (1, 1, 'status', 'todo', 'in_progress'),
  (4, 13, 'status', 'in_progress', 'review'),
  (5, 6, 'status', 'in_progress', 'done'),
  (5, 6, 'resolved_at', NULL, datetime('now', '-1 day')),
  (8, 7, 'status', 'todo', 'in_progress'),
  (10, 14, 'status', 'in_progress', 'review');
