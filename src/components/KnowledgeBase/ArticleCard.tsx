import React from 'react';
import { Eye, Calendar, Tag, ArrowRight, Clock, User, Star, TrendingUp } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const readingTime = Math.ceil(article.content.length / 1000);

  return (
    <div
      onClick={() => onClick(article)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary-100 hover:-translate-y-1 overflow-hidden h-full flex flex-col relative"
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-primary-100/30 transition-all duration-300 rounded-xl"></div>
      
      {/* Header with enhanced styling */}
      <div className="p-5 pb-4 flex-1 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-100 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300">
              <Tag className="h-3 w-3 mr-1" />
              {article.category?.name || 'General'}
            </span>
            {article.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-100 group-hover:scale-105 transition-transform duration-300">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </span>
            )}
          </div>
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-primary-50 transition-all duration-300 flex-shrink-0 group-hover:scale-110">
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
        
        <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 mb-3 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1 group-hover:text-gray-700 transition-colors duration-300">
          {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-all duration-300">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-t border-gray-100 mt-auto relative z-10 group-hover:from-primary-50/80 group-hover:to-primary-100/50 transition-all duration-300">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500 group-hover:text-primary-600 transition-colors duration-300">
              <Calendar className="h-3 w-3" />
              <span>{new Date(article.updated_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 group-hover:text-primary-600 transition-colors duration-300">
              <Eye className="h-3 w-3" />
              <span>{article.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 group-hover:text-primary-600 transition-colors duration-300">
              <Clock className="h-3 w-3" />
              <span>{readingTime} min</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-primary-600 font-medium group-hover:text-primary-700 transition-colors duration-300">
            <span>Read</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Trending indicator for high-view articles */}
      {article.views > 1000 && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white p-1 rounded-md shadow-md group-hover:scale-110 transition-transform duration-300">
          <TrendingUp className="h-3 w-3" />
        </div>
      )}
    </div>
  );
};

export default ArticleCard;