-- Migration: Remove Redundant Event Permissions
-- Description: Removes create, edit, and delete permissions for the 'events' resource as these are owner-only.

-- 1. Remove from role_permissions
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions 
  WHERE resource = 'events' 
  AND action IN ('create', 'edit', 'delete')
);

-- 2. Remove from permissions table
DELETE FROM permissions
WHERE resource = 'events' 
AND action IN ('create', 'edit', 'delete');
