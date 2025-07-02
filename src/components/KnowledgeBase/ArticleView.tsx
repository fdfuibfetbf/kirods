import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Eye, Tag, Share2, Bookmark, Clock, CheckCircle, Copy, ThumbsUp, ThumbsDown, MessageSquare, User } from 'lucide-react';
import { Article, Comment } from '../../types';
import CommentPopup from './CommentPopup';
import { useComments } from '../../hooks/useComments';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const { comments, fetchComments } = useComments();

  const readingTime = Math.ceil(article.content.length / 1000);
  const sections = article.content.split('\n\n').filter(section => section.trim());

  // Fetch comments when component mounts
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoadingComments(true);
        await fetchComments();
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [fetchComments]);

  // Filter comments for this article and only approved ones
  useEffect(() => {
    const articleComments = comments.filter(comment => 
      comment.article_id === article.id && comment.status === 'approved'
    );
    setApprovedComments(articleComments);
  }, [comments, article.id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
  };

  const handleCommentSubmitted = async () => {
    // Refresh comments when a new comment is submitted
    setLoadingComments(true);
    try {
      await fetchComments();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 mb-8 transition-colors group"
      >
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-medium">Back to Knowledge Base</span>
      </button>
      
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Article Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 md:p-12">
          <div className="max-w-3xl">
            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20">
                <Tag className="h-4 w-4 mr-2" />
                {article.category?.name || 'General'}
              </span>
              {article.featured && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  ⭐ Featured Guide
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{article.title}</h1>
            
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(article.updated_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{article.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>{approvedComments.length} comments</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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
          {/* Table of Contents for longer articles */}
          {sections.length > 5 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                Quick Navigation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sections.slice(0, 8).map((section, index) => {
                  const title = section.split('\n')[0].replace(/^#+\s*/, '').substring(0, 50);
                  if (title.length > 10) {
                    return (
                      <button
                        key={index}
                        className="text-left text-sm text-gray-600 hover:text-primary-600 py-1 transition-colors"
                        onClick={() => {
                          const element = document.getElementById(`section-${index}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {index + 1}. {title}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed space-y-6">
              {sections.map((section, index) => (
                <div key={index} id={`section-${index}`} className="scroll-mt-24">
                  {section.split('\n').map((paragraph, pIndex) => {
                    if (paragraph.trim() === '') return null;
                    
                    // Handle headers
                    if (paragraph.startsWith('#')) {
                      const level = paragraph.match(/^#+/)?.[0].length || 1;
                      const text = paragraph.replace(/^#+\s*/, '');
                      const HeaderTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
                      
                      return (
                        <HeaderTag 
                          key={pIndex} 
                          className={`font-bold text-gray-900 mt-8 mb-4 ${
                            level === 1 ? 'text-2xl' : 
                            level === 2 ? 'text-xl' : 
                            'text-lg'
                          }`}
                        >
                          {text}
                        </HeaderTag>
                      );
                    }
                    
                    // Handle lists
                    if (paragraph.startsWith('-') || paragraph.startsWith('•')) {
                      return (
                        <ul key={pIndex} className="list-disc list-inside space-y-2 ml-4">
                          <li className="text-base leading-relaxed">{paragraph.replace(/^[-•]\s*/, '')}</li>
                        </ul>
                      );
                    }
                    
                    // Handle numbered lists
                    if (/^\d+\./.test(paragraph)) {
                      return (
                        <ol key={pIndex} className="list-decimal list-inside space-y-2 ml-4">
                          <li className="text-base leading-relaxed">{paragraph.replace(/^\d+\.\s*/, '')}</li>
                        </ol>
                      );
                    }
                    
                    // Regular paragraphs
                    return (
                      <p key={pIndex} className="text-base leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 mt-8 border-t border-gray-200 gap-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                  isBookmarked 
                    ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                    : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Share'}
                </span>
              </button>

              <button 
                onClick={() => setShowCommentPopup(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Add Comment</span>
              </button>
            </div>
            
            {/* Feedback Section */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Was this article helpful?</p>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleFeedback('helpful')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    feedback === 'helpful' 
                      ? 'bg-green-50 text-green-600 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Yes</span>
                </button>
                <button 
                  onClick={() => handleFeedback('not-helpful')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    feedback === 'not-helpful' 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm font-medium">No</span>
                </button>
              </div>
              {feedback && (
                <p className="text-xs text-gray-500 mt-2">
                  Thank you for your feedback!
                </p>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              <span>Comments ({approvedComments.length})</span>
            </h3>
            <button 
              onClick={() => setShowCommentPopup(true)}
              className="bg-gradient-primary text-white px-4 py-2 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Add Comment</span>
            </button>
          </div>

          {loadingComments ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : approvedComments.length > 0 ? (
            <div className="space-y-8">
              {approvedComments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{comment.user_name}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{comment.content}</p>
                      
                      {/* Admin Reply */}
                      {comment.admin_reply && (
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-primary-700">Admin Reply</span>
                          </div>
                          <p className="text-primary-800 text-sm leading-relaxed">{comment.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h4>
              <p className="text-gray-600 mb-6">Be the first to share your thoughts on this article!</p>
              <button 
                onClick={() => setShowCommentPopup(true)}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium"
              >
                Write the first comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Articles Suggestion */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Browse Related Topics</h4>
            <p className="text-sm text-gray-600 mb-3">Find more guides in the {article.category?.name || 'same'} category</p>
            <button 
              onClick={onBack}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all guides →
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Still Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">Contact our support team for personalized assistance</p>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Start live chat →
            </button>
          </div>
        </div>
      </div>

      {/* Comment Popup */}
      <CommentPopup
        isOpen={showCommentPopup}
        onClose={() => setShowCommentPopup(false)}
        articleId={article.id}
        articleTitle={article.title}
        onCommentSubmitted={handleCommentSubmitted}
      />
    </div>
  );
};

export default ArticleView;