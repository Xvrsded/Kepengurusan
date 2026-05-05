-- Create iuran_master and iuran_user tables for production-grade iuran system
-- This replaces the old iuran/iuran_types/iuran_payments system

-- Step 1: Create iuran_master table (admin creates iuran types here)
CREATE TABLE IF NOT EXISTS iuran_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Step 2: Create iuran_user table (auto-generated for all warga)
CREATE TABLE IF NOT EXISTS iuran_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iuran_master_id UUID NOT NULL REFERENCES iuran_master(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users or profiles table
  status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'overdue'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_iuran_master_created_at ON iuran_master(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iuran_master_created_by ON iuran_master(created_by);
CREATE INDEX IF NOT EXISTS idx_iuran_user_iuran_master_id ON iuran_user(iuran_master_id);
CREATE INDEX IF NOT EXISTS idx_iuran_user_user_id ON iuran_user(user_id);
CREATE INDEX IF NOT EXISTS idx_iuran_user_status ON iuran_user(status);
CREATE INDEX IF NOT EXISTS idx_iuran_user_created_at ON iuran_user(created_at DESC);

-- Step 4: Create trigger for updated_at on iuran_master
CREATE OR REPLACE FUNCTION update_iuran_master_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_iuran_master_updated_at
  BEFORE UPDATE ON iuran_master
  FOR EACH ROW
  EXECUTE FUNCTION update_iuran_master_updated_at();

-- Step 5: Create trigger for updated_at on iuran_user
CREATE OR REPLACE FUNCTION update_iuran_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_iuran_user_updated_at
  BEFORE UPDATE ON iuran_user
  FOR EACH ROW
  EXECUTE FUNCTION update_iuran_user_updated_at();

-- Step 6: Create function to auto-generate iuran_user entries for all warga
-- This function is called by a trigger after iuran_master insert
CREATE OR REPLACE FUNCTION generate_iuran_user_entries()
RETURNS TRIGGER AS $$
DECLARE
  warga_user RECORD;
BEGIN
  -- Loop through all authenticated users (or profiles table if exists)
  FOR warga_user IN 
    SELECT id FROM profiles WHERE role = 'warga'
  LOOP
    INSERT INTO iuran_user (
      iuran_master_id,
      user_id,
      status
    ) VALUES (
      NEW.id,
      warga_user.id,
      'unpaid'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-generate iuran_user entries
CREATE TRIGGER trigger_generate_iuran_user_entries
  AFTER INSERT ON iuran_master
  FOR EACH ROW
  EXECUTE FUNCTION generate_iuran_user_entries();

-- Step 8: Enable RLS
ALTER TABLE iuran_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_user ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for iuran_master
-- Admin can view all iuran_master
CREATE POLICY "admin view all iuran_master"
ON iuran_master
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can insert iuran_master
CREATE POLICY "admin insert iuran_master"
ON iuran_master
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can update iuran_master
CREATE POLICY "admin update iuran_master"
ON iuran_master
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can delete iuran_master
CREATE POLICY "admin delete iuran_master"
ON iuran_master
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 10: Create RLS policies for iuran_user
-- User can view their own iuran_user
CREATE POLICY "user view own iuran_user"
ON iuran_user
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User can update their own iuran_user (for payment)
CREATE POLICY "user update own iuran_user"
ON iuran_user
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admin can view all iuran_user
CREATE POLICY "admin view all iuran_user"
ON iuran_user
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admin can update all iuran_user
CREATE POLICY "admin update all iuran_user"
ON iuran_user
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 11: Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE iuran_master;
ALTER PUBLICATION supabase_realtime ADD TABLE iuran_user;

-- Step 12: Verify tables are created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('iuran_master', 'iuran_user')
ORDER BY table_name, ordinal_position;
