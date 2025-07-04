import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Tag as TagIcon, 
  Globe,
  Save,
  X,
  Image,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Upload,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { useCategories } from '../../hooks/useCategories';
import { useStorage } from '../../hooks/useStorage';
import { BlogPost } from '../../types';
import RichTextEditor from './RichTextEditor';
import { marked } from 'marked';

const BlogManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [isSaving, setSaving] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: 'Admin User',
    author_id: 'admin',
    featured_image: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    tags: '',
    category_id: '',
    // SEO fields
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: ''
  });

  const { 
    posts, 
    loading, 
    error, 
    createPost, 
    updatePost, 
    deletePost,
    submitForIndexing,
    resetError 
  } = useBlogPosts();
  
  const { categories } = useCategories();
  const { files, fetchFiles, loading: loadingFiles } = useStorage();

  // Load images when image selector is opened
  useEffect(() => {
    if (showImageSelector) {
      fetchFiles('images');
    }
  }, [showImageSelector, fetchFiles]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      author_name: post.author_name,
      author_id: post.author_id,
      featured_image: post.featured_image || '',
      status: post.status,
      tags: post.tags.join(', '),
      category_id: post.category_id || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      meta_keywords: post.meta_keywords || '',
      canonical_url: post.canonical_url || '',
      og_title: post.og_title || '',
      og_description: post.og_description || '',
      og_image: post.og_image || ''
    });
    setIsEditing(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
      og_title: prev.og_title || title
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => {
      // Generate excerpt from content if not already set
      let excerpt = prev.excerpt;
      if (!excerpt || excerpt.trim() === '') {
        // Strip HTML tags and get first 160 characters
        const textContent = content.replace(/<[^>]*>/g, '');
        excerpt = textContent.substring(0, 160);
        if (textContent.length > 160) excerpt += '...';
      }

      return {
        ...prev,
        content,
        excerpt,
        meta_description: prev.meta_description || excerpt,
        og_description: prev.og_description || excerpt
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      resetError();

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Post title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Post content is required');
      }
      if (!formData.slug.trim()) {
        throw new Error('Post slug is required');
      }

      // Prepare post data
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category_id: formData.category_id || null,
        excerpt: formData.excerpt.trim() || formData.content.replace(/<[^>]*>/g, '').substring(0, 160)
      };

      if (selectedPost) {
        await updatePost(selectedPost.id, postData);
        setSuccessMessage('Blog post updated successfully!');
      } else {
        await createPost(postData);
        setSuccessMessage('Blog post created successfully!');
      }

      setIsEditing(false);
      setSelectedPost(null);
      resetForm();
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deletePost(id);
        setSuccessMessage('Blog post deleted successfully!');
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  const handleSubmitForIndexing = async (id: string) => {
    try {
      const result = await submitForIndexing(id);
      setSuccessMessage(result.message);
    } catch (error) {
      console.error('Error submitting for indexing:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author_name: 'Admin User',
      author_id: 'admin',
      featured_image: '',
      status: 'draft',
      tags: '',
      category_id: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: ''
    });
    setActiveTab('content');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPost(null);
    resetForm();
  };

  const selectImage = (url: string) => {
    setFormData(prev => ({ ...prev, featured_image: url }));
    setShowImageSelector(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      case 'archived': return AlertCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={resetError}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header and Search */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Blog Management</h3>
              <p className="text-sm text-gray-600">Create and manage blog posts with advanced editor and SEO tools</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>New Blog Post</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm appearance-none min-w-32"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* Edit Form with Rich Text Editor */
        <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h3>
            
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'content'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'seo'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Globe className="h-4 w-4 inline mr-2" />
                SEO
              </button>
            </div>
          </div>
          
          <form className="space-y-6">
            {activeTab === 'content' ? (
              /* Content Tab with Rich Text Editor */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter blog post title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="blog-post-url-slug"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, slug: generateSlug(formData.title)})}
                        className="px-3 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
                        title="Generate slug from title"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">URL: /blog/{formData.slug || 'post-slug'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published' | 'archived'})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., technology, web development, hosting"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImageSelector(true)}
                      className="px-4 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Image className="h-4 w-4" />
                      <span>Select</span>
                    </button>
                  </div>
                  {formData.featured_image && (
                    <div className="mt-3 relative">
                      <img 
                        src={formData.featured_image} 
                        alt="Featured" 
                        className="h-40 object-cover rounded-xl border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, featured_image: ''})}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Brief summary of the blog post (will be auto-generated if left empty)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/160 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog post content here..."
                    className="border border-gray-200 rounded-xl"
                  />
                </div>
              </>
            ) : (
              /* SEO Tab */
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">SEO Optimization</h4>
                  <p className="text-sm text-blue-700">Optimize your blog post for search engines and social media sharing.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="SEO optimized title (50-60 characters)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      rows={3}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Brief description for search results (150-160 characters)"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({...formData, meta_keywords: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Open Graph (Social Media)</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">OG Title</label>
                        <input
                          type="text"
                          value={formData.og_title}
                          onChange={(e) => setFormData({...formData, og_title: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          placeholder="Title for social media sharing"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">OG Description</label>
                        <textarea
                          rows={2}
                          value={formData.og_description}
                          onChange={(e) => setFormData({...formData, og_description: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          placeholder="Description for social media sharing"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">OG Image</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="url"
                            value={formData.og_image}
                            onChange={(e) => setFormData({...formData, og_image: e.target.value})}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            placeholder="https://example.com/image.jpg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Use featured image if available, otherwise open selector
                              if (formData.featured_image) {
                                setFormData({...formData, og_image: formData.featured_image});
                              } else {
                                setShowImageSelector(true);
                              }
                            }}
                            className="px-4 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all duration-200 flex items-center space-x-2"
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span>Use Featured</span>
                          </button>
                        </div>
                        {formData.og_image && (
                          <div className="mt-3 relative">
                            <img 
                              src={formData.og_image} 
                              alt="OG" 
                              className="h-32 object-cover rounded-xl border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Blog Post</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Blog Posts List */
        <div className="bg-gradient-card rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    SEO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No blog posts found</p>
                        <p className="text-gray-400 mb-6">Get started by creating your first blog post</p>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium"
                        >
                          Create New Blog Post
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
                    const StatusIcon = getStatusIcon(post.status);
                    
                    return (
                      <tr key={post.id} className="hover:bg-primary-25 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {post.featured_image ? (
                              <img 
                                src={post.featured_image} 
                                alt={post.title} 
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Image';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="h-6 w-6 text-primary-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {post.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                            {post.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {post.meta_title && post.meta_description ? (
                              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                Optimized
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
                                Needs SEO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {post.published_at 
                                ? new Date(post.published_at).toLocaleDateString() 
                                : 'Not published'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/blog/${post.slug}`;
                                copyToClipboard(url);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Copy URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="View"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            
                            <button
                              onClick={() => handleSubmitForIndexing(post.id)}
                              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                              title="Submit for indexing"
                            >
                              <Globe className="h-4 w-4" />
                            </button>
                            
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Image</h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingFiles ? (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading images...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No images found</p>
                  <p className="text-gray-400 mb-6">Upload images in the Storage section</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.filter(file => file.type.startsWith('image/')).map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => selectImage(file.url)}
                      className="cursor-pointer group"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:border-primary-300 transition-colors">
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-primary-500 text-white p-2 rounded-full">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => setShowImageSelector(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <a
                href="#storage"
                onClick={() => setShowImageSelector(false)}
                className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Manage Images</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;