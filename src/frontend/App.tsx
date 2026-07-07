import React, { useState, useEffect } from 'react';
import { Dress } from './types';
import { getDresses } from './data/db';
import AdminDashboard from './components/AdminDashboard';
import CustomerCatalog from './components/CustomerCatalog';
import ProductDetail from './components/ProductDetail';

export default function App() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [currentView, setCurrentView] = useState<'catalog' | 'detail' | 'admin'>('catalog');
  const [selectedDressId, setSelectedDressId] = useState<string | null>(null);

  // Initial load of the catalog
  useEffect(() => {
    getDresses().then(setDresses);
  }, []);

  // Hash-based routing to support browser Back and Forward navigation arrows
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/dress/')) {
        const id = hash.replace('#/dress/', '');
        setSelectedDressId(id);
        setCurrentView('detail');
      } else if (hash === '#/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('catalog');
        setSelectedDressId(null);
      }
    };

    // Run once on load to handle initial URL
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRefreshDresses = async () => {
    const updated = await getDresses();
    setDresses(updated);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('fashion_catalog_admin_session');
    window.location.hash = '#/';
  };

  const handleSelectDress = (dress: Dress) => {
    window.location.hash = `#/dress/${dress.id}`;
  };

  const handleBackToCatalog = () => {
    window.location.hash = '#/';
  };

  const handleNavigateToAdmin = () => {
    window.location.hash = '#/admin';
  };

  const activeDress = dresses.find(d => d.id === selectedDressId);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans antialiased">
      {/* Primary View Routing System */}
      <div className="flex-1">
        {currentView === 'admin' ? (
          <AdminDashboard
            dresses={dresses}
            onRefreshDresses={handleRefreshDresses}
            onLogout={handleAdminLogout}
            userEmail="vaishakh884@gmail.com"
          />
        ) : currentView === 'detail' && activeDress ? (
          <ProductDetail
            dress={activeDress}
            allDresses={dresses}
            onBack={handleBackToCatalog}
            onSelectDress={handleSelectDress}
          />
        ) : (
          <CustomerCatalog
            dresses={dresses}
            onSelectDress={handleSelectDress}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        )}
      </div>
    </div>
  );
}

