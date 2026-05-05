-- CREATE NEW TABLES FOR RT/RW APPLICATION
-- This script creates tables for location config, candidates, and panic alerts

-- STEP 1: Create location_config table
CREATE TABLE IF NOT EXISTS location_config (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  rt VARCHAR(10) NOT NULL DEFAULT '01',
  rw VARCHAR(10) NOT NULL DEFAULT '01',
  kelurahan VARCHAR(100) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default location config
INSERT INTO location_config (rt, rw, kelurahan, kota, postal_code)
VALUES ('01', '01', 'Contoh Kelurahan', 'Contoh Kota', '12345')
ON CONFLICT DO NOTHING;

-- STEP 2: Create candidates table for RT election
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  description TEXT,
  vote_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add index for active candidates
CREATE INDEX IF NOT EXISTS idx_candidates_active ON candidates(is_active) WHERE is_active = true;

-- STEP 3: Create panic_alerts table for emergency incidents
CREATE TABLE IF NOT EXISTS panic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  rt VARCHAR(10),
  rw VARCHAR(10),
  kelurahan VARCHAR(100),
  location_description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for panic alerts
CREATE INDEX IF NOT EXISTS idx_panic_alerts_user_id ON panic_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_panic_alerts_status ON panic_alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_panic_alerts_created_at ON panic_alerts(created_at DESC);

-- STEP 4: Enable Row Level Security
ALTER TABLE location_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS policies for location_config
-- Admin can read and update location config
CREATE POLICY "location_config_select_all" ON location_config
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "location_config_update_admin" ON location_config
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

CREATE POLICY "location_config_insert_admin" ON location_config
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- STEP 6: Create RLS policies for candidates
-- Everyone can read active candidates
CREATE POLICY "candidates_select_all" ON candidates
FOR SELECT TO authenticated
USING (true);

-- Admin can insert candidates
CREATE POLICY "candidates_insert_admin" ON candidates
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- Admin can update candidates
CREATE POLICY "candidates_update_admin" ON candidates
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- Admin can delete candidates
CREATE POLICY "candidates_delete_admin" ON candidates
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- STEP 7: Create RLS policies for panic_alerts
-- Users can insert their own panic alerts
CREATE POLICY "panic_alerts_insert_own" ON panic_alerts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can read their own panic alerts
CREATE POLICY "panic_alerts_select_own" ON panic_alerts
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admin can read all panic alerts
CREATE POLICY "panic_alerts_select_admin" ON panic_alerts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- Admin can update panic alerts (resolve them)
CREATE POLICY "panic_alerts_update_admin" ON panic_alerts
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid() AND citizens.role = 'admin'
  )
);

-- STEP 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 9: Add triggers for updated_at
CREATE TRIGGER update_location_config_updated_at
BEFORE UPDATE ON location_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panic_alerts_updated_at
BEFORE UPDATE ON panic_alerts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- STEP 10: Enable Realtime for panic_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE panic_alerts;

-- Verification queries
SELECT 'location_config' as table_name, COUNT(*) as row_count FROM location_config;
SELECT 'candidates' as table_name, COUNT(*) as row_count FROM candidates;
SELECT 'panic_alerts' as table_name, COUNT(*) as row_count FROM panic_alerts;
