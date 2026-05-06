# Supabase Storage Setup for Payment Proofs

## Create Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Bucket name: `payment-proofs`
4. Make it public: No (private bucket for security)
5. Click "Create bucket"

## Bucket Policies

Create the following policies for `payment-proofs` bucket:

### Policy 1: Allow authenticated users to upload
- Name: `Allow upload for authenticated users`
- Allowed operations: INSERT
- Target role: authenticated
- Policy definition: `auth.role() = 'authenticated'`

### Policy 2: Allow authenticated users to read their own files
- Name: `Allow read own files`
- Allowed operations: SELECT
- Target role: authenticated
- Policy definition: `auth.uid()::text = (storage.foldername[1])`

### Policy 3: Allow admins to read all files
- Name: `Allow admin read all`
- Allowed operations: SELECT
- Target role: authenticated
- Policy definition: `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')`

## Folder Structure

Files will be stored as: `{user_id}/{timestamp}_{filename}`

Example: `123e4567-e89b-12d3-a456-426614174000/1715025600000_bukti_transfer.jpg`
