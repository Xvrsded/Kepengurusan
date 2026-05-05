-- STEP 1: Create function to assign admin role on first registration
create or replace function assign_role_on_register()
returns trigger as $$
declare
  admin_count integer;
begin
  select count(*) into admin_count from citizens where role = 'admin';

  if admin_count = 0 then
    new.role := 'admin';
  else
    new.role := 'warga';
  end if;

  return new;
end;
$$ language plpgsql;

-- STEP 2: Create trigger to call the function before insert
drop trigger if exists trigger_assign_role on citizens;

create trigger trigger_assign_role
before insert on citizens
for each row
execute function assign_role_on_register();

-- STEP 5 (OPTIONAL): Hard lock - ensure only one admin can exist
create unique index only_one_admin on citizens ((role)) where role = 'admin';
