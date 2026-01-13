-- Add notes column to tables table
ALTER TABLE tables ADD COLUMN IF NOT EXISTS notes TEXT;
