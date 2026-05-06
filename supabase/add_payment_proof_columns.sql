-- Add payment proof columns to iuran_user table
-- This enables warga to upload proof of transfer and admin to verify

-- Add proof_url column
ALTER TABLE iuran_user 
ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Add verified_by column
ALTER TABLE iuran_user 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

-- Add verified_at column
ALTER TABLE iuran_user 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Update status constraint to include 'pending' and 'rejected'
-- First, drop the old constraint if it exists
ALTER TABLE iuran_user 
DROP CONSTRAINT IF EXISTS check_status;

-- Add new constraint with all valid statuses
ALTER TABLE iuran_user 
ADD CONSTRAINT check_status 
CHECK (status IN ('unpaid', 'paid', 'overdue', 'pending', 'rejected'));

-- Create index for proof_url
CREATE INDEX IF NOT EXISTS idx_iuran_user_proof_url ON iuran_user(proof_url);

-- Create index for verified_by
CREATE INDEX IF NOT EXISTS idx_iuran_user_verified_by ON iuran_user(verified_by);

-- Create index for verified_at
CREATE INDEX IF NOT EXISTS idx_iuran_user_verified_at ON iuran_user(verified_at);

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'iuran_user'
  AND column_name IN ('proof_url', 'verified_by', 'verified_at')
ORDER BY column_name;
