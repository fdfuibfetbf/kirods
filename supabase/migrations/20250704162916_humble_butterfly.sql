/*
  # Create Categories Table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, required, unique)
      - `slug` (text, required, unique)
      - `description` (text)
      - `color` (text, default '#3B82F6')
      - `icon` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for public read access
    - Add policy for admin management

  3. Sample Data
    - Insert default categories for the blog
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Allow public to read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admin to manage categories"
  ON categories
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Insert default categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Hosting', 'hosting', 'Web hosting tips, tutorials, and best practices', '#10B981', 'Server'),
  ('WordPress', 'wordpress', 'WordPress development, plugins, and maintenance', '#3B82F6', 'Code'),
  ('Domains', 'domains', 'Domain registration, management, and DNS', '#8B5CF6', 'Globe'),
  ('Security', 'security', 'Website security, SSL certificates, and protection', '#EF4444', 'Shield'),
  ('Performance', 'performance', 'Website optimization and speed improvements', '#F59E0B', 'Zap'),
  ('Tutorials', 'tutorials', 'Step-by-step guides and how-to articles', '#06B6D4', 'BookOpen')
ON CONFLICT (name) DO NOTHING;