/*
  # Fix Articles RLS Policies

  1. Security Updates
    - Update RLS policies for articles table to allow anonymous and authenticated users
    - Add separate policies for INSERT, UPDATE, DELETE, and SELECT operations
    - Align with existing patterns used in categories and chat tables

  2. Changes
    - Drop existing restrictive policies
    - Add new permissive policies for all CRUD operations
    - Allow both anonymous and authenticated users to manage articles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Articles are manageable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;

-- Create new policies that allow both anonymous and authenticated users
CREATE POLICY "Allow article creation"
  ON articles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow article updates"
  ON articles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow article deletion"
  ON articles
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow everyone to view articles"
  ON articles
  FOR SELECT
  TO anon, authenticated
  USING (true);