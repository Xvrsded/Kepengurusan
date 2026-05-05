-- RESET SURAT_PENGAJUAN MODULE - CLEAN ARCHITECTURE
-- This script removes all existing policies and creates simple, non-recursive policies

-- Step 1: Drop ALL existing policies on surat_pengajuan
DROP POLICY IF EXISTS "Users can view own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can insert own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can update own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can delete own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can view all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can update all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can delete all surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "select own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "user insert surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "user view own surat" ON surat_pengajuan;
DROP POLICY IF EXISTS "admin full access surat" ON surat_pengajuan;

-- Step 2: Ensure RLS is enabled
ALTER TABLE surat_pengajuan ENABLE ROW LEVEL SECURITY;

-- Step 3: Create USER ACCESS policies (simple, non-recursive)
-- User can insert their own surat
CREATE POLICY "user insert surat"
ON surat_pengajuan
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User can view their own surat
CREATE POLICY "user view own surat"
ON surat_pengajuan
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User can update their own surat
CREATE POLICY "user update own surat"
ON surat_pengajuan
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- User can delete their own surat
CREATE POLICY "user delete own surat"
ON surat_pengajuan
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Create ADMIN ACCESS policy (simple, non-recursive)
-- Admin has full access to all surat
CREATE POLICY "admin full access surat"
ON surat_pengajuan
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 5: Verify table structure
-- Ensure columns exist and have correct defaults
ALTER TABLE surat_pengajuan 
ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE surat_pengajuan 
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE surat_pengajuan 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Step 6: Ensure trigger for updated_at
DROP TRIGGER IF EXISTS update_surat_pengajuan_updated_at ON surat_pengajuan;

CREATE TRIGGER update_surat_pengajuan_updated_at
  BEFORE UPDATE ON surat_pengajuan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Ensure Realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE surat_pengajuan;

-- Step 8: Verify policies are created correctly
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
WHERE tablename = 'surat_pengajuan'
ORDER BY policyname;
