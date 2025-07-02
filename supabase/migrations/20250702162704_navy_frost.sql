/*
  # Fix SMTP Settings ID Column Type

  1. Changes
    - Change `smtp_settings.id` column from UUID to TEXT
    - This allows using static string identifiers like "global_smtp_settings"
    - Preserves existing data and constraints

  2. Security
    - Maintains existing RLS policies
    - Preserves all existing constraints except primary key (recreated)
*/

-- First, drop the existing primary key constraint
ALTER TABLE smtp_settings DROP CONSTRAINT smtp_settings_pkey;

-- Change the id column type from uuid to text
ALTER TABLE smtp_settings ALTER COLUMN id TYPE TEXT;

-- Remove the default value since we'll use static IDs
ALTER TABLE smtp_settings ALTER COLUMN id DROP DEFAULT;

-- Recreate the primary key constraint
ALTER TABLE smtp_settings ADD CONSTRAINT smtp_settings_pkey PRIMARY KEY (id);

-- Insert or update the global SMTP settings record with the static ID
INSERT INTO smtp_settings (
  id,
  host,
  port,
  username,
  password,
  from_email,
  from_name,
  encryption,
  enabled,
  created_at,
  updated_at
) VALUES (
  'global_smtp_settings',
  '',
  587,
  '',
  '',
  '',
  'Kirods Hosting',
  'tls',
  false,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;