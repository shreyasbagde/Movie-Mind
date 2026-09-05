import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Award, Flame, ArrowRight, Film } from 'lucide-react';
import { Hero } from '../components/Hero';
import { MovieCard } from '../components/MovieCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { Movie, RecommendationResult } from '../types';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { userPreferences } = useApp();
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [personalizedRecs, setPersonalizedRecs] = useState<RecommendationResult[]>([]);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const movies = await recommendationService.getAllMovies();
      setAllMovies(movies);

      // Trending: sort by popularity and recent rating
      const trending = [...movies].sort((a, b) => b.popularity * 0.6 + b.rating * 4 - (a.popularity * 0.6 + a.rating * 4)).slice(0, 8);
      setTrendingMovies(trending);

      // Popular: highest popularity
      const popular = [...movies].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
      setPopularMovies(popular);

      // Personalized Recommendations based on user's current preferences
      const recs = await recommendationService.getRecommendations(userPreferences, 6);
      setPersonalizedRecs(recs);

      setLoading(false);
    };

    loadData();
  }, [userPreferences]);

  const featuredMovie = allMovies.find((m) => m.featured) || allMovies[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
      {/* Cinematic Hero Banner */}
      <Hero
        featuredMovie={featuredMovie}
        searchQuery={heroSearchQuery}
        onSearchChange={setHeroSearchQuery}
      />

      {/* Section 1: Trending Movies */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>What People Are Watching</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trending Movies
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

        {/* Horizontal scroll on mobile / responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingMovies.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Section 2: Popular Movies */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Highest Rated & Acclaimed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Popular Classics & Hits
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

      {/* Section 3: Recommended For You */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Intelligent Content-Based Match</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Recommended For You
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Based on your favorite genres ({userPreferences.favoriteGenres.join(', ')}) and preferred {userPreferences.preferredRating}+ rating.
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

      {/* Interactive CTA Banner for Project Showcase */}
      <section className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
            College Data Science Project
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Does the Algorithm Predict Your Taste?
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            MovieMind analyzes movie metadata with normalized multi-feature similarity scoring. Dive into the live recommendation engine or view our analytical dataset distribution charts.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/recommendations"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
            >
              Test Recommendation Engine
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
