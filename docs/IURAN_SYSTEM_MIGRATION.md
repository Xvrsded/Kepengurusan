# Iuran System Migration Guide

## Overview
Migrating from old iuran system (iuran_types, iuran_payments) to new production-grade system (iuran_master, iuran_user).

## Old System
- `iuran_types`: Admin creates iuran types
- `iuran_payments`: Manual payment records per citizen
- Manual generation of payment records

## New System
- `iuran_master`: Admin creates iuran types
- `iuran_user`: Auto-generated for all warga via backend trigger
- Frontend only READ from iuran_user
- Payment updates status in iuran_user

## Database Changes
Run `supabase/create_iuran_master_user_tables.sql` to create new tables and triggers.

## Store Changes
- Added `IuranMaster` and `IuranUser` types
- Added `iuranMaster` and `iuranUser` to state
- Added `loadingIuranMaster` and `loadingIuranUser` loading states
- Added methods:
  - `fetchIuranMaster()`: Fetch all iuran_master (admin)
  - `fetchUserIuran(userId)`: Fetch user's iuran_user (warga)
  - `createIuranMaster(iuran)`: Create new iuran master (admin)
  - `updateIuranUserPayment(iuranId)`: Update payment status (warga)

## Frontend Changes Required

### Admin Iuran Page (`app/admin/iuran/page.tsx`)
- Change from `iuranTypes` to `iuranMaster`
- Change from `iuranPayments` to `iuranUser`
- Add form to create new iuran master
- Update UI to show new data structure
- Show statistics based on iuran_master and iuran_user

### Warga Iuran Page (`app/warga/iuran/page.tsx`)
- Use `fetchUserIuran` instead of old methods
- Show personal iuran with iuran_master details
- Add payment button that calls `updateIuranUserPayment`
- Show status colors: unpaid (red), paid (green), overdue (yellow)

## Realtime Setup
Add realtime subscriptions for:
- `iuran_master` changes (admin)
- `iuran_user` changes (warga and admin)

## State Management Rules
- No fetch in loops
- Use loading guards
- Proper dependency arrays
- No double fetch on login

## Testing Checklist
- [ ] Run SQL migration
- [ ] Admin creates iuran master
- [ ] Backend auto-generates iuran_user for all warga
- [ ] Warga sees their iuran
- [ ] Warga updates payment status
- [ ] Realtime updates work
- [ ] No data mismatch
- [ ] No infinite loops
