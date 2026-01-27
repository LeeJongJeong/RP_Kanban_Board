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
  assigned_to, priority, started_at,
  week_start_date, week_end_date, year_week
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
    datetime('now', '-15 minutes'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-2 hours'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-1 day'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-3 hours'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-45 minutes'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-30 minutes'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-2 hours'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-1 hour'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-4 hours'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    datetime('now', '-1 hour'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
    NULL,
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days'),
    date('now', '-' || ((strftime('%w', 'now') + 6) % 7) || ' days', '+6 days'),
    strftime('%Y-W%W', 'now')
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
