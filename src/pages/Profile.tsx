import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  History,
  Save,
  CheckCircle2,
  Calendar,
  LogIn,
  LogOut,
  UserPlus,
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
    currentUser,
    isLoggedIn,
    openAuthModal,
    logout,
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(userProfile.favoriteGenres);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setName(userProfile.name);
    setEmail(userProfile.email);
    setSelectedGenres(userProfile.favoriteGenres);
  }, [userProfile]);

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
    if (!isLoggedIn) {
      openAuthModal({ mode: 'signin' });
      return;
    }
    updateUserProfile({
      name,
      email,
      favoriteGenres: selectedGenres,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-600/30 border border-white/10">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-300 font-bold border border-red-500/30">
                {isLoggedIn ? 'MovieMind Member' : 'Guest Explorer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">{email || 'Not signed in'}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {userProfile.joinedDate}
              </span>
              <span>•</span>
              <span className="text-red-400 font-semibold">{favoriteMovies.length} Favorites</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isLoggedIn ? (
              <>
                <button
                  id="profile-btn-signin"
                  onClick={() => openAuthModal({ mode: 'signin' })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  id="profile-btn-signup"
                  onClick={() => openAuthModal({ mode: 'signup' })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold border border-white/10 backdrop-blur-md transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4 text-gray-300" />
                  <span>Create Account</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold border border-white/10 backdrop-blur-md transition-all"
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 text-xs sm:text-sm font-semibold border border-white/10 backdrop-blur-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Guest Sign In Callout if not logged in */}
      {!isLoggedIn && (
        <div className="p-6 rounded-2xl bg-red-600/10 border border-red-500/20 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LogIn className="w-4 h-4 text-red-400" />
              <span>Save your custom favorites and preferences across sessions</span>
            </h3>
            <p className="text-xs text-gray-300">
              Sign in with your account so your favorite movies and personalized AI recommendations are always ready.
            </p>
          </div>
          <button
            onClick={() => openAuthModal({ mode: 'signin' })}
            className="flex-shrink-0 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all hover:scale-105"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Profile & Preferences Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Taste Preferences & Credentials</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Defines the baseline vector for default recommendation suggestions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 disabled:opacity-60 rounded-xl px-4 py-2.5 text-sm text-white focus:border-red-500 outline-none backdrop-blur-md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 disabled:opacity-60 rounded-xl px-4 py-2.5 text-sm text-white focus:border-red-500 outline-none backdrop-blur-md"
              />
            </div>
          </div>

          {/* Favorite Genres Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                        ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105"
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
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <h2 className="text-xl font-bold text-white">Favorite Movies Collection</h2>
          </div>
          <Link to="/favorites" className="text-xs font-semibold text-red-400 hover:underline">
            Manage All ({favoriteMovies.length})
          </Link>
        </div>

        {favoriteMovies.length === 0 ? (
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-gray-400 text-sm backdrop-blur-md">
            No favorite movies saved yet.{' '}
            <Link to="/movies" className="text-red-400 font-semibold hover:underline">
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
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-gray-400 text-sm backdrop-blur-md">
            You haven&rsquo;t generated any custom recommendations yet.{' '}
            <Link to="/recommendations" className="text-red-400 font-semibold hover:underline">
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
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-red-400 font-medium">
                        Rating &ge; {item.preferences.preferredRating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.preferences.favoriteGenres.map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 font-medium border border-white/5"
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
                        className="w-10 h-14 rounded overflow-hidden bg-black/60 flex-shrink-0 border border-white/10 hover:scale-105 transition-transform"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
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
