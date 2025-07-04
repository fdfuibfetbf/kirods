import React, { useState, useEffect } from 'react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { useCategories } from '../../hooks/useCategories';
import { Calendar, Clock, Eye, Tag as TagIcon, ArrowRight, Search, Filter, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../SEO/SEOHead';

const BlogList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const { posts, loading } = useBlogPosts();
  const { categories } = useCategories();

  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => post.tags)
    )
  ).sort();

  // Filter posts based on search, category, and tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || post.category_id === selectedCategory;
    
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Get featured posts
  const featuredPosts = filteredPosts.filter(post => post.featured_image).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Blog - Kirods Hosting Knowledge Base"
        description="Read the latest articles, tutorials, and insights about web hosting, domain management, and website optimization."
        keywords="blog, web hosting, tutorials, domain management, website optimization"
        ogType="website"
      />

      <div className="space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-8 md:p-12 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-16 h-16 border border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-12 h-12 border border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-32 w-10 h-10 border border-white/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 border border-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Kirods Hosting Blog
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Insights, tutorials, and expert advice on web hosting, domain management, 
              and optimizing your online presence.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-0 bg-white/5 rounded-xl blur-md"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                <div className="flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-white/70" />
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder-white/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="w-1 h-8 bg-gradient-primary rounded-full mr-3"></span>
              Featured Posts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  {/* Featured Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Kirods+Hosting';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/10">
                        {post.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 bg-white flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                      
                      <span className="text-primary-600 font-medium group-hover:translate-x-1 transition-transform flex items-center">
                        Read
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm appearance-none shadow-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm appearance-none shadow-sm"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="ml-auto text-sm text-gray-500">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          </div>
        </div>

        {/* All Posts */}
        <div className="space-y-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory || selectedTag
                  ? "Try adjusting your search filters to find what you're looking for."
                  : "We haven't published any blog posts yet. Check back soon for new content!"}
              </p>
              {(searchQuery || selectedCategory || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedTag('');
                  }}
                  className="px-6 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden border border-gray-100 hover:border-primary-100"
                >
                  {/* Featured Image */}
                  {post.featured_image ? (
                    <div className="w-1/3 relative overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Kirods';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-1/3 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary-600" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="w-2/3 p-6 flex flex-col">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                        {post.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{post.author_name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        <span>Read more</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;