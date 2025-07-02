/*
  # Add SEO fields to articles table

  1. New Columns
    - `meta_title` (text) - SEO optimized title
    - `meta_description` (text) - Meta description for search results
    - `meta_keywords` (text) - Meta keywords
    - `slug` (text) - URL slug for the article
    - `canonical_url` (text) - Canonical URL
    - `og_title` (text) - Open Graph title
    - `og_description` (text) - Open Graph description
    - `og_image` (text) - Open Graph image URL

  2. Indexes
    - Add unique index on slug for better SEO URLs

  3. Functions
    - Add function to increment article views safely
*/

-- Add SEO fields to articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE articles ADD COLUMN meta_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE articles ADD COLUMN meta_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE articles ADD COLUMN meta_keywords text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'canonical_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN canonical_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'og_title'
  ) THEN
    ALTER TABLE articles ADD COLUMN og_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'og_description'
  ) THEN
    ALTER TABLE articles ADD COLUMN og_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'og_image'
  ) THEN
    ALTER TABLE articles ADD COLUMN og_image text;
  END IF;
END $$;

-- Add unique index on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'articles' AND indexname = 'articles_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX articles_slug_unique ON articles(slug) WHERE slug IS NOT NULL;
  END IF;
END $$;

-- Add session tracking fields to chat_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'session_duration'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN session_duration integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'user_ip'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN user_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE chat_sessions ADD COLUMN user_agent text;
  END IF;
END $$;

-- Create or replace function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE id = article_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_article_views(uuid) TO anon, authenticated;