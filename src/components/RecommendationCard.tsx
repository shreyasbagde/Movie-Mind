import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';
import { RecommendationResult } from '../types';
import { Rating } from './Rating';
import { useApp } from '../context/AppContext';
import { FALLBACK_POSTER } from '../data/movies';

interface RecommendationCardProps {
  result: RecommendationResult;
  rank?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ result, rank }) => {
  const { movie, score, breakdown, explanation, matchReasons } = result;
  const { isFavorite, toggleFavorite } = useApp();
  const [imgSrc, setImgSrc] = useState(movie.poster);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const favorite = isFavorite(movie.id);

  // Score styling logic
  const getScoreColor = (sc: number) => {
    if (sc >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 backdrop-blur-md';
    if (sc >= 80) return 'text-red-400 border-red-500/40 bg-red-950/40 backdrop-blur-md';
    return 'text-amber-400 border-amber-500/40 bg-amber-950/40 backdrop-blur-md';
  };

  return (
    <div
      id={`rec-card-${movie.id}`}
      className="group relative flex flex-col sm:flex-row bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:border-red-600/40 hover:bg-white/[0.08] transition-all duration-300 shadow-xl"
    >
      {/* Rank Indicator Badge */}
      {rank !== undefined && (
        <div className="absolute top-3 left-3 z-20 w-7 h-7 rounded-full bg-black/60 border border-white/15 text-xs font-black text-white flex items-center justify-center shadow-lg backdrop-blur-md">
          #{rank}
        </div>
      )}

      {/* Poster Section */}
      <div className="relative w-full sm:w-48 sm:min-w-[12rem] aspect-[2/3] sm:aspect-auto overflow-hidden bg-black/60 flex-shrink-0">
        <img
          src={imgSrc}
          alt={movie.title}
          onError={() => setImgSrc(FALLBACK_POSTER)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />

        {/* Favorite Button on Mobile */}
        <button
          onClick={() => toggleFavorite(movie.id)}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`sm:hidden absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border ${
            favorite ? 'bg-red-600 border-red-500 text-white' : 'bg-black/60 border-white/10 text-gray-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header with Title & Match Score Badge */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-red-500">{movie.genres.join(', ')}</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-xs text-gray-400 font-medium">{movie.year}</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-xs text-gray-400 font-medium">{movie.runtime}m</span>
            </div>
            <Link
              to={`/movie/${movie.id}`}
              className="text-lg sm:text-xl font-bold text-white hover:text-red-500 transition-colors line-clamp-1"
            >
              {movie.title}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Recommendation Score Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-black ${getScoreColor(
                score
              )} shadow-sm`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{score}% Match</span>
            </div>

            {/* Favorite Button on Desktop */}
            <button
              onClick={() => toggleFavorite(movie.id)}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`hidden sm:flex p-2 rounded-xl border backdrop-blur-md transition-all ${
                favorite
                  ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-500 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rating and Director */}
        <div className="flex items-center gap-3 mb-3">
          <Rating value={movie.rating} size="sm" />
          <span className="text-xs text-gray-400">
            Directed by <span className="text-gray-200 font-medium">{movie.director}</span>
          </span>
        </div>

        {/* Overview */}
        <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">
          {movie.overview}
        </p>

        {/* Highlighted Match Explanation Card */}
        <div className="mb-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-start gap-2.5">
            <span className="text-base select-none">🎯</span>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-200 mb-1">
                {explanation}
              </p>
              {matchReasons && matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-medium border border-white/10"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mathematical Breakdown Toggle (Data Science feature) */}
        <div className="mt-auto pt-2 border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>{showBreakdown ? 'Hide Scoring Math' : 'View Feature Breakdown'}</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <Link
              to={`/movie/${movie.id}`}
              className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 group/btn"
            >
              View Full Details
              <span className="transition-transform group-hover/btn:translate-x-1">→</span>
            </Link>
          </div>

          {/* Expanded Mathematical Weights */}
          {showBreakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 pb-1 text-[11px] bg-black/50 p-3 rounded-xl border border-white/10 backdrop-blur-md">
              <div>
                <span className="text-gray-400 block">Genre (40%)</span>
                <span className="font-bold text-white">{breakdown.genreScore} / 40</span>
              </div>
              <div>
                <span className="text-gray-400 block">Rating (25%)</span>
                <span className="font-bold text-white">{breakdown.ratingScore} / 25</span>
              </div>
              <div>
                <span className="text-gray-400 block">Keywords (15%)</span>
                <span className="font-bold text-white">{breakdown.keywordScore} / 15</span>
              </div>
              <div>
                <span className="text-gray-400 block">Popularity (10%)</span>
                <span className="font-bold text-white">{breakdown.popularityScore} / 10</span>
              </div>
              <div>
                <span className="text-gray-400 block">Era/Year (10%)</span>
                <span className="font-bold text-white">{breakdown.yearScore} / 10</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
