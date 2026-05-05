-- FIX AUTH USERS
-- This script creates Supabase Auth users if they only exist in citizens table
-- WARNING: This requires setting a temporary password - user must reset it

-- STEP 1: Check for users in citizens table that don't exist in auth.users
-- This will show you which users need to be created in auth.users

-- Find users in citizens but not in auth.users
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.role
FROM citizens c
WHERE c.id NOT IN (SELECT id FROM auth.users)
  AND c.email IS NOT NULL;

-- STEP 2: Create auth users for missing users
-- NOTE: This uses the Supabase Management API through SQL
-- You need to provide a temporary password for each user

-- For onoawal3@gmail.com (if missing from auth.users)
-- Uncomment and modify the email/password if needed

-- This is a placeholder - you need to use Supabase Dashboard or Management API
-- to create users in auth.users, as direct SQL insertion is not recommended
-- for security reasons.

-- ALTERNATIVE: Use Supabase Dashboard
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email: onoawal3@gmail.com
-- 4. Set a temporary password
-- 5. Assign role (if needed)
-- 6. Click "Create user"

-- ALTERNATIVE: Use Supabase CLI
-- supabase auth create-user --email onoawal3@gmail.com --password YourTempPassword123

-- STEP 3: After creating auth user, ensure citizens table has the correct id
-- The citizens table id should match the auth.users id (UUID)

-- Update citizens table to match auth.users id if needed
-- (Only run this if the ids don't match)

-- UPDATE citizens
-- SET id = (SELECT id FROM auth.users WHERE email = 'onoawal3@gmail.com')
-- WHERE email = 'onoawal3@gmail.com';

-- STEP 4: Verify the fix
-- Run verify_auth_users.sql again to check

-- RECOMMENDED WORKFLOW:
-- 1. Run verify_auth_users.sql to see the current state
-- 2. If user exists in citizens but not auth.users:
--    a. Use Supabase Dashboard to create the user in auth.users
--    b. Set a temporary password
--    c. Update the citizens table id to match auth.users id
-- 3. Run verify_auth_users.sql again to confirm
-- 4. Test login with the temporary password
-- 5. Ask user to reset their password
