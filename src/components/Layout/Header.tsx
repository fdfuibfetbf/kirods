import React from 'react';
import { Search, MessageCircle, User, Shield } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showChatWidget: boolean;
  onToggleChat: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  showChatWidget,
  onToggleChat
}) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Kirods Hosting</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => onViewChange('knowledge-base')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'knowledge-base'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => onViewChange('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Admin Panel
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          {currentView === 'knowledge-base' && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleChat}
              className={`p-2 rounded-lg transition-colors ${
                showChatWidget
                  ? 'text-white bg-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;