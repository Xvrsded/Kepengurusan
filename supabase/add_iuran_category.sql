-- Add category and period columns to iuran_master table
-- This enables categorizing iuran into: bulanan, harian, non_rutin

-- Add category column
ALTER TABLE iuran_master 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'bulanan';

-- Add check constraint for category values
ALTER TABLE iuran_master 
ADD CONSTRAINT check_category 
CHECK (category IN ('bulanan', 'harian', 'non_rutin'));

-- Add period column (for storing month/year for bulanan, or date for harian)
ALTER TABLE iuran_master 
ADD COLUMN IF NOT EXISTS period DATE;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_iuran_master_category ON iuran_master(category);

-- Create index for period
CREATE INDEX IF NOT EXISTS idx_iuran_master_period ON iuran_master(period);

-- Update existing records to have default category
UPDATE iuran_master 
SET category = 'bulanan' 
WHERE category IS NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'iuran_master'
  AND column_name IN ('category', 'period')
ORDER BY column_name;
