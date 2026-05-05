-- Fix admin access to surat_pengajuan using dual access model
-- This ensures admin can view all surat while users can only view their own

-- Step 1: Drop all existing surat_pengajuan policies
DROP POLICY IF EXISTS "Users can view own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can insert own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can update own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can delete own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can view all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can update all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can delete all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "select own surat" ON surat_pengajuan;

-- Step 2: Create dual access model

-- USER POLICIES - Users can only access their own data
CREATE POLICY "Users can view own surat" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surat" ON surat_pengajuan
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surat" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own surat" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ADMIN POLICIES - Admin can access all data
CREATE POLICY "Admin can view all surat" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all surat" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete all surat" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 3: Ensure profiles table has correct structure
-- If profiles table doesn't exist or has different structure, this might fail
-- Make sure profiles table has: id (UUID), role (TEXT)

-- Step 4: Grant necessary permissions
-- Ensure authenticated users have access to profiles table for admin check
-- This is needed for the EXISTS query to work
