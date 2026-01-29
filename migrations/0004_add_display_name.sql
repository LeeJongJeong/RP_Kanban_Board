-- Migration number: 0004
-- Add display_name column to users table

ALTER TABLE users ADD COLUMN display_name TEXT;
