import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Clock } from 'lucide-react';
import { Movie } from '../types';
import { Rating } from './Rating';
import { useApp } from '../context/AppContext';
import { FALLBACK_POSTER } from '../data/movies';

interface MovieCardProps {
  movie: Movie;
  compact?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, compact = false }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const [imgSrc, setImgSrc] = useState(movie.poster);
  const favorite = isFavorite(movie.id);

  return (
    <div
      id={`movie-card-${movie.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-lg hover:border-red-600/50 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
        <img
          src={imgSrc}
          alt={movie.title}
          onError={() => setImgSrc(FALLBACK_POSTER)}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Floating Rating Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Rating value={movie.rating} size="sm" />
        </div>

        {/* Floating Favorite Button */}
        <button
          id={`btn-fav-${movie.id}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(movie.id);
          }}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
            favorite
              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
              : 'bg-black/50 border-white/10 text-gray-300 hover:text-red-500 hover:bg-white/10'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`}
          />
        </button>

        {/* Quick Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Runtime pill */}
        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 text-[11px] font-medium text-gray-300 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{movie.runtime}m</span>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Year and Primary Genre */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          <span className="font-bold text-red-500 tracking-wide">
            {movie.genres[0]}
          </span>
          <span className="text-gray-400 font-medium">{movie.year}</span>
        </div>

        {/* Title */}
        <Link
          to={`/movie/${movie.id}`}
          className="font-bold text-gray-100 text-sm sm:text-base hover:text-red-500 transition-colors line-clamp-1 mb-1"
          title={movie.title}
        >
          {movie.title}
        </Link>

        {/* Short Overview (hidden if compact) */}
        {!compact && (
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
            {movie.overview}
          </p>
        )}

        {/* Genre Badges */}
        <div className="mt-auto pt-2 flex flex-wrap gap-1.5 items-center">
          {movie.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10"
            >
              {g}
            </span>
          ))}

          <Link
            to={`/movie/${movie.id}`}
            className="ml-auto text-xs font-semibold text-gray-300 hover:text-red-500 flex items-center gap-1 group/btn"
          >
            Details
            <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
