-- Update surat_pengajuan table for tracking status feature
-- Add admin_note and ensure updated_at exists

-- Add admin_note column if not exists
ALTER TABLE surat_pengajuan 
ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Add updated_at column if not exists
ALTER TABLE surat_pengajuan 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update status column default to 'pending'
ALTER TABLE surat_pengajuan 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_surat_pengajuan_updated_at ON surat_pengajuan;

CREATE TRIGGER update_surat_pengajuan_updated_at
  BEFORE UPDATE ON surat_pengajuan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies for tracking feature

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can view own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can update own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Users can delete own letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can view all letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can update all letters" ON surat_pengajuan;
DROP POLICY IF EXISTS "Admin can delete all letters" ON surat_pengajuan;

-- User can view own letters (for tracking)
CREATE POLICY "Users can view own letters" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User can insert own letters
CREATE POLICY "Users can insert own letters" ON surat_pengajuan
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all letters
CREATE POLICY "Admin can view all letters" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admin can update all letters (approve/reject)
CREATE POLICY "Admin can update all letters" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admin can delete all letters
CREATE POLICY "Admin can delete all letters" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Ensure Realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE surat_pengajuan;
