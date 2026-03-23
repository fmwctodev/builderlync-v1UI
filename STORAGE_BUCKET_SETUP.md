# Storage Bucket RLS Policies Setup

## Overview
The `organization-files` storage bucket exists but requires Row Level Security (RLS) policies to be configured manually through the Supabase Dashboard.

## Why Manual Setup?
Storage bucket policies require elevated permissions that cannot be set through standard migrations. They must be configured through:
- Supabase Dashboard (recommended)
- Supabase CLI with service role key
- Direct SQL with superuser access

## Required Policies

### 1. SELECT Policy - View Files
**Name**: `Users can view organization files`

**SQL**:
```sql
CREATE POLICY "Users can view organization files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);
```

**Description**: Allows users to view files in organizations they are active members of.

---

### 2. INSERT Policy - Upload Files
**Name**: `Users can upload organization files`

**SQL**:
```sql
CREATE POLICY "Users can upload organization files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);
```

**Description**: Allows users to upload files to their organization's folder.

---

### 3. UPDATE Policy - Update File Metadata
**Name**: `Users can update organization files`

**SQL**:
```sql
CREATE POLICY "Users can update organization files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'organization-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);
```

**Description**: Allows users to update file metadata (like content-type) for files in their organization.

---

### 4. DELETE Policy - Delete Files (Owners/Admins Only)
**Name**: `Owners and admins can delete organization files`

**SQL**:
```sql
CREATE POLICY "Owners and admins can delete organization files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-files' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  )
);
```

**Description**: Only owners and admins can delete files from their organization.

---

## File Path Structure

All files MUST be stored with this path format:
```
{organization_id}/{folder_path}/{filename}
```

### Examples:
- `550e8400-e29b-41d4-a716-446655440000/documents/contract.pdf`
- `550e8400-e29b-41d4-a716-446655440000/proposals/proposal-2024-01.pdf`
- `550e8400-e29b-41d4-a716-446655440000/photos/job-site-01.jpg`

The first folder MUST be the organization UUID for the RLS policies to work correctly.

---

## Setup Instructions

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Policies**
3. Select the `organization-files` bucket
4. Click **New Policy**
5. Choose **Custom** policy type
6. Copy and paste each SQL policy above
7. Click **Review** and then **Save**
8. Repeat for all 4 policies

### Option 2: Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Create a migration file
supabase migration new storage_policies

# Add the policies to the migration file
# Then apply
supabase db push
```

### Option 3: SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy all 4 policies into a new query
3. Run the query
4. Verify policies in Storage → Policies

---

## Verification

After setting up the policies, verify they work:

1. **Test Upload**:
```typescript
const { data, error } = await supabase.storage
  .from('organization-files')
  .upload(`${orgId}/test/test.txt`, file);
```

2. **Test Download**:
```typescript
const { data, error } = await supabase.storage
  .from('organization-files')
  .download(`${orgId}/test/test.txt`);
```

3. **Test Delete** (as owner/admin):
```typescript
const { data, error } = await supabase.storage
  .from('organization-files')
  .remove([`${orgId}/test/test.txt`]);
```

---

## Security Notes

✅ **Good Security Practices**:
- Organization isolation is enforced (users can only access their org's files)
- Role-based deletion (only owners/admins can delete)
- Active membership required (is_active = true)
- All operations require authentication

⚠️ **Important**:
- Never store sensitive data without encryption
- Consider implementing file size limits
- Monitor storage usage per organization
- Implement virus scanning for uploaded files (future enhancement)

---

## Troubleshooting

### Issue: Users can't upload files
**Solution**: Check that:
1. User is authenticated
2. User is an active member of the organization
3. File path starts with correct organization UUID
4. INSERT policy is created

### Issue: Users can't view files
**Solution**: Check that:
1. SELECT policy is created
2. File path format is correct
3. User has active membership in organization

### Issue: Non-admins can delete files
**Solution**: Verify DELETE policy only allows 'owner' and 'admin' roles

---

## Next Steps

After setting up the storage policies:

1. ✅ Test file upload from the File Manager
2. ✅ Test file download/viewing
3. ✅ Test file deletion as admin
4. ✅ Verify non-admins cannot delete
5. ✅ Monitor storage usage in dashboard

---

## Related Files

- Migration: `20251126065117_create_file_storage_bucket_v2.sql`
- API Service: `src/shared/services/filesApi.ts`
- Component: `src/modules/roof-runner/pages/FileManager.tsx`
