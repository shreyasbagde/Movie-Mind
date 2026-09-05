import React from 'react';
import {
  Code,
  Layers,
  Database,
  Cpu,
  Sparkles,
  Award,
  CheckCircle2,
  GitBranch,
  Server,
  Zap,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header / Project Identity */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 text-red-300 text-xs font-bold border border-red-500/30 backdrop-blur-md">
          <Award className="w-3.5 h-3.5 text-red-400" />
          <span>College Data Science Capstone Project</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          MovieMind – AI-Powered Movie Recommendation System
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg leading-relaxed">
          An end-to-end intelligent movie discovery platform combining content-based feature similarity, normalized multi-variable scoring, and conversational AI.
        </p>
      </div>

      {/* Section 1: Objective & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold border border-red-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white">Problem Statement</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            With thousands of movie options across digital streaming channels, viewers suffer from &ldquo;choice paralysis.&rdquo; Existing platforms often push sponsored content rather than true affinity-based matches, leaving audiences frustrated by irrelevant suggestions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white">Proposed Solution</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            MovieMind delivers mathematically explainable recommendations by decomposing movie metadata into normalized multidimensional feature vectors (genres, keywords, critic ratings, popularity, release epoch) and computing explicit match rationales for every suggestion.
          </p>
        </div>
      </div>

      {/* Section 2: Recommendation System Architecture & Math */}
      <div id="algorithm-math" className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Recommendation Algorithm & Scoring Math
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Content-based multi-feature similarity scoring function
            </p>
          </div>
        </div>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          The recommendation engine ranks each candidate movie $m$ against user preference vector $P$ using the composite weighted equation:
        </p>

        {/* Formula Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-red-300 overflow-x-auto text-center leading-loose backdrop-blur-md">
          Score(m, P) = (0.40 &times; S_genre) + (0.25 &times; S_rating) + (0.15 &times; S_keyword) + (0.10 &times; S_popularity) + (0.10 &times; S_year)
        </div>

        {/* Feature Breakdown Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 flex items-center justify-between">
              <span>Genre Overlap (40%)</span>
              <span className="text-red-400 text-xs">Jaccard Index</span>
            </span>
            <p className="text-xs text-gray-400">
              Intersection over Union: $|G_m \cap G_P| / |G_m \cup G_P|$
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 flex items-center justify-between">
              <span>Rating Proximity (25%)</span>
              <span className="text-amber-400 text-xs">Linear Proximity</span>
            </span>
            <p className="text-xs text-gray-400">
              $1 - (|R_m - R_P| / 10)$, rewarding high-rated alignment
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 flex items-center justify-between">
              <span>Keyword Affinity (15%)</span>
              <span className="text-emerald-400 text-xs">Semantic Tags</span>
            </span>
            <p className="text-xs text-gray-400">
              Thematic match across plot keywords and director styling
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 flex items-center justify-between">
              <span>Popularity (10%)</span>
              <span className="text-purple-400 text-xs">Normalized [0,1]</span>
            </span>
            <p className="text-xs text-gray-400">
              Scaled viewer traffic index $Pop / 100$
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 flex items-center justify-between">
              <span>Epoch Affinity (10%)</span>
              <span className="text-sky-400 text-xs">Temporal Decay</span>
            </span>
            <p className="text-xs text-gray-400">
              Matches target preference era: Classics, Modern, or All
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-red-500/30 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-red-300 flex items-center justify-between">
              <span>Explainability Output</span>
              <span className="text-red-400 text-xs">Dynamic UI</span>
            </span>
            <p className="text-xs text-gray-400">
              Generates natural language match reasons for the user
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Technology Stack */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-1">
              Frontend UI
            </span>
            <p className="text-base font-bold text-gray-100">React 18 + TS</p>
            <span className="text-xs text-gray-400">Vite & Tailwind CSS</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Visual Analytics
            </span>
            <p className="text-base font-bold text-gray-100">Recharts</p>
            <span className="text-xs text-gray-400">Interactive SVG charts</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              AI Layer
            </span>
            <p className="text-base font-bold text-gray-100">Gemini 2.5 Flash</p>
            <span className="text-xs text-gray-400">Multi-turn Chat & Insights</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-1">
              Storage Layer
            </span>
            <p className="text-base font-bold text-gray-100">LocalStorage + Schema</p>
            <span className="text-xs text-gray-400">Offline-first persistence</span>
          </div>
        </div>
      </div>

      {/* Section 4: Future Scope */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
          <GitBranch className="w-4 h-4" />
          <span>Extensibility & Research Directions</span>
        </div>
        <h2 className="text-2xl font-black text-white">Future Scope for Capstone Evolution</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 block">
              1. Collaborative Filtering
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Integrate Matrix Factorization (SVD / ALS) and user-item interaction matrices to capture communal taste trends.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 block">
              2. Python / PyTorch ML Backend
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect a FastAPI microservice running Transformer embeddings (BERT/Sentence-Transformers) for semantic plot synopsis matching.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
            <span className="font-bold text-sm text-gray-100 block">
              3. Real-Time TMDB Sync
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Live ingest of 500,000+ movies via TMDB v3 API and automated periodic recommendation retraining.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
