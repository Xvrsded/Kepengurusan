# Supabase RLS Fix - Infinite Recursion Issue

## Problem
The citizens table had RLS policies that caused infinite recursion errors when querying the table. This prevented role fetching and caused admin users to be incorrectly identified as warga.

## Solution
Drop all existing RLS policies and rebuild with safe policies that don't use self-referential queries.

## Migration Steps

### Step 1: Drop Existing RLS Policies
Run the SQL file `drop_rls_policies.sql` in Supabase SQL Editor:
```bash
supabase/assign_admin_role.sql
```

This will:
- Drop all existing policies on citizens table
- Disable RLS temporarily
- Re-enable RLS (ready for new policies)

### Step 2: Rebuild Safe RLS Policies
Run the SQL file `rebuild_rls_policies.sql` in Supabase SQL Editor:
```bash
supabase/rebuild_rls_policies.sql
```

This will create safe policies:
- `users_select_own_data` - Users can SELECT their own data using `auth.uid() = id`
- `users_insert_own_data` - Users can INSERT their own data using `auth.uid() = id`
- `users_update_own_data` - Users can UPDATE their own data using `auth.uid() = id`
- `users_delete_own_data` - Users can DELETE their own data using `auth.uid() = id`

### Step 3: Verify Role Fetching
After running the SQL migrations:
1. Test login as admin (onoawal3@gmail.com)
2. Verify role is fetched correctly from citizens table
3. Verify redirect to /admin happens correctly

## Important Notes

⚠️ **What to AVOID in RLS Policies:**
- Do NOT query the citizens table within the policy
- Do NOT use `exists(select from citizens ...)`
- Do NOT use any self-referential queries to the same table

✅ **Safe Policy Pattern:**
```sql
using (auth.uid() = id)
with check (auth.uid() = id)
```

## Code Changes

### Store Changes (store/useAppStore.ts)
- Added `roleStatus: 'loading' | 'success' | 'error'` for proper role state management
- Removed all fallback role logic (no more `role: "warga"` defaults)
- `syncSupabaseUser` now:
  - Sets `roleStatus: 'loading'` at start
  - Sets `roleStatus: 'success'` if role found
  - Sets `roleStatus: 'error'` if profile not found or RLS error
- `setSupabaseUser` no longer sets role from metadata (role only from citizens table)

### Login Flow (app/login/page.tsx)
- Checks `roleStatus` before redirect
- Only redirects if `roleStatus === 'success'` and role is set
- Shows error message if `roleStatus === 'error'`
- No fallback to "warga"

### AuthProvider (providers/AuthProvider.tsx)
- Removed redirect logic to prevent double redirect
- Only syncs session and role
- Login page handles all redirects based on roleStatus

## Expected Result After Fix

✅ No more infinite recursion errors
✅ Admin (onoawal3@gmail.com) correctly identified as admin
✅ Warga correctly identified as warga
✅ Login redirects immediately without refresh
✅ No fallback to "warga"
✅ Role always fetched from citizens table using auth.uid()
