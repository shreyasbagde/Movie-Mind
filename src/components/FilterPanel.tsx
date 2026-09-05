import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Star, Calendar } from 'lucide-react';
import { FilterOptions } from '../types';
import { ALL_GENRES } from '../data/movies';

interface FilterPanelProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  totalResults: number;
}

const LANGUAGES = ['All', 'English', 'Japanese', 'Korean', 'Spanish', 'French'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, totalResults }) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handleReset = () => {
    onChange({
      searchQuery: '',
      genre: 'All',
      minRating: 0,
      releaseYearRange: [1940, 2026],
      language: 'All',
      sortBy: 'popularity',
    });
  };

  const hasActiveFilters =
    filters.genre !== 'All' ||
    filters.minRating > 0 ||
    filters.language !== 'All' ||
    filters.releaseYearRange[0] > 1940 ||
    filters.releaseYearRange[1] < 2026 ||
    filters.sortBy !== 'popularity';

  return (
    <div className="w-full bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
      {/* Header bar: title + toggle on mobile + total count */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-sm sm:text-base text-gray-100">
            Filter & Sort Movies
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-medium">
            {totalResults} {totalResults === 1 ? 'movie' : 'movies'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors font-medium px-2.5 py-1 rounded-lg hover:bg-white/10"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="md:hidden flex items-center gap-1 text-xs font-semibold text-gray-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md"
          >
            <span>{isOpenMobile ? 'Hide Filters' : 'Show Filters'}</span>
            {isOpenMobile ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Controls (Collapsible on mobile) */}
      <div className={`mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${
        isOpenMobile ? 'block' : 'hidden md:grid'
      }`}>
        {/* Genre Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => onChange({ ...filters, genre: e.target.value })}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md transition-colors"
          >
            <option value="All">All Genres</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-1.5">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              Min Rating
            </span>
            <span className="text-amber-400 font-bold">{filters.minRating > 0 ? `${filters.minRating} ⭐` : 'Any'}</span>
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md transition-colors"
          >
            <option value={0}>Any Rating</option>
            <option value={7}>7.0+ Good</option>
            <option value={8}>8.0+ Great</option>
            <option value={8.5}>8.5+ Exceptional</option>
            <option value={9}>9.0+ Masterpiece</option>
          </select>
        </div>

        {/* Release Era Filter */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-gray-300 mb-1.5">
            <Calendar className="w-3 h-3 text-red-500" />
            Release Era
          </label>
          <select
            value={
              filters.releaseYearRange[0] === 2020
                ? '2020s'
                : filters.releaseYearRange[0] === 2010
                ? '2010s'
                : filters.releaseYearRange[0] === 2000
                ? '2000s'
                : filters.releaseYearRange[1] <= 1999
                ? 'classics'
                : 'all'
            }
            onChange={(e) => {
              const val = e.target.value;
              let range: [number, number] = [1940, 2026];
              if (val === '2020s') range = [2020, 2026];
              if (val === '2010s') range = [2010, 2019];
              if (val === '2000s') range = [2000, 2009];
              if (val === 'classics') range = [1940, 1999];
              onChange({ ...filters, releaseYearRange: range });
            }}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md transition-colors"
          >
            <option value="all">All Release Years</option>
            <option value="2020s">2020 - Present</option>
            <option value="2010s">2010 - 2019</option>
            <option value="2000s">2000 - 2009</option>
            <option value="classics">Classics (Pre-2000)</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md transition-colors"
          >
            <option value="popularity">Popularity (Most Popular)</option>
            <option value="rating">Rating (Highest Rated)</option>
            <option value="newest">Release Date (Newest First)</option>
            <option value="title">Alphabetical (A – Z)</option>
          </select>
        </div>
      </div>

      {/* Language quick chips */}
      <div className={`mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 ${
        isOpenMobile ? 'flex' : 'hidden md:flex'
      }`}>
        <span className="text-xs text-gray-400 font-medium mr-1">Language:</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onChange({ ...filters, language: lang })}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium border ${
              filters.language === lang
                ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};
