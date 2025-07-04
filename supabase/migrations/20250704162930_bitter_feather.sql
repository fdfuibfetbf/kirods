/*
  # Update Blog Posts Foreign Key Constraint

  1. Changes
    - Add foreign key constraint to blog_posts.category_id if it doesn't exist
    - Ensure the relationship is properly established for Supabase API

  2. Notes
    - This migration ensures the foreign key relationship exists
    - It's safe to run multiple times due to IF NOT EXISTS checks
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey' 
    AND table_name = 'blog_posts'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update existing blog posts to have valid category references
UPDATE blog_posts 
SET category_id = (
  CASE 
    WHEN tags @> ARRAY['hosting'] THEN (SELECT id FROM categories WHERE slug = 'hosting')
    WHEN tags @> ARRAY['wordpress'] THEN (SELECT id FROM categories WHERE slug = 'wordpress')
    WHEN tags @> ARRAY['domains'] THEN (SELECT id FROM categories WHERE slug = 'domains')
    WHEN tags @> ARRAY['security'] THEN (SELECT id FROM categories WHERE slug = 'security')
    ELSE (SELECT id FROM categories WHERE slug = 'tutorials')
  END
)
WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories);