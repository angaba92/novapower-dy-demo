import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import MuseChatOverlay from './components/MuseChatOverlay';
import VisualSearchOverlay from './components/VisualSearchOverlay';
import SearchOverlay from './components/SearchOverlay';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import PlanDetailPage from './pages/PlanDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import SearchResultsPage from './pages/SearchResultsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

import { useDYContext } from './hooks/useDYContext';

export default function App() {
  const [museOpen, setMuseOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [visualSearchProductImage, setVisualSearchProductImage] = useState<string | undefined>();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('np_dark_mode') === 'true');

  const location = useLocation();

  // [DY INTEGRATION] Push a page-context update to DY on every route change.
  // This is the equivalent of the standard DY context script `DY.recommendationContext`
  // call. The hook detects page type from the URL and updates window.DY accordingly.
  useDYContext();

  const handleVisualSearch = (productImageUrl?: string) => {
    setVisualSearchProductImage(productImageUrl);
    setVisualSearchOpen(true);
  };

  const toggleDark = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('np_dark_mode', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faff] dark:bg-slate-900 dark:text-slate-100">
      <Header
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onOpenMuse={() => setMuseOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onVisualSearch={handleVisualSearch} />} />
          <Route
            path="/plans/:category"
            element={<CategoryPage onVisualSearch={handleVisualSearch} />}
          />
          <Route
            path="/plan/:sku"
            element={<PlanDetailPage onVisualSearch={handleVisualSearch} />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route
            path="/search"
            element={<SearchResultsPage onVisualSearch={handleVisualSearch} />}
          />
        </Routes>
      </main>

      <Footer />

      <AnimatePresence>
        {museOpen && <MuseChatOverlay onClose={() => setMuseOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            onClose={() => setSearchOpen(false)}
            onOpenVisualSearch={() => handleVisualSearch(undefined)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {visualSearchOpen && (
          <VisualSearchOverlay
            productImageUrl={visualSearchProductImage}
            onClose={() => {
              setVisualSearchOpen(false);
              setVisualSearchProductImage(undefined);
            }}
          />
        )}
      </AnimatePresence>

      {/* Re-mount routes-aware effect when location changes (forces DY context update) */}
      <span data-route={location.pathname} className="hidden" />
    </div>
  );
}
