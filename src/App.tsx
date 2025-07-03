import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PublicLayout from './components/Layout/PublicLayout';
import AdminLayout from './components/Layout/AdminLayout';
import KnowledgeBase from './components/KnowledgeBase/KnowledgeBase';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
          <Routes>
            <Route path="/area51/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
            <Route path="/*" element={<PublicLayout />}>
              <Route index element={<KnowledgeBase />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;