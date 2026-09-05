import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, UserPreferences, UserProfile, RecommendationResult, AuthModalState } from '../types';
import { MOVIES_DATA } from '../data/movies';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  login: (profile: Partial<UserProfile> & { name: string; email: string }) => void;
  logout: () => void;
  authModal: AuthModalState;
  openAuthModal: (options?: Partial<AuthModalState>) => void;
  closeAuthModal: () => void;
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

const GUEST_PROFILE: UserProfile = {
  name: 'Guest Explorer',
  email: '',
  favoriteGenres: ['Sci-Fi', 'Action'],
  favoriteMovieIds: [],
  recommendationHistory: [],
  joinedDate: 'Just now',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const SESSION_KEY = 'moviesuggest_user_session_v1';
const PREFS_KEY = 'moviesuggest_preferences_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  // Auth Modal State
  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    mode: 'signin',
  });

  const openAuthModal = (options?: Partial<AuthModalState>) => {
    setAuthModal({
      isOpen: true,
      mode: options?.mode || 'signin',
      pendingMovieId: options?.pendingMovieId,
      pendingMovieTitle: options?.pendingMovieTitle,
    });
  };

  const closeAuthModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Favorites state tied to current user session
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed: UserProfile = JSON.parse(session);
        const userFavsKey = `moviesuggest_favs_${parsed.email}`;
        const savedFavs = localStorage.getItem(userFavsKey);
        if (savedFavs) return JSON.parse(savedFavs);
        return parsed.favoriteMovieIds || [];
      }
      return [];
    } catch {
      return [];
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

  // Sync favorites whenever they change for a logged-in user
  useEffect(() => {
    if (currentUser) {
      try {
        const userFavsKey = `moviesuggest_favs_${currentUser.email}`;
        localStorage.setItem(userFavsKey, JSON.stringify(favorites));

        // Also update currentUser object
        const updatedUser = { ...currentUser, favoriteMovieIds: favorites };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Failed to persist user favorites', e);
      }
    }
  }, [favorites, currentUser]);

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
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (profile: Partial<UserProfile> & { name: string; email: string }) => {
    const userEmail = profile.email.trim().toLowerCase();
    let userFavs: string[] = [];

    try {
      const savedFavs = localStorage.getItem(`moviesuggest_favs_${userEmail}`);
      if (savedFavs) {
        userFavs = JSON.parse(savedFavs);
      } else if (profile.favoriteMovieIds && profile.favoriteMovieIds.length > 0) {
        userFavs = profile.favoriteMovieIds;
      }
    } catch {
      userFavs = profile.favoriteMovieIds || [];
    }

    // If there was a pending favorite click, add it!
    if (authModal.pendingMovieId && !userFavs.includes(authModal.pendingMovieId)) {
      userFavs = [...userFavs, authModal.pendingMovieId];
      addToast(
        `Welcome, ${profile.name}! Added "${authModal.pendingMovieTitle || 'Movie'}" to your Favorites.`,
        'success'
      );
    } else {
      addToast(`Welcome back, ${profile.name}! You are now signed in.`, 'success');
    }

    const sessionUser: UserProfile = {
      id: profile.id || `u-${Date.now()}`,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      favoriteGenres: profile.favoriteGenres || ['Sci-Fi', 'Action'],
      favoriteMovieIds: userFavs,
      recommendationHistory: profile.recommendationHistory || [],
      joinedDate: profile.joinedDate || 'September 2026',
    };

    setCurrentUser(sessionUser);
    setFavorites(userFavs);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(`moviesuggest_favs_${userEmail}`, JSON.stringify(userFavs));
    closeAuthModal();
  };

  const logout = () => {
    setCurrentUser(null);
    setFavorites([]);
    localStorage.removeItem(SESSION_KEY);
    addToast('You have been signed out.', 'info');
  };

  const toggleFavorite = (movieId: string) => {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    const movieTitle = movie ? `"${movie.title}"` : 'Movie';

    // Guard: If user is not logged in, prompt sign in
    if (!currentUser) {
      openAuthModal({
        mode: 'signin',
        pendingMovieId: movieId,
        pendingMovieTitle: movie?.title,
      });
      addToast('Sign in to add movies to your Favorites List', 'info');
      return;
    }

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
  };

  const isFavorite = (movieId: string) => favorites.includes(movieId);

  const favoriteMovies = MOVIES_DATA.filter((m) => favorites.includes(m.id));

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    addToast('Profile updated successfully!', 'success');
  };

  const updateUserPreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    if (currentUser) {
      const updated = {
        ...currentUser,
        favoriteGenres: prefs.favoriteGenres,
      };
      setCurrentUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
    addToast('Recommendation preferences updated!', 'success');
  };

  const addRecommendationHistory = (prefs: UserPreferences, results: RecommendationResult[]) => {
    if (!currentUser) return;
    const entry = {
      timestamp: Date.now(),
      preferences: prefs,
      recommendedMovieIds: results.map((r) => r.movie.id),
    };
    const updated = {
      ...currentUser,
      recommendationHistory: [entry, ...currentUser.recommendationHistory.slice(0, 9)],
    };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  const userProfile = currentUser || GUEST_PROFILE;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn: currentUser !== null,
        login,
        logout,
        authModal,
        openAuthModal,
        closeAuthModal,
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

