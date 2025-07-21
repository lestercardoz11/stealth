/*
  # Create Storage Bucket for Documents

  1. Storage
    - Create documents bucket for file storage
    - Set up RLS policies for document access
    
  2. Security
    - Users can upload to their own folder
    - Users can read their own documents and company-wide documents
    - Admins can access all documents
*/

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    public.is_approved_user(auth.uid())
  );

-- Policy for users to read their own documents
CREATE POLICY "Users can read own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    public.is_approved_user(auth.uid())
  );

-- Policy for users to read company-wide documents
CREATE POLICY "Users can read company documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_path = name
      AND d.is_company_wide = true
    ) AND
    public.is_approved_user(auth.uid())
  );

-- Policy for users to delete their own documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    public.is_approved_user(auth.uid())
  );

-- Policy for admins to access all documents
CREATE POLICY "Admins can manage all documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    public.is_admin(auth.uid())
  );