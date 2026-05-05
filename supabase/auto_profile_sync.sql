-- AUTO PROFILE SYNC TRIGGER
-- Automatically creates a profile in citizens table when a new user is created in auth.users

-- STEP 1: Create function to sync user to citizens table
create or replace function sync_user_to_citizens()
returns trigger as $$
begin
  -- Insert into citizens table using the new user data from auth.users
  insert into citizens (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'warga'  -- Default role, can be overridden by admin trigger
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql;

-- STEP 2: Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- STEP 3: Create trigger to call the function after insert on auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function sync_user_to_citizens();

-- STEP 4: Verify trigger is created correctly
-- This should show the trigger in the list
select 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
from information_schema.triggers
where trigger_name = 'on_auth_user_created';

-- NOTES:
-- - This trigger runs AFTER a user is inserted into auth.users
-- - It uses NEW.id (the UUID from auth.users) as the primary key
-- - It extracts name and phone from user_metadata if available
-- - Default role is 'warga' - can be changed by the admin assignment trigger
-- - on conflict (id) do nothing prevents duplicate inserts
-- - No schema modifications needed - citizens table should already have correct columns
