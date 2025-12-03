/*
  # Create File Storage Bucket

  1. Storage Bucket
    - Create `organization-files` bucket for unlimited file storage
    - Configure bucket to be private (authentication required)
    - File paths will include organization_id for isolation: {organization_id}/{folder_path}/{filename}

  Note: Storage bucket RLS policies are managed through Supabase Dashboard or CLI
  The bucket is created as private, requiring authentication for all operations
*/

-- Create storage bucket for organization files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-files',
  'organization-files',
  false,
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;