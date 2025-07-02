/*
  # Fix SMTP Settings Table

  1. Ensure SMTP settings table exists with proper structure
  2. Insert default record if none exists
  3. Add proper RLS policies
  4. Add update trigger for updated_at field

  This migration is safe to run multiple times.
*/

-- Create the smtp_settings table if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to manage SMTP settings" ON public.smtp_settings;
DROP POLICY IF EXISTS "Allow anonymous users to read SMTP settings" ON public.smtp_settings;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_smtp_settings_updated_at ON public.smtp_settings;

-- Create trigger to automatically update updated_at on changes
CREATE TRIGGER update_smtp_settings_updated_at
    BEFORE UPDATE ON public.smtp_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_smtp_settings_updated_at();

-- Insert default SMTP settings record if none exists
INSERT INTO public.smtp_settings (
    host,
    port,
    username,
    password,
    from_email,
    from_name,
    encryption,
    enabled
) 
SELECT 
    '',
    587,
    '',
    '',
    '',
    'Kirods Hosting',
    'tls',
    false
WHERE NOT EXISTS (SELECT 1 FROM public.smtp_settings);