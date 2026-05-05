# Backup and Recovery Guide

## Overview

This document describes the backup and recovery procedures for the Kepengurusan application.

## Automated Backup Script

### Using the Export Script

The application includes an automated database export script that exports all data to JSON and CSV formats.

**Location:** `scripts/exportDatabase.ts`

**Prerequisites:**
- Node.js installed
- Supabase credentials configured in `.env.local`

**Usage:**

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the export script
npx tsx scripts/exportDatabase.ts
```

**Output:**
- JSON backup: `exports/backup-{timestamp}.json` (complete database dump)
- CSV files: `exports/{table}-{timestamp}.csv` (individual table exports)

**Tables Exported:**
- citizens
- letters
- iuran
- iuran_types
- iuran_payments
- notifications

## Manual Backup via Supabase Dashboard

### 1. Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to the **Database** tab

### 2. Export Data

**Option A: Export via SQL Editor**

1. Navigate to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Run the following SQL command for each table:

```sql
-- Export citizens table
SELECT * FROM citizens;

-- Export letters table
SELECT * FROM letters;

-- Export iuran table
SELECT * FROM iuran;

-- Export iuran_types table
SELECT * FROM iuran_types;

-- Export iuran_payments table
SELECT * FROM iuran_payments;

-- Export notifications table
SELECT * FROM notifications;
```

4. Click **Download** button to save results as CSV

**Option B: Export via Table Editor**

1. Navigate to **Table Editor** in the left sidebar
2. Select a table from the dropdown
3. Click the **Export** button in the top right
4. Choose format (CSV or JSON)
5. Click **Download**

### 3. Backup Schema

To backup the database structure (schema):

1. Navigate to **Database** → **Schema**
2. Click **Export Schema**
3. Save the SQL file

## Recovery Procedures

### Restore from JSON Backup

1. Ensure you have the JSON backup file
2. Use the Supabase SQL Editor to execute INSERT statements
3. Or use a script to restore data (not included, requires custom implementation)

### Restore from CSV Backup

1. Navigate to **Table Editor** in Supabase Dashboard
2. Select the target table
3. Click **Import** button
4. Upload the CSV file
5. Map columns and confirm import

### Important Notes for Recovery

- **Foreign Key Constraints**: When restoring data, ensure parent tables are restored before child tables
  - Order: `iuran_types` → `citizens` → `iuran_payments` → `iuran` → `letters` → `notifications`

- **Data Integrity**: Check for duplicate records before importing

- **Backup Timestamp**: Always verify the backup date to ensure you're restoring the correct version

## Backup Schedule Recommendations

### Daily Backup (Automated)

For production environments:
- Run the export script daily using a cron job
- Store backups in a secure location (e.g., AWS S3, Google Cloud Storage)
- Keep at least 7 days of daily backups

### Weekly Backup (Manual)

- Perform a full manual backup via Supabase Dashboard weekly
- Document any schema changes in this file

### Monthly Backup (Archive)

- Keep one monthly backup for at least 12 months
- Store in an offsite location for disaster recovery

## Backup Verification

After each backup, verify:

1. **File Size**: Ensure backup files are not empty
2. **Record Count**: Compare record counts with database
3. **JSON Validity**: Ensure JSON files are valid (can be opened)
4. **CSV Validity**: Ensure CSV files can be opened in a spreadsheet application

## Troubleshooting

### Export Script Fails

**Error:** "Missing Supabase credentials"

**Solution:**
- Ensure `.env.local` file exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Error:** "Permission denied"

**Solution:**
- Ensure the Supabase anon key has read access to all tables
- Check RLS policies allow public read access for backup operations

### Import Fails

**Error:** "Foreign key constraint violation"

**Solution:**
- Ensure parent tables are imported before child tables
- Check that referenced records exist in parent tables

**Error:** "Duplicate key violation"

**Solution:**
- Clear the target table before importing
- Or use upsert operations instead of insert

## Contact

For questions or issues with backup procedures, contact the development team.
