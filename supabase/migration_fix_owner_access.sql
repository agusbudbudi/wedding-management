-- Migration: Restore Owner Access
-- Description: Adds RLS policy so creating users (owners) can view their own events

-- 1. Ensure RLS is enabled (it should be, but just in case)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 2. Add Policy for Owners
-- This allows users to view events where they are the 'user_id' (creator/owner)
CREATE POLICY "Users can view own events" ON events
  FOR ALL
  USING (auth.uid() = user_id);

-- Note: The previous migration added the "Staff" policy.
-- Now both policies will be active: "Owner" OR "Staff" access.
