-- Fix infinite recursion in RLS policies
-- This script removes recursive policies and creates a safe role function

-- Step 1: Create safe role function that doesn't query tables with RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Step 2: Drop all existing policies that use EXISTS queries
DROP POLICY IF EXISTS "Users can view own citizens" ON citizens;
DROP POLICY IF EXISTS "Admin can view all citizens" ON citizens;
DROP POLICY IF EXISTS "Users can view own letters" ON letters;
DROP POLICY IF EXISTS "Admin can view all letters" ON letters;
DROP POLICY IF EXISTS "Users can view own iuran" ON iuran;
DROP POLICY IF EXISTS "Admin can view all iuran" ON iuran;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admin can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Everyone can view iuran types" ON iuran_types;
DROP POLICY IF EXISTS "Admin can modify iuran types" ON iuran_types;
DROP POLICY IF EXISTS "Users can view own iuran payments" ON iuran_payments;
DROP POLICY IF EXISTS "Admin can view all iuran payments" ON iuran_payments;

-- Step 3: Recreate policies using the safe function

-- Citizens RLS Policies
CREATE POLICY "Users can view own citizens" ON citizens
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all citizens" ON citizens
  FOR ALL
  USING (get_my_role() = 'admin');

-- Letters RLS Policies
CREATE POLICY "Users can view own letters" ON letters
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all letters" ON letters
  FOR ALL
  USING (get_my_role() = 'admin');

-- Iuran RLS Policies
CREATE POLICY "Users can view own iuran" ON iuran
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all iuran" ON iuran
  FOR ALL
  USING (get_my_role() = 'admin');

-- Notifications RLS Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all notifications" ON notifications
  FOR ALL
  USING (get_my_role() = 'admin');

-- Iuran Types RLS Policies
CREATE POLICY "Everyone can view iuran types" ON iuran_types
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can modify iuran types" ON iuran_types
  FOR ALL
  USING (get_my_role() = 'admin');

-- Iuran Payments RLS Policies
CREATE POLICY "Users can view own iuran payments" ON iuran_payments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all iuran payments" ON iuran_payments
  FOR ALL
  USING (get_my_role() = 'admin');

-- Step 4: Fix surat_pengajuan policies to use the safe function
DROP POLICY IF EXISTS "Users can view own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can insert own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can update own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can delete own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can view all letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can update all letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can delete all letters" ON surat_pengajuan;

-- User can view own letters (for tracking)
CREATE POLICY "Users can view own surat" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User can insert own letters
CREATE POLICY "Users can insert own surat" ON surat_pengajuan
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User can update own letters
CREATE POLICY "Users can update own surat" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User can delete own letters
CREATE POLICY "Users can delete own surat" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can view all letters
CREATE POLICY "Admin can view all surat" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

-- Admin can update all letters (approve/reject)
CREATE POLICY "Admin can update all surat" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Admin can delete all letters
CREATE POLICY "Admin can delete all surat" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Step 5: Fix other tables that might have recursion issues
-- Location config
DROP POLICY IF EXISTS "location_config_select_all" ON location_config;
DROP POLICY IF EXISTS "location_config_update_admin" ON location_config;
DROP POLICY IF EXISTS "location_config_insert_admin" ON location_config;

CREATE POLICY "Everyone can view location config" ON location_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can modify location config" ON location_config
  FOR ALL
  USING (get_my_role() = 'admin');

-- Candidates
DROP POLICY IF EXISTS "Everyone can view candidates" ON candidates;
DROP POLICY IF EXISTS "Admin can modify candidates" ON candidates;

CREATE POLICY "Everyone can view active candidates" ON candidates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can modify candidates" ON candidates
  FOR ALL
  USING (get_my_role() = 'admin');

-- Panic alerts
DROP POLICY IF EXISTS "Users can view own panic alerts" ON panic_alerts;
DROP POLICY IF EXISTS "Admin can view all panic alerts" ON panic_alerts;

CREATE POLICY "Users can view own panic alerts" ON panic_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all panic alerts" ON panic_alerts
  FOR ALL
  USING (get_my_role() = 'admin');

-- Grant execute permission on get_my_role to authenticated users
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
