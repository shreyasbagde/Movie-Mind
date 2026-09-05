import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Film,
  Star,
  Clock,
  Zap,
  ArrowDown,
  Layers,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';
import { MovieTypePreference, RecommendationResult, UserPreferences } from '../types';
import { recommendationService } from '../services/recommendationService';
import { ALL_GENRES } from '../data/movies';
import { useApp } from '../context/AppContext';

const GENRE_OPTIONS = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Animation',
  'Adventure',
  'Crime',
];

const MOVIE_TYPE_OPTIONS: { id: MovieTypePreference; label: string; desc: string }[] = [
  { id: 'recent', label: 'Recent Movies', desc: 'Released in recent contemporary years' },
  { id: 'classics', label: 'Classics', desc: 'Golden era & iconic timeless titles' },
  { id: 'highly_rated', label: 'Highly Rated', desc: 'Critical darlings & top rated' },
  { id: 'popular', label: 'Popular Hits', desc: 'Most viewed & viral titles' },
  { id: 'all', label: 'All Movie Types', desc: 'Balanced selection across all eras' },
];

export const Recommendations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const seedMovieId = searchParams.get('seedMovieId');

  const {
    userPreferences,
    updateUserPreferences,
    addRecommendationHistory,
    addToast,
  } = useApp();

  // Local state for the form
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    userPreferences.favoriteGenres.length > 0 ? userPreferences.favoriteGenres : ['Sci-Fi', 'Action']
  );
  const [preferredRating, setPreferredRating] = useState<number>(
    userPreferences.preferredRating || 8.0
  );
  const [preferredType, setPreferredType] = useState<MovieTypePreference>(
    userPreferences.preferredMovieType || 'highly_rated'
  );

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate initial or URL-seed recommendations
  useEffect(() => {
    const runInitial = async () => {
      setIsGenerating(true);
      const prefs: UserPreferences = {
        favoriteGenres: selectedGenres,
        preferredRating,
        preferredMovieType: preferredType,
        selectedMovieId: seedMovieId || undefined,
      };

      const results = await recommendationService.getRecommendations(prefs, 10);
      setRecommendations(results);
      setHasGenerated(true);
      setIsGenerating(false);
    };

    runInitial();
  }, [seedMovieId]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      } else {
        addToast('Please keep at least one preferred genre selected', 'info');
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const newPrefs: UserPreferences = {
      favoriteGenres: selectedGenres,
      preferredRating,
      preferredMovieType: preferredType,
      selectedMovieId: seedMovieId || undefined,
    };

    // Save to user context
    updateUserPreferences(newPrefs);

    const results = await recommendationService.getRecommendations(newPrefs, 10);
    setRecommendations(results);
    setHasGenerated(true);
    setIsGenerating(false);

    addRecommendationHistory(newPrefs, results);
    addToast(`Generated ${results.length} personalized movie recommendations!`, 'success');

    // Smooth scroll down to results
    const resultsElem = document.getElementById('recommendations-results-heading');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 text-red-300 text-xs font-bold border border-red-500/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Core Recommendation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Find Movies You&rsquo;ll Love
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Configure your preferred genres, quality threshold, and temporal era. Our multi-variable
          similarity model will match and rank movies from the feature vectors.
        </p>
      </div>

      {/* Interactive Recommendation Parameter Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto space-y-8">
        {/* Step 1: Select your favorite genre */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Select your favorite genres
            </label>
            <span className="text-xs text-gray-400">
              Selected: <strong className="text-red-500">{selectedGenres.length}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {GENRE_OPTIONS.map((genre) => {
              const active = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center gap-1.5 backdrop-blur-md ${
                    active
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select preferred rating with Slider */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Select preferred rating threshold
            </label>
            <div className="flex items-center gap-1 text-sm sm:text-base font-black text-amber-400 bg-black/60 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
              <Star className="w-4 h-4 fill-current" />
              <span>{preferredRating.toFixed(1)} / 10.0</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={preferredRating}
              onChange={(e) => setPreferredRating(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[11px] text-gray-500 font-semibold px-1">
              <span>1.0 ⭐ (Any)</span>
              <span>5.0 ⭐ (Average)</span>
              <span>7.5 ⭐ (Good)</span>
              <span>8.5 ⭐ (Exceptional)</span>
              <span>10.0 ⭐ (Masterpiece)</span>
            </div>
          </div>
        </div>

        {/* Step 3: Select preferred movie type */}
        <div className="pt-4 border-t border-white/10">
          <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            Select preferred movie type
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOVIE_TYPE_OPTIONS.map((type) => {
              const active = preferredType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPreferredType(type.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                    active
                      ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-gray-100">
                      {type.label}
                    </span>
                    {active && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <span className="text-[11px] text-gray-400 block leading-tight">
                    {type.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Generate Recommendations */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Computes genre (40%), rating (25%), keywords (15%), popularity (10%), year (10%)</span>
          </div>

          <button
            id="btn-generate-recommendations"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing Vectors...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 18: PROJECT PRESENTATION - "How It Works" Flow Diagram */}
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-2 text-red-500 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Project Presentation Architecture</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          How It Works (Recommendation Pipeline)
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
          The content-based recommendation model takes user preference vectors and correlates them with multi-dimensional movie feature attributes:
        </p>

        {/* Visual Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative text-center">
          {/* Step A */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <span className="font-bold text-xs text-gray-100 mb-1">User Preferences</span>
            <span className="text-[10px] text-gray-400">Genres, Rating, Era</span>
          </div>

          {/* Step B */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <span className="font-bold text-xs text-gray-100 mb-1">Movie Features</span>
            <span className="text-[10px] text-gray-400">Keywords, Director, Cast</span>
          </div>

          {/* Step C */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <span className="font-bold text-xs text-gray-100 mb-1">Similarity Metric</span>
            <span className="text-[10px] text-gray-400">Jaccard + Proximity</span>
          </div>

          {/* Step D */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs mb-2">
              4
            </div>
            <span className="font-bold text-xs text-gray-100 mb-1">Scoring Weights</span>
            <span className="text-[10px] text-gray-400">0% to 100% Normalized</span>
          </div>

          {/* Step E */}
          <div className="p-4 rounded-2xl bg-red-600/15 border border-red-500/40 backdrop-blur-md flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs mb-2 shadow-md">
              5
            </div>
            <span className="font-bold text-xs text-white mb-1">Top Recommendations</span>
            <span className="text-[10px] text-red-300">Ranked Personalized List</span>
          </div>
        </div>
      </div>

      {/* Results Output Section */}
      <div className="space-y-6 pt-6">
        <div id="recommendations-results-heading" className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Ranked Predictions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Your Personalized Recommendations
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Sorted strictly by descending recommendation score with feature-level explanations.
            </p>
          </div>

          <span className="text-xs text-gray-300 font-medium px-3 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            {recommendations.length} Recommended Movies
          </span>
        </div>

        {recommendations.length === 0 && !isGenerating ? (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-gray-400 text-sm">
              Click &quot;Generate Recommendations&quot; above to calculate matches.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((result, idx) => (
              <RecommendationCard key={result.movie.id} result={result} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
