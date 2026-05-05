# Routing Fix Guide - Warga Role Infinite Redirect Loop

## Problem
User warga selalu kembali ke dashboard setelah pindah halaman lain (infinite redirect loop).

## Root Cause
The `useAuthGuard` hook was redirecting based on role on every render without checking the current pathname, causing infinite redirect loops.

**Original problematic code:**
```typescript
if (role !== "admin") {
  router.replace("/warga");
  return;
}
```

This would redirect to `/warga` every time the component re-rendered, even if the user was already on `/warga`, causing an infinite loop.

## Solution
Updated `useAuthGuard` to be route-aware and prevent redirect loops.

**Fixed code:**
```typescript
// Only redirect to login if not already on login page
if (!user) {
  if (pathname !== "/login") {
    router.replace("/login");
  }
  return;
}

// Only redirect if role is not admin and not already on warga page
if (role !== "admin" && role !== null && pathname !== "/warga") {
  router.replace("/warga");
  return;
}

// If role is null (still loading profile), don't redirect
// Let the user stay on current page
```

## Changes Made

### 1. useAuthGuard (`lib/useAuthGuard.ts`)
- Added `usePathname` hook to get current route
- Added pathname check before redirecting to `/login`
- Added pathname check before redirecting to `/warga`
- Don't redirect if role is null (still loading profile)
- Only redirect if not already on target route

### 2. Architecture Summary
- **Middleware**: Only checks authentication, no role-based redirect
- **AuthProvider**: Only syncs session, no redirect logic
- **useAuthGuard**: Route-aware guard with pathname checks
- **RouteGuard**: Component-level guard (shows error, doesn't redirect)

## How It Works Now

### Login Flow:
1. User clicks login → Login page handles auth
2. Login successful → redirect based on role (admin/warga)
3. useAuthGuard checks pathname - no redirect if already on correct route

### Navigation Flow:
1. User navigates to `/warga/iuran`
2. useAuthGuard checks: user is authenticated, role is warga, pathname is `/warga/iuran`
3. No redirect - user stays on page
4. User can navigate freely within warga routes

### Protection Flow:
1. Unauthenticated user tries to access `/admin`
2. Middleware checks authentication → redirects to `/login`
3. User logs in → redirected to appropriate dashboard
4. useAuthGuard checks pathname - no redirect loop

## Route Awareness

The guard now checks:
- **Login page**: Only redirect to login if not already on `/login`
- **Warga page**: Only redirect to `/warga` if not already on `/warga`
- **Admin page**: Only admin users can access (via useAuthGuard in admin layout)
- **Loading state**: Don't redirect if role is null (still loading)

## Expected Behavior

### Before Fix:
- User warga navigates to `/warga/iuran`
- useAuthGuard redirects to `/warga`
- useAuthGuard redirects to `/warga` again
- **Infinite loop**

### After Fix:
- User warga navigates to `/warga/iuran`
- useAuthGuard checks: user is authenticated, role is warga, pathname is `/warga/iuran`
- No redirect - user stays on page
- **Stable navigation**

## Architecture Clarification

### Responsibilities:
- **Middleware**: Protects routes from unauthenticated access
- **AuthProvider**: Syncs session and role from Supabase
- **useAuthGuard**: Protects admin-only pages (used in admin layout)
- **RouteGuard**: Component-level guard (shows/hides content)
- **Login Page**: Handles initial redirect after login

### What Each Does:
1. **Middleware**: 
   - Checks if user is authenticated
   - Redirects to `/login` if not
   - Does NOT check role
   - Does NOT do role-based redirect

2. **AuthProvider**:
   - Syncs session from Supabase
   - Calls `syncSupabaseUser()` to fetch role
   - Does NOT redirect
   - Only manages state

3. **useAuthGuard**:
   - Protects admin-only pages
   - Checks if user is admin
   - Redirects warga users to `/warga` (with pathname check)
   - Redirects unauthenticated users to `/login` (with pathname check)

4. **RouteGuard**:
   - Component-level guard
   - Shows error if role doesn't match
   - Does NOT redirect
   - Just hides/shows content

5. **Login Page**:
   - Handles authentication
   - Fetches role after login
   - Redirects based on role (admin → /admin, warga → /warga)
   - Only redirects on login success

## Troubleshooting

### Issue: Still getting redirect loops
- Check if useAuthGuard is using the updated code
- Check if pathname is being passed correctly
- Check browser console for redirect logs
- Check if role is null (still loading)

### Issue: Warga users can access admin pages
- Check if admin layout uses useAuthGuard
- Check if useAuthGuard is checking role correctly
- Check if role is being fetched correctly

### Issue: Users redirected to wrong page after login
- Check login page redirect logic
- Check roleStatus in store
- Check if role is being fetched from citizens table

## Production Checklist

- [ ] Verify useAuthGuard has pathname checks
- [ ] Test warga user navigation within warga routes
- [ ] Test warga user trying to access admin routes
- [ ] Test admin user navigation within admin routes
- [ ] Test unauthenticated user trying to access protected routes
- [ ] Verify no infinite redirect loops
- [ ] Check browser console for errors
- [ ] Test on mobile devices

## Expected Result After Fix

- User warga bisa pindah halaman tanpa dipaksa balik dashboard
- Dashboard hanya default entry point, bukan forced redirect
- Tidak ada infinite navigation loop
- Routing stabil dan production-ready
- User bisa navigate freely within their role's allowed routes
