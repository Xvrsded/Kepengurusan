-- ============================================================================
-- OPTIMIZED JOIN QUERIES & VIEWS
-- Untuk berbagai skenario berat yang digunakan di aplikasi
-- ============================================================================

-- ============================================================================
-- 1. GET IURAN PAYMENTS DENGAN PROFILE INFO (HEAVY SCENARIO)
-- ============================================================================
-- Scenario: Admin melihat daftar pembayaran dengan info warga
-- Query: iuran_user + profiles + iuran_master dalam satu request
-- Benefit: 1 query instead of 3 queries per row (N+1 problem solved)

SELECT 
  iu.id,
  iu.status,
  iu.paid_at,
  iu.created_at,
  p.id as user_id,
  p.full_name,
  p.nik,
  p.phone,
  im.id as iuran_id,
  im.title,
  im.amount,
  im.due_date
FROM iuran_user iu
INNER JOIN profiles p ON iu.user_id = p.id
INNER JOIN iuran_master im ON iu.iuran_master_id = im.id
WHERE im.is_active = true
ORDER BY iu.created_at DESC
LIMIT 50 OFFSET 0;

-- ============================================================================
-- 2. GET SURAT PENGAJUAN DENGAN PROFILE INFO
-- ============================================================================
-- Scenario: Admin melihat daftar surat dengan info pengaju
-- Columns: Hanya yang dibutuhkan (selective fetching)

SELECT 
  sp.id,
  sp.user_id,
  sp.jenis_surat,
  sp.keperluan,
  sp.status,
  sp.created_at,
  sp.updated_at,
  p.full_name,
  p.nik,
  p.phone,
  p.address
FROM surat_pengajuan sp
LEFT JOIN profiles p ON sp.user_id = p.id
ORDER BY sp.created_at DESC
LIMIT 50 OFFSET 0;

-- ============================================================================
-- 3. GET MESSAGES DENGAN PROFILE INFO (CHAT LIST)
-- ============================================================================
-- Scenario: List chat dengan info pengguna sender/receiver
-- Optimized untuk mensearch conversations

WITH latest_messages AS (
  SELECT DISTINCT ON (
    CASE 
      WHEN sender_id = 'user-uuid-here' THEN receiver_id 
      ELSE sender_id 
    END
  )
    *
  FROM messages
  WHERE sender_id = 'user-uuid-here' OR receiver_id = 'user-uuid-here'
  ORDER BY 
    CASE 
      WHEN sender_id = 'user-uuid-here' THEN receiver_id 
      ELSE sender_id 
    END,
    created_at DESC
)
SELECT 
  m.id,
  m.sender_id,
  m.receiver_id,
  m.message,
  m.is_read,
  m.created_at,
  p.id as other_user_id,
  p.full_name,
  p.nik
FROM latest_messages m
INNER JOIN profiles p ON (
  CASE 
    WHEN m.sender_id = 'user-uuid-here' THEN m.receiver_id = p.id
    ELSE m.sender_id = p.id
  END
)
ORDER BY m.created_at DESC;

-- ============================================================================
-- 4. GET IURAN SUMMARY PER USER (WITH PROFILE)
-- ============================================================================
-- Scenario: Laporan pembayaran per user dengan ringkasan
-- Menggunakan aggregation untuk performance optimal

SELECT 
  p.id,
  p.full_name,
  p.nik,
  p.phone,
  COUNT(iu.id) as total_iuran,
  COUNT(CASE WHEN iu.status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN iu.status = 'unpaid' THEN 1 END) as unpaid_count,
  COUNT(CASE WHEN iu.status = 'overdue' THEN 1 END) as overdue_count,
  SUM(CASE WHEN iu.status = 'paid' THEN im.amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN iu.status IN ('unpaid', 'overdue') THEN im.amount ELSE 0 END) as total_unpaid
FROM profiles p
LEFT JOIN iuran_user iu ON p.id = iu.user_id
LEFT JOIN iuran_master im ON iu.iuran_master_id = im.id
WHERE p.role = 'warga'
GROUP BY p.id, p.full_name, p.nik, p.phone
ORDER BY total_unpaid DESC;

-- ============================================================================
-- 5. GET ACTIVE LETTERS WITH USER INFO (DETAIL VIEW)
-- ============================================================================
-- Scenario: Admin melihat detail surat dengan info lengkap

SELECT 
  sp.id,
  sp.jenis_surat,
  sp.keperluan,
  sp.status,
  sp.created_at,
  sp.updated_at,
  sp.user_id,
  p.full_name,
  p.nik,
  p.address,
  p.phone,
  p.role
FROM surat_pengajuan sp
INNER JOIN profiles p ON sp.user_id = p.id
WHERE sp.status IN ('pending', 'proses')
ORDER BY sp.created_at ASC;

-- ============================================================================
-- 6. GET PANIC ALERTS WITH RESPONDER INFO
-- ============================================================================
-- Scenario: Real-time monitoring panic alerts dengan info responder

SELECT 
  pa.id,
  pa.user_id,
  pa.location_description,
  pa.status,
  pa.created_at,
  pa.resolved_at,
  pa.resolved_by,
  p.full_name as reporter_name,
  p.nik as reporter_nik,
  p.phone as reporter_phone,
  admin.full_name as resolved_by_name
FROM panic_alerts pa
LEFT JOIN profiles p ON pa.user_id = p.id
LEFT JOIN profiles admin ON pa.resolved_by = admin.id
WHERE pa.status IN ('active', 'resolved')
ORDER BY pa.created_at DESC
LIMIT 100;

-- ============================================================================
-- 7. DASHBOARD STATISTICS QUERIES
-- ============================================================================

-- 7a. Quick stats untuk admin dashboard
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'warga') as total_warga,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admin,
  (SELECT COUNT(*) FROM surat_pengajuan WHERE status = 'pending') as pending_letters,
  (SELECT COUNT(*) FROM iuran_user WHERE status = 'unpaid') as unpaid_iuran,
  (SELECT COUNT(*) FROM panic_alerts WHERE status = 'active') as active_panic;

-- 7b. Iuran collection rate
SELECT 
  im.id,
  im.title,
  im.amount,
  COUNT(iu.id) as total_assigned,
  COUNT(CASE WHEN iu.status = 'paid' THEN 1 END) as paid,
  ROUND(
    COUNT(CASE WHEN iu.status = 'paid' THEN 1 END)::numeric / 
    COUNT(iu.id) * 100, 2
  ) as collection_rate_percent
FROM iuran_master im
LEFT JOIN iuran_user iu ON im.id = iu.iuran_master_id
WHERE im.is_active = true
GROUP BY im.id, im.title, im.amount
ORDER BY im.created_at DESC;

-- ============================================================================
-- 8. PAGINATION QUERIES WITH COUNT
-- ============================================================================

-- 8a. Paginated letters with count
WITH paginated_letters AS (
  SELECT 
    sp.id,
    sp.user_id,
    sp.jenis_surat,
    sp.keperluan,
    sp.status,
    sp.created_at,
    p.full_name,
    p.nik
  FROM surat_pengajuan sp
  INNER JOIN profiles p ON sp.user_id = p.id
  ORDER BY sp.created_at DESC
  LIMIT 20 OFFSET 0
)
SELECT 
  pl.*,
  (SELECT COUNT(*) FROM surat_pengajuan) as total_count
FROM paginated_letters pl;

-- 8b. Paginated iuran with count
WITH paginated_iuran AS (
  SELECT 
    iu.id,
    iu.status,
    iu.paid_at,
    iu.created_at,
    im.title,
    im.amount,
    p.full_name,
    p.nik
  FROM iuran_user iu
  INNER JOIN iuran_master im ON iu.iuran_master_id = im.id
  INNER JOIN profiles p ON iu.user_id = p.id
  WHERE im.is_active = true
  ORDER BY iu.created_at DESC
  LIMIT 50 OFFSET 0
)
SELECT 
  pi.*,
  (SELECT COUNT(*) FROM iuran_user iu2 
   INNER JOIN iuran_master im2 ON iu2.iuran_master_id = im2.id 
   WHERE im2.is_active = true) as total_count
FROM paginated_iuran pi;

-- ============================================================================
-- 9. SEARCH QUERIES
-- ============================================================================

-- 9a. Search warga by name or nik
SELECT 
  id,
  full_name,
  nik,
  phone,
  address,
  status
FROM profiles
WHERE role = 'warga' AND (
  full_name ILIKE '%search-term%' OR 
  nik ILIKE '%search-term%'
)
LIMIT 20;

-- 9b. Search surat by jenis_surat or user name
SELECT 
  sp.id,
  sp.jenis_surat,
  sp.keperluan,
  sp.status,
  sp.created_at,
  p.full_name,
  p.nik
FROM surat_pengajuan sp
INNER JOIN profiles p ON sp.user_id = p.id
WHERE 
  sp.jenis_surat ILIKE '%search-term%' OR
  p.full_name ILIKE '%search-term%' OR
  p.nik ILIKE '%search-term%'
LIMIT 20;

-- ============================================================================
-- 10. PERFORMANCE TEST QUERIES
-- ============================================================================

-- Test N+1 problem - SLOW (dont run in production)
-- EXPLAIN ANALYZE
-- SELECT * FROM iuran_user LIMIT 100;

-- Test optimized query - FAST
-- EXPLAIN ANALYZE
-- SELECT 
--   iu.id, iu.status, iu.paid_at,
--   im.title, im.amount,
--   p.full_name, p.nik
-- FROM iuran_user iu
-- INNER JOIN iuran_master im ON iu.iuran_master_id = im.id
-- INNER JOIN profiles p ON iu.user_id = p.id
-- WHERE im.is_active = true
-- LIMIT 100;
