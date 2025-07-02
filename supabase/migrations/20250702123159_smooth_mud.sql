/*
  # Create admin profile table

  1. New Tables
    - `admin_profiles`
      - `id` (uuid, primary key)
      - `user_id` (text, unique) - admin identifier
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `location` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `role` (text, default 'Administrator')
      - `join_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_profiles` table
    - Add policies for admin access
*/

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL DEFAULT 'admin',
  first_name text NOT NULL DEFAULT 'Admin',
  last_name text NOT NULL DEFAULT 'User',
  email text UNIQUE NOT NULL DEFAULT 'admin@kirods.com',
  phone text DEFAULT '+1 (555) 123-4567',
  location text DEFAULT 'New York, USA',
  bio text DEFAULT 'System Administrator for Kirods Hosting Knowledge Base',
  avatar_url text,
  role text NOT NULL DEFAULT 'Super Administrator',
  join_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow admin profile access"
  ON admin_profiles
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin profile if it doesn't exist
INSERT INTO admin_profiles (user_id, first_name, last_name, email, phone, location, bio, role, join_date)
VALUES ('admin', 'Admin', 'User', 'admin@kirods.com', '+1 (555) 123-4567', 'New York, USA', 'System Administrator for Kirods Hosting Knowledge Base', 'Super Administrator', '2023-01-15')
ON CONFLICT (user_id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_profile_updated_at();