import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PublicHeader from './PublicHeader';

const PublicLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <HelmetProvider>
      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ searchQuery }} />
      </main>
    </HelmetProvider>
  );
};

export default PublicLayout;