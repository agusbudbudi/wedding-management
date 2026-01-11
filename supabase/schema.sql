-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Guests Table
create table guests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  category text not null, -- 'vip', 'family', 'friend', 'colleague', 'other'
  pax_count integer not null default 1,
  status text not null default 'draft', -- 'draft', 'sent', 'viewed', 'confirmed', 'declined'
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Tables Table (for Seating)
create table tables (
  id text primary key, -- slug like 'T-1'
  name text not null,
  shape text not null default 'round', -- 'round', 'rect'
  capacity integer not null default 10,
  section text not null default 'main',
  assigned_guest_ids text[] default '{}', -- Array of guest UUIDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table guests enable row level security;
alter table tables enable row level security;

-- Create Policies (Allow public read for invitation, but restricted write)
-- Note: Selection is remains public to allow invitation lookup by slug, 
-- but we should consider restricting returned columns in the application layer.
DROP POLICY IF EXISTS "Enable read access for all users" ON guests;
CREATE POLICY "Enable read access for guests" ON guests FOR SELECT USING (true);

-- Allow guests to update their own RSVP status (confirmed/declined) and wishes
CREATE POLICY "Allow guests to update their own RSVP" ON guests 
FOR UPDATE 
USING (true)
WITH CHECK (
  status IN ('confirmed', 'declined')
);

-- Allow authenticated users (admins) all access
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON guests;
CREATE POLICY "Enable all access for authenticated users" ON guests FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON tables;
CREATE POLICY "Enable all access for authenticated users" ON tables FOR ALL USING (auth.role() = 'authenticated');

-- Seed Initial Data (Optional)
insert into guests (name, slug, category, pax_count, status)
values
  ('Budi Santoso', 'budi-santoso', 'vip', 2, 'sent'),
  ('Siti Aminah', 'siti-aminah', 'family', 4, 'viewed'),
  ('Andi Wijaya', 'andi-wijaya', 'friend', 1, 'confirmed');

insert into tables (id, name, shape, capacity, section)
values
  ('T-1', 'Table 1', 'round', 10, 'VIP'),
  ('T-2', 'Table 2', 'rect', 8, 'Family');
