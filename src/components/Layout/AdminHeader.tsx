import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Settings, Bell, User, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-primary p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  🔒 Area 51
                </span>
                <span className="text-xs text-gray-500 -mt-1">Admin Panel</span>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Knowledge Base</span>
            </Link>
          </div>

          {/* Admin Actions */}
          <div className="flex items-center space-x-3">
            <button className="relative p-3 bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-3 bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200">
              <Settings className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@kirods.com</p>
              </div>
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;