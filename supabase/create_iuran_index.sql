-- Index for iuran_user table to optimize user_id queries
-- This improves performance for fetching iuran data by user

CREATE INDEX IF NOT EXISTS idx_iuran_user_user_id 
ON iuran_user(user_id);

-- Additional index for status queries (optional)
CREATE INDEX IF NOT EXISTS idx_iuran_user_status 
ON iuran_user(status);

-- Composite index for user_id + status (optional, for combined filters)
CREATE INDEX IF NOT EXISTS idx_iuran_user_user_id_status 
ON iuran_user(user_id, status);
