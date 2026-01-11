-- Migration Fix: Make role column nullable in event_staff table
-- This allows using role_id for dynamic roles while maintaining backward compatibility

-- Make the role column nullable
ALTER TABLE event_staff 
ALTER COLUMN role DROP NOT NULL;

-- This allows staff to be assigned via role_id without needing to set the old role column
