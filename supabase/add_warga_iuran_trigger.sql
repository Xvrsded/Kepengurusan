-- Create trigger to auto-generate iuran_user entries for new warga
-- This ensures that when a new warga registers, they get all existing iuran entries

-- Step 1: Create function to generate iuran_user entries for a single warga
CREATE OR REPLACE FUNCTION generate_iuran_for_new_warga()
RETURNS TRIGGER AS $$
DECLARE
  iuran_master_record RECORD;
BEGIN
  -- Only proceed if the new user is a warga
  IF NEW.role != 'warga' THEN
    RETURN NEW;
  END IF;

  -- Loop through all existing iuran_master records
  FOR iuran_master_record IN 
    SELECT id FROM iuran_master WHERE is_active = true
  LOOP
    INSERT INTO iuran_user (
      iuran_master_id,
      user_id,
      status
    ) VALUES (
      iuran_master_record.id,
      NEW.id,
      'unpaid'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_generate_iuran_for_new_warga ON profiles;

CREATE TRIGGER trigger_generate_iuran_for_new_warga
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_iuran_for_new_warga();

-- Step 3: Verify the trigger is created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_generate_iuran_for_new_warga';
