import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Sparkles, Compass, LogIn, UserCheck } from 'lucide-react';
import { MovieGrid } from '../components/MovieGrid';
import { useApp } from '../context/AppContext';

export const Favorites: React.FC = () => {
  const { favoriteMovies, favorites, toggleFavorite, addToast, isLoggedIn, openAuthModal, currentUser } = useApp();

  const [confirmClear, setConfirmClear] = React.useState(false);

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    favorites.forEach((id) => toggleFavorite(id));
    setConfirmClear(false);
    addToast('Cleared all favorites', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Saved Watchlist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Favorite Movies
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLoggedIn
              ? `Personalized collection saved for ${currentUser?.name || 'you'}.`
              : 'Sign in to your account to save movies and view your personalized favorites list.'}
          </p>
        </div>

        {isLoggedIn && favoriteMovies.length > 0 && (
          <div className="flex items-center gap-3">
            <Link
              to="/recommendations"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:border-red-500/60 text-gray-200 hover:text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Recommend from Favorites</span>
            </Link>

            <button
              onClick={handleClearAll}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all ${
                confirmClear
                  ? 'bg-red-600/30 border-red-500 text-red-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmClear ? 'Click to Confirm Clear' : 'Clear All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* State Switch: 1. Guest (Not Logged In) -> Sign In Banner */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto my-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-red-600/15 blur-[60px] pointer-events-none rounded-full" />
          
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center mb-5 shadow-lg shadow-red-600/20">
            <LogIn className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            Sign In to Manage Your Favorites
          </h2>
          <p className="text-gray-300 text-sm max-w-lg mb-8 leading-relaxed">
            You must be logged in to add movies to your Favorites List, sync them across devices, and generate AI recommendations based on what you love.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              id="favorites-btn-signin"
              onClick={() => openAuthModal({ mode: 'signin' })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>
            <button
              id="favorites-btn-register"
              onClick={() => openAuthModal({ mode: 'signup' })}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105"
            >
              <UserCheck className="w-4 h-4 text-gray-300" />
              <span>Create Free Account</span>
            </button>
            <Link
              to="/movies"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-sm border border-white/10 backdrop-blur-md transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Movie Catalog</span>
            </Link>
          </div>
        </div>
      ) : favoriteMovies.length === 0 ? (
        /* State 2: Logged in, but 0 favorites yet */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto my-12 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 text-gray-400 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Favorites Saved Yet</h2>
          <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
            Click the heart icon on any movie poster or details page to build your personalized watchlist.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/movies"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Movies</span>
            </Link>
            <Link
              to="/recommendations"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Get Recommendations</span>
            </Link>
          </div>
        </div>
      ) : (
        /* State 3: Logged in with favorite movies */
        <MovieGrid movies={favoriteMovies} />
      )}
    </div>
  );
};
