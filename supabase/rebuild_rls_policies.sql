-- STEP 2: Rebuild safe RLS policies (NO RECURSION)
-- These policies use simple auth.uid() checks without self-referential queries

-- Enable RLS on citizens table
alter table citizens enable row level security;

-- Policy: Users can SELECT their own data
create policy "users_select_own_data"
on citizens for select
using (auth.uid() = id);

-- Policy: Users can INSERT their own data
create policy "users_insert_own_data"
on citizens for insert
with check (auth.uid() = id);

-- Policy: Users can UPDATE their own data
create policy "users_update_own_data"
on citizens for update
using (auth.uid() = id);

-- Policy: Users can DELETE their own data
create policy "users_delete_own_data"
on citizens for delete
using (auth.uid() = id);

-- Optional: Admin can access all data (if needed for admin dashboard)
-- Uncomment if admin needs to view/update all citizens
-- create policy "admin_all_access"
-- on citizens for all
-- using (
--   exists (
--     select 1 from citizens
--     where id = auth.uid() and role = 'admin'
--   )
-- );

-- ⚠️ WARNING: Do NOT use policies that query the citizens table recursively
-- Examples of what to AVOID:
-- - exists(select from citizens where ...)
-- - Any self-reference to the citizens table in the policy
