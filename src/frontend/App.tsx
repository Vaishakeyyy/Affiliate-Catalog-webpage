import React, { useState, useEffect } from 'react';
import { Dress } from './types';
import { getDresses } from './data/db';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [dresses, setDresses] = useState<Dress[]>([]);

  // Initial load of the catalog
  useEffect(() => {
    getDresses().then(setDresses);
  }, []);

  const handleRefreshDresses = async () => {
    const updated = await getDresses();
    setDresses(updated);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('fashion_catalog_admin_session');
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans antialiased">
      {/* Primary View Routing System */}
      <div className="flex-1">
        <AdminDashboard
          dresses={dresses}
          onRefreshDresses={handleRefreshDresses}
          onLogout={handleAdminLogout}
          userEmail="vaishakh884@gmail.com"
        />
      </div>
    </div>
  );
}

