import { useCallback } from 'react';
import { useEmailTemplates } from './useEmailTemplates';
import { useSMTPSettings } from './useSMTPSettings';
import { Comment, Article } from '../types';

export const useEmailService = () => {
  const { sendEmail, updateEmailStatus } = useEmailTemplates();
  const { settings: smtpSettings } = useSMTPSettings();

  // Function to actually send email via Supabase Edge Function
  const sendActualEmail = useCallback(async (
    to: string,
    subject: string,
    body: string,
    recipientName: string,
    logId?: string
  ) => {
    try {
      // Check if SMTP is configured and enabled
      if (!smtpSettings?.enabled) {
        console.log('SMTP is disabled, email not sent');
        return { success: false, message: 'SMTP is disabled' };
      }

      if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password || !smtpSettings.from_email) {
        console.log('SMTP not properly configured');
        return { success: false, message: 'SMTP not properly configured' };
      }

      // Get Supabase URL for edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.log('Supabase not configured, simulating email send');
        
        // Simulate email sending for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (logId) {
          await updateEmailStatus(logId, 'sent');
        }
        
        return { success: true, message: 'Email sent (simulated)' };
      }

      const emailData = {
        to,
        subject,
        body,
        recipientName
      };

      console.log('Sending email via Supabase Edge Function:', emailData);

      // Call Supabase Edge Function to send email
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          emailData,
          logId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true, message: result.message, messageId: result.messageId };
      } else {
        console.error(`❌ Email failed to send to ${to}:`, result.message);
        return { success: false, message: result.message };
      }

    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update log status to failed if we have a log ID
      if (logId) {
        try {
          await updateEmailStatus(logId, 'failed', error instanceof Error ? error.message : 'Unknown error');
        } catch (updateError) {
          console.error('Error updating email log status:', updateError);
        }
      }
      
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [smtpSettings, updateEmailStatus]);

  const sendCommentNotification = useCallback(async (
    templateId: string,
    comment: Comment,
    article: Article,
    adminReply?: string
  ) => {
    try {
      // Check if SMTP is enabled
      if (!smtpSettings?.enabled) {
        console.log('SMTP is disabled, skipping email notification');
        return;
      }

      const variables = {
        user_name: comment.user_name,
        article_title: article.title,
        comment_content: comment.content,
        admin_reply: adminReply || '',
        admin_name: 'Admin User', // You can get this from admin profile
        site_name: 'Kirods Hosting',
        article_url: `${window.location.origin}/article/${article.slug || article.id}`
      };

      // Send email using the template system (which will log to database)
      const emailLog = await sendEmail(templateId, comment.user_email, comment.user_name, variables);
      
      if (emailLog) {
        console.log(`📧 Email prepared: ${templateId} to ${comment.user_email}`);
        
        // Now actually send the email via SMTP using the edge function
        const result = await sendActualEmail(
          comment.user_email,
          emailLog.subject,
          emailLog.body,
          comment.user_name,
          emailLog.id
        );

        if (result.success) {
          console.log(`✅ Email notification sent successfully: ${templateId} to ${comment.user_email}`);
        } else {
          console.error(`❌ Email notification failed: ${templateId} to ${comment.user_email} - ${result.message}`);
        }
        
        return result;
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }, [sendEmail, sendActualEmail, smtpSettings]);

  const sendCommentSubmittedNotification = useCallback(async (comment: Comment, article: Article) => {
    return sendCommentNotification('comment_submitted', comment, article);
  }, [sendCommentNotification]);

  const sendCommentApprovedNotification = useCallback(async (comment: Comment, article: Article) => {
    return sendCommentNotification('comment_approved', comment, article, comment.admin_reply);
  }, [sendCommentNotification]);

  const sendCommentRepliedNotification = useCallback(async (comment: Comment, article: Article, adminReply: string) => {
    return sendCommentNotification('comment_replied', comment, article, adminReply);
  }, [sendCommentNotification]);

  const sendCommentRejectedNotification = useCallback(async (comment: Comment, article: Article) => {
    return sendCommentNotification('comment_rejected', comment, article);
  }, [sendCommentNotification]);

  const sendCommentDeletedNotification = useCallback(async (comment: Comment, article: Article) => {
    return sendCommentNotification('comment_deleted', comment, article);
  }, [sendCommentNotification]);

  return {
    sendCommentSubmittedNotification,
    sendCommentApprovedNotification,
    sendCommentRepliedNotification,
    sendCommentRejectedNotification,
    sendCommentDeletedNotification,
    sendActualEmail
  };
};