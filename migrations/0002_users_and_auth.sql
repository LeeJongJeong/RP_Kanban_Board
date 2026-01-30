-- ============================================
-- Migration 0002: Users and Authentication
-- 사용자 테이블 및 인증 관련 스키마
-- ============================================

-- Users (사용자 계정)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  
  -- 역할 기반 접근 제어
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
  engineer_id INTEGER, -- 연결된 엔지니어 (선택적)
  is_active INTEGER DEFAULT 1, -- 1: 활성, 0: 비활성
  
  -- 사용자 표시 정보
  display_name TEXT, -- 표시 이름
  job_title TEXT,    -- 직급/직책
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (engineer_id) REFERENCES engineers(id)
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
