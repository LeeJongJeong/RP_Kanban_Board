-- 샘플 엔지니어 데이터
INSERT INTO engineers (name, email, role, wip_limit) VALUES 
  ('김민수', 'minsu.kim@company.com', 'manager', 5),
  ('이영희', 'younghee.lee@company.com', 'engineer', 3),
  ('박철수', 'chulsoo.park@company.com', 'engineer', 3),
  ('정수진', 'sujin.jung@company.com', 'consultant', 4),
  ('최동욱', 'dongwook.choi@company.com', 'engineer', 3);

-- 샘플 티켓 데이터
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
    2,
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
    3,
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
    4,
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
    5,
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
    2,
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
    3,
    2,
    datetime('now', '-30 minutes')
  );

-- 샘플 코멘트 데이터
INSERT INTO comments (ticket_id, engineer_id, content, comment_type) VALUES 
  (1, 2, 'Replication Lag 원인 분석 중: Slave 서버의 Disk I/O가 100%에 근접. Slow Query Log 확인 필요.', 'note'),
  (1, 2, 'Workaround: read_only 쿼리를 Master로 임시 우회. Slave 재구성 예정.', 'workaround'),
  (4, 5, '백업 상태 정상, Replication 1초 이하 정상, Buffer Pool 사용률 78% 양호.', 'note'),
  (5, 2, 'Redis 7.2.4 패치 적용 완료. 재시작 후 클러스터 상태 정상 확인.', 'solution');

-- 샘플 히스토리 데이터
INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value) VALUES 
  (1, 2, 'status', 'todo', 'in_progress'),
  (4, 5, 'status', 'in_progress', 'review'),
  (5, 2, 'status', 'in_progress', 'done'),
  (5, 2, 'resolved_at', NULL, datetime('now', '-1 day'));
