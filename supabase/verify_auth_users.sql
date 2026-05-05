-- VERIFY AUTH USERS
-- Check if user exists in auth.users and citizens table

-- Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'onoawal3@gmail.com';

-- Check if user exists in citizens table
SELECT 
  id,
  name,
  phone,
  role,
  created_at
FROM citizens 
WHERE email = 'onoawal3@gmail.com' OR id = (SELECT id FROM auth.users WHERE email = 'onoawal3@gmail.com');

-- Check all users in auth.users
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check all users in citizens table
SELECT 
  id,
  name,
  email,
  phone,
  role,
  created_at
FROM citizens 
ORDER BY created_at DESC;

-- Check for mismatched users (in auth.users but not in citizens, or vice versa)
SELECT 
  'auth.users only' as source,
  id,
  email,
  created_at
FROM auth.users 
WHERE id NOT IN (SELECT id FROM citizens)
UNION ALL
SELECT 
  'citizens only' as source,
  id,
  name as email,
  created_at
FROM citizens 
WHERE id NOT IN (SELECT id FROM auth.users);
