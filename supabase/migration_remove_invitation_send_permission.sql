-- Migration: Remove Redundant Invitation Send Permission
-- Description: Removes 'invitations:send' as it is redundant to 'guest_list:send_invitation'

-- 1. Remove from role_permissions first (cascade should handle this, but being explicit is safer)
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions WHERE resource = 'invitations' AND action = 'send'
);

-- 2. Remove from permissions table
DELETE FROM permissions
WHERE resource = 'invitations' AND action = 'send';
