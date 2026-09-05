import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Search, SlidersHorizontal } from 'lucide-react';
import { FilterPanel } from '../components/FilterPanel';
import { MovieGrid } from '../components/MovieGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterOptions, Movie } from '../types';
import { recommendationService } from '../services/recommendationService';

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from search params if present
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialSort = (searchParams.get('sort') as FilterOptions['sortBy']) || 'popularity';

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: initialQuery,
    genre: initialGenre,
    minRating: 0,
    releaseYearRange: [1940, 2026],
    language: 'All',
    sortBy: initialSort,
  });

  // Sync state if URL query param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.searchQuery) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const results = recommendationService.filterMovies(filters);
    setFilteredMovies(results);
    setLoading(false);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      genre: 'All',
      minRating: 0,
      releaseYearRange: [1940, 2026],
      language: 'All',
      sortBy: 'popularity',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Film className="w-4 h-4" />
            <span>Catalogue & Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Browse All Movies
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Explore our curated dataset of cinematic milestones with multi-criteria filtering, instant title/director search, and rating thresholds.
          </p>
        </div>

        <div className="w-full md:w-80">
          <SearchBar
            value={filters.searchQuery}
            onChange={(q) => {
              setFilters({ ...filters, searchQuery: q });
              if (q) setSearchParams({ q });
              else setSearchParams({});
            }}
            placeholder="Search by title, director, keyword..."
          />
        </div>
      </div>

      {/* Filter and Sorting Panel */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        totalResults={filteredMovies.length}
      />

      {/* Movies Grid */}
      <MovieGrid
        movies={filteredMovies}
        loading={loading}
        onResetFilters={handleResetFilters}
        emptyMessage={
          filters.searchQuery
            ? `No movies found matching "${filters.searchQuery}". Try adjusting your query or resetting filters.`
            : 'No movies found with the selected genre and rating combination.'
        }
      />
    </div>
  );
};
