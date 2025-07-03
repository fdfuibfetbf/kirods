import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, TrendingUp, Activity, Clock, Tag, Eye, Mail, Globe } from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';
import { useCategories } from '../../hooks/useCategories';
import ArticleManagement from './ArticleManagement';
import CategoryManagement from './CategoryManagement';
import AdminAnalytics from './AdminAnalytics';
import CommentManagement from './CommentManagement';
import SMTPSettings from './SMTPSettings';
import EmailManagement from './EmailManagement';
import AdminProfile from './AdminProfile';
import AdminSidebar from './AdminSidebar';
import SitemapGenerator from '../SEO/SitemapGenerator';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    onlineUsers: 0,
    todayViews: 0
  });
  
  const { articles } = useArticles();
  const { categories } = useCategories();

  // Simulate real-time data updates
  useEffect(() => {
    const updateRealTimeStats = () => {
      setRealTimeStats({
        onlineUsers: Math.floor(Math.random() * 25) + 5,
        todayViews: Math.floor(Math.random() * 500) + 200
      });
    };

    updateRealTimeStats();
    const interval = setInterval(updateRealTimeStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);

  const stats = [
    { 
      name: 'Total Articles', 
      value: articles.length.toString(), 
      change: '+' + Math.floor(articles.length * 0.1), 
      icon: FileText, 
      color: 'from-primary-500 to-primary-600', 
      bgColor: 'bg-primary-50',
      isLive: false
    },
    { 
      name: 'Categories', 
      value: categories.length.toString(), 
      change: '+' + Math.floor(categories.length * 0.05), 
      icon: Tag, 
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-50',
      isLive: false
    },
    { 
      name: 'Total Views', 
      value: totalViews.toLocaleString(), 
      change: '+' + realTimeStats.todayViews, 
      icon: Eye, 
      color: 'from-orange-500 to-orange-600', 
      bgColor: 'bg-orange-50',
      isLive: true
    },
    { 
      name: 'Comments', 
      value: '24', 
      change: 'Live', 
      icon: MessageSquare, 
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'bg-blue-50',
      isLive: true
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-soft p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-slate-300">Manage your knowledge base content, user comments, and email notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-300">Pending Comments</div>
              <div className="text-2xl font-bold flex items-center space-x-2">
                <span>5</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-medium transition-all duration-300 group relative">
            {stat.isLive && (
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.isLive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-green-600 bg-green-50'
              }`}>
                {stat.isLive ? 'Live' : `+${stat.change}`}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Management Overview */}
      <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Content & SEO Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="bg-primary-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">📝</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Article Management</div>
            <div className="text-xs text-gray-600">Create and edit articles</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">🏷️</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Category Organization</div>
            <div className="text-xs text-gray-600">Organize content structure</div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">💬</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Comment Moderation</div>
            <div className="text-xs text-gray-600">Review and publish comments</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">📧</div>
            <div className="text-sm font-medium text-gray-900 mb-1">Email Management</div>
            <div className="text-xs text-gray-600">Templates and notifications</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">⚙️</div>
            <div className="text-sm font-medium text-gray-900 mb-1">SMTP Configuration</div>
            <div className="text-xs text-gray-600">Email server setup</div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">🔍</div>
            <div className="text-sm font-medium text-gray-900 mb-1">SEO & Indexing</div>
            <div className="text-xs text-gray-600">Search engine optimization</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'analytics': return <AdminAnalytics />;
      case 'articles': return <ArticleManagement />;
      case 'categories': return <CategoryManagement />;
      case 'comments': return <CommentManagement />;
      case 'email': return <EmailManagement />;
      case 'smtp': return <SMTPSettings />;
      case 'seo': return <SitemapGenerator />;
      case 'profile': return <AdminProfile />;
      default: return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;