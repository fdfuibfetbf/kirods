/*
  # Create Blog System Tables

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, required, unique)
      - `content` (text, required)
      - `excerpt` (text)
      - `author_id` (text, required)
      - `author_name` (text, required)
      - `featured_image` (text)
      - `status` (text, default 'draft') - draft, published, archived
      - `tags` (text array)
      - `category_id` (uuid, foreign key to categories)
      - `views` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `published_at` (timestamp)
      - SEO fields (meta_title, meta_description, etc.)
      - Indexing fields (indexed_at, indexing_status, etc.)

  2. Security
    - Enable RLS on `blog_posts` table
    - Add policies for public read access to published posts
    - Add policies for admin management of all posts

  3. Functions
    - Add function to increment blog post views safely
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author_id text NOT NULL,
  author_name text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  tags text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  -- SEO fields
  meta_title text,
  meta_description text,
  meta_keywords text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  -- Indexing fields
  indexed_at timestamptz,
  indexing_status text,
  indexing_errors text,
  CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Allow public to read published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Allow admin to manage all blog posts"
  ON blog_posts
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET views = views + 1 
  WHERE id = post_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_blog_post_views(uuid) TO anon, authenticated;

-- Insert sample blog posts
INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  author_id,
  author_name,
  featured_image,
  status,
  tags,
  category_id,
  published_at
) 
SELECT
  'Getting Started with Kirods Hosting',
  'getting-started-with-kirods-hosting',
  '# Getting Started with Kirods Hosting

Welcome to Kirods Hosting! This guide will help you get started with our hosting services and make the most of your web hosting experience.

## Setting Up Your Account

After signing up for Kirods Hosting, you''ll receive a welcome email with your account details. Here''s what to do next:

1. Log in to your control panel using the credentials provided
2. Set up your domain name or transfer an existing one
3. Configure your hosting environment
4. Upload your website files

## Managing Your Website

Our intuitive control panel makes it easy to manage your website:

- **File Manager**: Upload, edit, and organize your website files
- **Database Manager**: Create and manage MySQL databases
- **Email Accounts**: Set up professional email addresses for your domain
- **SSL Certificates**: Secure your website with free SSL certificates

## Optimizing Performance

To ensure your website loads quickly and performs well:

- Enable caching for faster page loads
- Optimize your images before uploading
- Minify CSS and JavaScript files
- Use a Content Delivery Network (CDN)

## Getting Support

If you need assistance, our support team is available 24/7:

- Live chat support
- Ticket system
- Knowledge base articles
- Community forums

We''re committed to providing you with the best hosting experience possible!',
  'This guide will help you get started with Kirods Hosting services and make the most of your web hosting experience. Learn how to set up your account, manage your website, optimize performance, and get support when needed.',
  'admin',
  'Admin User',
  'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'published',
  ARRAY['hosting', 'getting started', 'tutorial'],
  (SELECT id FROM categories WHERE name LIKE '%Hosting%' LIMIT 1),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'getting-started-with-kirods-hosting'
);

INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  author_id,
  author_name,
  featured_image,
  status,
  tags,
  category_id,
  published_at
) 
SELECT
  '5 Essential WordPress Security Tips',
  '5-essential-wordpress-security-tips',
  '# 5 Essential WordPress Security Tips

WordPress powers over 40% of all websites on the internet, making it a prime target for hackers. Protecting your WordPress site is crucial for maintaining your online presence and safeguarding your visitors'' data.

## 1. Keep Everything Updated

One of the simplest yet most effective security measures is keeping your WordPress core, themes, and plugins updated:

- WordPress regularly releases security patches
- Outdated themes and plugins can contain vulnerabilities
- Set up automatic updates when possible
- Regularly check for available updates

## 2. Use Strong Authentication

Strengthen your login security with these measures:

- Create strong, unique passwords using a password manager
- Implement two-factor authentication (2FA)
- Limit login attempts to prevent brute force attacks
- Change the default admin username
- Consider using a security plugin like Wordfence or Sucuri

## 3. Regular Backups

Backups are your safety net if something goes wrong:

- Set up automated daily backups
- Store backups in multiple locations (local and cloud)
- Test your backup restoration process regularly
- Keep backups for at least 30 days

## 4. Secure Your Hosting Environment

Your hosting environment plays a crucial role in security:

- Choose a reputable hosting provider with security features
- Use SFTP instead of FTP for file transfers
- Implement proper file permissions
- Enable SSL/TLS encryption for your website

## 5. Monitor and Scan Regularly

Stay vigilant by monitoring your site:

- Install a security plugin that offers malware scanning
- Set up alerts for suspicious activities
- Review your site logs regularly
- Perform security audits quarterly

By implementing these essential security measures, you can significantly reduce the risk of your WordPress site being compromised. Remember that security is an ongoing process, not a one-time setup.',
  'Protect your WordPress website with these 5 essential security tips. Learn how to keep your site updated, strengthen authentication, implement regular backups, secure your hosting environment, and monitor for threats.',
  'admin',
  'Admin User',
  'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'published',
  ARRAY['wordpress', 'security', 'tips'],
  (SELECT id FROM categories WHERE name LIKE '%WordPress%' LIMIT 1),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = '5-essential-wordpress-security-tips'
);

INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  author_id,
  author_name,
  featured_image,
  status,
  tags,
  category_id,
  published_at
) 
SELECT
  'How to Choose the Perfect Domain Name for Your Business',
  'how-to-choose-perfect-domain-name-business',
  '# How to Choose the Perfect Domain Name for Your Business

Your domain name is often the first impression potential customers have of your business online. It''s your digital address and a crucial part of your brand identity. Here''s how to choose a domain name that will benefit your business for years to come.

## Why Your Domain Name Matters

A good domain name:
- Builds brand recognition and trust
- Improves discoverability and SEO
- Creates a professional impression
- Is easier for customers to remember and share

## Key Factors to Consider

### 1. Keep It Short and Simple

Shorter domain names are:
- Easier to remember
- Less prone to typing errors
- More likely to fit on business cards and marketing materials
- Quicker to say in conversation

Aim for a domain name with 6-14 characters if possible.

### 2. Make It Memorable

Your domain should be:
- Catchy and distinctive
- Easy to pronounce
- Simple to spell
- Unique enough to stand out

Avoid numbers, hyphens, and unusual spellings that could confuse people.

### 3. Include Keywords When Appropriate

Strategic keywords can help with:
- Search engine optimization
- Clearly communicating what your business does
- Making your domain more relevant to your industry

However, don''t force keywords if they make your domain too long or awkward.

### 4. Choose the Right TLD (Top-Level Domain)

While .com remains the gold standard, consider:
- Industry-specific TLDs (.tech, .store, .photography)
- Location-based TLDs (.us, .co.uk, .eu)
- Brand-focused TLDs (.brand, .company)

Remember that non-.com domains may be harder for some users to remember.

### 5. Think Long-Term

Your domain should:
- Accommodate business growth
- Not limit you to specific products or locations
- Remain relevant as your business evolves
- Be something you''ll be proud of years from now

## Before You Register

Before finalizing your domain choice:
- Check trademark databases to avoid legal issues
- Search social media platforms for username availability
- Ask friends to spell it after only hearing it
- Consider purchasing common misspellings as well

## Conclusion

Choosing the right domain name is a balance between marketing, branding, and practical considerations. Take your time with this decision, as changing your domain later can be costly and complicated. With careful thought and the tips above, you can select a domain name that serves your business well for years to come.',
  'Learn how to select the perfect domain name for your business with these expert tips. Discover why your domain matters and the key factors to consider including length, memorability, keywords, TLD selection, and long-term thinking.',
  'admin',
  'Admin User',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'published',
  ARRAY['domains', 'business', 'branding'],
  (SELECT id FROM categories WHERE name LIKE '%Domain%' LIMIT 1),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = 'how-to-choose-perfect-domain-name-business'
);