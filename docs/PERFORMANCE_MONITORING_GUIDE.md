# DATABASE PERFORMANCE MONITORING & TROUBLESHOOTING

## 📊 Performance Monitoring Queries

### 1. Slow Query Analysis

```sql
-- Check slowest queries (Top 10)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  min_time,
  ROUND(mean_time::numeric, 2) as avg_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%information_schema%'
ORDER BY mean_time DESC
LIMIT 10;

-- Find queries taking most total time
SELECT 
  query,
  calls,
  ROUND(total_time::numeric, 2) as total_ms,
  ROUND(mean_time::numeric, 2) as avg_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_time DESC
LIMIT 10;

-- Find queries called most frequently (might be N+1 indicators)
SELECT 
  query,
  calls,
  ROUND(mean_time::numeric, 2) as avg_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 10;
```

### 2. Index Usage Analysis

```sql
-- Check which indexes are actually being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as "Scans",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched",
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'RARELY USED'
    ELSE 'USED'
  END as status,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Show all indexes with their definitions
SELECT 
  tablename,
  indexname,
  indexdef,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
LEFT JOIN pg_stat_user_indexes USING (indexname)
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 3. Table Size & Row Count Analysis

```sql
-- All tables with sizes and row counts
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) as indexes_size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Top 10 largest tables
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  n_live_tup as rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Tables with most rows (potential performance bottlenecks)
SELECT 
  tablename,
  n_live_tup as rows,
  n_dead_tup as dead_rows,
  ROUND(n_dead_tup * 100.0 / n_live_tup, 2) as dead_ratio_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### 4. Query Execution Plans

```sql
-- Analyze query execution plan (copy target query in WHERE)
EXPLAIN ANALYZE
SELECT 
  iu.id,
  iu.status,
  im.title,
  p.full_name
FROM iuran_user iu
INNER JOIN iuran_master im ON iu.iuran_master_id = im.id
INNER JOIN profiles p ON iu.user_id = p.id
WHERE im.is_active = true
LIMIT 50;

-- Compare two queries (before/after optimization)
-- Bad query:
EXPLAIN ANALYZE
SELECT * FROM iuran_user
ORDER BY created_at DESC
LIMIT 50;

-- Good query:
EXPLAIN ANALYZE
SELECT 
  id, status, paid_at, created_at, 
  iuran_master_id, user_id
FROM iuran_user
ORDER BY created_at DESC
LIMIT 50;
```

### 5. Lock & Deadlock Analysis

```sql
-- Check current locks
SELECT 
  pid,
  usename,
  application_name,
  state,
  query,
  query_start,
  state_change
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start DESC;

-- Check for blocking queries
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement,
  blocked_activity.application_name AS blocked_application,
  blocking_activity.application_name AS blocking_application
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 6. RLS Policy Performance

```sql
-- Check if RLS policies are causing performance issues
-- Run slow query with EXPLAIN VERBOSE to see RLS checks

EXPLAIN VERBOSE
SELECT * FROM surat_pengajuan
WHERE user_id = 'specific-user-id'
LIMIT 10;

-- Monitor RLS policy calls
-- RLS policies that perform subqueries can be slow
-- Look for policies with multiple JOINs in USING/WITH CHECK clauses
```

---

## 🔍 Troubleshooting Guide

### Problem 1: "Queries still slow even after indexing"

**Diagnosis**:
```sql
-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM iuran_user 
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC
LIMIT 50;

-- Look for "Seq Scan" instead of "Index Scan"
```

**Solutions**:
1. **Check index statistics are updated**:
   ```sql
   ANALYZE iuran_user;
   ANALYZE profiles;
   ```

2. **Verify composite index order**:
   ```sql
   -- Bad: Index on (created_at, user_id)
   CREATE INDEX idx_bad ON iuran_user(created_at, user_id);
   
   -- Good: Index on (user_id, created_at) - more selective first
   CREATE INDEX idx_good ON iuran_user(user_id, created_at DESC);
   ```

3. **Check query selectivity**:
   ```sql
   -- If filtering on column that appears in many rows,
   -- index might not be chosen
   
   -- Check cardinality
   SELECT 
     COUNT(DISTINCT user_id) as distinct_users,
     COUNT(*) as total_rows,
     ROUND(COUNT(DISTINCT user_id)::numeric / COUNT(*) * 100, 2) as selectivity_pct
   FROM iuran_user;
   ```

### Problem 2: "N+1 queries still happening"

**Diagnosis**:
```typescript
// Check browser DevTools Network tab
// Count number of requests to /query or similar endpoints

// If you see 1 request for list + 20+ requests for details = N+1 problem
```

**Solutions**:
1. **Use JOIN instead of multiple queries**:
   ```typescript
   // ❌ BAD
   const payments = await supabase.from('iuran_user').select('*');
   for (const p of payments) {
     const user = await supabase.from('profiles')
       .select('full_name')
       .eq('id', p.user_id)
       .single();
   }

   // ✅ GOOD
   const payments = await supabase.from('iuran_user').select(`
     *,
     profiles(full_name)
   `);
   ```

2. **Batch queries instead of looping**:
   ```typescript
   // ❌ BAD
   for (const id of userIds) {
     const data = await fetch(`/api/user/${id}`);
   }

   // ✅ GOOD
   const data = await fetch('/api/users', {
     body: JSON.stringify({ ids: userIds })
   });
   ```

### Problem 3: "High memory usage on large tables"

**Diagnosis**:
```sql
-- Check table size
SELECT 
  tablename,
  n_live_tup as rows,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
WHERE tablename = 'messages'
  AND schemaname = 'public';
```

**Solutions**:
1. **Implement proper pagination**:
   ```typescript
   // ❌ BAD: Loading all 1M messages
   const messages = await supabase.from('messages').select('*');

   // ✅ GOOD: Load only what's needed
   const messages = await supabase.from('messages')
     .select('id, message, created_at')
     .limit(50)
     .order('created_at', { ascending: false });
   ```

2. **Archive old data**:
   ```sql
   -- Archive messages older than 1 year
   CREATE TABLE messages_archive AS
   SELECT * FROM messages
   WHERE created_at < NOW() - INTERVAL '1 year';

   DELETE FROM messages
   WHERE created_at < NOW() - INTERVAL '1 year';
   ```

### Problem 4: "RLS policies causing performance degradation"

**Diagnosis**:
```sql
-- Compare with and without RLS
EXPLAIN ANALYZE
SELECT * FROM surat_pengajuan
WHERE user_id = 'specific-id'
LIMIT 10;

-- Check if it does extra subqueries for RLS checks
```

**Solutions**:
1. **Use indexed columns in RLS policies**:
   ```sql
   -- ❌ BAD: RLS on non-indexed column
   CREATE POLICY "users_own_data"
   ON surat_pengajuan FOR SELECT
   USING (user_id = auth.uid());
   
   -- ✅ GOOD: RLS on indexed column
   CREATE INDEX idx_surat_user_id ON surat_pengajuan(user_id);
   CREATE POLICY "users_own_data"
   ON surat_pengajuan FOR SELECT
   USING (user_id = auth.uid());
   ```

2. **Avoid complex RLS policies**:
   ```sql
   -- ❌ BAD: Complex RLS with JOINs
   CREATE POLICY "admin_access"
   ON surat_pengajuan FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM profiles p
       INNER JOIN user_roles ur ON p.id = ur.user_id
       WHERE p.id = auth.uid() AND ur.role = 'admin'
     )
   );
   
   -- ✅ GOOD: Simple RLS
   CREATE POLICY "admin_access"
   ON surat_pengajuan FOR SELECT
   USING (
     auth.jwt()->>'role' = 'admin'
   );
   ```

---

## 📈 Performance Baseline

Track these metrics weekly:

```sql
-- Performance snapshot
SELECT 
  'Query Execution' as metric,
  ROUND(AVG(mean_time)::numeric, 2) as avg_ms,
  ROUND(MAX(mean_time)::numeric, 2) as max_ms,
  SUM(calls) as total_calls,
  NOW() as measured_at
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'

UNION ALL

SELECT 
  'Table Sizes' as metric,
  ROUND(AVG(pg_total_relation_size(schemaname||'.'||tablename) / 1024 / 1024)::numeric, 2) as avg_mb,
  ROUND(MAX(pg_total_relation_size(schemaname||'.'||tablename) / 1024 / 1024)::numeric, 2) as max_mb,
  SUM(n_live_tup) as total_rows,
  NOW() as measured_at
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

---

## ⚡ Performance Tips

1. **Always use LIMIT for list queries**
   ```sql
   -- ❌ Bad
   SELECT * FROM messages;
   
   -- ✅ Good
   SELECT id, message, created_at FROM messages LIMIT 100;
   ```

2. **Order by indexed column first**
   ```sql
   -- ❌ Slow - has to sort all rows
   SELECT * FROM surat_pengajuan WHERE status = 'pending' ORDER BY created_at;
   
   -- ✅ Fast - uses index
   SELECT * FROM surat_pengajuan ORDER BY created_at DESC LIMIT 50;
   ```

3. **Use EXPLAIN to verify index usage**
   ```sql
   EXPLAIN (ANALYZE, BUFFERS)
   SELECT * FROM table WHERE indexed_column = value;
   
   -- Look for "Index Scan" in output
   -- If "Seq Scan" appears, your query might not be using the index
   ```

4. **Avoid SELECT * in production**
   ```sql
   -- ❌ Fetches all columns (might be 100+ columns in future)
   SELECT * FROM profiles;
   
   -- ✅ Fetch only needed columns
   SELECT id, full_name, nik FROM profiles;
   ```

5. **Use connection pooling** (if not using Supabase directly)
   ```
   Supabase already handles connection pooling
   ```

---

## 🔔 When to Optimize

### Critical (Optimize ASAP)
- Query > 1000ms
- Page taking > 5 seconds to load
- Server CPU > 80%
- N+1 query patterns detected

### Important (Optimize Soon)
- Query > 500ms
- Page taking > 2 seconds to load
- Unused indexes taking up space
- RLS policies causing performance issues

### Nice-to-Have (Optimize Later)
- Query > 100ms
- Page taking 1-2 seconds
- Minor optimization opportunities

---

## 📊 Monitoring Dashboard

Create a simple monitoring dashboard using these queries:

```sql
-- Overall health check
WITH stats AS (
  SELECT 
    COUNT(*) as total_tables,
    SUM(n_live_tup) as total_rows,
    SUM(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    AVG(mean_time) as avg_query_time,
    MAX(mean_time) as max_query_time
  FROM pg_stat_user_tables, pg_stat_statements
  WHERE pg_stat_user_tables.schemaname = 'public'
)
SELECT * FROM stats;
```

---

## Support Resources

- [Supabase Performance Optimization](https://supabase.com/docs)
- [PostgreSQL Query Performance](https://www.postgresql.org/docs/current/performance.html)
- [pg_stat_statements Documentation](https://www.postgresql.org/docs/current/pgstatstatements.html)
