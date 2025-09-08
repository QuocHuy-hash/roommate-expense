-- Migration: Add is_settled column to expenses table
ALTER TABLE expenses ADD COLUMN is_settled BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN expenses.is_settled IS 'Indicates whether the shared expense has been settled by the other party';
