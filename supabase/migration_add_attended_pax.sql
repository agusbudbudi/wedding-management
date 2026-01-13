-- Add attended_pax column to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS attended_pax INTEGER;

-- Update RLS policies if necessary (usually not needed for just a column addition if blanket policies exist, but good to check)
-- Assuming existing policies cover "guests" table updates for staff/owners.
