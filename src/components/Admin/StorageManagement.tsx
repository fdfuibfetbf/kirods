import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, Upload, Trash2, File, Image, Video, FileText, FilePlus, FolderPlus, RefreshCw, Link, Copy, CheckCircle, AlertCircle, X, Loader, Lock, Unlock, Search, Filter, MoreVertical, Download, Edit, Eye, ArrowLeft, Database, FileArchive, FileAudio, FileCode, File as FilePdf, FileSpreadsheet, FileType, FileX } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { StorageFile, StorageBucket } from '../../types';

const StorageManagement: React.FC = () => {
  const [currentBucket, setCurrentBucket] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showCreateBucketModal, setShowCreateBucketModal] = useState<boolean>(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
  const [showFilePreview, setShowFilePreview] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [newBucketName, setNewBucketName] = useState<string>('');
  const [newBucketPublic, setNewBucketPublic] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'file' | 'bucket', name: string, path?: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
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
    resetError 
  } = useStorage();

  // Load buckets on mount
  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  // Load files when bucket changes
  useEffect(() => {
    if (currentBucket) {
      fetchFiles(currentBucket, currentPath);
    }
  }, [currentBucket, currentPath, fetchFiles]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear copied URL after 3 seconds
  useEffect(() => {
    if (copiedUrl) {
      const timer = setTimeout(() => {
        setCopiedUrl('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedUrl]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentBucket) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(currentBucket, file, currentPath, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
      }
      setSuccessMessage(`Successfully uploaded ${files.length} file(s)`);
    } catch (err) {
      console.error('Error uploading files:', err);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle bucket creation
  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return;
    
    try {
      await createBucket(newBucketName.trim().toLowerCase(), newBucketPublic);
      setSuccessMessage(`Bucket "${newBucketName}" created successfully`);
      setShowCreateBucketModal(false);
      setNewBucketName('');
      setNewBucketPublic(false);
    } catch (err) {
      console.error('Error creating bucket:', err);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentBucket) return;
    
    try {
      await createFolder(currentBucket, currentPath, newFolderName.trim());
      setSuccessMessage(`Folder "${newFolderName}" created successfully`);
      setShowCreateFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'file' && itemToDelete.path) {
        await deleteFile(currentBucket, itemToDelete.path);
        setSuccessMessage(`File "${itemToDelete.name}" deleted successfully`);
      } else if (itemToDelete.type === 'bucket') {
        await deleteBucket(itemToDelete.name);
        setSuccessMessage(`Bucket "${itemToDelete.name}" deleted successfully`);
        if (currentBucket === itemToDelete.name) {
          setCurrentBucket('');
          setCurrentPath('');
        }
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Handle bucket privacy toggle
  const handleToggleBucketPrivacy = async (bucketName: string, isCurrentlyPublic: boolean) => {
    try {
      await updateBucketPublicStatus(bucketName, !isCurrentlyPublic);
      setSuccessMessage(`Bucket "${bucketName}" is now ${isCurrentlyPublic ? 'private' : 'public'}`);
    } catch (err) {
      console.error('Error updating bucket privacy:', err);
    }
  };

  // Copy file URL to clipboard
  const copyToClipboard = async (file: StorageFile) => {
    try {
      let url = file.url;
      
      // If the file is not in a public bucket, get a signed URL
      if (!file.is_public) {
        url = await getSignedUrl(file.bucket, file.path, 3600); // 1 hour expiry
      }
      
      await navigator.clipboard.writeText(url);
      setCopiedUrl(file.path);
      setSuccessMessage('URL copied to clipboard');
    } catch (err) {
      console.error('Error copying URL:', err);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
    setSelectedFiles([]);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (!currentPath) {
      // If at root, go back to bucket selection
      setCurrentBucket('');
    } else {
      // Go up one folder
      const pathParts = currentPath.split('/');
      pathParts.pop();
      setCurrentPath(pathParts.join('/'));
    }
    setSelectedFiles([]);
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    
    const parts = currentPath.split('/');
    return parts.map((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      return { name: part, path };
    });
  };

  // Get file icon based on type
  const getFileIcon = (file: StorageFile) => {
    const type = file.type.split('/')[0];
    const subtype = file.type.split('/')[1];
    
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'audio':
        return <FileAudio className="h-6 w-6 text-yellow-500" />;
      case 'application':
        if (subtype === 'pdf') {
          return <FilePdf className="h-6 w-6 text-red-500" />;
        } else if (subtype.includes('spreadsheet') || subtype.includes('excel')) {
          return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
        } else if (subtype.includes('zip') || subtype.includes('compressed')) {
          return <FileArchive className="h-6 w-6 text-orange-500" />;
        } else if (subtype.includes('json') || subtype.includes('xml') || subtype.includes('html')) {
          return <FileCode className="h-6 w-6 text-gray-500" />;
        }
        return <FileText className="h-6 w-6 text-gray-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter files based on search and type filter
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (fileTypeFilter === 'all') return matchesSearch;
    
    const type = file.type.split('/')[0];
    return matchesSearch && (
      (fileTypeFilter === 'image' && type === 'image') ||
      (fileTypeFilter === 'video' && type === 'video') ||
      (fileTypeFilter === 'document' && (
        file.type.includes('pdf') || 
        file.type.includes('word') || 
        file.type.includes('text') || 
        file.type.includes('document')
      )) ||
      (fileTypeFilter === 'other' && type !== 'image' && type !== 'video' && !file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('text') && !file.type.includes('document'))
    );
  });

  // Preview file
  const handlePreviewFile = (file: StorageFile) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  // Download file
  const handleDownloadFile = async (file: StorageFile) => {
    try {
      let url = file.url;
      
      // If the file is not in a public bucket, get a signed URL
      if (!file.is_public) {
        url = await getSignedUrl(file.bucket, file.path, 3600); // 1 hour expiry
      }
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setSuccessMessage(`Downloading ${file.name}`);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  // Render bucket selection view
  const renderBucketSelection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Storage Management</h1>
              <p className="text-gray-600">Manage your files, images, videos, and documents</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateBucketModal(true)}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Bucket</span>
            </button>
            <button
              onClick={fetchBuckets}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : buckets.length > 0 ? (
          buckets.map(bucket => (
            <div 
              key={bucket.id} 
              className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-medium transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${bucket.public ? 'bg-green-50' : 'bg-blue-50'} rounded-xl flex items-center justify-center`}>
                    <FolderOpen className={`h-6 w-6 ${bucket.public ? 'text-green-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {bucket.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        bucket.public 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {bucket.public ? 'Public' : 'Private'}
                      </span>
                      <span className="text-gray-500">{bucket.file_count} files</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleBucketPrivacy(bucket.name, bucket.public)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={bucket.public ? 'Make private' : 'Make public'}
                  >
                    {bucket.public ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({
                        type: 'bucket',
                        name: bucket.name
                      });
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete bucket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setCurrentBucket(bucket.name);
                  setCurrentPath('');
                }}
                className="w-full mt-4 px-4 py-3 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors text-left flex items-center justify-between group"
              >
                <span className="text-gray-700 group-hover:text-primary-600 font-medium">Browse Files</span>
                <FolderOpen className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-2xl shadow-soft border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Storage Buckets</h3>
            <p className="text-gray-600 mb-6">Create your first storage bucket to start uploading files</p>
            <button
              onClick={() => setShowCreateBucketModal(true)}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium inline-flex items-center space-x-2"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Create Bucket</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Bucket Modal */}
      {showCreateBucketModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create Storage Bucket</h3>
              <button
                onClick={() => setShowCreateBucketModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bucket Name</label>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="my-bucket-name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use only lowercase letters, numbers, hyphens, and underscores
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bucket-public"
                  checked={newBucketPublic}
                  onChange={(e) => setNewBucketPublic(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="bucket-public" className="text-sm text-gray-700">
                  Make bucket public (files will be accessible without authentication)
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Public buckets allow anyone to access your files</li>
                  <li>• Private buckets require signed URLs for access</li>
                  <li>• Bucket names must be globally unique</li>
                  <li>• You cannot change a bucket's name after creation</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateBucketModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBucket}
                disabled={!newBucketName.trim()}
                className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-green transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Bucket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render file browser view
  const renderFileBrowser = () => {
    const currentBucketObj = buckets.find(b => b.name === currentBucket);
    const breadcrumbs = getBreadcrumbs();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-card rounded-2xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={navigateUp}
              className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-medium">
                {currentPath ? 'Up One Level' : 'Back to Buckets'}
              </span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 flex items-center space-x-2 font-medium"
              >
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </button>
              
              <button
                onClick={() => fetchFiles(currentBucket, currentPath)}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Bucket Info & Breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className={`w-10 h-10 ${currentBucketObj?.public ? 'bg-green-50' : 'bg-blue-50'} rounded-xl flex items-center justify-center`}>
                <FolderOpen className={`h-5 w-5 ${currentBucketObj?.public ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">{currentBucket}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentBucketObj?.public 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {currentBucketObj?.public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{currentBucketObj?.file_count || 0} files</span>
                  {currentBucketObj?.size_bytes ? (
                    <span>• {formatFileSize(currentBucketObj.size_bytes)}</span>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setCurrentPath('')}
                className={`px-3 py-1 rounded-lg ${
                  !currentPath 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
              >
                Root
              </button>
              
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => setCurrentPath(crumb.path)}
                    className={`px-3 py-1 rounded-lg ${
                      index === breadcrumbs.length - 1
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm appearance-none min-w-32"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Upload className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Uploading Files</h3>
                  <p className="text-sm text-blue-700">{progress}% complete</p>
                </div>
              </div>
              <div className="text-blue-700 font-medium">{progress}%</div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-red-900">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={resetError}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">Success</h3>
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Files Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Parent Directory Link (if in a subfolder) */}
                {currentPath && (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-gray-500" />
                        </div>
                        <button
                          onClick={navigateUp}
                          className="text-gray-900 hover:text-primary-600 font-medium transition-colors"
                        >
                          ../ (Parent Directory)
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">Folder</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500">-</span>
                    </td>
                  </tr>
                )}
                
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                          <div className="h-4 bg-gray-200 rounded w-40"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map(file => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {file.path}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{file.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(file.updated_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          file.is_public 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {file.is_public ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(file)}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedUrl === file.path
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                            title="Copy URL"
                          >
                            {copiedUrl === file.path ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Link className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete({
                                type: 'file',
                                name: file.name,
                                path: file.path
                              });
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileX className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium mb-2">No files found</p>
                      <p className="text-gray-400 mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search or filters' 
                          : 'Upload your first file to get started'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium inline-flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Files</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Create New Folder</h3>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    placeholder="my-folder"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use only letters, numbers, hyphens, and underscores
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Folder Path</h4>
                  <p className="text-sm text-blue-700">
                    {currentPath 
                      ? `/${currentBucket}/${currentPath}/${newFolderName || 'folder-name'}`
                      : `/${currentBucket}/${newFolderName || 'folder-name'}`}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-green transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {showFilePreview && previewFile && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 truncate max-w-md">{previewFile.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(previewFile)}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedUrl === previewFile.path
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    title="Copy URL"
                  >
                    {copiedUrl === previewFile.path ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Link className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(previewFile)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowFilePreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-100">
                {previewFile.type.startsWith('image/') ? (
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name} 
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : previewFile.type.startsWith('video/') ? (
                  <video 
                    src={previewFile.url} 
                    controls 
                    className="max-w-full max-h-[60vh]"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : previewFile.type.startsWith('audio/') ? (
                  <audio 
                    src={previewFile.url} 
                    controls 
                    className="w-full"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe 
                    src={previewFile.url} 
                    className="w-full h-[60vh]"
                    title={previewFile.name}
                  >
                    Your browser does not support PDF preview.
                  </iframe>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {getFileIcon(previewFile)}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{previewFile.name}</h4>
                    <p className="text-gray-500 mb-4">{previewFile.type}</p>
                    <button
                      onClick={() => handleDownloadFile(previewFile)}
                      className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium inline-flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download File</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">File Type</p>
                    <p className="font-medium text-gray-900">{previewFile.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Size</p>
                    <p className="font-medium text-gray-900">{formatFileSize(previewFile.size)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Last Modified</p>
                    <p className="font-medium text-gray-900">{new Date(previewFile.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {itemToDelete.type === 'file' ? 'file' : 'bucket'} 
                  <span className="font-semibold"> {itemToDelete.name}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {currentBucket ? renderFileBrowser() : renderBucketSelection()}
    </div>
  );
};

export default StorageManagement;