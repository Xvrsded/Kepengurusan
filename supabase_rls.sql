-- Enable Row Level Security
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran_payments ENABLE ROW LEVEL SECURITY;

-- Citizens RLS Policies
-- Users can only see their own citizen data (matched by email from auth.users)
CREATE POLICY "Users can view own citizens" ON citizens
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can view all citizens
CREATE POLICY "Admin can view all citizens" ON citizens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Letters RLS Policies
-- Users can only view their own letters
CREATE POLICY "Users can view own letters" ON letters
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can view all letters
CREATE POLICY "Admin can view all letters" ON letters
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Iuran RLS Policies
-- Users can only view their own iuran
CREATE POLICY "Users can view own iuran" ON iuran
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can view all iuran
CREATE POLICY "Admin can view all iuran" ON iuran
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Notifications RLS Policies
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can view all notifications
CREATE POLICY "Admin can view all notifications" ON notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Iuran Types RLS Policies
-- Everyone can view iuran types (read-only)
CREATE POLICY "Everyone can view iuran types" ON iuran_types
  FOR SELECT
  USING (true);

-- Only admin can modify iuran types
CREATE POLICY "Admin can modify iuran types" ON iuran_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Iuran Payments RLS Policies
-- Users can only view their own iuran payments
CREATE POLICY "Users can view own iuran payments" ON iuran_payments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin can view all iuran payments
CREATE POLICY "Admin can view all iuran payments" ON iuran_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
