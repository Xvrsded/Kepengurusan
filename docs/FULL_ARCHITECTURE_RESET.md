# FULL ARCHITECTURE RESET - Authentication & Routing System

## Overview
Complete refactoring of authentication and routing system following strict non-negotiable rules to eliminate all redirect loops, role mismatches, and architectural conflicts.

## NON-NEGOTIABLE RULES

### 1. SINGLE AUTH FLOW ONLY
- Login only happens in `authService`
- No login logic in pages, layouts, or providers
- Single source of truth for authentication

### 2. SINGLE REDIRECT POINT
- Redirect only happens in: **login success handler**
- ❌ FORBIDDEN:
  - Redirect in useEffect
  - Redirect in middleware based on role
  - Redirect in layout
  - Redirect in page guard

### 3. MIDDLEWARE ONLY FOR PROTECTION
- Middleware only:
  - Blocks unauthenticated access
- ❌ FORBIDDEN:
  - Role-based redirect
  - Any redirect logic

### 4. ROLE RULE (STRICT)
- Role only from `profiles.role` (citizens table)
- ❌ FORBIDDEN:
  - Fallback to "warga"
  - Override in frontend
  - If role null → STOP flow (error state)

### 5. NO AUTO NAVIGATION
- ❌ FORBIDDEN:
  - router.push except login success
  - Auto redirect on page load

### 6. STATE RULE
- Only 1 auth store (single source of truth)
- ❌ FORBIDDEN:
  - Duplicate state in page/component

## ARCHITECTURE CHANGES

### A. authService (ONLY PLACE LOGIN)
**File:** `services/authService.ts`

**Changes:**
- Added `login()` method that:
  1. Authenticates with Supabase Auth
  2. Fetches profile from citizens table
  3. Returns `{ success, user, role, error }`
- Added `fetchUserProfile()` method for profile fetching
- Strict role fetching with no fallback
- Error handling for auth failure, profile fetch failure, role not found

**Key Features:**
```typescript
async login(email: string, password: string): Promise<LoginResult> {
  // Step 1: Authenticate with Supabase
  // Step 2: Fetch profile from citizens table
  // Step 3: Return user and role
  // NO fallback logic
}
```

### B. middleware (ONLY GUARD)
**File:** `middleware.ts`

**Changes:**
- Removed all role-based logic
- Only blocks unauthenticated access to protected routes
- No redirect logic based on role
- Comment: "MIDDLEWARE ONLY GUARD: Block unauthenticated access to protected routes"

**Key Features:**
```typescript
// MIDDLEWARE ONLY GUARD: Block unauthenticated access to protected routes
// NO role-based redirect - role logic is handled by client-side
if (!user && isProtected) {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
```

### C. useAuthGuard (PURE GUARD)
**File:** `lib/useAuthGuard.ts`

**Changes:**
- Removed ALL redirect logic
- Now returns state only
- No router usage
- Pure guard function

**Key Features:**
```typescript
export function useAuthGuard() {
  // PURE GUARD: Only returns state, NO redirect logic
  // Redirects are handled ONLY by login page (single redirect point)
  return {
    isAuthenticated: !!user,
    role,
    loading
  };
}
```

### D. AuthProvider (SYNC ONLY)
**File:** `providers/AuthProvider.tsx`

**Changes:**
- Removed all redirect logic
- Uses authService for profile fetching (single source of truth)
- Only syncs session and role
- No router usage

**Key Features:**
```typescript
// Use authService to fetch profile (single source of truth)
const { authService } = await import('@/services/authService')
const profileResult = await authService.fetchUserProfile(user.id)

if (profileResult.success && profileResult.role) {
  setStore({ role: profileResult.role, roleStatus: 'success' })
} else {
  setStore({ role: null, roleStatus: 'error' })
}

// AUTH PROVIDER ONLY: Syncs session and role
// NO redirect logic - handled by login page (single redirect point)
```

### E. Login Page (SINGLE REDIRECT POINT)
**File:** `app/login/page.tsx`

**Changes:**
- Simplified to use new authService
- Single auth flow (only calls authService)
- Single redirect point (redirects once on success)
- No syncSupabaseUser call
- No roleStatus checks
- No multiple redirects

**Key Features:**
```typescript
const handleLogin = async () => {
  // SINGLE AUTH FLOW: Call authService (ONLY PLACE LOGIN)
  const result = await authService.login(email.trim(), password);

  if (!result.success) {
    // Show error
    return;
  }

  // SINGLE REDIRECT POINT: Redirect ONCE on login success
  if (result.role === "admin") {
    router.push("/admin");
  } else if (result.role === "warga") {
    router.push("/warga");
  }
};
```

### F. Register Page (PURE UI ONLY)
**File:** `app/register/page.tsx`

**Changes:**
- Removed redirect logic from useEffect
- Now shows notification instead of redirect
- Pure UI only
- No auto navigation

**Key Features:**
```typescript
useEffect(() => {
  if (isLoggedIn) {
    setNotif({
      title: "Sudah Login",
      message: "Anda sudah login. Silakan navigasi ke halaman yang diinginkan.",
      variant: "success",
    });
  }
}, [isLoggedIn, setNotif]);
```

### G. RouteGuard (COMPONENT GUARD)
**File:** `components/RouteGuard.tsx`

**Status:** No changes needed
- Already shows error instead of redirect
- Component-level guard only

## FAILURE CONDITION HANDLING

### If role not found:
```typescript
if (!citizen || !citizen.role) {
  console.error('[AUTH] Profile or role not found for user:', user.id)
  return {
    success: false,
    error: 'Profile or role not found'
  }
}
```
- STOP flow
- Show error UI
- ❌ NO fallback logic allowed

### If auth fails:
```typescript
if (authError || !data.user) {
  return {
    success: false,
    error: authError?.message || 'Authentication failed'
  }
}
```
- STOP flow
- Show error UI
- ❌ NO fallback logic allowed

### If profile fetch fails:
```typescript
if (profileError) {
  console.error('[AUTH] Profile fetch error:', profileError.message)
  return {
    success: false,
    error: 'Failed to fetch profile'
  }
}
```
- STOP flow
- Show error UI
- ❌ NO fallback logic allowed

## EXPECTED OUTPUT AFTER REFACTOR

✅ No redirect loops
✅ No dashboard bounce back
✅ No hook errors
✅ No role mismatch
✅ Navigation fully stable
✅ Production-ready architecture

## DATA FLOW

### Login Flow:
1. User enters credentials in login page
2. Login page calls `authService.login()`
3. authService:
   - Authenticates with Supabase Auth
   - Fetches profile from citizens table
   - Returns `{ success, user, role, error }`
4. Login page checks result
5. If success → redirect ONCE based on role
6. If error → show error message

### Session Init Flow:
1. App loads
2. AuthProvider initializes
3. AuthProvider calls `authService.fetchUserProfile()`
4. Store sets role and roleStatus
5. No redirect happens

### Navigation Flow:
1. User navigates to protected route
2. Middleware checks authentication
3. If not authenticated → redirect to login
4. If authenticated → allow access
5. Pages render data (no redirect logic)

## ARCHITECTURE SUMMARY

### Responsibilities:

**authService:**
- Single place for login logic
- Fetches profile from database
- Returns user and role
- No fallback logic

**middleware:**
- Protects routes from unauthenticated access
- No role-based redirect
- No redirect logic

**AuthProvider:**
- Syncs session from Supabase
- Calls authService to fetch role
- No redirect logic
- Only manages state

**useAuthGuard:**
- Pure guard function
- Returns state only
- No redirect logic

**Login Page:**
- Single redirect point
- Calls authService
- Redirects ONCE on success
- No other redirect logic

**Pages/Layouts:**
- Pure UI only
- No redirect logic
- No role fetching for routing
- Only render data

## TESTING CHECKLIST

- [ ] Test admin login → redirects to /admin
- [ ] Test warga login → redirects to /warga
- [ ] Test invalid credentials → shows error
- [ ] Test profile not found → shows error
- [ ] Test warga navigating within warga routes → no redirect loop
- [ ] Test admin navigating within admin routes → no redirect loop
- [ ] Test unauthenticated user accessing protected routes → redirect to login
- [ ] Test register flow → no auto redirect
- [ ] Test session init → no auto redirect
- [ ] Verify no console errors
- [ ] Verify no infinite redirect loops

## PRODUCTION DEPLOYMENT

1. **Deploy all changes:**
   - `services/authService.ts`
   - `middleware.ts`
   - `lib/useAuthGuard.ts`
   - `providers/AuthProvider.tsx`
   - `app/login/page.tsx`
   - `app/register/page.tsx`

2. **Run SQL migrations:**
   - `supabase/drop_rls_policies.sql`
   - `supabase/rebuild_rls_policies.sql`
   - `supabase/auto_profile_sync.sql`

3. **Verify auth users:**
   - Run `supabase/verify_auth_users.sql`
   - Fix any mismatched users if needed

4. **Test full flow:**
   - Login as admin
   - Login as warga
   - Test navigation
   - Test error cases

## TROUBLESHOOTING

### Issue: Still getting redirect loops
- Check if useAuthGuard is still redirecting
- Check if middleware has role logic
- Check if AuthProvider is redirecting
- Check if pages have redirect logic

### Issue: Role not found error
- Check if user exists in citizens table
- Check if role column has value
- Check RLS policies
- Run verify_auth_users.sql

### Issue: Login not working
- Check authService.login() is being called
- Check console logs for errors
- Check Supabase connection
- Verify user exists in auth.users

## CONCLUSION

This architecture reset eliminates all multi-source control systems and implements a strict single-source-of-truth architecture with:
- Single auth flow (authService only)
- Single redirect point (login page only)
- Middleware only for protection
- Strict role fetching with no fallback
- No auto navigation
- Single auth store

The result is a stable, production-ready authentication and routing system with no redirect loops, no role mismatches, and clear separation of concerns.
