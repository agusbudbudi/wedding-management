-- Migration: Link roles to profiles for ownership display
-- Description: Updates the created_by foreign key to point to public.profiles and adds a specific constraint name

-- 1. Correct the foreign key to point to profiles table
-- First, find the existing constraint name if possible, or just drop and recreate
-- Since we usually don't know the auto-generated name, we'll use a safer approach

ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_created_by_fkey;

ALTER TABLE roles
ADD CONSTRAINT roles_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES profiles(id)
ON DELETE SET NULL;
