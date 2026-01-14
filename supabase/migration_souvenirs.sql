-- Create Souvenirs Table
create table if not exists souvenirs (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) not null,
  name text not null,
  description text,
  stock integer not null default 0,
  image_url text,
  category_restrictions text[], -- Array of allowed categories, null means all
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for souvenirs
alter table souvenirs enable row level security;

-- Policies for souvenirs
drop policy if exists "Enable read access for souvenirs" on souvenirs;
create policy "Enable read access for souvenirs" on souvenirs for select using (true);

drop policy if exists "Enable all access for authenticated users" on souvenirs;
create policy "Enable all access for authenticated users" on souvenirs for all using (auth.role() = 'authenticated');

-- Modify Guests Table for Souvenir Tracking
alter table guests add column if not exists souvenir_id uuid references souvenirs(id);
alter table guests add column if not exists souvenir_redeemed_at timestamp with time zone;
alter table guests add column if not exists souvenir_redeemed_quantity integer default 0;

-- Function to redeem souvenir (transactional)
create or replace function redeem_souvenir(
  p_guest_id uuid,
  p_souvenir_id uuid,
  p_quantity integer
) returns void as $$
declare
  v_current_stock integer;
begin
  -- Check stock
  select stock into v_current_stock from souvenirs where id = p_souvenir_id for update;
  
  if v_current_stock < p_quantity then
    raise exception 'Insufficient souvenir stock';
  end if;

  -- Update guest
  update guests 
  set 
    souvenir_id = p_souvenir_id,
    souvenir_redeemed_at = now(),
    souvenir_redeemed_quantity = p_quantity,
    status = 'souvenir_delivered' -- Auto update status to souvenir_delivered? Or keep existing logic?
    -- Let's stick to status being updated to 'souvenir_delivered' if that's the desired flow.
    -- However, the user said "when souvenir redemmed stock souvenir shall be deducted"
    -- and usually this happens at check-in or exit.
    -- If we use 'souvenir_delivered' status, it might override 'attended'.
    -- Let's just create a separate field or let the frontend decide status update.
    -- For now, just update the tracking columns.
  where id = p_guest_id;

  -- Deduct stock
  update souvenirs
  set stock = stock - p_quantity
  where id = p_souvenir_id;
end;
$$ language plpgsql security definer;
