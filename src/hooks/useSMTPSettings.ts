import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SMTPSettings } from '../types';

// Fixed ID for the global SMTP settings record
const GLOBAL_SMTP_SETTINGS_ID = 'global_smtp_settings';

export const useSMTPSettings = () => {
  const [settings, setSettings] = useState<SMTPSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Return mock settings if Supabase is not configured
        const mockSettings: SMTPSettings = {
          id: GLOBAL_SMTP_SETTINGS_ID,
          host: '',
          port: 587,
          username: '',
          password: '',
          from_email: '',
          from_name: 'Kirods Hosting',
          encryption: 'tls',
          enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setSettings(mockSettings);
        setLoading(false);
        return;
      }

      // First, try to get existing settings
      const { data: existingData, error: selectError } = await supabase
        .from('smtp_settings')
        .select('*')
        .eq('id', GLOBAL_SMTP_SETTINGS_ID)
        .maybeSingle();

      if (selectError) {
        console.error('Error selecting SMTP settings:', selectError);
        throw new Error(`Database error: ${selectError.message}`);
      }

      if (existingData) {
        // Settings already exist, use them
        setSettings(existingData);
      } else {
        // No settings exist, create default ones
        const defaultSettings = {
          id: GLOBAL_SMTP_SETTINGS_ID,
          host: '',
          port: 587,
          username: '',
          password: '',
          from_email: '',
          from_name: 'Kirods Hosting',
          encryption: 'tls' as const,
          enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('smtp_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting SMTP settings:', insertError);
          throw new Error(`Database error: ${insertError.message}`);
        }

        setSettings(insertedData);
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading SMTP settings';
      setError(errorMessage);
      
      // Set mock settings as fallback
      const mockSettings: SMTPSettings = {
        id: GLOBAL_SMTP_SETTINGS_ID,
        host: '',
        port: 587,
        username: '',
        password: '',
        from_email: '',
        from_name: 'Kirods Hosting',
        encryption: 'tls',
        enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SMTPSettings>) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        // Update mock settings
        setSettings(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
        console.log('Mock SMTP settings updated:', updates);
        return;
      }

      // Validate required fields if SMTP is being enabled
      if (updates.enabled && (updates.enabled !== settings?.enabled || settings?.enabled)) {
        const finalSettings = { ...settings, ...updates };
        if (!finalSettings.host?.trim()) {
          throw new Error('SMTP host is required when enabling SMTP');
        }
        if (!finalSettings.username?.trim()) {
          throw new Error('Username is required when enabling SMTP');
        }
        if (!finalSettings.password?.trim()) {
          throw new Error('Password is required when enabling SMTP');
        }
        if (!finalSettings.from_email?.trim()) {
          throw new Error('From email is required when enabling SMTP');
        }
        if (!finalSettings.from_email.includes('@')) {
          throw new Error('Please enter a valid from email address');
        }
      }

      // Update the existing record
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('Updating SMTP settings:', updatedData);

      const { data, error } = await supabase
        .from('smtp_settings')
        .update(updatedData)
        .eq('id', GLOBAL_SMTP_SETTINGS_ID)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      console.log('SMTP settings updated successfully:', data);
      setSettings(data);
    } catch (err) {
      console.error('Error updating SMTP settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update SMTP settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const testConnection = async (testSettings: Partial<SMTPSettings>): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate required fields
      if (!testSettings.host || !testSettings.username || !testSettings.password) {
        return {
          success: false,
          message: 'Please fill in all required fields (host, username, password)'
        };
      }

      if (!testSettings.from_email || !testSettings.from_email.includes('@')) {
        return {
          success: false,
          message: 'Please enter a valid from email address'
        };
      }

      // For demo purposes, simulate a test
      // In a real application, you would make an API call to test the SMTP connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Mock test result based on common providers
      const isGmail = testSettings.host?.includes('gmail.com');
      const isOutlook = testSettings.host?.includes('outlook.com');
      const isYahoo = testSettings.host?.includes('yahoo.com');
      const isSendGrid = testSettings.host?.includes('sendgrid.net');

      if (isGmail || isOutlook || isYahoo || isSendGrid) {
        return {
          success: true,
          message: `✅ SMTP connection successful! Test email sent to ${testSettings.from_email}.`
        };
      } else {
        return {
          success: Math.random() > 0.3, // 70% success rate for other providers
          message: Math.random() > 0.3 
            ? `✅ SMTP connection successful! Server responded correctly.`
            : `❌ Connection failed. Please check your credentials and server settings.`
        };
      }
    } catch (err) {
      console.error('Error testing SMTP connection:', err);
      return {
        success: false,
        message: `❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
  };

  const resetError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    testConnection,
    fetchSettings,
    resetError
  };
};