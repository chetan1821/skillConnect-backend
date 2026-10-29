import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedProviders } from './components/FeaturedProviders';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProviderPortal } from './components/ProviderPortal';
import { Toast } from './components/Toast';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { api } from './api/client';

const MainLayout = () => {
  const {
    user,
    activeRoleView,
    setViewMode,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    toast
  } = useAuth();

  // App Level Data
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Selected State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);

  // Load Categories & Providers
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [cats, pros] = await Promise.all([
          api.getCategories(false),
          api.getProviders(false)
        ]);
        setCategories(cats || []);
        setProviders(pros || []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Filtered providers
  const filteredProviders = providers.filter((pro) => {
    const matchesCategory =
      !selectedCategory ||
      (pro.categories && pro.categories.includes(selectedCategory));

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      pro.full_name?.toLowerCase().includes(q) ||
      pro.business_name?.toLowerCase().includes(q) ||
      pro.description?.toLowerCase().includes(q) ||
      (pro.categories && pro.categories.some((c) => c.toLowerCase().includes(q)));

    return matchesCategory && matchesQuery;
  });

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleSearchSubmit = () => {
    const el = document.getElementById('providers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Global System Announcement Banner */}
      <AnnouncementBanner />

      {/* Navigation Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          handleSearchSubmit();
        }}
        onOpenMyBookings={() => {
          if (!user) {
            handleOpenAuth('login');
          } else {
            setIsMyBookingsOpen(true);
          }
        }}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeRoleView === 'admin' ? (
          <AdminDashboard />
        ) : activeRoleView === 'provider' ? (
          <ProviderPortal onSwitchToCustomer={() => setViewMode('customer')} />
        ) : (
          /* Customer / Public Marketplace View */
          <>
            <Hero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              onSearchSubmit={handleSearchSubmit}
            />

            <CategoryGrid
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catName) => {
                setSelectedCategory(catName);
                if (catName) handleSearchSubmit();
              }}
            />

            <FeaturedProviders
              providers={filteredProviders}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectProvider={setSelectedProvider}
              onResetFilters={handleResetFilters}
            />

            <HowItWorks onGetStarted={() => handleOpenAuth('register')} />
          </>
        )}
      </main>

      {/* Footer */}
      {activeRoleView === 'customer' && (
        <Footer
          categories={categories}
          onSelectCategory={(catName) => {
            setSelectedCategory(catName);
            handleSearchSubmit();
          }}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <ProviderDetailModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onBookingSuccess={() => {
          // Keep modal open with success message or let user open appointments
        }}
      />

      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
      />

      {/* Global Toast Alerts */}
      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
