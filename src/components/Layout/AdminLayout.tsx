import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLogin from '../Admin/AdminLogin';
import AdminDashboard from '../Admin/AdminDashboard';

const AdminLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setLoginLoading(true);
    setLoginError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo credentials - in production, this would be a real API call
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }

    setLoginLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginError('');
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminLayout;