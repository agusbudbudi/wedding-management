-- Migration: Add Edit Table Permission
-- Description: Adds 'seating:edit_table' permission for editing table info, separate from assigning guests

-- Insert new permission
INSERT INTO permissions (resource, action, display_name, description) VALUES
  ('seating', 'edit_table', 'Edit Table Info', 'Can edit table name, capacity, and other details')
ON CONFLICT (resource, action) DO NOTHING;

-- Auto-assign new permission to existing Owner roles
DO $$
DECLARE
  owner_role_record RECORD;
BEGIN
  FOR owner_role_record IN SELECT id FROM roles WHERE name = 'Owner' AND is_system_role = true
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT owner_role_record.id, p.id
    FROM permissions p
    WHERE p.resource = 'seating' AND p.action = 'edit_table'
    AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp 
      WHERE rp.role_id = owner_role_record.id AND rp.permission_id = p.id
    );
  END LOOP;
END $$;
