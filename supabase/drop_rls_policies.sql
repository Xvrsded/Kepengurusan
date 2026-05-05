-- STEP 1: Drop all existing RLS policies on citizens table
-- This fixes infinite recursion errors

-- Drop all policies on citizens table
drop policy if exists "users_own_data" on citizens;
drop policy if exists "admin_all_access" on citizens;
drop policy if exists "citizens_select_policy" on citizens;
drop policy if exists "citizens_insert_policy" on citizens;
drop policy if exists "citizens_update_policy" on citizens;
drop policy if exists "citizens_delete_policy" on citizens;

-- Disable RLS temporarily to ensure no policies are active
alter table citizens disable row level security;

-- Re-enable RLS (will be set up with safe policies in next step)
alter table citizens enable row level security;
