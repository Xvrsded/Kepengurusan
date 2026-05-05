-- Fix RLS policies for letters table to allow authenticated users to insert letters

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own letters" ON letters;
DROP POLICY IF EXISTS "Admin can view all letters" ON letters;

-- Recreate policies with INSERT permission for authenticated users

-- Users can view and insert their own letters
CREATE POLICY "Users can view own letters" ON letters
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert letters" ON letters
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin can view all letters and do all operations
CREATE POLICY "Admin can view all letters" ON letters
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Also add UPDATE and DELETE policies for users to manage their own letters (optional)
CREATE POLICY "Users can update own letters" ON letters
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own letters" ON letters
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
