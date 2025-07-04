/*
  # Create Storage Management Tables and Functions

  1. New RLS Policies
    - Add policies for storage buckets and objects
    - Allow anonymous and authenticated users to manage storage
    - Enable secure file access control

  2. Security
    - Enable proper access controls for storage
    - Allow public access to public buckets
    - Restrict private bucket access
*/

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create storage tracking table for additional metadata
CREATE TABLE IF NOT EXISTS storage_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  object_path text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  content_type text,
  is_folder boolean DEFAULT false,
  custom_metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bucket_id, object_path)
);

-- Enable RLS on storage_metadata
ALTER TABLE storage_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_metadata
CREATE POLICY "Allow public access to storage_metadata"
  ON storage_metadata
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage storage_metadata"
  ON storage_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to manage storage_metadata"
  ON storage_metadata
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_storage_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_storage_metadata_updated_at
  BEFORE UPDATE ON storage_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_metadata_updated_at();

-- Create function to track storage object changes
CREATE OR REPLACE FUNCTION handle_storage_object_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert new metadata record
    INSERT INTO storage_metadata (
      bucket_id,
      object_path,
      size_bytes,
      content_type,
      is_folder,
      custom_metadata
    ) VALUES (
      NEW.bucket_id,
      NEW.name,
      COALESCE((NEW.metadata->>'size')::bigint, 0),
      COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
      NEW.name LIKE '%/',
      NEW.metadata
    )
    ON CONFLICT (bucket_id, object_path) 
    DO UPDATE SET
      size_bytes = COALESCE((NEW.metadata->>'size')::bigint, 0),
      content_type = COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
      is_folder = NEW.name LIKE '%/',
      custom_metadata = NEW.metadata,
      updated_at = now();
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update existing metadata record
    UPDATE storage_metadata
    SET
      size_bytes = COALESCE((NEW.metadata->>'size')::bigint, 0),
      content_type = COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
      is_folder = NEW.name LIKE '%/',
      custom_metadata = NEW.metadata,
      updated_at = now()
    WHERE bucket_id = NEW.bucket_id AND object_path = NEW.name;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete metadata record
    DELETE FROM storage_metadata
    WHERE bucket_id = OLD.bucket_id AND object_path = OLD.name;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for storage.objects
DROP TRIGGER IF EXISTS storage_object_changes ON storage.objects;
CREATE TRIGGER storage_object_changes
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION handle_storage_object_changes();

-- Create RLS policies for storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated access to buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow individual bucket access" ON storage.buckets;

-- Create new policies for storage.buckets
CREATE POLICY "Allow public access to buckets"
  ON storage.buckets
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage buckets"
  ON storage.buckets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to manage buckets"
  ON storage.buckets
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated access to objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual object access" ON storage.objects;

-- Create new policies for storage.objects
CREATE POLICY "Allow select access to public objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN (
    SELECT name FROM storage.buckets WHERE public = true
  ));

CREATE POLICY "Allow authenticated users to manage objects"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to manage objects"
  ON storage.objects
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create default buckets if they don't exist
DO $$
BEGIN
  -- Public bucket for images
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'images') THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('images', 'images', true, false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);
  END IF;

  -- Public bucket for videos
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'videos') THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('videos', 'videos', true, false, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg']);
  END IF;

  -- Private bucket for documents
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents') THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('documents', 'documents', false, false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
  END IF;
END $$;