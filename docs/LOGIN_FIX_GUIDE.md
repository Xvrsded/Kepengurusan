# Login System Fix Guide

## Problem Summary
Login button not responding - no loading state, no error message, no redirect.

## Root Cause Analysis
The login system had multiple issues:
1. **RLS Infinite Recursion**: Citizens table RLS policies causing infinite recursion
2. **Role Fetching Failure**: Could not fetch role from citizens table due to RLS error
3. **Silent Failures**: No proper error handling or logging to debug issues
4. **Architecture Confusion**: Multiple redirect sources causing conflicts

## Changes Made

### 1. Login Page (`app/login/page.tsx`)
- Added comprehensive logging to track every step of login flow
- Added error handling with specific error messages
- Ensured `setIsLoading(true)` always runs at start
- Ensured `setIsLoading(false)` always runs in finally block
- Added roleStatus check before redirect
- Single redirect source (login page only)

**Log Format:**
```
[LOGIN] handleLogin called
[LOGIN] Setting isLoading = true
[LOGIN] Step 1: Authenticating with Supabase
[LOGIN] Auth result: { error, hasData }
[LOGIN] Step 2: Syncing user data and role from citizens table
[LOGIN] Step 3: Checking role status
[LOGIN] Role data: { roleStatus, role }
[LOGIN] Role found, redirecting to: admin/warga
[LOGIN] Setting isLoading = false
```

### 2. Store (`store/useAppStore.ts`)
- Added comprehensive logging to syncSupabaseUser
- Added roleStatus state management ('loading' | 'success' | 'error')
- Removed all fallback role logic (no more default "warga")
- Ensured role only comes from citizens table
- Proper error handling for RLS errors

**Log Format:**
```
[SYNC] syncSupabaseUser called
[SYNC] User from auth: { hasUser, userId }
[SYNC] Fetching citizen data for user: userId
[SYNC] Citizen fetch result: { hasCitizen, error }
[SYNC] Role found: admin/warga
[SYNC] syncSupabaseUser completed successfully
```

### 3. AuthProvider (`providers/AuthProvider.tsx`)
- Removed redirect logic to prevent double redirect
- Only syncs session and role
- Login page handles all redirects based on roleStatus

### 4. SQL Migration Files
- `supabase/drop_rls_policies.sql` - Drops all existing RLS policies
- `supabase/rebuild_rls_policies.sql` - Rebuilds safe RLS policies (no recursion)
- `supabase/RLS_FIX_README.md` - Documentation for RLS fix

## REQUIRED ACTIONS

### Step 1: Run SQL Migrations (CRITICAL)
Open Supabase SQL Editor and run in order:

1. **Drop existing RLS policies:**
```sql
-- Run: supabase/drop_rls_policies.sql
```

2. **Rebuild safe RLS policies:**
```sql
-- Run: supabase/rebuild_rls_policies.sql
```

### Step 2: Test Login Flow
1. Open browser console (F12)
2. Go to login page
3. Enter credentials and click "Masuk Sekarang"
4. Watch console logs to see where the flow stops

### Step 3: Debug Using Console Logs

**If you see:**
```
[LOGIN] handleLogin called
[LOGIN] Setting isLoading = true
```
→ Button click is working, loading state is set

**If you see:**
```
[LOGIN] Step 1: Authenticating with Supabase
[LOGIN] Auth result: { error: "..." }
```
→ Auth failed - check email/password

**If you see:**
```
[LOGIN] Step 2: Syncing user data and role from citizens table
[SYNC] syncSupabaseUser called
[SYNC] User from auth: { hasUser: true, userId: "..." }
[SYNC] Fetching citizen data for user: "..."
[SYNC] Citizen fetch result: { hasCitizen: false, error: "infinite recursion detected..." }
```
→ RLS policies not fixed - run SQL migrations again

**If you see:**
```
[SYNC] Citizen fetch result: { hasCitizen: false, error: null }
[SYNC] Citizen data not found for user: "..."
```
→ Profile not in citizens table - user needs to be registered

**If you see:**
```
[LOGIN] Role found, redirecting to: admin
```
→ Success! User will be redirected

## Expected Behavior After Fix

### Successful Login Flow:
1. Click login button → loading state visible (spinner)
2. Console: `[LOGIN] handleLogin called`
3. Console: `[LOGIN] Setting isLoading = true`
4. Console: `[LOGIN] Step 1: Authenticating with Supabase`
5. Console: `[LOGIN] Auth result: { error: null, hasData: true }`
6. Console: `[LOGIN] Step 2: Syncing user data and role from citizens table`
7. Console: `[SYNC] syncSupabaseUser called`
8. Console: `[SYNC] User from auth: { hasUser: true, userId: "..." }`
9. Console: `[SYNC] Fetching citizen data for user: "..."`
10. Console: `[SYNC] Citizen fetch result: { hasCitizen: true, error: null }`
11. Console: `[SYNC] Role found: admin`
12. Console: `[LOGIN] Role data: { roleStatus: 'success', role: 'admin' }`
13. Console: `[LOGIN] Role found, redirecting to: admin`
14. Redirect to `/admin` or `/warga`
15. Console: `[LOGIN] Setting isLoading = false`
16. Success notification shown

### Error Cases:
- **Auth error**: "Email atau password salah"
- **Profile not found**: "Data profil tidak ditemukan di database. Silakan hubungi admin."
- **RLS error**: "Gagal memuat data profil. Silakan coba lagi."

## Architecture Summary

### Single Responsibility:
- **Login Page**: Handles login, role fetch, and redirect
- **AuthProvider**: Only syncs session and role on auth state changes
- **Middleware**: Only checks authentication, no role-based redirect
- **Store**: Manages state (roleStatus, role, loading)

### Data Flow:
1. User clicks login → Login Page
2. Supabase auth signIn → Login Page
3. syncSupabaseUser → Store (fetches from citizens table)
4. roleStatus set → Store
5. Login Page checks roleStatus
6. Redirect based on role → Login Page

### No Fallbacks:
- Role only from citizens table (auth.uid() = id)
- No default "warga" role
- Silent fails replaced with explicit errors
- Loading states always visible

## Troubleshooting

### Issue: Button not responding
- Check console for `[LOGIN] handleLogin called`
- If not present, check button onClick handler
- Check for JavaScript errors in console

### Issue: Loading state stuck
- Check console logs to see which step failed
- Check network tab for failed requests
- Check Supabase connection

### Issue: Role not found
- Check if user exists in citizens table
- Check if RLS policies are applied
- Check console for RLS errors

### Issue: Redirect not happening
- Check roleStatus is 'success'
- Check role is not null
- Check console for redirect logs

## Production Checklist

- [ ] Run SQL migrations (drop_rls_policies.sql)
- [ ] Run SQL migrations (rebuild_rls_policies.sql)
- [ ] Test admin login (onoawal3@gmail.com)
- [ ] Test warga login
- [ ] Test error cases (wrong password, missing profile)
- [ ] Verify console logs are clean
- [ ] Remove console logs after testing (optional)
- [ ] Test on mobile devices
- [ ] Test slow network conditions
