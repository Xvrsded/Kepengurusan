# Database Setup for Profile Photo Feature

## 1. Add photo_url column to profiles table

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT;
```

## 2. Create Supabase Storage bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it: `profile`
4. Make it public (for easier access to photos)
5. Add RLS policy:

```sql
-- Enable RLS
ALTER STORAGE POLICIES ON storage.buckets ENABLE;

-- Allow authenticated users to upload their own profile photo
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own profile photo
CREATE POLICY "Users can view their own profile photo"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own profile photo
CREATE POLICY "Users can update their own profile photo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. File naming convention

When uploading profile photos, use this format:
- Path: `profile/{user_id}/photo.jpg`
- Example: `profile/abc123-def456/photo.jpg`
