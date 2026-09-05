import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, Film } from 'lucide-react';
import { Hero } from '../components/Hero';
import { MovieCard } from '../components/MovieCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { Movie, RecommendationResult } from '../types';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';
import { INDUSTRIES, getIndustryBadge } from '../utils/movieHelpers';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userPreferences } = useApp();
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [trendingInIndiaMovies, setTrendingInIndiaMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [personalizedRecs, setPersonalizedRecs] = useState<RecommendationResult[]>([]);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const movies = await recommendationService.getAllMovies();
      setAllMovies(movies);

      // 1. Trending in India (Pushpa 2, Jawan, Kalki 2898 AD, KGF 2, RRR, Stree 2, etc.)
      const indiaTrending = await recommendationService.getTrendingInIndia();
      setTrendingInIndiaMovies(indiaTrending);

      // 2. Overall Trending: highest popularity & rating
      const trending = [...movies]
        .sort((a, b) => b.popularity * 0.6 + b.rating * 4 - (a.popularity * 0.6 + a.rating * 4))
        .slice(0, 8);
      setTrendingMovies(trending);

      // 3. Popular Classics & Modern Hits
      const popular = [...movies].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
      setPopularMovies(popular);

      // 4. Personalized Recommendations based on user's current preferences
      const recs = await recommendationService.getRecommendations(userPreferences, 6);
      setPersonalizedRecs(recs);

      setLoading(false);
    };

    loadData();
  }, [userPreferences]);

  const featuredMovie =
    allMovies.find((m) => m.title.includes('RRR')) ||
    allMovies.find((m) => m.featured) ||
    allMovies[0];

  // Filtered view if user toggles category filter on Home
  const displayedIndustryMovies =
    selectedIndustry === 'All'
      ? []
      : allMovies
          .filter((m) => (m.industry || '').toLowerCase() === selectedIndustry.toLowerCase())
          .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
      {/* Cinematic Hero Banner with Indian + Hollywood focus */}
      <Hero
        featuredMovie={featuredMovie}
        searchQuery={heroSearchQuery}
        onSearchChange={setHeroSearchQuery}
        selectedIndustry={selectedIndustry}
        onSelectIndustry={(ind) => setSelectedIndustry(ind)}
      />

      {/* Category Filter Pills on Home Page */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Film className="w-4 h-4" />
              <span>Cinema Categories</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Explore by Film Industry
            </h2>
          </div>
          <Link
            to="/movies"
            className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Industry Category Badges */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {INDUSTRIES.map((ind) => {
            const isSelected = selectedIndustry === ind;
            const badge = ind !== 'All' ? getIndustryBadge(ind) : null;
            const displayLabel =
              ind === 'Tollywood'
                ? 'Tollywood (Telugu)'
                : ind === 'Kollywood'
                ? 'Kollywood (Tamil)'
                : ind === 'Mollywood'
                ? 'Mollywood (Malayalam)'
                : ind === 'Sandalwood'
                ? 'Sandalwood (Kannada)'
                : ind;

            return (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all whitespace-nowrap border shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {badge && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ind === 'Bollywood'
                        ? 'bg-amber-400'
                        : ind === 'Tollywood'
                        ? 'bg-rose-400'
                        : ind === 'Kollywood'
                        ? 'bg-emerald-400'
                        : ind === 'Mollywood'
                        ? 'bg-blue-400'
                        : ind === 'Sandalwood'
                        ? 'bg-violet-400'
                        : 'bg-red-400'
                    }`}
                  />
                )}
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>

        {/* If an industry filter is active on Home, display its movies */}
        {selectedIndustry !== 'All' && displayedIndustryMovies.length > 0 && (
          <div className="pt-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-200">
                Top {selectedIndustry} Picks
              </h3>
              <Link
                to={`/movies?industry=${encodeURIComponent(selectedIndustry)}`}
                className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1"
              >
                View all {selectedIndustry} movies →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {displayedIndustryMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 1: 🔥 Trending in India */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              <span>India Box Office & Streaming Sensations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Trending in India</span>
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                Top Hits
              </span>
            </h2>
          </div>
          <Link
            to="/movies?industry=Bollywood"
            className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 group"
          >
            <span>Explore Indian Cinema</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trending in India Grid with Ranking badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5">
          {trendingInIndiaMovies.slice(0, 6).map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} ranking={index + 1} />
          ))}
        </div>
      </section>

      {/* Section 2: Global Trending Blockbusters */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Most Watched Globally & Domestically</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Top Blockbusters
            </h2>
          </div>
          <Link
            to="/movies?sort=popularity"
            className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingMovies.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Section 3: Recommended For You (Multi-Feature algorithm) */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <span>6-Dimensional Recommendation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Recommended For You
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Matching your preferences: {userPreferences.favoriteGenres.join(', ')} • {userPreferences.preferredLanguage || 'All Languages'} • {userPreferences.preferredIndustry || 'All Industries'}.
            </p>
          </div>

          <Link
            to="/recommendations"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:border-red-500/60 text-gray-200 text-xs sm:text-sm font-bold transition-all hover:bg-white/15 backdrop-blur-md flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Customize Preferences</span>
          </Link>
        </div>

        <div className="space-y-4">
          {personalizedRecs.slice(0, 3).map((rec, idx) => (
            <RecommendationCard key={rec.movie.id} result={rec} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* Section 4: Highly Acclaimed Masterpieces */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Critically Acclaimed Cinema</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Critically Acclaimed Hits
            </h2>
          </div>
          <Link
            to="/movies?sort=rating"
            className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {popularMovies.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Interactive CTA Banner for Project Showcase */}
      <section className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
            Intelligent Multi-Feature ML System
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Next-Generation Cinema Discovery
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            MovieMind unifies Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood, and Hollywood with normalized multi-feature similarity scoring across Genre, Language, Industry, Rating, Popularity, and Temporal Era.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/recommendations"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
            >
              Try Live Recommendations
            </Link>
            <Link
              to="/analytics"
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105"
            >
              View Dataset Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
