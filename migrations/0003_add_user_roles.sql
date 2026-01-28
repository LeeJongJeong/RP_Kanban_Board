-- Migration number: 0003 	 2026-01-28T07:17:00.000Z
-- Add role-based access control to users table

-- Add new columns to users table
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN engineer_id INTEGER;
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;

-- Note: SQLite doesn't support adding foreign key constraints via ALTER TABLE
-- The constraint will be enforced at application level
