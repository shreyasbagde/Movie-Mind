import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Film,
  Star,
  Flame,
  Award,
  Database,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  GenreDistributionChart,
  RatingDistributionChart,
  YearDistributionChart,
} from '../components/Charts';
import { AnalyticsData, Movie } from '../types';
import { recommendationService } from '../services/recommendationService';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await recommendationService.getAnalytics();
      const movies = await recommendationService.getAllMovies();
      setAnalytics(data);
      setAllMovies(movies);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Exploratory Data Analysis (EDA)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Movie Dataset Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Statistical distribution, feature engineering metrics, and corpus attributes powering the MovieMind recommendation engine.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 backdrop-blur-md">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Local Corpus + TMDB Parity</span>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Movies */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Movies
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/20">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1">
            {analytics.totalMovies}
          </div>
          <span className="text-xs text-gray-400">Curated high-dimension titles</span>
        </div>

        {/* Card 2: Average Rating */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Average Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-1">
            {analytics.averageRating} <span className="text-lg text-gray-500 font-semibold">/ 10</span>
          </div>
          <span className="text-xs text-gray-400">Weighted IMDB/TMDB scale</span>
        </div>

        {/* Card 3: Most Popular Genre */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Top Genre
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mb-1 truncate">
            {analytics.mostPopularGenre}
          </div>
          <span className="text-xs text-gray-400">Highest frequency feature</span>
        </div>

        {/* Card 4: Highest Rated Movie */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Top Rated Title
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-1">
            {analytics.highestRatedMovie.title}
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            {analytics.highestRatedMovie.rating} ⭐ Rating
          </span>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Movies by Genre */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-white">Movies by Genre</h3>
              <p className="text-xs text-gray-400">Frequency distribution across multi-genre tags</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-medium">
              Categorical Feature
            </span>
          </div>
          <GenreDistributionChart data={analytics.genresDistribution} />
        </div>

        {/* Chart 2: Rating Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-white">Rating Distribution</h3>
              <p className="text-xs text-gray-400">Distribution histogram of viewer and critic scores</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-medium">
              Numerical Continuous
            </span>
          </div>
          <RatingDistributionChart data={analytics.ratingsDistribution} />
        </div>
      </div>

      {/* Chart 3: Movies by Release Year */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-white">Release Era Temporal Trend</h3>
            <p className="text-xs text-gray-400">Distribution of titles across cinematic chronological eras</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-medium">
            Temporal Axis
          </span>
        </div>
        <YearDistributionChart data={analytics.yearDistribution} />
      </div>

      {/* Data Science Table: Top 10 Dataset Records */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-white">Sample Training Corpus (Top Titles)</h3>
            <p className="text-xs text-gray-400">Normalized features ready for cosine & Jaccard matrix operations</p>
          </div>
          <Link
            to="/movies"
            className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
          >
            <span>View Full {allMovies.length} Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/60 uppercase text-[11px] font-bold text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Genres</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Popularity</th>
                <th className="py-3 px-4">Director</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {allMovies.slice(0, 8).map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Link to={`/movie/${m.id}`} className="hover:text-red-400">
                      {m.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{m.year}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {m.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] text-gray-300"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">{m.rating} ⭐</td>
                  <td className="py-3 px-4 text-gray-400">{m.popularity}</td>
                  <td className="py-3 px-4 text-gray-300">{m.director}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
