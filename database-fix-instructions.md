# Fix Foreign Key Relationship - Manual Steps

Since the Supabase CLI is not available in this environment, you need to manually execute the migration SQL in your Supabase dashboard.

## Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to the SQL Editor

2. **Execute the following SQL:**

```sql
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
```

3. **Click "Run" to execute the SQL**

4. **Verify the relationship was created:**
   - Go to Table Editor > blog_posts
   - You should see `category_id` listed as a foreign key pointing to `categories.id`

5. **Test the application:**
   - Refresh your blog page at https://localhost:5173/blog
   - The error should be resolved and blog posts should load correctly

## What this fixes:
- Creates the missing foreign key relationship between `blog_posts.category_id` and `categories.id`
- Updates existing blog posts to have valid category references
- Allows Supabase to properly join the tables when using the query: `select=*,category:categories(*)`

The error will be resolved once you execute this SQL in your Supabase dashboard.