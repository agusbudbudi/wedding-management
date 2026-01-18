-- Migration: Fix role_permissions RLS for staff management
-- Description: Allows staff to manage permissions for roles they created

-- 1. Update RLS policies for role_permissions
DROP POLICY IF EXISTS "Event owners can manage role permissions" ON role_permissions;

CREATE POLICY "Owners can manage all role permissions" ON role_permissions
  FOR ALL USING (
    role_id IN (
      SELECT r.id FROM roles r
      WHERE r.event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Staff can manage permissions for roles they created" ON role_permissions
  FOR ALL USING (
    role_id IN (
      SELECT r.id FROM roles r
      WHERE r.created_by = auth.uid()
    )
  );
