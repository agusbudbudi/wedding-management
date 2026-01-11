-- Migration: Fix Infinite Recursion Code 42P17
-- Description: Breaks RLS loops using SECURITY DEFINER functions

-- 1. Create a secure function to check staff status
-- SECURITY DEFINER ensures this runs with owner privileges, breaking the RLS loop
-- (events -> policy -> event_staff -> policy -> events)
CREATE OR REPLACE FUNCTION is_staff_member(check_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM event_staff
    WHERE event_id = check_event_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Staff can view assigned events" ON events;

-- 3. Re-create Staff Policy using the secure function
-- This allows staff to view events safely
CREATE POLICY "Staff can view assigned events" ON events
  FOR SELECT
  USING ( is_staff_member(id) );

-- 4. Update the trigger function to be SECURITY DEFINER
-- This ensures creating the owner role doesn't hit recursion when inserting into 'roles'
-- (events insert -> trigger -> roles insert -> roles policy -> events select -> recursion)
CREATE OR REPLACE FUNCTION create_owner_role_for_event()
RETURNS TRIGGER AS $$
DECLARE
  new_role_id UUID;
BEGIN
  -- Create Owner role for the new event
  INSERT INTO roles (event_id, name, description, is_system_role)
  VALUES (NEW.id, 'Owner', 'Event owner with full access to all features', true)
  RETURNING id INTO new_role_id;
  
  -- Assign all permissions to Owner role
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT new_role_id, id FROM permissions;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
