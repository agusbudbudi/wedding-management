-- Function to redeem souvenir (transactional) with auto-quantity logic
create or replace function redeem_souvenir(
  p_guest_id uuid,
  p_souvenir_id uuid
) returns void as $$
declare
  v_current_stock integer;
  v_quantity_to_deduct integer;
  v_guest_pax integer;
  v_attended_pax integer;
begin
  -- Get user pax info
  select pax_count, attended_pax into v_guest_pax, v_attended_pax 
  from guests 
  where id = p_guest_id;
  
  -- Logic: attended_pax fallback to pax_count
  v_quantity_to_deduct := coalesce(v_attended_pax, v_guest_pax, 1); -- Default to 1 if both null (shouldn't happen)

  -- Check stock
  select stock into v_current_stock from souvenirs where id = p_souvenir_id for update;
  
  if v_current_stock < v_quantity_to_deduct then
    raise exception 'Insufficient souvenir stock. Need %, have %', v_quantity_to_deduct, v_current_stock;
  end if;

  -- Update guest
  update guests 
  set 
    souvenir_id = p_souvenir_id,
    souvenir_redeemed_at = now(),
    souvenir_redeemed_quantity = v_quantity_to_deduct,
    status = 'souvenir_delivered'
  where id = p_guest_id;

  -- Deduct stock
  update souvenirs
  set stock = stock - v_quantity_to_deduct
  where id = p_souvenir_id;
end;
$$ language plpgsql security definer;
