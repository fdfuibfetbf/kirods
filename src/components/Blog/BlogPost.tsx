import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { Calendar, Clock, Eye, Tag as TagIcon, ArrowLeft, User, Share2, Copy, CheckCircle } from 'lucide-react';
import SEOHead from '../SEO/SEOHead';
import { marked } from 'marked';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getPostBySlug, incrementViews, posts } = useBlogPosts();
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  
  // Get related posts (same category or tags)
  const relatedPosts = posts
    .filter(p => 
      p.id !== post?.id && 
      (p.category_id === post?.category_id || 
       p.tags.some(tag => post?.tags.includes(tag)))
    )
    .slice(0, 3);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const fetchedPost = await getPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          // Increment view count
          incrementViews(fetchedPost.id);
        } else {
          setError('Blog post not found');
        }
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, getPostBySlug, incrementViews]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };

  // Calculate reading time
  const readingTime = post ? Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 1000) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Blog Post Not Found</h3>
        <p className="text-gray-600 mb-6">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-green transition-all duration-200 font-medium"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords}
        canonicalUrl={post.canonical_url}
        ogTitle={post.og_title || post.title}
        ogDescription={post.og_description || post.excerpt}
        ogImage={post.og_image || post.featured_image}
        ogType="article"
      />

      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Back Navigation */}
        <Link
          to="/blog"
          className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 mb-8 transition-colors group"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-medium">Back to Blog</span>
        </Link>
        
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative h-80 overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=Kirods+Hosting';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
            </div>
          )}

          {/* Article Header */}
          <div className={`${post.featured_image ? 'bg-transparent -mt-32 relative z-10 text-white' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'} p-8 md:p-12`}>
            <div className="max-w-3xl">
              {/* Category and Tags */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20">
                  <TagIcon className="h-4 w-4 mr-2" />
                  {post.category?.name || 'Uncategorized'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{post.author_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Share Button */}
            <div className="flex justify-end mb-8">
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Share'}
                </span>
              </button>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}
              />
            </div>

            {/* Author Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {post.author_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Author</h3>
                  <h4 className="text-primary-600 font-medium mb-2">{post.author_name}</h4>
                  <p className="text-gray-600 text-sm">
                    Content writer and web hosting specialist at Kirods Hosting. Passionate about making technical concepts accessible to everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-8 bg-gradient-primary rounded-full mr-3"></span>
              Related Posts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 hover:border-primary-100"
                >
                  {/* Featured Image */}
                  {relatedPost.featured_image ? (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={relatedPost.featured_image} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Kirods+Hosting';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary-600" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-xs text-gray-500">
                        {new Date(relatedPost.published_at || relatedPost.created_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPost;