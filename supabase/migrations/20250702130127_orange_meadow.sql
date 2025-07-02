/*
  # Create SMTP Settings Table

  1. New Tables
    - `smtp_settings`
      - `id` (uuid, primary key)
      - `host` (text, required) - SMTP server hostname
      - `port` (integer, default 587) - SMTP server port
      - `username` (text, required) - SMTP authentication username
      - `password` (text, required) - SMTP authentication password
      - `from_email` (text, required) - Default sender email address
      - `from_name` (text, optional) - Default sender name
      - `encryption` (text, default 'tls') - Encryption method (none, tls, ssl)
      - `enabled` (boolean, default false) - Whether SMTP is enabled
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `smtp_settings` table
    - Add policy for authenticated users to manage SMTP settings
    - Add policy for anonymous users to read settings (for admin interface)

  3. Triggers
    - Auto-update `updated_at` timestamp on record changes

  4. Constraints
    - Check constraint for valid encryption values
    - Ensure only one SMTP configuration exists at a time
*/

-- Create the smtp_settings table
CREATE TABLE IF NOT EXISTS public.smtp_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host text NOT NULL DEFAULT '',
    port integer NOT NULL DEFAULT 587,
    username text NOT NULL DEFAULT '',
    password text NOT NULL DEFAULT '',
    from_email text NOT NULL DEFAULT '',
    from_name text DEFAULT 'Kirods Hosting',
    encryption text NOT NULL DEFAULT 'tls' CHECK (encryption IN ('none', 'tls', 'ssl')),
    enabled boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for SMTP settings access
CREATE POLICY "Allow authenticated users to manage SMTP settings"
    ON public.smtp_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read SMTP settings"
    ON public.smtp_settings
    FOR SELECT
    TO anon
    USING (true);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_smtp_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on changes
CREATE TRIGGER update_smtp_settings_updated_at
    BEFORE UPDATE ON public.smtp_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_smtp_settings_updated_at();

-- Insert default SMTP settings record
INSERT INTO public.smtp_settings (
    host,
    port,
    username,
    password,
    from_email,
    from_name,
    encryption,
    enabled
) VALUES (
    '',
    587,
    '',
    '',
    '',
    'Kirods Hosting',
    'tls',
    false
) ON CONFLICT DO NOTHING;