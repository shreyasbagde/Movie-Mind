import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Sparkles, Compass } from 'lucide-react';
import { MovieGrid } from '../components/MovieGrid';
import { useApp } from '../context/AppContext';

export const Favorites: React.FC = () => {
  const { favoriteMovies, favorites, toggleFavorite, addToast } = useApp();

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    if (window.confirm('Are you sure you want to remove all movies from your favorites?')) {
      favorites.forEach((id) => toggleFavorite(id));
      addToast('Cleared all favorites', 'info');
    }
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
            Movies you saved for later. Stored permanently in your browser&rsquo;s local storage.
          </p>
        </div>

        {favoriteMovies.length > 0 && (
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty or Loaded state */}
      {favoriteMovies.length === 0 ? (
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
        <MovieGrid movies={favoriteMovies} />
      )}
    </div>
  );
};
