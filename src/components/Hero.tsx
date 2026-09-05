import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Play, Star, Flame, Film } from 'lucide-react';
import { Movie } from '../types';
import { SearchBar } from './SearchBar';
import { INDUSTRIES } from '../utils/movieHelpers';

interface HeroProps {
  featuredMovie?: Movie;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  selectedIndustry?: string;
  onSelectIndustry?: (industry: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredMovie,
  searchQuery,
  onSearchChange,
  selectedIndustry = 'All',
  onSelectIndustry,
}) => {
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const backdropUrl =
    featuredMovie?.backdrop ||
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg mb-12 shadow-2xl">
      {/* Background Image with Deep Cinematic Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={backdropUrl}
          alt="Hero Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/75" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl px-6 py-12 sm:py-16 md:py-20 lg:px-12 flex flex-col items-start">
        {/* Project Tag / Indian & Global Cinema Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Indian Cinema & Global Discovery • 6-Weight ML Engine</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-3">
          Discover Blockbusters Across <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
            Indian & Global Cinema
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-6">
          Personalized recommendations spanning Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood & Hollywood — powered by multi-feature genre, language, and industry similarity algorithms.
        </p>

        {/* Industry Filter Quick Tabs */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>Industries:</span>
            </span>
            {INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustry === ind;
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => {
                    if (onSelectIndustry) {
                      onSelectIndustry(ind);
                    } else {
                      navigate(`/movies?industry=${encodeURIComponent(ind)}`);
                    }
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap border shrink-0 ${
                    isSelected
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-black/60 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {ind === 'Tollywood'
                    ? 'Tollywood (Telugu)'
                    : ind === 'Kollywood'
                    ? 'Kollywood (Tamil)'
                    : ind === 'Mollywood'
                    ? 'Mollywood (Malayalam)'
                    : ind === 'Sandalwood'
                    ? 'Sandalwood (Kannada)'
                    : ind}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar in Hero */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mb-6">
          <div className="flex gap-2">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by actor (Prabhas, SRK), director, language, industry..."
              className="shadow-lg"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/25 flex-shrink-0 hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <Link
            id="hero-btn-recommendations"
            to="/recommendations"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-red-600/25 hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Get Recommendations</span>
          </Link>

          <Link
            id="hero-btn-explore"
            to="/movies"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4 text-gray-300" />
            <span>Browse All Movies</span>
          </Link>
        </div>

        {/* Featured Spotlight Card */}
        {featuredMovie && (
          <div className="mt-2 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl max-w-md">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600/20 text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                Trending Spotlight • {featuredMovie.industry || 'Cinema'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-100 truncate block">
                {featuredMovie.title} ({featuredMovie.year})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{featuredMovie.rating}</span>
            </div>
            <Link
              to={`/movie/${featuredMovie.id}`}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
              title="Watch preview"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
