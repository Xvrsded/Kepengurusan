-- Create surat_pengajuan table for letter submissions
-- This table replaces the letters table with proper structure

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS surat_pengajuan CASCADE;

-- Create surat_pengajuan table
CREATE TABLE surat_pengajuan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jenis_surat TEXT NOT NULL,
  keperluan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'proses', 'selesai', 'ditolak')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_surat_pengajuan_user_id ON surat_pengajuan(user_id);
CREATE INDEX idx_surat_pengajuan_status ON surat_pengajuan(status);
CREATE INDEX idx_surat_pengajuan_created_at ON surat_pengajuan(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_surat_pengajuan_updated_at
  BEFORE UPDATE ON surat_pengajuan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE surat_pengajuan ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surat_pengajuan

-- Users can insert their own letters
CREATE POLICY "Users can insert own letters" ON surat_pengajuan
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own letters
CREATE POLICY "Users can view own letters" ON surat_pengajuan
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own letters
CREATE POLICY "Users can update own letters" ON surat_pengajuan
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own letters
CREATE POLICY "Users can delete own letters" ON surat_pengajuan
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Admin can update all letters
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

-- Enable Realtime for surat_pengajuan
ALTER PUBLICATION supabase_realtime ADD TABLE surat_pengajuan;
