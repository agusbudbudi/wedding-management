-- Add default UUID to tables id column if it's missing
-- This ensures that new tables get a unique ID automatically if not provided
alter table tables alter column id set default uuid_generate_v4()::text;
