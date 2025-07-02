import React, { useState, useRef, useEffect } from 'react';
import { 
  Server, 
  Globe, 
  Mail, 
  Shield, 
  Headphones, 
  Database,
  Cloud,
  Settings,
  Lock,
  Zap,
  FileText,
  HardDrive,
  Monitor,
  CreditCard,
  Users,
  Key,
  Smartphone,
  Wifi,
  Search,
  X
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Predefined categories with icons and descriptions - all using green gradient colors
  const predefinedCategories = [
    {
      name: 'Apps',
      description: 'Application management and installation guides',
      icon: Smartphone,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'WordPress',
      description: 'Complete WordPress setup and optimization',
      icon: FileText,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Domain Vault',
      description: 'Domain security and management tools',
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'General & Support',
      description: 'General help and customer support',
      icon: Headphones,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Checkout & Billing',
      description: 'Payment processing and billing support',
      icon: CreditCard,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'Domains',
      description: 'Domain registration and DNS management',
      icon: Globe,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Domain Privacy Protection',
      description: 'Protect your domain registration details',
      icon: Lock,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'Domain Transfers',
      description: 'Transfer domains between registrars',
      icon: Database,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Hosting',
      description: 'Web hosting solutions and server management',
      icon: Server,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'Email Service',
      description: 'Professional email hosting and setup',
      icon: Mail,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'SSL Certificates',
      description: 'Secure your website with SSL encryption',
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'My Account',
      description: 'Account settings and profile management',
      icon: Users,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Affiliates',
      description: 'Affiliate program and commission tracking',
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'API & Resellers',
      description: 'API documentation and reseller tools',
      icon: Settings,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'Legacy Products',
      description: 'Support for discontinued services',
      icon: HardDrive,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    },
    {
      name: 'PremiumDNS',
      description: 'Advanced DNS management and features',
      icon: Wifi,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      hoverColor: 'hover:from-primary-200 hover:to-primary-300'
    },
    {
      name: 'FastVPN',
      description: 'Secure VPN service and configuration',
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    }
  ];

  // Sample search suggestions
  const searchSuggestions = [
    { type: 'category', name: 'WordPress Installation', category: 'WordPress' },
    { type: 'category', name: 'Domain Setup', category: 'Domains' },
    { type: 'category', name: 'SSL Certificate Installation', category: 'SSL Certificates' },
    { type: 'category', name: 'Email Configuration', category: 'Email Service' },
    { type: 'category', name: 'cPanel Access', category: 'Hosting' },
    { type: 'category', name: 'DNS Management', category: 'Domains' },
    { type: 'category', name: 'Website Migration', category: 'Hosting' },
    { type: 'category', name: 'Backup Restoration', category: 'Hosting' },
    { type: 'category', name: 'Database Management', category: 'Hosting' },
    { type: 'category', name: 'FTP Setup', category: 'Hosting' },
    { type: 'category', name: 'WordPress Security', category: 'WordPress' },
    { type: 'category', name: 'Domain Transfer', category: 'Domain Transfers' },
    { type: 'category', name: 'Email Forwarding', category: 'Email Service' },
    { type: 'category', name: 'SSL Renewal', category: 'SSL Certificates' },
    { type: 'category', name: 'Account Billing', category: 'Checkout & Billing' }
  ];

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      
      setFilteredSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setShowDropdown(false);
    
    // Find and select the related category
    const relatedCategory = categories.find(cat => 
      cat.name.toLowerCase().includes(suggestion.category.toLowerCase()) ||
      suggestion.category.toLowerCase().includes(cat.name.toLowerCase())
    );
    
    if (relatedCategory) {
      onCategorySelect(relatedCategory.id);
    }
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Try to find a matching category
      const matchingCategory = categories.find(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingCategory) {
        onCategorySelect(matchingCategory.id);
      }
    }
    setShowDropdown(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
    setFilteredSuggestions([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Merge predefined categories with actual categories from database
  const getCategoryData = (categoryName: string) => {
    return predefinedCategories.find(cat => 
      cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
      categoryName.toLowerCase().includes(cat.name.toLowerCase())
    ) || {
      name: categoryName,
      description: 'Comprehensive guides and tutorials',
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      hoverColor: 'hover:from-primary-100 hover:to-primary-200'
    };
  };

  return (
    <div className="py-16">
      {/* Smart Search Bar with Dropdown */}
      <div className="max-w-2xl mx-auto mb-12" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledgebase"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg shadow-sm transition-all duration-200"
          />
          
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search button */}
          <button 
            onClick={handleSearchSubmit}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-primary text-white px-6 py-2 rounded-lg hover:shadow-green transition-all duration-200 font-medium"
          >
            Search
          </button>

          {/* Search Dropdown */}
          {showDropdown && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                  Suggested searches
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left px-3 py-3 hover:bg-primary-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                          {suggestion.name}
                        </div>
                        <div className="text-xs text-primary-600 group-hover:text-primary-700">
                          in {suggestion.category}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {predefinedCategories.map((categoryData, index) => {
          // Find matching category from database
          const dbCategory = categories.find(cat => 
            cat.name.toLowerCase().includes(categoryData.name.toLowerCase()) ||
            categoryData.name.toLowerCase().includes(cat.name.toLowerCase())
          );
          
          const IconComponent = categoryData.icon;
          const articleCount = dbCategory?.article_count || 0;

          return (
            <div
              key={index}
              onClick={() => dbCategory && onCategorySelect(dbCategory.id)}
              className={`group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200 ${
                !dbCategory ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-center">
                {/* Icon */}
                <div className={`w-12 h-12 ${categoryData.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 ${categoryData.hoverColor}`}>
                  <IconComponent className={`h-6 w-6 ${categoryData.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {categoryData.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  View section →
                </p>

                {/* Article Count */}
                {dbCategory && (
                  <div className="text-xs text-primary-600 font-medium">
                    {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Section */}
      <div className="mt-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recent Articles */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Articles</h2>
            <div className="space-y-4">
              {categories.slice(0, 5).map((category, index) => (
                <div key={category.id} className="flex items-start space-x-3 p-3 hover:bg-primary-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <button
                      onClick={() => onCategorySelect(category.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium text-left"
                    >
                      {category.name}
                    </button>
                    <div className="text-xs text-primary-600 mt-1">
                      {category.description || 'Category guides and tutorials'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { question: "How to generate CSR (Certificate Signing Request) Code", category: "SSL Certificates" },
                { question: "How to set up a URL redirect for a domain", category: "Domains" },
                { question: "Which record type option should I choose for the information I'm about to enter?", category: "Domains" },
                { question: "How to set up Free Email Forwarding", category: "Email service" },
                { question: "How do I activate an SSL certificate", category: "SSL Certificates" }
              ].map((faq, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-primary-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium text-left">
                      {faq.question}
                    </button>
                    <div className="text-xs text-primary-600 mt-1">
                      {faq.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;