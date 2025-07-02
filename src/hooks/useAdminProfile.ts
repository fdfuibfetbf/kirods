import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdminProfile } from '../types';

export const useAdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', 'admin')
        .single();

      if (error) {
        // If no profile exists, create a default one
        if (error.code === 'PGRST116') {
          const defaultProfile = {
            user_id: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@kirods.com',
            phone: '+1 (555) 123-4567',
            location: 'New York, USA',
            bio: 'System Administrator for Kirods Hosting Knowledge Base',
            role: 'Super Administrator',
            join_date: '2023-01-15'
          };

          const { data: newProfile, error: createError } = await supabase
            .from('admin_profiles')
            .insert([defaultProfile])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AdminProfile>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Cannot save profile changes.');
      }

      // Validate required fields
      if (updates.email && !updates.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (updates.first_name && updates.first_name.trim().length < 1) {
        throw new Error('First name is required');
      }

      if (updates.last_name && updates.last_name.trim().length < 1) {
        throw new Error('Last name is required');
      }

      // Clean up the updates object
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined && value !== null)
      );

      console.log('Updating profile with:', cleanUpdates);

      const { data, error } = await supabase
        .from('admin_profiles')
        .update(cleanUpdates)
        .eq('user_id', 'admin')
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);

      // Validate password requirements
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      // For demo purposes, we'll simulate password validation
      // In a real application, you would verify the current password against a secure hash
      if (currentPassword !== 'admin123') {
        throw new Error('Current password is incorrect');
      }

      // In a real application, you would hash the new password and store it securely
      // For now, we'll just update a timestamp to indicate the password was changed
      const { data, error } = await supabase
        .from('admin_profiles')
        .update({ 
          updated_at: new Date().toISOString(),
          // In production, you would store a hashed password
          // password_hash: await hashPassword(newPassword)
        })
        .eq('user_id', 'admin')
        .select()
        .single();

      if (error) throw error;

      console.log('Password changed successfully');
      setProfile(data);
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while changing password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image file must be smaller than 5MB');
      }

      // For demo purposes, convert to base64 data URL
      // In production, you would upload to Supabase Storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error('Failed to process image file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    resetError
  };
};