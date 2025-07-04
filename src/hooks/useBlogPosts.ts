import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (includeUnpublished: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:categories(*)
        `);
      
      // Filter out unpublished posts for public view
      if (!includeUnpublished) {
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading blog posts');
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching blog post by slug:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading the blog post');
      return null;
    }
  }, []);

  const createPost = useCallback(async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Validate required fields
      if (!post.title.trim()) {
        throw new Error('Post title is required');
      }

      if (!post.content.trim()) {
        throw new Error('Post content is required');
      }

      if (!post.slug.trim()) {
        throw new Error('Post slug is required');
      }

      // Check if slug is unique
      const { data: existingPost, error: slugCheckError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', post.slug)
        .maybeSingle();

      if (slugCheckError) throw slugCheckError;
      
      if (existingPost) {
        throw new Error(`A post with the slug "${post.slug}" already exists`);
      }

      // Set published_at if status is published
      const published_at = post.status === 'published' ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ 
          ...post, 
          views: 0,
          published_at 
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPosts(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error creating blog post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the blog post');
      throw err;
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // If status is changing to published and there's no published_at date, set it
      const updateData = { ...updates };
      
      if (updates.status === 'published') {
        // Get the current post to check if it was previously published
        const { data: currentPost, error: fetchError } = await supabase
          .from('blog_posts')
          .select('status, published_at')
          .eq('id', id)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Only set published_at if this is the first time publishing
        if (currentPost.status !== 'published' || !currentPost.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
      
      // If slug is being updated, check for uniqueness
      if (updates.slug) {
        const { data: existingPost, error: slugCheckError } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id)
          .maybeSingle();

        if (slugCheckError) throw slugCheckError;
        
        if (existingPost) {
          throw new Error(`A post with the slug "${updates.slug}" already exists`);
        }
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => post.id === id ? data : post));
      
      return data;
    } catch (err) {
      console.error('Error updating blog post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the blog post');
      throw err;
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the blog post');
      throw err;
    }
  }, []);

  const incrementViews = useCallback(async (id: string) => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. View count will not be updated.');
        return;
      }

      const { error } = await supabase.rpc('increment_blog_post_views', { post_id: id });
      if (error) throw error;
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, views: post.views + 1 } : post
      ));
    } catch (err) {
      console.error('Error incrementing views:', err);
      // Don't set error state for view increments to avoid disrupting user experience
    }
  }, []);

  const submitForIndexing = useCallback(async (id: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Get the post to submit
      const { data: post, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // In a real implementation, you would call a function to submit to search engines
      // For now, we'll just update the indexing status
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          indexing_status: 'indexed',
          indexed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { 
              ...post, 
              indexing_status: 'indexed', 
              indexed_at: new Date().toISOString() 
            } 
          : post
      ));

      return {
        success: true,
        message: `Blog post "${post.title}" has been submitted for indexing.`
      };
    } catch (err) {
      console.error('Error submitting post for indexing:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the post for indexing');
      
      return {
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred while submitting the post for indexing'
      };
    }
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    submitForIndexing,
    resetError
  };
};