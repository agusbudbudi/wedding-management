-- Migration: Add granular role management permissions and role ownership tracking
-- Description: Adds create_role, edit_role, delete_role permissions and adds created_by column to roles table

-- 1. Add created_by column to roles table if it doesn't exist
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Add new permissions
INSERT INTO permissions (resource, action, display_name, description) VALUES
  ('staff', 'create_role', 'Create New Role', 'Can create new custom roles'),
  ('staff', 'edit_role', 'Edit Role', 'Can edit existing custom roles'),
  ('staff', 'delete_role', 'Delete Role', 'Can delete custom roles')
ON CONFLICT (resource, action) DO NOTHING;

-- 3. Update existing roles to set created_by to the event owner (approximate for existing data)
UPDATE roles r
SET created_by = e.user_id
FROM events e
WHERE r.event_id = e.id AND r.created_by IS NULL;

-- 4. Assign new permissions to Owner roles for all events
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Owner' 
AND p.resource = 'staff' 
AND p.action IN ('create_role', 'edit_role', 'delete_role')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 5. Update RLS policies for roles to allow staff management based on ownership
DROP POLICY IF EXISTS "Event owners can manage roles" ON roles;

CREATE POLICY "Owners can manage all roles" ON roles
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can manage roles they created" ON roles
  FOR ALL USING (
    created_by = auth.uid()
  );
