import React from 'react';
import { Category } from '../../types';
import { Filter, Search, ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  const totalArticles = categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0);
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Filter className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
        </div>
      </div>

      {/* Categories List */}
      {isExpanded && (
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {/* All Articles */}
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">All Articles</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                selectedCategory === '' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {totalArticles}
              </span>
            </div>
          </button>
          
          {/* Individual Categories */}
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                selectedCategory === category.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  selectedCategory === category.id 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}>
                  {category.article_count || 0}
                </span>
              </div>
              {category.description && (
                <p className={`text-xs leading-relaxed ${
                  selectedCategory === category.id 
                    ? 'text-primary-600' 
                    : 'text-gray-500 group-hover:text-primary-500'
                }`}>
                  {category.description.length > 80 
                    ? `${category.description.substring(0, 80)}...` 
                    : category.description
                  }
                </p>
              )}
            </button>
          ))}
          
          {filteredCategories.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No categories found</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{categories.length}</div>
            <div className="text-xs text-gray-500">Categories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{totalArticles}</div>
            <div className="text-xs text-gray-500">Total Guides</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;