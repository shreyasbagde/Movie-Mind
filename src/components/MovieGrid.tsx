import React from 'react';
import { Film, RefreshCcw } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  emptyMessage?: string;
  onResetFilters?: () => void;
  compact?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading = false,
  emptyMessage = 'No movies found matching your criteria.',
  onResetFilters,
  compact = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md animate-pulse"
          >
            <div className="aspect-[2/3] w-full bg-white/5" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md my-8">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No movies found</h3>
        <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Clear Filters & Reset</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} compact={compact} />
      ))}
    </div>
  );
};
