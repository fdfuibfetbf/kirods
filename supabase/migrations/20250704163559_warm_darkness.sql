/*
  # Fix Blog Posts Category Foreign Key Relationship

  1. Changes
    - Add foreign key constraint between blog_posts.category_id and categories.id
    - Update existing blog posts to have valid category references
    - Ensure data integrity for the relationship

  2. Security
    - No RLS changes needed as tables already have proper policies

  3. Notes
    - Safe to run multiple times due to IF NOT EXISTS checks
    - Updates existing data to maintain referential integrity
*/

-- First, ensure we have some default categories if they don't exist
INSERT INTO categories (name, slug, description, created_at, updated_at)
VALUES 
  ('Tutorials', 'tutorials', 'Step-by-step guides and tutorials', now(), now()),
  ('Hosting', 'hosting', 'Web hosting related articles', now(), now()),
  ('WordPress', 'wordpress', 'WordPress tips and guides', now(), now()),
  ('Domains', 'domains', 'Domain management and registration', now(), now()),
  ('Security', 'security', 'Website security best practices', now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
    AND table_schema = 'public'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update existing blog posts to have valid category references
-- This ensures all blog posts have a valid category_id
UPDATE blog_posts 
SET category_id = (
  CASE 
    WHEN tags @> ARRAY['hosting'] THEN (SELECT id FROM categories WHERE slug = 'hosting' LIMIT 1)
    WHEN tags @> ARRAY['wordpress'] THEN (SELECT id FROM categories WHERE slug = 'wordpress' LIMIT 1)
    WHEN tags @> ARRAY['domains'] THEN (SELECT id FROM categories WHERE slug = 'domains' LIMIT 1)
    WHEN tags @> ARRAY['security'] THEN (SELECT id FROM categories WHERE slug = 'security' LIMIT 1)
    ELSE (SELECT id FROM categories WHERE slug = 'tutorials' LIMIT 1)
  END
)
WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories);

-- Verify the relationship was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
    AND table_schema = 'public'
  ) THEN
    RAISE NOTICE 'Foreign key constraint successfully created: blog_posts.category_id -> categories.id';
  ELSE
    RAISE EXCEPTION 'Failed to create foreign key constraint';
  END IF;
END $$;