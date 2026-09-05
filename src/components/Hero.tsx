import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Play, Star, Flame } from 'lucide-react';
import { Movie } from '../types';
import { SearchBar } from './SearchBar';

interface HeroProps {
  featuredMovie?: Movie;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredMovie,
  searchQuery,
  onSearchChange,
}) => {
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/70" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl px-6 py-14 sm:py-20 md:py-24 lg:px-12 flex flex-col items-start">
        {/* Project Tag / Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs sm:text-sm font-semibold mb-5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Intelligent Content-Based Filtering & Machine Learning</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-4">
          Discover Your Next <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
            Favorite Movie
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-sm sm:text-lg max-w-2xl font-normal leading-relaxed mb-8">
          Get personalized movie recommendations powered by intelligent multi-feature
          similarity algorithms, genre matching, and data science insights.
        </p>

        {/* Search Bar in Hero */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mb-8">
          <div className="flex gap-2">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search movies by title, genre, director..."
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
            <span>Explore Movies</span>
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
                Trending Spotlight
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
