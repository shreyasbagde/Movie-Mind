import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, UserPreferences, UserProfile, RecommendationResult } from '../types';
import { MOVIES_DATA } from '../data/movies';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  favorites: string[];
  favoriteMovies: Movie[];
  toggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateUserPreferences: (prefs: UserPreferences) => void;
  userPreferences: UserPreferences;
  recommendationHistory: UserProfile['recommendationHistory'];
  addRecommendationHistory: (prefs: UserPreferences, results: RecommendationResult[]) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: ['Sci-Fi', 'Action'],
  preferredRating: 8.0,
  preferredMovieType: 'highly_rated',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@university.edu',
  favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
  favoriteMovieIds: ['m-1', 'm-2', 'm-3'],
  recommendationHistory: [],
  joinedDate: 'September 2026',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const FAVORITES_KEY = 'moviesuggest_favorites_v1';
const PROFILE_KEY = 'moviesuggest_profile_v1';
const PREFS_KEY = 'moviesuggest_preferences_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load Favorites from LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE.favoriteMovieIds;
    } catch {
      return DEFAULT_PROFILE.favoriteMovieIds;
    }
  });

  // Load Profile from LocalStorage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Load Preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites', e);
    }
  }, [favorites]);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Failed to persist profile', e);
    }
  }, [userProfile]);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(userPreferences));
    } catch (e) {
      console.error('Failed to persist preferences', e);
    }
  }, [userPreferences]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFavorite = (movieId: string) => {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    const movieTitle = movie ? `"${movie.title}"` : 'Movie';

    setFavorites((prev) => {
      const exists = prev.includes(movieId);
      if (exists) {
        addToast(`Removed ${movieTitle} from your Favorites`, 'info');
        return prev.filter((id) => id !== movieId);
      } else {
        addToast(`Added ${movieTitle} to your Favorites!`, 'success');
        return [...prev, movieId];
      }
    });

    setUserProfile((prev) => ({
      ...prev,
      favoriteMovieIds: prev.favoriteMovieIds.includes(movieId)
        ? prev.favoriteMovieIds.filter((id) => id !== movieId)
        : [...prev.favoriteMovieIds, movieId],
    }));
  };

  const isFavorite = (movieId: string) => favorites.includes(movieId);

  const favoriteMovies = MOVIES_DATA.filter((m) => favorites.includes(m.id));

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    addToast('Profile updated successfully!', 'success');
  };

  const updateUserPreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    setUserProfile((prev) => ({
      ...prev,
      favoriteGenres: prefs.favoriteGenres,
    }));
    addToast('Recommendation preferences updated!', 'success');
  };

  const addRecommendationHistory = (prefs: UserPreferences, results: RecommendationResult[]) => {
    const entry = {
      timestamp: Date.now(),
      preferences: prefs,
      recommendedMovieIds: results.map((r) => r.movie.id),
    };
    setUserProfile((prev) => ({
      ...prev,
      recommendationHistory: [entry, ...prev.recommendationHistory.slice(0, 9)], // Keep top 10
    }));
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        favoriteMovies,
        toggleFavorite,
        isFavorite,
        userProfile,
        updateUserProfile,
        updateUserPreferences,
        userPreferences,
        recommendationHistory: userProfile.recommendationHistory,
        addRecommendationHistory,
        toasts,
        addToast,
        removeToast,
        isAiModalOpen,
        setIsAiModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
