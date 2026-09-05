import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Clock,
  Calendar,
  Globe,
  User,
  Sparkles,
  ArrowLeft,
  X,
  ExternalLink,
  Film,
} from 'lucide-react';
import { Movie, RecommendationResult } from '../types';
import { Rating } from '../components/Rating';
import { MovieCard } from '../components/MovieCard';
import { recommendationService } from '../services/recommendationService';
import { useApp } from '../context/AppContext';
import { FALLBACK_POSTER, FALLBACK_BACKDROP } from '../data/movies';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [posterSrc, setPosterSrc] = useState('');
  const [backdropSrc, setBackdropSrc] = useState('');
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);

      const found = await recommendationService.getMovieById(id);
      if (found) {
        setMovie(found);
        setPosterSrc(found.poster);
        setBackdropSrc(found.backdrop);

        const similar = await recommendationService.getSimilarMovies(found, 6);
        setSimilarMovies(similar);
      } else {
        setMovie(null);
      }
      setLoading(false);
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-gray-400 mx-auto flex items-center justify-center mb-4 backdrop-blur-md">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">
          The requested movie record could not be found in our database.
        </p>
        <button
          onClick={() => navigate('/movies')}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all"
        >
          Return to Movies Catalogue
        </button>
      </div>
    );
  }

  const favorite = isFavorite(movie.id);

  return (
    <div className="relative pb-20">
      {/* Massive Movie Backdrop Banner */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] overflow-hidden bg-black">
        <img
          src={backdropSrc}
          alt={movie.title}
          referrerPolicy="no-referrer"
          onError={() => setBackdropSrc(FALLBACK_BACKDROP)}
          className="w-full h-full object-cover object-center opacity-35 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/40" />

        {/* Back navigation button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Details Container (Overlapping Backdrop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-56 sm:-mt-72 md:-mt-80 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Column: Movie Poster + Action Buttons */}
          <div className="w-60 sm:w-72 md:w-80 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white/5 border-2 border-white/15 shadow-2xl relative group backdrop-blur-md">
              <img
                src={posterSrc}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={() => setPosterSrc(FALLBACK_POSTER)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* CTAs Under Poster */}
            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => setShowTrailerModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Official Trailer</span>
              </button>

              <button
                onClick={() => toggleFavorite(movie.id)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border backdrop-blur-md transition-all ${
                  favorite
                    ? 'bg-red-600/20 border-red-500/60 text-red-400 hover:bg-red-600/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-200 hover:bg-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                <span>{favorite ? 'In Your Favorites' : 'Add to Favorites'}</span>
              </button>

              <Link
                to={`/recommendations?seedMovieId=${movie.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Find Similar Movies</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Overview, Cast */}
          <div className="flex-1 space-y-6">
            {/* Title and Tagline */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 backdrop-blur-md"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Specs Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 mt-3 font-medium">
                <div className="flex items-center gap-1.5">
                  <Rating value={movie.rating} size="md" />
                  <span className="text-gray-500 text-xs">/ 10</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {movie.year}
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {movie.runtime} mins
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {movie.language}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">Popularity Score: {movie.popularity}/100</span>
              </div>
            </div>

            {/* Overview / Plot */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                Synopsis
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* Key Personnel: Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Director
                </span>
                <p className="text-sm font-semibold text-gray-100">{movie.director}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Leading Cast
                </span>
                <p className="text-sm font-medium text-gray-200 leading-normal">
                  {movie.cast.join(', ')}
                </p>
              </div>
            </div>

            {/* Keywords / Content Features */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Content Features & Keywords (ML Tags)
              </span>
              <div className="flex flex-wrap gap-2">
                {movie.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-medium backdrop-blur-md"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: "Because You Watched This" */}
        <div className="mt-20 pt-12 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Content-Based Similarity</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Because You Watched &ldquo;{movie.title}&rdquo;
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Ranked by thematic keyword overlap, shared genres, and director styling.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
            {similarMovies.map((rec) => (
              <div key={rec.movie.id} className="flex flex-col space-y-2">
                <MovieCard movie={rec.movie} compact />
                <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-center backdrop-blur-md">
                  {rec.score}% Match
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500 fill-current" />
                <h3 className="text-lg font-bold text-white">{movie.title} – Official Preview</h3>
              </div>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded video / preview player container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerUrl?.split('v=')[1] || 'YoHD9XEInc0'}?autoplay=1`}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>{movie.title} ({movie.year}) Directed by {movie.director}</span>
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
