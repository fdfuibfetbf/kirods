import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EmailTemplate, EmailLog } from '../types';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Return mock templates if Supabase is not configured
        const mockTemplates: EmailTemplate[] = [
          {
            id: 'comment_submitted',
            name: 'Comment Submitted',
            subject: 'Thank you for your comment on "{{article_title}}"',
            body: 'Dear {{user_name}},\n\nThank you for submitting a comment on our article "{{article_title}}".\n\nYour comment:\n"{{comment_content}}"\n\nYour comment is currently under review by our moderation team. We will review it shortly and notify you once it has been approved.\n\nBest regards,\n{{admin_name}}\n{{site_name}}',
            description: 'Sent to users when they submit a comment',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'comment_approved',
            name: 'Comment Approved',
            subject: 'Your comment on "{{article_title}}" has been approved',
            body: 'Dear {{user_name}},\n\nGreat news! Your comment on our article "{{article_title}}" has been approved and is now live on our website.\n\nYour comment:\n"{{comment_content}}"\n\nYou can view your comment and the full article at: {{article_url}}\n\nThank you for contributing to our community!\n\nBest regards,\n{{admin_name}}\n{{site_name}}',
            description: 'Sent to users when their comment is approved',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'comment_replied',
            name: 'Admin Reply',
            subject: 'Admin replied to your comment on "{{article_title}}"',
            body: 'Dear {{user_name}},\n\nAn administrator has replied to your comment on our article "{{article_title}}".\n\nYour original comment:\n"{{comment_content}}"\n\nAdmin Reply:\n"{{admin_reply}}"\n\nYou can view the full conversation at: {{article_url}}\n\nBest regards,\n{{admin_name}}\n{{site_name}}',
            description: 'Sent to users when admin replies to their comment',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'comment_rejected',
            name: 'Comment Update',
            subject: 'Update regarding your comment on "{{article_title}}"',
            body: 'Dear {{user_name}},\n\nThank you for your interest in commenting on our article "{{article_title}}".\n\nAfter review, we were unable to approve your comment as it did not meet our community guidelines. We encourage you to review our commenting policy and feel free to submit a new comment that follows our guidelines.\n\nIf you have any questions, please feel free to contact our support team.\n\nBest regards,\n{{admin_name}}\n{{site_name}}',
            description: 'Sent to users when their comment is rejected',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'comment_deleted',
            name: 'Comment Removed',
            subject: 'Your comment on "{{article_title}}" has been removed',
            body: 'Dear {{user_name}},\n\nWe are writing to inform you that your comment on our article "{{article_title}}" has been removed.\n\nYour comment:\n"{{comment_content}}"\n\nThis action was taken to maintain the quality and safety of our community discussions. If you believe this was done in error, please contact our support team.\n\nBest regards,\n{{admin_name}}\n{{site_name}}',
            description: 'Sent to users when their comment is deleted',
            enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setTemplates(mockTemplates);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching email templates:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading email templates');
      setTemplates([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Return mock logs if Supabase is not configured
        const mockLogs: EmailLog[] = [
          {
            id: '1',
            template_id: 'comment_submitted',
            recipient_email: 'user@example.com',
            recipient_name: 'John Doe',
            subject: 'Thank you for your comment',
            body: 'Dear John Doe, Thank you for submitting a comment...',
            status: 'sent',
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ];
        
        setLogs(mockLogs);
        return;
      }

      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          template:email_templates(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching email logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading email logs');
      setLogs([]); // Set empty array on error
    }
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<EmailTemplate>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Update mock data
        setTemplates(prev => prev.map(template => 
          template.id === templateId 
            ? { ...template, ...updates, updated_at: new Date().toISOString() }
            : template
        ));
        return;
      }

      const { data, error } = await supabase
        .from('email_templates')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? data : template
      ));

      return data;
    } catch (err) {
      console.error('Error updating email template:', err);
      setError(err instanceof Error ? err.message : 'Failed to update email template');
      throw err;
    }
  }, []);

  const sendEmail = useCallback(async (
    templateId: string, 
    recipientEmail: string, 
    recipientName: string, 
    variables: Record<string, string>
  ) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.log('Mock email prepared:', { templateId, recipientEmail, recipientName, variables });
        
        // Find template and replace variables
        const template = templates.find(t => t.id === templateId);
        if (!template) {
          throw new Error(`Email template '${templateId}' not found`);
        }

        let subject = template.subject;
        let body = template.body;

        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), value);
          body = body.replace(new RegExp(placeholder, 'g'), value);
        });

        // Add mock log entry
        const mockLog: EmailLog = {
          id: `mock_${Date.now()}`,
          template_id: templateId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject: subject,
          body: body,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setLogs(prev => [mockLog, ...prev]);
        return mockLog;
      }

      // Get the template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Email template '${templateId}' not found`);
      }

      if (!template.enabled) {
        console.log(`Email template '${templateId}' is disabled, skipping email`);
        return null;
      }

      // Replace variables in subject and body
      let subject = template.subject;
      let body = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      });

      // Create email log entry with pending status
      const { data: logData, error: logError } = await supabase
        .from('email_logs')
        .insert([{
          template_id: templateId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject,
          body,
          status: 'pending'
        }])
        .select()
        .single();

      if (logError) throw logError;

      // Update local logs state immediately
      setLogs(prev => [logData, ...prev]);

      console.log(`📧 Email prepared for sending: ${templateId} to ${recipientEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body preview: ${body.substring(0, 100)}...`);

      return logData;
    } catch (err) {
      console.error('Error preparing email:', err);
      setError(err instanceof Error ? err.message : 'Failed to prepare email');
      throw err;
    }
  }, [templates]);

  const updateEmailStatus = useCallback(async (emailId: string, status: 'sent' | 'failed', errorMessage?: string) => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Update mock data
        setLogs(prev => prev.map(log => 
          log.id === emailId 
            ? { 
                ...log, 
                status, 
                error_message: errorMessage,
                sent_at: status === 'sent' ? new Date().toISOString() : log.sent_at
              }
            : log
        ));
        return;
      }

      const updateData: any = { 
        status,
        error_message: errorMessage || null
      };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', emailId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setLogs(prev => prev.map(log => 
        log.id === emailId ? data : log
      ));

      return data;
    } catch (err) {
      console.error('Error updating email status:', err);
    }
  }, []);

  const testTemplate = useCallback(async (templateId: string, testEmail: string) => {
    const testVariables = {
      user_name: 'Test User',
      article_title: 'Sample Article Title',
      comment_content: 'This is a test comment content for demonstration purposes.',
      admin_reply: 'This is a test admin reply to show how the email template works.',
      admin_name: 'Admin User',
      site_name: 'Kirods Hosting',
      article_url: 'https://example.com/article/sample-article'
    };

    return sendEmail(templateId, testEmail, 'Test User', testVariables);
  }, [sendEmail]);

  const resetError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, [fetchTemplates, fetchLogs]);

  return {
    templates,
    logs,
    loading,
    error,
    fetchTemplates,
    fetchLogs,
    updateTemplate,
    sendEmail,
    updateEmailStatus,
    testTemplate,
    resetError
  };
};