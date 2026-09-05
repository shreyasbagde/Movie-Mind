import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Sparkles,
  History,
  Save,
  CheckCircle2,
  Calendar,
  Film,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_GENRES, MOVIES_DATA } from '../data/movies';
import { MovieCard } from '../components/MovieCard';

export const Profile: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    favoriteMovies,
    recommendationHistory,
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(userProfile.favoriteGenres);
  const [isEditing, setIsEditing] = useState(false);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      favoriteGenres: selectedGenres,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-rose-950/40">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Data Science Student Profile
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">{email}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {userProfile.joinedDate}
              </span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{favoriteMovies.length} Favorites</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile & Preferences Form (Visible or Editable) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Taste Preferences & Credentials</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Defines the baseline vector for default recommendation suggestions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 disabled:opacity-60 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 disabled:opacity-60 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Favorite Genres Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1 ${
                      active
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3 h-3" />}
                    <span>{genre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isEditing && (
            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-950/40 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Favorite Movies Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h2 className="text-xl font-bold text-white">Favorite Movies Collection</h2>
          </div>
          <Link to="/favorites" className="text-xs font-semibold text-rose-400 hover:underline">
            Manage All ({favoriteMovies.length})
          </Link>
        </div>

        {favoriteMovies.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400 text-sm">
            No favorite movies saved yet.{' '}
            <Link to="/movies" className="text-rose-400 font-semibold hover:underline">
              Browse movies to add some!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {favoriteMovies.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} compact />
            ))}
          </div>
        )}
      </div>

      {/* Recommendation History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Recommendation History</h2>
        </div>

        {recommendationHistory.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400 text-sm">
            You haven&rsquo;t generated any custom recommendations yet.{' '}
            <Link to="/recommendations" className="text-rose-400 font-semibold hover:underline">
              Try the recommendation engine now!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendationHistory.map((item, idx) => {
              const matchedMovies = MOVIES_DATA.filter((m) =>
                item.recommendedMovieIds.includes(m.id)
              );
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-rose-400 font-medium">
                        Rating &ge; {item.preferences.preferredRating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.preferences.favoriteGenres.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    {matchedMovies.slice(0, 4).map((m) => (
                      <Link
                        key={m.id}
                        to={`/movie/${m.id}`}
                        title={m.title}
                        className="w-10 h-14 rounded overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-800 hover:scale-105 transition-transform"
                      >
                        <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
