/*
  # Add comments table for article feedback

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key to articles)
      - `user_name` (text, required)
      - `user_email` (text, required)
      - `content` (text, required)
      - `status` (text, default 'pending') - pending, approved, rejected
      - `admin_reply` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for public read access to approved comments
    - Add policies for comment creation by anonymous users
    - Add policies for admin management of all comments

  3. Relationships
    - Foreign key constraint from `comments.article_id` to `articles.id`
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  admin_reply text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT fk_comments_article_id 
    FOREIGN KEY (article_id) 
    REFERENCES articles(id) 
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy for public to read approved comments
CREATE POLICY "Allow public to read approved comments"
  ON comments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy for anonymous users to create comments
CREATE POLICY "Allow anonymous users to create comments"
  ON comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy for admin to manage all comments
CREATE POLICY "Allow admin to manage all comments"
  ON comments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);