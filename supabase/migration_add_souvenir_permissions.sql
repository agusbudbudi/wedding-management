-- Migration: Add Souvenir Permissions
-- Description: Adds granular permissions for souvenir management

-- Insert new permissions
INSERT INTO permissions (resource, action, display_name, description) VALUES
  -- Souvenir Permissions
  ('souvenirs', 'view', 'View Souvenirs', 'Can view souvenir list and statistics'),
  ('souvenirs', 'create', 'Create Souvenirs', 'Can add new souvenir items'),
  ('souvenirs', 'edit', 'Edit Souvenirs', 'Can edit existing souvenir items'),
  ('souvenirs', 'delete', 'Delete Souvenirs', 'Can delete souvenir items'),
  ('souvenirs', 'view_redeemed', 'View Redeemed Guests', 'Can view the list of guests who have redeemed souvenirs'),
  ('souvenirs', 'export_report', 'Export Reports', 'Can export souvenir redemption reports')
ON CONFLICT (resource, action) DO NOTHING;

-- Auto-assign new permissions to existing Owner roles
DO $$
DECLARE
  owner_role_record RECORD;
BEGIN
  FOR owner_role_record IN SELECT id FROM roles WHERE name = 'Owner' AND is_system_role = true
  LOOP
     -- Assign new permissions to this owner role
     -- We use INSERT ... ON CONFLICT DO NOTHING if constraint exists, 
     -- but since role_permissions has (role_id, permission_id) unique, we can use that or WHERE NOT EXISTS logic.
     -- Using pure SQL insert-select with where not exists for safety.
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT owner_role_record.id, p.id
    FROM permissions p
    WHERE p.resource = 'souvenirs'
    AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp 
      WHERE rp.role_id = owner_role_record.id AND rp.permission_id = p.id
    );
  END LOOP;
END $$;
