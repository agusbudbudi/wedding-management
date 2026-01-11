-- Create Events Table
create table events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date date not null,
  location text,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add event_id to guests and tables
alter table guests add column event_id uuid references events(id);
alter table tables add column event_id uuid references events(id);

-- Enable RLS for events
alter table events enable row level security;

-- Allow public read access to events (required for invitations to look up event details by slug/id)
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
CREATE POLICY "Enable read access for events" ON events FOR SELECT USING (true);

-- Allow authenticated users (admins) all access
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON events;
CREATE POLICY "Enable all access for authenticated users" ON events FOR ALL USING (auth.role() = 'authenticated');

-- Insert a default event
insert into events (name, date, location, slug)
values ('Budi & Siti Wedding', '2025-10-20', 'Gran Melia Hotel', 'budi-siti-wedding');

-- Update existing data to link to the default event
update guests set event_id = (select id from events where slug = 'budi-siti-wedding') where event_id is null;
update tables set event_id = (select id from events where slug = 'budi-siti-wedding') where event_id is null;
