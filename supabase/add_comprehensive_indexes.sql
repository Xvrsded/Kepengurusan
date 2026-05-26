-- ============================================================================
-- COMPREHENSIVE INDEX OPTIMIZATION
-- Created: 2024
-- Dijalankan: Setelah semua tabel dibuat di Supabase
-- Tujuan: Meningkatkan performa query filter, join, dan sort
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_nik ON profiles(nik); -- Unique lookup
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Composite index untuk common filter patterns
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- ============================================================================
-- 2. IURAN_USER TABLE INDEXES (PERFORMANCE CRITICAL)
-- ============================================================================
-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_iuran_user_status ON iuran_user(status) WHERE status IN ('unpaid', 'overdue');
CREATE INDEX IF NOT EXISTS idx_iuran_user_user_id ON iuran_user(user_id);
CREATE INDEX IF NOT EXISTS idx_iuran_user_iuran_master_id ON iuran_user(iuran_master_id);

-- Composite indexes untuk JOIN queries
CREATE INDEX IF NOT EXISTS idx_iuran_user_master_status ON iuran_user(iuran_master_id, status);
CREATE INDEX IF NOT EXISTS idx_iuran_user_user_status ON iuran_user(user_id, status);

-- ============================================================================
-- 3. MESSAGES TABLE INDEXES
-- ============================================================================
-- Already has indexes from CHAT_SETUP.md, adding more for optimization
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_desc ON messages(created_at DESC);

-- ============================================================================
-- 4. SURAT_PENGAJUAN TABLE INDEXES
-- ============================================================================
-- Already has basic indexes, adding composite indexes
CREATE INDEX IF NOT EXISTS idx_surat_pengajuan_user_status ON surat_pengajuan(user_id, status);
CREATE INDEX IF NOT EXISTS idx_surat_pengajuan_status_created ON surat_pengajuan(status, created_at DESC);

-- ============================================================================
-- 5. IURAN_MASTER TABLE INDEXES
-- ============================================================================
-- Already has indexes, verify they're complete
CREATE INDEX IF NOT EXISTS idx_iuran_master_is_active ON iuran_master(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_iuran_master_created_by_active ON iuran_master(created_by, is_active);

-- ============================================================================
-- 6. PANIC_ALERTS TABLE INDEXES
-- ============================================================================
-- Already has indexes, adding for optimization
CREATE INDEX IF NOT EXISTS idx_panic_alerts_resolved_status ON panic_alerts(status) WHERE status IN ('active', 'resolved');

-- ============================================================================
-- 7. CANDIDATES TABLE INDEXES
-- ============================================================================
-- Already has index for active, adding more for optimization
CREATE INDEX IF NOT EXISTS idx_candidates_is_active_created ON candidates(is_active, created_at DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all indexes were created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index size and usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as "Scan Count",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
