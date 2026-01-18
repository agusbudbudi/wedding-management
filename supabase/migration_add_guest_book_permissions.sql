-- Migration: Add Guest Book Permissions
-- Description: Adds granular permissions for Guest Book management

-- 1. Insert new permissions
INSERT INTO permissions (resource, action, display_name, description) VALUES
  ('guest_book', 'view', 'View Guest Book', 'Can view the guest photo book and wishes'),
  ('guest_book', 'delete', 'Delete Photo', 'Can delete submitted photos and wishes'),
  ('guest_book', 'download', 'Download PDF', 'Can download the guest book as PDF')
ON CONFLICT (resource, action) DO NOTHING;

-- 2. Auto-assign new permissions to existing Owner roles
DO $$
DECLARE
  owner_role_record RECORD;
BEGIN
  FOR owner_role_record IN SELECT id FROM roles WHERE name = 'Owner' AND is_system_role = true
  LOOP
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT owner_role_record.id, p.id
    FROM permissions p
    WHERE p.resource = 'guest_book'
    AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp 
      WHERE rp.role_id = owner_role_record.id AND rp.permission_id = p.id
    );
  END LOOP;
END $$;
