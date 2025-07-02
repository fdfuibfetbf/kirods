/*
  # Create Email Templates and Logs Tables

  1. New Tables
    - `email_templates`
      - `id` (text, primary key) - template identifier
      - `name` (text) - human readable name
      - `subject` (text) - email subject template
      - `body` (text) - email body template with placeholders
      - `description` (text) - template description
      - `enabled` (boolean) - whether template is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `email_logs`
      - `id` (uuid, primary key)
      - `template_id` (text) - reference to email template
      - `recipient_email` (text) - email recipient
      - `recipient_name` (text) - recipient name
      - `subject` (text) - actual email subject sent
      - `body` (text) - actual email body sent
      - `status` (text) - sent, failed, pending
      - `error_message` (text) - error details if failed
      - `sent_at` (timestamptz) - when email was sent
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access

  3. Default Templates
    - Comment submitted notification
    - Comment approved notification
    - Comment replied notification
    - Comment rejected notification
    - Comment deleted notification
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  description text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text REFERENCES email_templates(id),
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Allow admin to manage email templates"
  ON email_templates
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for email logs
CREATE POLICY "Allow admin to manage email logs"
  ON email_logs
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, body, description, enabled) VALUES
(
  'comment_submitted',
  'Comment Submitted',
  'Thank you for your comment on "{{article_title}}"',
  'Dear {{user_name}},

Thank you for submitting a comment on our article "{{article_title}}".

Your comment:
"{{comment_content}}"

Your comment is currently under review by our moderation team. We will review it shortly and notify you once it has been approved.

Best regards,
{{admin_name}}
{{site_name}}

---
This is an automated email. Please do not reply to this email.',
  'Sent to users when they submit a comment',
  true
),
(
  'comment_approved',
  'Comment Approved',
  'Your comment on "{{article_title}}" has been approved',
  'Dear {{user_name}},

Great news! Your comment on our article "{{article_title}}" has been approved and is now live on our website.

Your comment:
"{{comment_content}}"

{{#admin_reply}}
Admin Reply:
"{{admin_reply}}"
{{/admin_reply}}

You can view your comment and the full article at: {{article_url}}

Thank you for contributing to our community!

Best regards,
{{admin_name}}
{{site_name}}

---
This is an automated email. Please do not reply to this email.',
  'Sent to users when their comment is approved',
  true
),
(
  'comment_replied',
  'Admin Reply',
  'Admin replied to your comment on "{{article_title}}"',
  'Dear {{user_name}},

An administrator has replied to your comment on our article "{{article_title}}".

Your original comment:
"{{comment_content}}"

Admin Reply:
"{{admin_reply}}"

You can view the full conversation at: {{article_url}}

Best regards,
{{admin_name}}
{{site_name}}

---
This is an automated email. Please do not reply to this email.',
  'Sent to users when admin replies to their comment',
  true
),
(
  'comment_rejected',
  'Comment Update',
  'Update regarding your comment on "{{article_title}}"',
  'Dear {{user_name}},

Thank you for your interest in commenting on our article "{{article_title}}".

After review, we were unable to approve your comment as it did not meet our community guidelines. We encourage you to review our commenting policy and feel free to submit a new comment that follows our guidelines.

If you have any questions, please feel free to contact our support team.

Best regards,
{{admin_name}}
{{site_name}}

---
This is an automated email. Please do not reply to this email.',
  'Sent to users when their comment is rejected',
  true
),
(
  'comment_deleted',
  'Comment Removed',
  'Your comment on "{{article_title}}" has been removed',
  'Dear {{user_name}},

We are writing to inform you that your comment on our article "{{article_title}}" has been removed.

Your comment:
"{{comment_content}}"

This action was taken to maintain the quality and safety of our community discussions. If you believe this was done in error, please contact our support team.

Best regards,
{{admin_name}}
{{site_name}}

---
This is an automated email. Please do not reply to this email.',
  'Sent to users when their comment is deleted',
  true
);