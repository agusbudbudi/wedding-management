-- Migration: Create Roles, Permissions, and Role Permissions tables
-- Description: Implements dynamic role-based access control system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- 2. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- 3. Create Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 4. Add role_id column to event_staff (keep old role column for migration)
ALTER TABLE event_staff 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- 5. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roles_event_id ON roles(event_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_role_id ON event_staff(role_id);

-- 6. Seed Default Permissions
INSERT INTO permissions (resource, action, display_name, description) VALUES
  -- Guest List Permissions
  ('guest_list', 'view', 'View Guest List', 'Can view the guest list'),
  ('guest_list', 'add', 'Add Guest', 'Can add new guests'),
  ('guest_list', 'edit', 'Edit Guest', 'Can edit guest information'),
  ('guest_list', 'delete', 'Delete Guest', 'Can delete guests'),
  ('guest_list', 'import', 'Import Guest List', 'Can import guests from file'),
  ('guest_list', 'send_invitation', 'Send Invitation', 'Can send invitations to guests'),
  
  -- Seating Permissions
  ('seating', 'view', 'View Seating', 'Can view seating arrangements'),
  ('seating', 'edit', 'Edit Seating', 'Can edit seating arrangements'),
  ('seating', 'add_table', 'Add Table', 'Can add new tables'),
  ('seating', 'delete_table', 'Delete Table', 'Can delete tables'),
  
  -- Check-in Permissions
  ('check_in', 'view', 'View Check-in Tool', 'Can access check-in tool'),
  ('check_in', 'scan', 'Scan QR Code', 'Can scan guest QR codes'),
  ('check_in', 'manual', 'Manual Check-in', 'Can manually check-in guests'),
  
  -- Invitations Permissions
  ('invitations', 'view', 'View Invitations', 'Can view invitation templates'),
  ('invitations', 'edit', 'Edit Invitation', 'Can edit invitation templates'),
  ('invitations', 'send', 'Send Invitations', 'Can send invitations'),
  
  -- Staff Permissions
  ('staff', 'view', 'View Staff', 'Can view staff members'),
  ('staff', 'add', 'Add Staff', 'Can add new staff members'),
  ('staff', 'remove', 'Remove Staff', 'Can remove staff members'),
  ('staff', 'manage_roles', 'Manage Roles & Permissions', 'Can create and manage roles and permissions'),
  
  -- Dashboard Permissions
  ('dashboard', 'view', 'View Dashboard', 'Can view dashboard overview'),
  
  -- Events Permissions
  ('events', 'view', 'View Events', 'Can view events list'),
  ('events', 'create', 'Create Event', 'Can create new events'),
  ('events', 'edit', 'Edit Event', 'Can edit event details'),
  ('events', 'delete', 'Delete Event', 'Can delete events')
ON CONFLICT (resource, action) DO NOTHING;

-- 7. Create function to auto-create Owner role when event is created
CREATE OR REPLACE FUNCTION create_owner_role_for_event()
RETURNS TRIGGER AS $$
DECLARE
  new_role_id UUID;
  perm RECORD;
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
$$ LANGUAGE plpgsql;

-- 8. Create trigger to auto-create Owner role
DROP TRIGGER IF EXISTS trigger_create_owner_role ON events;
CREATE TRIGGER trigger_create_owner_role
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_role_for_event();

-- 9. Backfill Owner roles for existing events
DO $$
DECLARE
  event_record RECORD;
  new_role_id UUID;
BEGIN
  FOR event_record IN SELECT id FROM events WHERE id NOT IN (SELECT DISTINCT event_id FROM roles WHERE name = 'Owner')
  LOOP
    -- Create Owner role
    INSERT INTO roles (event_id, name, description, is_system_role)
    VALUES (event_record.id, 'Owner', 'Event owner with full access to all features', true)
    RETURNING id INTO new_role_id;
    
    -- Assign all permissions
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT new_role_id, id FROM permissions;
  END LOOP;
END $$;

-- 10. Create RLS Policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Users can view roles for their events" ON roles
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
      UNION
      SELECT event_id FROM event_staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can manage roles" ON roles
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

-- Permissions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Role permissions policies
CREATE POLICY "Users can view role permissions for their events" ON role_permissions
  FOR SELECT USING (
    role_id IN (
      SELECT r.id FROM roles r
      WHERE r.event_id IN (
        SELECT id FROM events WHERE user_id = auth.uid()
        UNION
        SELECT event_id FROM event_staff WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Event owners can manage role permissions" ON role_permissions
  FOR ALL USING (
    role_id IN (
      SELECT r.id FROM roles r
      WHERE r.event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
    )
  );

-- Migration complete
