import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { StorageFile, StorageBucket } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useStorage = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch all buckets
  const fetchBuckets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { data, error } = await supabase.storage.listBuckets();

      if (error) throw error;

      // Add file count and size info to buckets
      const bucketsWithInfo = await Promise.all(
        data.map(async (bucket) => {
          try {
            const { data: files } = await supabase.storage.from(bucket.name).list();
            const fileCount = files?.length || 0;
            
            // Calculate total size (this is a simplified approach)
            // In a real app, you'd store and track file sizes in a separate table
            let sizeBytes = 0;
            
            return {
              ...bucket,
              file_count: fileCount,
              size_bytes: sizeBytes
            } as StorageBucket;
          } catch (err) {
            console.error(`Error getting info for bucket ${bucket.name}:`, err);
            return {
              ...bucket,
              file_count: 0,
              size_bytes: 0
            } as StorageBucket;
          }
        })
      );

      setBuckets(bucketsWithInfo);
    } catch (err) {
      console.error('Error fetching buckets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading storage buckets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new bucket
  const createBucket = useCallback(async (name: string, isPublic: boolean = false) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Validate bucket name (lowercase, alphanumeric, hyphens, underscores)
      if (!/^[a-z0-9-_]+$/.test(name)) {
        throw new Error('Bucket name must contain only lowercase letters, numbers, hyphens, and underscores');
      }

      const { data, error } = await supabase.storage.createBucket(name, {
        public: isPublic
      });

      if (error) throw error;

      // Update buckets list
      await fetchBuckets();
      
      return data;
    } catch (err) {
      console.error('Error creating bucket:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the bucket');
      throw err;
    }
  }, [fetchBuckets]);

  // Delete a bucket
  const deleteBucket = useCallback(async (name: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { error } = await supabase.storage.deleteBucket(name);

      if (error) throw error;

      // Update buckets list
      await fetchBuckets();
    } catch (err) {
      console.error('Error deleting bucket:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the bucket');
      throw err;
    }
  }, [fetchBuckets]);

  // Update bucket public/private status
  const updateBucketPublicStatus = useCallback(async (name: string, isPublic: boolean) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { error } = await supabase.storage.updateBucket(name, {
        public: isPublic
      });

      if (error) throw error;

      // Update buckets list
      await fetchBuckets();
    } catch (err) {
      console.error('Error updating bucket:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the bucket');
      throw err;
    }
  }, [fetchBuckets]);

  // Fetch files from a bucket
  const fetchFiles = useCallback(async (bucketName: string, path: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Get bucket info to check if it's public
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
      
      if (bucketError) throw bucketError;
      
      const isPublic = bucketData?.public || false;

      // List files in the bucket
      const { data, error } = await supabase.storage.from(bucketName).list(path);

      if (error) throw error;

      // Transform file data and get URLs
      const filesWithUrls = await Promise.all(
        (data || [])
          .filter(item => !item.id.endsWith('/')) // Filter out folders
          .map(async (file) => {
            const filePath = path ? `${path}/${file.name}` : file.name;
            
            // Get public or signed URL based on bucket privacy
            let url;
            if (isPublic) {
              const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(filePath);
              url = publicUrl.publicUrl;
            } else {
              const { data: signedUrl } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60 * 60); // 1 hour expiry
              url = signedUrl?.signedUrl || '';
            }

            return {
              id: file.id,
              name: file.name,
              size: file.metadata?.size || 0,
              type: file.metadata?.mimetype || 'application/octet-stream',
              url,
              path: filePath,
              bucket: bucketName,
              created_at: file.created_at,
              updated_at: file.updated_at || file.created_at,
              is_public: isPublic,
              metadata: file.metadata
            } as StorageFile;
          })
      );

      setFiles(filesWithUrls);
      return filesWithUrls;
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading files');
      setFiles([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a file
  const uploadFile = useCallback(async (
    bucketName: string, 
    file: File, 
    path: string = '', 
    onProgress?: (progress: number) => void
  ) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExt}`;
      const filePath = path ? `${path}/${uniqueFilename}` : uniqueFilename;

      // Upload the file with progress tracking
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
            if (onProgress) onProgress(percent);
          }
        });

      if (error) throw error;

      // Get bucket info to check if it's public
      const { data: bucketData } = await supabase.storage.getBucket(bucketName);
      const isPublic = bucketData?.public || false;

      // Get the URL for the uploaded file
      let url;
      if (isPublic) {
        const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        url = publicUrl.publicUrl;
      } else {
        const { data: signedUrl } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60 * 60); // 1 hour expiry
        url = signedUrl?.signedUrl || '';
      }

      // Create file object with metadata
      const fileObject: StorageFile = {
        id: data?.id || uniqueFilename,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        path: filePath,
        bucket: bucketName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: isPublic,
        metadata: {
          contentType: file.type,
          size: file.size
        }
      };

      // Refresh file list
      await fetchFiles(bucketName, path);

      return fileObject;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the file');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [fetchFiles]);

  // Delete a file
  const deleteFile = useCallback(async (bucketName: string, filePath: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      const { error } = await supabase.storage.from(bucketName).remove([filePath]);

      if (error) throw error;

      // Update files list
      setFiles(prev => prev.filter(file => file.path !== filePath));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the file');
      throw err;
    }
  }, []);

  // Create a folder
  const createFolder = useCallback(async (bucketName: string, path: string, folderName: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // Validate folder name (no slashes, dots, etc.)
      if (!/^[a-zA-Z0-9-_]+$/.test(folderName)) {
        throw new Error('Folder name must contain only letters, numbers, hyphens, and underscores');
      }

      // Create an empty file with a folder suffix to represent the folder
      const folderPath = path ? `${path}/${folderName}/.folder` : `${folderName}/.folder`;
      
      // Upload an empty file to create the folder
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(folderPath, new Blob(['']), {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Refresh file list
      await fetchFiles(bucketName, path);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the folder');
      throw err;
    }
  }, [fetchFiles]);

  // Get a public URL for a file
  const getPublicUrl = useCallback((bucketName: string, filePath: string): string => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  }, []);

  // Get a signed URL for a file (temporary access)
  const getSignedUrl = useCallback(async (bucketName: string, filePath: string, expiresIn: number = 3600): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error creating signed URL:', err);
      throw err;
    }
  }, []);

  // Move/rename a file
  const moveFile = useCallback(async (bucketName: string, oldPath: string, newPath: string) => {
    try {
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
      }

      // First copy the file to the new location
      const { error: copyError } = await supabase.storage
        .from(bucketName)
        .copy(oldPath, newPath);

      if (copyError) throw copyError;

      // Then delete the old file
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([oldPath]);

      if (deleteError) throw deleteError;

      // Get the parent path to refresh files
      const parentPath = newPath.split('/').slice(0, -1).join('/');
      
      // Refresh file list
      await fetchFiles(bucketName, parentPath);
    } catch (err) {
      console.error('Error moving/renaming file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while moving/renaming the file');
      throw err;
    }
  }, [fetchFiles]);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    files,
    buckets,
    loading,
    uploading,
    progress,
    error,
    fetchBuckets,
    createBucket,
    deleteBucket,
    updateBucketPublicStatus,
    fetchFiles,
    uploadFile,
    deleteFile,
    createFolder,
    getPublicUrl,
    getSignedUrl,
    moveFile,
    resetError
  };
};