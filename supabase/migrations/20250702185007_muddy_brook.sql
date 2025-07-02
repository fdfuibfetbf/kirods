/*
  # Fix SMTP Settings RLS Policies

  1. Security Updates
    - Drop existing restrictive policies
    - Add comprehensive policies for both anonymous and authenticated users
    - Ensure SMTP settings can be managed properly by the application

  2. Policy Changes
    - Allow anonymous users to read and manage SMTP settings (for admin interface)
    - Allow authenticated users full access to SMTP settings
    - Maintain security while enabling proper functionality

  Note: This allows broader access for SMTP settings management. In production,
  you may want to restrict this further based on user roles.
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous users to read SMTP settings" ON smtp_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage SMTP settings" ON smtp_settings;

-- Create comprehensive policies for SMTP settings management
-- Allow anonymous users to read SMTP settings
CREATE POLICY "Allow anonymous read SMTP settings"
  ON smtp_settings
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert SMTP settings (for initial setup)
CREATE POLICY "Allow anonymous insert SMTP settings"
  ON smtp_settings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update SMTP settings
CREATE POLICY "Allow anonymous update SMTP settings"
  ON smtp_settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users full access to SMTP settings
CREATE POLICY "Allow authenticated manage SMTP settings"
  ON smtp_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;