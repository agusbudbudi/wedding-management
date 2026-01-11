-- Migration: Allow staff to view assigned events
-- Description: Adds RLS policy to 'events' table so staff can fetch event details

-- Enable RLS (ensure it is enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for staff access
-- This allows any authenticated user to view an event IF they are listed in the event_staff table for that event
CREATE POLICY "Staff can view assigned events" ON events
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM event_staff WHERE event_id = events.id
    )
  );

-- Note: existing policy "Users can view own events" covers the owner.
