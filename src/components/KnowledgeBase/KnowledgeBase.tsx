import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import { Article } from '../../types';
import ArticleCard from './ArticleCard';
import CategoryFilter from './CategoryFilter';
import CategoryGrid from './CategoryGrid';
import ArticleView from './ArticleView';
import HeroSection from './HeroSection';
import { Shield, ArrowLeft, Tag, FileText } from 'lucide-react';

interface OutletContext {
  searchQuery: string;
}

const KnowledgeBase: React.FC = () => {
  const { searchQuery } = useOutletContext<OutletContext>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const { articles, loading: articlesLoading, incrementViews } = useArticles();
  const { categories, loading: categoriesLoading } = useCategories();

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    incrementViews(article.id);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory('');
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || article.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);

  // Get selected category info
  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  if (articlesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  // Show category grid and hero when no search query and no category selected
  const showHomepage = !searchQuery && !selectedCategory;

  // Show category articles view when category is selected
  const showCategoryView = selectedCategory && !searchQuery;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section - only show on homepage */}
      {showHomepage && <HeroSection />}

      {/* Category Grid - only show on homepage */}
      {showHomepage && (
        <CategoryGrid 
          categories={categories} 
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Category Articles View - Centered Long Row Grid */}
      {showCategoryView && (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Category Header */}
          <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToCategories}
                className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="font-medium">Back to Categories</span>
              </button>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="h-10 w-10 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{selectedCategoryInfo?.name}</h1>
              <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                {selectedCategoryInfo?.description || 'Browse all articles in this category'}
              </p>

              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{filteredArticles.length} articles</span>
                </div>
                {featuredArticles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span>{featuredArticles.length} featured</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Articles - Single Centered Grid */}
          {filteredArticles.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                  <h2 className="text-3xl font-bold text-gray-900">Articles</h2>
                  <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                </div>
                <p className="text-gray-600 mb-8">Complete collection of guides and tutorials in this category</p>
              </div>
              
              {/* Long Row Grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={handleArticleClick}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-gradient-card rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No articles found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This category doesn't have any articles yet. Check back soon for new content!
              </p>
              <button
                onClick={handleBackToCategories}
                className="bg-gradient-primary text-white px-8 py-4 rounded-xl hover:shadow-green transition-all duration-200 font-medium text-lg"
              >
                Browse Other Categories
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Results View - with sidebar */}
      {searchQuery && !selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div className="animate-slide-up">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Featured Results</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div className="animate-slide-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results ({filteredArticles.length})
                </h2>
              </div>
              
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-card rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">No articles found</p>
                  <p className="text-gray-400">Try adjusting your search terms or category filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Articles on Homepage */}
      {showHomepage && featuredArticles.length > 0 && (
        <div className="animate-slide-up">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-1 h-12 bg-gradient-primary rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Articles</h2>
              <div className="w-1 h-12 bg-gradient-primary rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our most popular and helpful guides to get you started
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;