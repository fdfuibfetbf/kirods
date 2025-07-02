import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Shield, Menu, X, Home, HelpCircle } from 'lucide-react';

interface PublicHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const secretInputRef = useRef<HTMLInputElement>(null);

  // Listen for the secret code "area51"
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only capture if not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const newCode = secretCode + event.key.toLowerCase();
      
      if ('area51'.startsWith(newCode)) {
        setSecretCode(newCode);
        
        if (newCode === 'area51') {
          setShowAdminAccess(true);
          setSecretCode('');
          
          // Auto-hide after 10 seconds
          setTimeout(() => {
            setShowAdminAccess(false);
          }, 10000);
        }
      } else {
        setSecretCode('');
      }
    };

    // Reset secret code after 3 seconds of inactivity
    const resetTimer = setTimeout(() => {
      setSecretCode('');
    }, 3000);

    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(resetTimer);
    };
  }, [secretCode]);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-primary-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                Kirods Hosting
              </span>
              <span className="text-xs text-gray-500 -mt-1">Knowledge Base</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Hidden Admin Access - only shows when secret code is entered */}
            {showAdminAccess && (
              <Link
                to="/area51"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors relative group animate-pulse"
              >
                <Shield className="h-4 w-4" />
                <span>🔒 Area 51</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200">
              <HelpCircle className="h-5 w-5" />
            </button>

            <button className="p-3 bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200">
              <User className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                
                {/* Hidden Admin Access for Mobile */}
                {showAdminAccess && (
                  <Link
                    to="/area51"
                    className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors animate-pulse"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>🔒 Area 51</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Secret Code Indicator (for debugging - remove in production) */}
      {secretCode && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-1 rounded text-xs font-mono z-50">
          {secretCode}
        </div>
      )}
    </header>
  );
};

export default PublicHeader;