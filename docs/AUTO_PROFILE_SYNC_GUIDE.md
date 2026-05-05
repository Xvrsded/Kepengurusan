# Auto Profile Sync Trigger Guide

## Problem
Previous trigger implementation had errors:
- "column 'created_at' already exists" - duplicate column in schema
- "missing FROM-clause entry for table 'new'" - incorrect use of NEW in SQL

## Solution
Created new trigger implementation (`supabase/auto_profile_sync.sql`) that:
1. Uses proper plpgsql function syntax
2. Uses NEW correctly inside trigger function
3. Binds to auth.users AFTER INSERT
4. No schema modifications needed
5. Handles conflicts gracefully

## What the Trigger Does

When a new user is created in `auth.users` (via Supabase Auth signUp):
1. Trigger fires AFTER INSERT on auth.users
2. Function `sync_user_to_citizens()` is called
3. Inserts a row into `citizens` table with:
   - `id`: UUID from auth.users (NEW.id)
   - `name`: From user_metadata or email as fallback
   - `phone`: From user_metadata or empty string
   - `role`: Default 'warga' (can be overridden by admin assignment trigger)

## Trigger Implementation

### Function: `sync_user_to_citizens()`
```sql
create or replace function sync_user_to_citizens()
returns trigger as $$
begin
  insert into citizens (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'warga'
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql;
```

### Trigger: `on_auth_user_created`
```sql
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function sync_user_to_citizens();
```

## Key Fixes

### 1. Schema Consistency
- **No schema modifications**: The trigger does not add columns
- **Uses existing columns**: citizens table should already have id, name, phone, role
- **No duplicate created_at**: No column creation in trigger

### 2. Correct NEW Usage
- **NEW only inside function**: NEW is used inside the plpgsql function body
- **Proper language**: Function uses `language plpgsql`
- **Correct reference**: Uses `NEW.id`, `NEW.email`, `NEW.raw_user_meta_data`

### 3. Correct Trigger Binding
- **Table**: auth.users (not citizens)
- **Event**: AFTER INSERT (not BEFORE)
- **Timing**: Runs after user is created in auth.users
- **Scope**: FOR EACH ROW

## How to Apply

### Step 1: Run the SQL
```bash
# In Supabase SQL Editor, run:
supabase/auto_profile_sync.sql
```

### Step 2: Verify Trigger
The SQL includes a verification query:
```sql
select 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
from information_schema.triggers
where trigger_name = 'on_auth_user_created';
```

Expected result:
```
trigger_name           | event_manipulation | event_object_table | action_statement
-----------------------+---------------------+-------------------+------------------
on_auth_user_created   | INSERT              | auth.users        | sync_user_to_citizens()
```

### Step 3: Test Registration
1. Go to `/register` page
2. Fill in registration form
3. Submit
4. Check citizens table - new user should be created automatically

## Data Flow

### Registration Flow with Trigger:
1. User fills register form
2. `supabase.auth.signUp()` called
3. User created in `auth.users` table
4. **Trigger fires** → `sync_user_to_citizens()` called
5. Row inserted into `citizens` table
6. Application continues with login/upsert flow (as backup)

### Without Trigger (Previous Flow):
1. User fills register form
2. `supabase.auth.signUp()` called
3. User created in `auth.users` table
4. Application manually upserts to `citizens` table
5. If manual upsert fails → mismatch between tables

## Benefits

### Automatic Sync:
- No manual upsert needed in application code
- Tables stay in sync automatically
- Reduces application complexity

### Error Prevention:
- Prevents "user in auth.users but not in citizens" issue
- Prevents "Invalid login credentials" errors
- Ensures data consistency

### Performance:
- Trigger runs at database level (faster)
- No extra round-trip to application
- Atomic operation with user creation

## Conflict Handling

The trigger uses `on conflict (id) do nothing`:
- If citizen with same UUID already exists → skip
- Prevents duplicate rows
- Allows manual fixes without breaking trigger

## Role Assignment

The trigger sets default role to 'warga'. For admin assignment:
- Use the existing `assign_admin_role.sql` trigger
- It runs BEFORE INSERT on citizens
- Checks if admin count is 0 → assigns 'admin'
- Otherwise assigns 'warga'

Both triggers work together:
1. Auto sync trigger creates citizen with 'warga'
2. Admin assignment trigger can override role

## Troubleshooting

### Trigger Not Firing:
- Check if trigger exists: Run verification query
- Check if function exists: `SELECT * FROM pg_proc WHERE proname = 'sync_user_to_citizens'`
- Check auth.users table: Ensure user is actually created

### User Not in Citizens After Register:
- Check trigger logs: Look for errors in Supabase logs
- Check citizens schema: Ensure columns exist (id, name, phone, role)
- Check user_metadata: Ensure name/phone are in metadata if needed

### Duplicate Rows:
- Check if `on conflict (id) do nothing` is working
- Check for manual inserts conflicting with trigger
- Verify UUIDs are unique

## Cleanup (If Needed)

To remove the trigger:
```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists sync_user_to_citizens();
```

## Production Checklist

- [ ] Run `auto_profile_sync.sql` in Supabase SQL Editor
- [ ] Verify trigger exists using verification query
- [ ] Test registration flow
- [ ] Check citizens table after registration
- [ ] Test login with newly registered user
- [ ] Verify role assignment works correctly
- [ ] Check for duplicate rows
- [ ] Monitor Supabase logs for trigger errors

## Expected Result After Fix

- Register user → automatically created in citizens table
- No "column 'created_at' already exists" error
- No "missing FROM-clause entry for table 'new'" error
- No schema mismatch errors
- Trigger runs without errors
- auth.users and citizens table stay in sync
