-- Engineers (엔지니어 정보)
CREATE TABLE IF NOT EXISTS engineers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'engineer', -- 'manager', 'engineer', 'consultant'
  wip_limit INTEGER DEFAULT 3, -- WIP 제한 (동시 진행 가능한 티켓 수)
  is_active INTEGER DEFAULT 1, -- 1: 활성, 0: 비활성
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets (티켓/작업 정보)
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 상태 관리
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  
  -- DB 엔지니어링 특화 필드
  dbms_type TEXT NOT NULL, -- 'MySQL', 'PostgreSQL', 'MariaDB', 'MongoDB', 'Redis', 'SingleStore', 'HeatWave', 'EDB'
  work_category TEXT NOT NULL, -- '장애대응', '성능튜닝', '아키텍처설계', '정기점검', '패치업그레이드'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  
  -- 인스턴스 정보
  instance_host TEXT, -- 대상 호스트 IP
  instance_env TEXT DEFAULT 'prod', -- 'prod', 'dev', 'stg'
  instance_version TEXT, -- DB 버전 정보
  
  -- SLA 타이머
  sla_minutes INTEGER, -- 목표 해결 시간 (분 단위)
  started_at DATETIME, -- 실제 작업 시작 시간
  resolved_at DATETIME, -- 해결 완료 시간
  
  -- 담당자
  assigned_to INTEGER, -- engineers 테이블의 id
  
  -- 우선순위
  priority INTEGER DEFAULT 3, -- 1: 최우선, 2: 높음, 3: 보통, 4: 낮음
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assigned_to) REFERENCES engineers(id)
);

-- Comments (티켓 코멘트/기술 노트)
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  engineer_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note', -- 'note', 'solution', 'workaround', 'reference'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

-- Ticket History (티켓 상태 변경 이력)
CREATE TABLE IF NOT EXISTS ticket_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  changed_by INTEGER NOT NULL,
  field_name TEXT NOT NULL, -- 'status', 'assigned_to', 'severity' 등
  old_value TEXT,
  new_value TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES engineers(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_dbms_type ON tickets(dbms_type);
CREATE INDEX IF NOT EXISTS idx_tickets_severity ON tickets(severity);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history(ticket_id);
