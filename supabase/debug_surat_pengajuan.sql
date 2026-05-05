-- Debug script to verify data in surat_pengajuan table
-- Run this in Supabase SQL Editor to verify data exists

-- Step 1: Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'surat_pengajuan'
);

-- Step 2: Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'surat_pengajuan'
ORDER BY ordinal_position;

-- Step 3: Count all records
SELECT COUNT(*) as total_records FROM surat_pengajuan;

-- Step 4: Show all records (bypass RLS temporarily)
-- Note: This requires superuser access or RLS disabled
SET LOCAL search_path TO public;
SET LOCAL statement_timeout TO '30s';

-- Try to select with security definer function
CREATE OR REPLACE FUNCTION get_all_surat_pengajuan()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  jenis_surat text,
  keperluan text,
  status text,
  admin_note text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.surat_pengajuan ORDER BY created_at DESC;
$$;

-- Execute the function
SELECT * FROM get_all_surat_pengajuan();

-- Step 5: Check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'surat_pengajuan';

-- Step 6: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'surat_pengajuan';

-- Step 7: Check current user
SELECT current_user, auth.uid();

-- Step 8: Check if profiles table exists and has admin role
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'profiles'
);

-- Step 9: Check profiles structure if exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 10: Check admin users in profiles
SELECT * FROM profiles WHERE role = 'admin';

-- Cleanup function (optional)
-- DROP FUNCTION IF EXISTS get_all_surat_pengajuan();
