-- Add updated_at column to guests table
alter table guests 
add column updated_at timestamp with time zone default timezone('utc'::text, now());

-- Optional: Create a trigger to automatically update updated_at on any change
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_guests_updated_at
before update on guests
for each row
execute procedure update_updated_at_column();
