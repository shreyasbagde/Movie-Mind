import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal, Film, Star, User, Video, Globe } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { Movie, MovieIndustry } from '../types';
import { recommendationService } from '../services/recommendationService';
import { INDUSTRIES, LANGUAGES, getLanguageBadge, getIndustryBadge } from '../utils/movieHelpers';

const POPULAR_SEARCH_SUGGESTIONS = [
  { label: 'Prabhas', type: 'Actor' },
  { label: 'Shah Rukh Khan', type: 'Actor' },
  { label: 'Rajinikanth', type: 'Actor' },
  { label: 'Allu Arjun', type: 'Actor' },
  { label: 'Yash', type: 'Actor' },
  { label: 'Mohanlal', type: 'Actor' },
  { label: 'S.S. Rajamouli', type: 'Director' },
  { label: 'Prashanth Neel', type: 'Director' },
  { label: 'Lokesh Kanagaraj', type: 'Director' },
  { label: 'Telugu', type: 'Language' },
  { label: 'Tamil', type: 'Language' },
  { label: 'Malayalam', type: 'Language' },
  { label: 'Kannada', type: 'Language' },
  { label: 'Tollywood', type: 'Industry' },
  { label: 'Bollywood', type: 'Industry' },
];

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const industryParam = searchParams.get('industry') || 'All';
  const languageParam = searchParams.get('language') || 'All';

  const [query, setQuery] = useState(queryParam);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industryParam);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(languageParam);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'popularity' | 'year'>('relevance');

  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const movies = await recommendationService.getAllMovies();
      setAllMovies(movies);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  // Synchronize state when URL changes
  useEffect(() => {
    if (queryParam !== query) setQuery(queryParam);
    if (industryParam !== selectedIndustry) setSelectedIndustry(industryParam);
    if (languageParam !== selectedLanguage) setSelectedLanguage(languageParam);
  }, [queryParam, industryParam, languageParam]);

  const updateSearchUrl = (newQuery: string, newInd: string, newLang: string) => {
    const params: Record<string, string> = {};
    if (newQuery) params.q = newQuery;
    if (newInd !== 'All') params.industry = newInd;
    if (newLang !== 'All') params.language = newLang;
    setSearchParams(params);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateSearchUrl(val, selectedIndustry, selectedLanguage);
  };

  const handleIndustryChange = (ind: string) => {
    setSelectedIndustry(ind);
    updateSearchUrl(query, ind, selectedLanguage);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    updateSearchUrl(query, selectedIndustry, lang);
  };

  const clearAll = () => {
    setQuery('');
    setSelectedIndustry('All');
    setSelectedLanguage('All');
    setMinRating(0);
    setSortBy('relevance');
    setSearchParams({});
  };

  // Perform multi-attribute search across Actor, Director, Language, Industry, Title, and Genres
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    let results = allMovies.filter((movie) => {
      // Industry filter
      if (selectedIndustry !== 'All') {
        if ((movie.industry || '').toLowerCase() !== selectedIndustry.toLowerCase()) {
          return false;
        }
      }

      // Language filter
      if (selectedLanguage !== 'All') {
        if (movie.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
          return false;
        }
      }

      // Rating filter
      if (minRating > 0 && movie.rating < minRating) {
        return false;
      }

      // Query match across multiple fields
      if (!q) return true;

      const titleMatch = movie.title.toLowerCase().includes(q);
      const directorMatch = movie.director.toLowerCase().includes(q);
      const castMatch = movie.cast.some((actor) => actor.toLowerCase().includes(q));
      const languageMatch = movie.language.toLowerCase().includes(q);
      const industryMatch = (movie.industry || '').toLowerCase().includes(q);
      const genreMatch = movie.genres.some((genre) => genre.toLowerCase().includes(q));
      const keywordMatch = movie.keywords.some((k) => k.toLowerCase().includes(q));

      return (
        titleMatch ||
        directorMatch ||
        castMatch ||
        languageMatch ||
        industryMatch ||
        genreMatch ||
        keywordMatch
      );
    });

    // Sorting
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        results.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'year':
        results.sort((a, b) => b.year - a.year);
        break;
      case 'relevance':
      default:
        // Rank exact title or exact actor match higher
        if (q) {
          results.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(q) ? 2 : 0;
            const bTitle = b.title.toLowerCase().includes(q) ? 2 : 0;
            const aActor = a.cast.some((c) => c.toLowerCase().includes(q)) ? 1 : 0;
            const bActor = b.cast.some((c) => c.toLowerCase().includes(q)) ? 1 : 0;
            return bTitle + bActor - (aTitle + aActor);
          });
        }
        break;
    }

    return results;
  }, [allMovies, query, selectedIndustry, selectedLanguage, minRating, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 text-red-300 text-xs font-bold border border-red-500/30 backdrop-blur-md">
          <SearchIcon className="w-3.5 h-3.5 text-red-400" />
          <span>Universal Movie Search</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Search by Actor, Director, Language &amp; Industry
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Quickly find Indian and global movies across Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood &amp; Hollywood.
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by actor (Prabhas, SRK), director (Rajamouli), language (Telugu), industry..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-base shadow-2xl backdrop-blur-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span className="text-xs text-gray-400 font-semibold">Popular Searches:</span>
          {POPULAR_SEARCH_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleQueryChange(item.label)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-gray-500 font-mono">({item.type})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category & Multi-Attribute Filters */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Industry Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>Cinema Category / Industry Filter</span>
            </span>
            {selectedIndustry !== 'All' && (
              <span className="text-xs text-red-400 font-semibold">{selectedIndustry} Active</span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustry === ind;
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
                  onClick={() => handleIndustryChange(ind)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap border shrink-0 ${
                    isSelected
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Filter Chips */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Language Filter</span>
            </span>
            {selectedLanguage !== 'All' && (
              <span className="text-xs text-blue-400 font-semibold">{selectedLanguage} Active</span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang;
              const badge = lang !== 'All' ? getLanguageBadge(lang) : null;

              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {badge && <span>{badge.emoji}</span>}
                  <span>{lang}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating and Sorting Controls */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Min Rating:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 7.5, 8.0, 8.5].map((val) => (
                <button
                  key={val}
                  onClick={() => setMinRating(val)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    minRating === val
                      ? 'bg-amber-500 border-amber-400 text-black'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {val === 0 ? 'Any' : `${val}+ ⭐`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-300">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-200 outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md"
            >
              <option value="relevance">Relevance</option>
              <option value="popularity">Popularity</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Release Date</option>
            </select>

            {(query || selectedIndustry !== 'All' || selectedLanguage !== 'All' || minRating > 0) && (
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-red-400 hover:text-red-300 ml-2 px-2.5 py-1 rounded-lg hover:bg-white/5"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Search Results</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
              {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'}
            </span>
          </h2>

          {query && (
            <span className="text-xs text-gray-400">
              Matches for &ldquo;<strong className="text-white">{query}</strong>&rdquo;
            </span>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md space-y-3">
            <p className="text-gray-300 font-semibold text-base">
              No movies found matching your search criteria.
            </p>
            <p className="text-gray-500 text-xs max-w-md mx-auto">
              Try searching by actor name (e.g. &ldquo;Prabhas&rdquo;, &ldquo;Shah Rukh Khan&rdquo;), director (e.g. &ldquo;Rajamouli&rdquo;), language (e.g. &ldquo;Telugu&rdquo;), or resetting the filters.
            </p>
            <button
              onClick={clearAll}
              className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
