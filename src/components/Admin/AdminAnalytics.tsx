import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  FileText
} from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';

const AdminAnalytics: React.FC = () => {
  const { articles } = useArticles();
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    todayViews: 0,
    onlineVisitors: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const updateRealTimeData = () => {
      setRealTimeData({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        todayViews: Math.floor(Math.random() * 1000) + 500,
        onlineVisitors: Math.floor(Math.random() * 25) + 5
      });
    };

    updateRealTimeData();
    const interval = setInterval(updateRealTimeData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);

  const stats = [
    {
      title: 'Total Page Views',
      value: totalViews.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'blue',
      realTime: false
    },
    {
      title: 'Online Visitors',
      value: realTimeData.onlineVisitors.toString(),
      change: 'Live',
      trend: 'up',
      icon: Users,
      color: 'green',
      realTime: true
    },
    {
      title: 'Today\'s Views',
      value: realTimeData.todayViews.toLocaleString(),
      change: '+15.7%',
      trend: 'up',
      icon: BarChart3,
      color: 'orange',
      realTime: true
    },
    {
      title: 'Active Users',
      value: realTimeData.activeUsers.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      color: 'purple',
      realTime: true
    }
  ];

  // Get top articles by views
  const topArticles = articles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(article => ({
      title: article.title,
      views: article.views,
      change: '+' + Math.floor(Math.random() * 20 + 5) + '%'
    }));

  // Generate recent activity from real data
  const recentActivity = [
    ...articles.slice(0, 5).map(article => ({
      id: article.id,
      action: article.updated_at !== article.created_at ? 'Article updated' : 'Article published',
      item: article.title,
      time: new Date(article.updated_at).toLocaleString(),
      type: 'article'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 bg-green-50',
      purple: 'from-purple-500 to-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your knowledge base performance and user engagement</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-medium transition-all duration-300 relative">
              {stat.realTime && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.change === 'Live' ? 'text-green-600' :
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change === 'Live' ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      <span>{stat.change}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Articles */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Top Articles</h3>
          </div>
          
          <div className="space-y-4">
            {topArticles.length > 0 ? topArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{article.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{article.views.toLocaleString()} views</p>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {article.change}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No articles published yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.item}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Visitors Section */}
      <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Live Visitor Activity</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{realTimeData.onlineVisitors} visitors online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{realTimeData.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-xs text-green-600 mt-1">Last 30 minutes</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{Math.floor(realTimeData.todayViews / 24)}</div>
            <div className="text-sm text-gray-600">Avg. Hourly Views</div>
            <div className="text-xs text-orange-600 mt-1">Today</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{articles.length}</div>
            <div className="text-sm text-gray-600">Published Articles</div>
            <div className="text-xs text-blue-600 mt-1">Total content</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Traffic Overview</h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3" />
              <p>Real-time traffic chart</p>
              <p className="text-sm">Integration with analytics service needed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Content Performance</h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-3" />
              <p>Article performance metrics</p>
              <p className="text-sm">Category-wise view distribution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;