import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Database, Code, Heart, Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black/40 border-t border-white/10 mt-20 text-gray-400 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Project Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                CineSuggest
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-600/10 text-red-400 font-bold border border-red-600/20">
                MovieMind v1.0
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              An AI-powered content-based movie recommendation system built for a college Data Science showcase. Employs multi-feature similarity scoring across genres, ratings, keywords, popularity, and release epochs.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-red-500" /> TMDB-Ready Schema
              </span>
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-amber-400" /> Modular ML Pipeline
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-red-500 transition-colors">
                  Browse All Movies
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  Recommendation Engine
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-red-500 transition-colors">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Science & Documentation */}
          <div>
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">
              Data Science
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/analytics" className="hover:text-red-500 transition-colors">
                  Dataset Analytics & Visuals
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-red-500 transition-colors">
                  Mathematical Methodology
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-red-500 transition-colors">
                  User Preferences & History
                </Link>
              </li>
              <li>
                <a
                  href="#algorithm-math"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/about#algorithm-math';
                  }}
                  className="hover:text-red-500 transition-colors"
                >
                  Scoring Weights (40/25/15/10/10)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 MovieMind – CineSuggest. Built for College Data Science Capstone Presentation.</p>
          <div className="flex items-center gap-1">
            <span>Powered by Content-Based Filtering &</span>
            <span className="text-red-500 font-semibold">Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
