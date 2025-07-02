import React from 'react';
import { Eye, Calendar, Tag, ArrowRight, Clock, User, Star } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const readingTime = Math.ceil(article.content.length / 1000); // Estimate reading time

  return (
    <div
      onClick={() => onClick(article)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-200 hover:-translate-y-1 overflow-hidden h-full flex flex-col"
    >
      {/* Header with category and featured badge */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
              <Tag className="h-3 w-3 mr-1" />
              {article.category?.name || 'General'}
            </span>
            {article.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </span>
            )}
          </div>
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-4 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
          {article.content.replace(/<[^>]*>/g, '').substring(0, 180)}...
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(article.updated_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{readingTime} min read</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-primary-600 font-medium">
            <span>Read Article</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;