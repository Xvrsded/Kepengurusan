# Auth Login Error Fix Guide

## Problem
```
AuthApiError: Invalid login credentials
```

Login fails at Supabase Auth signInWithPassword step.

## Root Cause
The user (onoawal3@gmail.com) likely exists in the `citizens` table but NOT in `auth.users`. This happens when:
- User was manually inserted into citizens table without going through Supabase Auth
- Register flow was not used to create the user
- auth.users and citizens table are out of sync

## Why This Happens
Supabase Auth (`auth.users`) and your application database (`citizens`) are separate:
- `auth.users`: Stores authentication credentials (email, password hash, UUID)
- `citizens`: Stores application data (name, phone, role)

Login requires BOTH:
1. User exists in `auth.users` with valid email/password
2. User exists in `citizens` with role information

## Verification Steps

### Step 1: Check if user exists in auth.users
Run `supabase/verify_auth_users.sql` in Supabase SQL Editor.

**Expected result:**
```sql
-- If user exists in auth.users:
id | email | created_at | last_sign_in_at
---+-------+------------+-----------------
uuid | onoawal3@gmail.com | 2026-04-30 | ...

-- If user does NOT exist in auth.users:
-- No rows returned
```

### Step 2: Check if user exists in citizens table
The same SQL script will also check the citizens table.

**Expected result:**
```sql
-- If user exists in citizens:
id | name | phone | role
---+------+-------+-----
uuid | Ono Awal | 628... | admin
```

### Step 3: Identify the mismatch
The SQL script will show:
- Users in `auth.users` but not in `citizens`
- Users in `citizens` but not in `auth.users`

## Fix Options

### Option A: User Exists in citizens but NOT in auth.users (Most Likely)

**Solution: Create user in Supabase Auth**

1. **Using Supabase Dashboard (Recommended):**
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add user" > "Create new user"
   - Enter email: `onoawal3@gmail.com`
   - Set a temporary password (e.g., `TempPassword123!`)
   - Click "Create user"
   - Copy the UUID from the user row

2. **Update citizens table to match auth.users UUID:**
   ```sql
   -- Get the UUID from auth.users
   SELECT id FROM auth.users WHERE email = 'onoawal3@gmail.com';
   
   -- Update citizens table with the correct UUID
   UPDATE citizens
   SET id = 'PASTE_UUID_HERE'
   WHERE email = 'onoawal3@gmail.com';
   ```

3. **Test login with temporary password:**
   - Go to login page
   - Enter email: `onoawal3@gmail.com`
   - Enter password: `TempPassword123!`
   - Should login successfully

4. **Ask user to reset password:**
   - User should reset their password to a secure one

### Option B: User Exists in auth.users but NOT in citizens

**Solution: Insert user into citizens table**

```sql
-- Get user info from auth.users
SELECT id, email FROM auth.users WHERE email = 'onoawal3@gmail.com';

-- Insert into citizens table
INSERT INTO citizens (id, name, phone, role)
VALUES (
  'PASTE_UUID_HERE',
  'Ono Awal',  -- Update with actual name
  '628123456789',  -- Update with actual phone
  'admin'  -- or 'warga'
);
```

### Option C: User exists in both but password is wrong

**Solution: Reset password via Supabase Dashboard**

1. Go to Supabase Dashboard > Authentication > Users
2. Find the user (onoawal3@gmail.com)
3. Click "Reset password"
4. Send password reset email to user
5. User follows email link to set new password

### Option D: Recreate user from scratch (Last Resort)

If the data is corrupted or mismatched:

1. **Delete from citizens table:**
   ```sql
   DELETE FROM citizens WHERE email = 'onoawal3@gmail.com';
   ```

2. **Delete from auth.users (via Dashboard):**
   - Go to Supabase Dashboard > Authentication > Users
   - Find the user and delete

3. **Re-register via application:**
   - Go to `/register` page
   - Fill in registration form
   - This will create user in both auth.users and citizens correctly

## Register Flow Verification

The current register flow (`app/register/page.tsx`) is correct:

1. **Step 1:** `supabase.auth.signUp()` - Creates user in auth.users
2. **Step 2:** `supabase.auth.signInWithPassword()` - Signs in the user
3. **Step 3:** `supabase.from("citizens").upsert()` - Inserts into citizens table

**This ensures users are created in BOTH tables correctly.**

## Login Service Verification

The login service (`services/authService.ts`) is correct:

```typescript
async login(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password })
}
```

**No transformation of email/password - direct pass-through to Supabase.**

## Troubleshooting Checklist

- [ ] Run `verify_auth_users.sql` to check current state
- [ ] Identify which table is missing the user
- [ ] Create user in missing table using appropriate method
- [ ] Ensure UUIDs match between auth.users and citizens
- [ ] Test login with correct credentials
- [ ] Verify role is correctly set in citizens table
- [ ] Test redirect to correct page based on role

## Expected Behavior After Fix

### Successful Login Flow:
1. User enters email and password
2. Console: `[LOGIN] handleLogin called`
3. Console: `[LOGIN] Step 1: Authenticating with Supabase`
4. Console: `[LOGIN] Auth result: { error: null, hasData: true }`
5. Console: `[LOGIN] Step 2: Syncing user data and role from citizens table`
6. Console: `[SYNC] syncSupabaseUser called`
7. Console: `[SYNC] User from auth: { hasUser: true, userId: "..." }`
8. Console: `[SYNC] Citizen fetch result: { hasCitizen: true, error: null }`
9. Console: `[SYNC] Role found: admin`
10. Console: `[LOGIN] Role found, redirecting to: admin`
11. Redirect to `/admin` or `/warga`

### Error Cases:
- **Invalid credentials:** "Email atau password salah"
- **User not in citizens:** "Data profil tidak ditemukan di database. Silakan hubungi admin."
- **RLS error:** "Gagal memuat data profil. Silakan coba lagi."

## Prevention

To prevent this issue in the future:

1. **Always use the register page** to create new users
2. **Never manually insert users** into citizens table only
3. **Always verify both tables** are in sync after manual operations
4. **Use database triggers** (if needed) to ensure consistency
5. **Regularly audit** auth.users vs citizens table

## SQL Scripts Summary

1. **verify_auth_users.sql** - Check current state of both tables
2. **fix_auth_users.sql** - Guide for fixing mismatched users
3. **drop_rls_policies.sql** - Drop RLS policies (if needed)
4. **rebuild_rls_policies.sql** - Rebuild safe RLS policies

## Production Checklist

- [ ] Run verify_auth_users.sql to check all users
- [ ] Fix any mismatched users using appropriate method
- [ ] Test login for admin user (onoawal3@gmail.com)
- [ ] Test login for regular warga users
- [ ] Verify role-based redirects work correctly
- [ ] Ensure RLS policies are applied correctly
- [ ] Remove console logs after testing (optional)
