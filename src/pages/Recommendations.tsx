import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Film,
  Star,
  Zap,
  Layers,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';
import { MovieTypePreference, RecommendationResult, UserPreferences } from '../types';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';
import { INDUSTRIES, LANGUAGES, getLanguageBadge } from '../utils/movieHelpers';

const GENRE_OPTIONS = [
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Sci-Fi',
  'Romance',
  'Horror',
  'Crime',
  'Adventure',
  'Fantasy',
  'Animation',
];

const PRESETS = [
  {
    label: 'Action + Telugu',
    industry: 'Tollywood',
    language: 'Telugu',
    genres: ['Action'],
    rating: 7.8,
    badge: '🎬 Tollywood Action',
    desc: 'Expected: RRR, Pushpa, Baahubali, Salaar, Devara',
  },
  {
    label: 'Comedy + Hindi',
    industry: 'Bollywood',
    language: 'Hindi',
    genres: ['Comedy'],
    rating: 7.5,
    badge: '🇮🇳 Bollywood Comedy',
    desc: 'Expected: 3 Idiots, Chhichhore, Hera Pheri, Munna Bhai',
  },
  {
    label: 'Thriller + Malayalam',
    industry: 'Mollywood',
    language: 'Malayalam',
    genres: ['Thriller', 'Crime'],
    rating: 7.8,
    badge: '🍿 Mollywood Thrillers',
    desc: 'Expected: Drishyam, Lucifer, Neru, 2018, Aavesham',
  },
  {
    label: 'Sci-Fi + Tamil',
    industry: 'Kollywood',
    language: 'Tamil',
    genres: ['Sci-Fi'],
    rating: 7.0,
    badge: '🎥 Kollywood Sci-Fi',
    desc: 'Expected: Enthiran, 2.0, Maanaadu',
  },
  {
    label: 'Action + Kannada / Pan-India',
    industry: 'Sandalwood',
    language: 'Kannada',
    genres: ['Action'],
    rating: 8.0,
    badge: '⭐ Sandalwood Blockbusters',
    desc: 'Expected: K.G.F: Chapter 1 & 2, Kantara, Salaar',
  },
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
    userPreferences.favoriteGenres.length > 0 ? userPreferences.favoriteGenres : ['Action', 'Thriller']
  );
  const [preferredRating, setPreferredRating] = useState<number>(
    userPreferences.preferredRating || 8.0
  );
  const [preferredIndustry, setPreferredIndustry] = useState<string>(
    userPreferences.preferredIndustry || 'All'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<string>(
    userPreferences.preferredLanguage || 'All'
  );
  const [preferredType, setPreferredType] = useState<MovieTypePreference>(
    userPreferences.preferredMovieType || 'all'
  );

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate initial recommendations
  useEffect(() => {
    const runInitial = async () => {
      setIsGenerating(true);
      const prefs: UserPreferences = {
        favoriteGenres: selectedGenres,
        preferredRating,
        preferredIndustry,
        preferredLanguage,
        preferredMovieType: preferredType,
        selectedMovieId: seedMovieId || undefined,
      };

      const results = await recommendationService.getRecommendations(prefs, 12);
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

  const applyPreset = async (preset: typeof PRESETS[0]) => {
    setSelectedGenres(preset.genres);
    setPreferredIndustry(preset.industry);
    setPreferredLanguage(preset.language);
    setPreferredRating(preset.rating);

    const newPrefs: UserPreferences = {
      favoriteGenres: preset.genres,
      preferredRating: preset.rating,
      preferredIndustry: preset.industry,
      preferredLanguage: preset.language,
      preferredMovieType: 'all',
    };

    setIsGenerating(true);
    updateUserPreferences(newPrefs);
    const results = await recommendationService.getRecommendations(newPrefs, 12);
    setRecommendations(results);
    setHasGenerated(true);
    setIsGenerating(false);

    addRecommendationHistory(newPrefs, results);
    addToast(`Preset applied: ${preset.label}`, 'success');

    const resultsElem = document.getElementById('recommendations-results-heading');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const newPrefs: UserPreferences = {
      favoriteGenres: selectedGenres,
      preferredRating,
      preferredIndustry,
      preferredLanguage,
      preferredMovieType: preferredType,
      selectedMovieId: seedMovieId || undefined,
    };

    // Save to user context
    updateUserPreferences(newPrefs);

    const results = await recommendationService.getRecommendations(newPrefs, 12);
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
          <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Multi-Dimensional Indian & Global Cinema Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Intelligent Movie Recommendations
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Powered by a 6-feature weighted scoring model across Genre (35%), Language (20%), Industry (15%), Rating (15%), Popularity (10%), and Year (5%).
        </p>
      </div>

      {/* Quick Verification Presets Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Zap className="w-4 h-4" />
          <span>Quick Algorithm Verification Presets</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Click any preset to verify recommendations against expected Indian cinema blockbusters:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-gray-100 group-hover:text-red-400 transition-colors">
                  {preset.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                  {preset.badge}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 block truncate">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Recommendation Parameter Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto space-y-8">
        {/* Step 1: Industry Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Cinema Category / Industry</span>
              <span className="text-xs text-red-400 font-semibold">(Weight: 15%)</span>
            </label>
            <span className="text-xs text-gray-400">
              Active: <strong className="text-red-500">{preferredIndustry}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => {
              const active = preferredIndustry === ind;
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
                  type="button"
                  onClick={() => setPreferredIndustry(ind)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center gap-1.5 backdrop-blur-md ${
                    active
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{displayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Language Preference */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Language Preference</span>
              <span className="text-xs text-red-400 font-semibold">(Weight: 20%)</span>
            </label>
            <span className="text-xs text-gray-400">
              Active: <strong className="text-red-500">{preferredLanguage}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const active = preferredLanguage === lang;
              const badge = lang !== 'All' ? getLanguageBadge(lang) : null;

              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreferredLanguage(lang)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center gap-1.5 backdrop-blur-md ${
                    active
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {badge && <span>{badge.emoji}</span>}
                  <span>{lang}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Genre Selection */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Select Favorite Genres</span>
              <span className="text-xs text-red-400 font-semibold">(Weight: 35%)</span>
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

        {/* Step 4: Rating Threshold */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-bold text-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Preferred Rating Threshold</span>
              <span className="text-xs text-red-400 font-semibold">(Weight: 15%)</span>
            </label>
            <div className="flex items-center gap-1 text-sm sm:text-base font-black text-amber-400 bg-black/60 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
              <Star className="w-4 h-4 fill-current" />
              <span>{preferredRating.toFixed(1)} / 10.0</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <input
              type="range"
              min="6.0"
              max="9.5"
              step="0.1"
              value={preferredRating}
              onChange={(e) => setPreferredRating(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[11px] text-gray-500 font-semibold px-1">
              <span>6.0 ⭐ (Moderate)</span>
              <span>7.5 ⭐ (Good)</span>
              <span>8.0 ⭐ (Superhit)</span>
              <span>8.5 ⭐ (Blockbuster)</span>
              <span>9.5 ⭐ (Legendary)</span>
            </div>
          </div>
        </div>

        {/* Action Button: Generate Recommendations */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Weights: Genre (35%) • Language (20%) • Industry (15%) • Rating (15%) • Pop (10%) • Year (5%)</span>
          </div>

          <button
            id="btn-generate-recommendations"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Computing Matrices...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* 6-Dimensional Recommendation Architecture Breakdown */}
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-2 text-red-500 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Recommendation Engine Architecture</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          Mathematical Weight Distribution (100% Total)
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
          The algorithm maps candidate movies against your preference vector across six distinct feature dimensions:
        </p>

        {/* Visual Weights Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-red-400 mb-1">35%</div>
            <div className="font-bold text-xs text-gray-100">Genre</div>
            <div className="text-[10px] text-gray-400">Jaccard Match</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-emerald-400 mb-1">20%</div>
            <div className="font-bold text-xs text-gray-100">Language</div>
            <div className="text-[10px] text-gray-400">Exact / Regional</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-blue-400 mb-1">15%</div>
            <div className="font-bold text-xs text-gray-100">Industry</div>
            <div className="text-[10px] text-gray-400">Pan-India Affinity</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-amber-400 mb-1">15%</div>
            <div className="font-bold text-xs text-gray-100">Rating</div>
            <div className="text-[10px] text-gray-400">Proximity Vector</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-purple-400 mb-1">10%</div>
            <div className="font-bold text-xs text-gray-100">Popularity</div>
            <div className="text-[10px] text-gray-400">Audience Hype</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xl font-black text-rose-400 mb-1">5%</div>
            <div className="font-bold text-xs text-gray-100">Year</div>
            <div className="text-[10px] text-gray-400">Release Era</div>
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
              Personalized Recommendations
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Sorted by recommendation score with full contextual explanations and breakdown math.
            </p>
          </div>

          <span className="text-xs text-gray-300 font-medium px-3 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            {recommendations.length} Recommended Movies
          </span>
        </div>

        {recommendations.length === 0 && !isGenerating ? (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-gray-400 text-sm">
              Click &quot;Generate Recommendations&quot; or select a preset above.
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
