import { Menu, MessageCircle, Moon, Search, ShoppingBag, Sun, User, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import clsx from 'clsx';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onOpenMuse: () => void;
  onOpenSearch: () => void;
}

const NAV: { to: string; label: string }[] = [
  { to: '/plans/electricity', label: 'Electricity' },
  { to: '/plans/gas', label: 'Gas' },
  { to: '/plans/broadband', label: 'Broadband' },
  { to: '/plans/mobile', label: 'Mobile' },
  { to: '/plans/bundles', label: 'Bundles' },
  { to: '/plans/smart-home', label: 'Smart Home' },
  { to: '/plans/insurance', label: 'Insurance' },
  { to: '/blog', label: 'Insights' },
];

export default function Header({
  darkMode,
  onToggleDark,
  onOpenMuse,
  onOpenSearch,
}: HeaderProps) {
  const { count } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200 dark:bg-slate-900/90 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="grid place-items-center h-9 w-9 rounded-lg gradient-hero text-white">
              <Zap className="w-5 h-5" />
            </span>
            <span className="font-bold text-lg tracking-tight text-[#062f66] dark:text-blue-300">NovaPower</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 mr-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 rounded-md text-sm font-medium transition',
                    isActive
                      ? 'text-[#0a4ea8] bg-[#e9f2ff] dark:text-blue-400 dark:bg-blue-900/30'
                      : 'text-gray-700 hover:text-[#0a4ea8] hover:bg-[#f5faff] dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onOpenMuse}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border border-[#0a4ea8] text-[#0a4ea8] hover:bg-[#e9f2ff] dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <MessageCircle className="w-4 h-4" />
              Ask NovaBot
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={onOpenSearch}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-[#0a4ea8] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={onToggleDark}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/account"
              aria-label="Account"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              title="My account"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#cc0000] text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="lg:hidden py-2 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                onOpenSearch();
              }}
              className="w-full mb-2 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
            >
              <Search className="w-4 h-4" />
              Search plans, devices, FAQs…
            </button>
            <div className="grid grid-cols-2 gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'text-[#0a4ea8] bg-[#e9f2ff] dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-gray-700 hover:bg-[#f5faff] dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800',
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
