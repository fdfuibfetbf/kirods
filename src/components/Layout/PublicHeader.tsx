import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Shield, Menu, X, Home, HelpCircle, ExternalLink, Globe } from 'lucide-react';

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
    <header className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-gradient-primary p-2 rounded-lg shadow-md group-hover:scale-105 transition-all duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <a 
                href="https://kirods.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
              >
                Kirods Hosting
              </a>
              <span className="text-xs text-gray-500 -mt-1 font-medium">Knowledge Base</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="https://kirods.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              <Globe className="h-4 w-4" />
              <span>Kirods.com</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
              <span className="absolute -bottom-1 left-3 w-0 h-0.5 bg-primary-500 group-hover:w-[calc(100%-1.5rem)] transition-all duration-300"></span>
            </a>

            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              <Home className="h-4 w-4" />
              <span>Knowledge Base</span>
              <span className="absolute -bottom-1 left-3 w-0 h-0.5 bg-primary-500 group-hover:w-[calc(100%-1.5rem)] transition-all duration-300"></span>
            </Link>
            
            {/* Hidden Admin Access - only shows when secret code is entered */}
            {showAdminAccess && (
              <Link
                to="/area51"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-all duration-300 relative group animate-pulse px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <Shield className="h-4 w-4" />
                <span>🔒 Area 51</span>
                <span className="absolute -bottom-1 left-3 w-0 h-0.5 bg-red-500 group-hover:w-[calc(100%-1.5rem)] transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300 text-sm placeholder-gray-400 shadow-sm hover:shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-gray-50/80 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group">
              <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            </button>

            <a 
              href="https://kirods.com/login" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-gray-50/80 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-gray-50/80 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 animate-slide-up">
            <div className="space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <a
                  href="https://kirods.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">Kirods.com</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <Link
                  to="/"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Knowledge Base</span>
                </Link>
                
                <a
                  href="https://kirods.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Login</span>
                </a>
                
                {/* Hidden Admin Access for Mobile */}
                {showAdminAccess && (
                  <Link
                    to="/area51"
                    className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 animate-pulse"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">🔒 Area 51</span>
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