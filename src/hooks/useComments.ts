import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';
import { useEmailService } from './useEmailService';

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    sendCommentSubmittedNotification,
    sendCommentApprovedNotification,
    sendCommentRepliedNotification,
    sendCommentRejectedNotification,
    sendCommentDeletedNotification
  } = useEmailService();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Return empty array if Supabase is not configured
        setComments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          article:articles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading comments');
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const approveComment = useCallback(async (commentId: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot approve comment.');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const updatedComment = { ...comment, status: 'approved' as const, updated_at: new Date().toISOString() };
          
          // Send email notification
          if (comment.article) {
            sendCommentApprovedNotification(updatedComment, comment.article);
          }
          
          return updatedComment;
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error approving comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve comment');
    }
  }, [sendCommentApprovedNotification]);

  const rejectComment = useCallback(async (commentId: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot reject comment.');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const updatedComment = { ...comment, status: 'rejected' as const, updated_at: new Date().toISOString() };
          
          // Send email notification
          if (comment.article) {
            sendCommentRejectedNotification(updatedComment, comment.article);
          }
          
          return updatedComment;
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject comment');
    }
  }, [sendCommentRejectedNotification]);

  const replyToComment = useCallback(async (commentId: string, reply: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot reply to comment.');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .update({ 
          admin_reply: reply,
          status: 'approved', // Auto-approve when replying
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const updatedComment = { 
            ...comment, 
            admin_reply: reply,
            status: 'approved' as const,
            updated_at: new Date().toISOString()
          };
          
          // Send email notification
          if (comment.article) {
            sendCommentRepliedNotification(updatedComment, comment.article, reply);
          }
          
          return updatedComment;
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error replying to comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    }
  }, [sendCommentRepliedNotification]);

  const createComment = useCallback(async (articleId: string, userName: string, userEmail: string, content: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot create comment.');
        throw new Error('Database is not configured. Please contact the administrator.');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          article_id: articleId,
          user_name: userName,
          user_email: userEmail,
          content: content,
          status: 'pending'
        }])
        .select(`
          *,
          article:articles(*)
        `)
        .single();

      if (error) throw error;

      // Add to local state
      setComments(prev => [data, ...prev]);
      
      // Send email notification
      if (data.article) {
        sendCommentSubmittedNotification(data, data.article);
      }
      
      return data;
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
      throw err;
    }
  }, [sendCommentSubmittedNotification]);

  const updateComment = useCallback(async (commentId: string, updates: Partial<Comment>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot update comment.');
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          article:articles(*)
        `)
        .single();

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? data : comment
      ));

      return data;
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot delete comment.');
        return;
      }

      // Get the comment before deleting for email notification
      const commentToDelete = comments.find(c => c.id === commentId);

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Send email notification before removing from state
      if (commentToDelete?.article) {
        sendCommentDeletedNotification(commentToDelete, commentToDelete.article);
      }

      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  }, [comments, sendCommentDeletedNotification]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    approveComment,
    rejectComment,
    replyToComment,
    createComment,
    updateComment,
    deleteComment
  };
};