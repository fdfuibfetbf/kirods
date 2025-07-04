import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  MessageSquare, 
  User, 
  BarChart3, 
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Mail,
  Globe,
  Database
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onLogout
}) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'email', label: 'Email Management', icon: Mail },
    { id: 'smtp', label: 'SMTP Settings', icon: Settings },
    { id: 'seo', label: 'SEO & Indexing', icon: Globe },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Kirods Hosting</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              
              {!isCollapsed && (
                <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@kirods.com</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 mx-auto" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;