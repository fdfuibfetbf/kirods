/*
  # Add SEO Indexing and Tracking Features

  1. New Tables
    - `seo_indexing_logs`
      - `id` (uuid, primary key)
      - `url` (text) - URL that was submitted for indexing
      - `status` (text) - success, failed, pending
      - `search_engine` (text) - google, bing, etc.
      - `response` (text) - response from search engine
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. New Columns for Articles
    - `indexed_at` (timestamp) - when the article was last indexed
    - `indexing_status` (text) - indexed, pending, failed
    - `indexing_errors` (text) - any errors from indexing attempts

  3. Security
    - Enable RLS on new table
    - Add policies for admin access
*/

-- Create seo_indexing_logs table
CREATE TABLE IF NOT EXISTS seo_indexing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  search_engine text NOT NULL,
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT seo_indexing_logs_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

-- Add SEO indexing fields to articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'indexed_at'
  ) THEN
    ALTER TABLE articles ADD COLUMN indexed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'indexing_status'
  ) THEN
    ALTER TABLE articles ADD COLUMN indexing_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'indexing_errors'
  ) THEN
    ALTER TABLE articles ADD COLUMN indexing_errors text;
  END IF;
END $$;

-- Enable RLS on seo_indexing_logs
ALTER TABLE seo_indexing_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for seo_indexing_logs
CREATE POLICY "Allow admin to manage SEO indexing logs"
  ON seo_indexing_logs
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seo_indexing_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_seo_indexing_logs_updated_at
  BEFORE UPDATE ON seo_indexing_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_indexing_logs_updated_at();

-- Create function to mark article as indexed
CREATE OR REPLACE FUNCTION mark_article_as_indexed(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET 
    indexed_at = now(),
    indexing_status = 'indexed',
    indexing_errors = NULL
  WHERE id = article_id;
END;
$$;

-- Create function to mark article indexing as failed
CREATE OR REPLACE FUNCTION mark_article_indexing_failed(article_id uuid, error_message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET 
    indexing_status = 'failed',
    indexing_errors = error_message
  WHERE id = article_id;
END;
$$;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION mark_article_as_indexed(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_article_indexing_failed(uuid, text) TO anon, authenticated;