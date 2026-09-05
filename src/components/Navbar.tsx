import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  Sparkles,
  Heart,
  BarChart2,
  Info,
  User,
  Menu,
  X,
  Search,
  Compass,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, setIsAiModalOpen, currentUser, isLoggedIn, openAuthModal, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Film },
    { path: '/movies', label: 'Movies', icon: Compass },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles, highlight: true },
    { path: '/favorites', label: 'Favorites', icon: Heart, badge: favorites.length },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/about', label: 'About', icon: Info },
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setIsSearchOpen(false);
      setMobileMenuOpen(false);
      setQuickSearch('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              aria-label="MovieMind Home"
            >
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-red-600/25 group-hover:scale-105 transition-transform">
                <span className="select-none">🎬</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-red-500 transition-colors">
                  MovieMind
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all ${
                      active
                        ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="ml-1 text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">
                        AI
                      </span>
                    )}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search trigger / input on desktop */}
            <div className="relative hidden md:block">
              <form onSubmit={handleQuickSearchSubmit} className="relative">
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Search movies..."
                  className="w-44 lg:w-56 pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-100 placeholder-gray-500 focus:w-64 focus:ring-2 focus:ring-red-600 focus:border-red-600/50 outline-none backdrop-blur-md transition-all duration-200"
                />
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              </form>
            </div>

            {/* Ask AI Button (Gemini Movie Advisor) */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
              title="Open CineSuggest AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-black ml-0.5">
                AI
              </span>
            </button>

            {/* Authentication Control: Sign In Button or User Menu */}
            {!isLoggedIn ? (
              <button
                id="navbar-btn-signin"
                onClick={() => openAuthModal({ mode: 'signin' })}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs sm:text-sm font-bold backdrop-blur-md shadow-lg shadow-black/30 transition-all hover:scale-105 active:scale-95"
                title="Sign in to save movies to your favorites list"
              >
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                    location.pathname === '/profile'
                      ? 'bg-red-600/15 border-red-500/40 text-red-500'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Logged in as ${currentUser?.name}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-red-600/25 border border-red-500/40 text-red-400 font-bold flex items-center justify-center text-xs">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentUser?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold max-w-[90px] truncate">
                    {currentUser?.name}
                  </span>
                </Link>

                <button
                  id="navbar-btn-signout"
                  onClick={logout}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-white/10 backdrop-blur-md transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white backdrop-blur-md"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white backdrop-blur-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-white/10">
            <form onSubmit={handleQuickSearchSubmit} className="relative">
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Search movies by title, genre, director..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </form>
          </div>
        )}

        {/* Mobile Hamburger Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 space-y-2 bg-black/40 backdrop-blur-xl">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile Auth Button */}
            <div className="pt-3 mt-2 border-t border-white/10 px-2">
              {!isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({ mode: 'signin' });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Save Favorites</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center text-xs">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-tight">{currentUser?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{currentUser?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
