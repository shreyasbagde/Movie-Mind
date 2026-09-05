import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, UserPreferences, UserProfile, RecommendationResult, AuthModalState } from '../types';
import { MOVIES_DATA } from '../data/movies';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  googleProvider,
  signInWithPopup,
  updateProfile,
} from '../lib/firebase';
import {
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  addFavoriteToFirestore,
  removeFavoriteFromFirestore,
  subscribeToUserFavorites,
  saveRecommendationHistoryToFirestore,
} from '../services/firebaseService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  login: (profile: Partial<UserProfile> & { name: string; email: string }) => void;
  signInWithFirebase: (email: string, pass: string) => Promise<void>;
  signUpWithFirebase: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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

  // Favorites state
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

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Fetch from Firestore
          const remoteProfile = await getUserProfileFromFirestore(fbUser.uid);
          const profile: UserProfile = {
            id: fbUser.uid,
            name: remoteProfile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Cinephile',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || remoteProfile?.avatar || undefined,
            favoriteGenres: remoteProfile?.favoriteGenres || ['Sci-Fi', 'Action'],
            favoriteMovieIds: remoteProfile?.favoriteMovieIds || [],
            recommendationHistory: remoteProfile?.recommendationHistory || [],
            joinedDate: remoteProfile?.joinedDate || 'September 2026',
          };

          setCurrentUser(profile);
          setFavorites(profile.favoriteMovieIds || []);
          localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        } catch (e) {
          console.warn('Failed to sync user from Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for favorites when user is logged in
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const unsubscribe = subscribeToUserFavorites(
        currentUser.id,
        (favMovieIds) => {
          if (favMovieIds.length > 0) {
            setFavorites(favMovieIds);
          }
        },
        (err) => {
          console.debug('Real-time favorites sync note:', err.message);
        }
      );
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUser?.id]);

  // Sync favorites to localStorage for fast local access
  useEffect(() => {
    if (currentUser) {
      try {
        const userFavsKey = `moviesuggest_favs_${currentUser.email}`;
        localStorage.setItem(userFavsKey, JSON.stringify(favorites));

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

  // Firebase Email/Password Sign-In
  const signInWithFirebase = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;
      let remoteProfile = await getUserProfileFromFirestore(fbUser.uid);

      let userFavs = remoteProfile?.favoriteMovieIds || [];
      if (authModal.pendingMovieId && !userFavs.includes(authModal.pendingMovieId)) {
        userFavs = [...userFavs, authModal.pendingMovieId];
        await addFavoriteToFirestore(fbUser.uid, authModal.pendingMovieId, authModal.pendingMovieTitle);
        addToast(`Added "${authModal.pendingMovieTitle || 'Movie'}" to your Favorites!`, 'success');
      }

      const profile: UserProfile = {
        id: fbUser.uid,
        name: remoteProfile?.name || fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email,
        avatar: fbUser.photoURL || undefined,
        favoriteGenres: remoteProfile?.favoriteGenres || ['Sci-Fi', 'Action'],
        favoriteMovieIds: userFavs,
        recommendationHistory: remoteProfile?.recommendationHistory || [],
        joinedDate: remoteProfile?.joinedDate || 'September 2026',
      };

      setCurrentUser(profile);
      setFavorites(userFavs);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      addToast(`Welcome back, ${profile.name}! Signed in via Firebase.`, 'success');
      closeAuthModal();
    } catch (err: any) {
      const msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err.message;
      addToast(`Sign-in error: ${msg}`, 'error');
      throw err;
    }
  };

  // Firebase Email/Password Sign-Up
  const signUpWithFirebase = async (email: string, pass: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = cred.user;

      if (displayName.trim()) {
        await updateProfile(fbUser, { displayName: displayName.trim() });
      }

      let userFavs: string[] = [];
      if (authModal.pendingMovieId) {
        userFavs = [authModal.pendingMovieId];
        await addFavoriteToFirestore(fbUser.uid, authModal.pendingMovieId, authModal.pendingMovieTitle);
        addToast(`Added "${authModal.pendingMovieTitle || 'Movie'}" to your Favorites!`, 'success');
      }

      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: displayName.trim() || email.split('@')[0],
        email: fbUser.email || email,
        favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
        favoriteMovieIds: userFavs,
        recommendationHistory: [],
        joinedDate: 'September 2026',
      };

      // Persist to Cloud Firestore backend
      await saveUserProfileToFirestore(fbUser.uid, newProfile);

      setCurrentUser(newProfile);
      setFavorites(userFavs);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newProfile));
      addToast(`Account created successfully! Welcome to MovieMind.`, 'success');
      closeAuthModal();
    } catch (err: any) {
      const msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err.message;
      addToast(`Registration error: ${msg}`, 'error');
      throw err;
    }
  };

  // Firebase Google Popup Sign-In
  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      let remoteProfile = await getUserProfileFromFirestore(fbUser.uid);

      let userFavs = remoteProfile?.favoriteMovieIds || [];
      if (authModal.pendingMovieId && !userFavs.includes(authModal.pendingMovieId)) {
        userFavs = [...userFavs, authModal.pendingMovieId];
        await addFavoriteToFirestore(fbUser.uid, authModal.pendingMovieId, authModal.pendingMovieTitle);
        addToast(`Added "${authModal.pendingMovieTitle || 'Movie'}" to your Favorites!`, 'success');
      }

      const profile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || remoteProfile?.name || fbUser.email?.split('@')[0] || 'Cinephile',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || undefined,
        favoriteGenres: remoteProfile?.favoriteGenres || ['Sci-Fi', 'Action'],
        favoriteMovieIds: userFavs,
        recommendationHistory: remoteProfile?.recommendationHistory || [],
        joinedDate: remoteProfile?.joinedDate || 'September 2026',
      };

      // Ensure stored in Firestore
      await saveUserProfileToFirestore(fbUser.uid, profile);

      setCurrentUser(profile);
      setFavorites(userFavs);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      addToast(`Welcome, ${profile.name}! Signed in with Google.`, 'success');
      closeAuthModal();
    } catch (err: any) {
      // In sandbox/iframe environments, popups can be blocked or cancelled; provide clean feedback
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        addToast('Google sign-in popup was blocked. Please try with email/password.', 'info');
      } else {
        const msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err.message;
        addToast(`Google sign-in: ${msg}`, 'error');
      }
      throw err;
    }
  };

  // Quick Demo / Local Login
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

    // Also async save to Firestore if network is ready
    if (sessionUser.id) {
      saveUserProfileToFirestore(sessionUser.id, sessionUser).catch(() => {});
    }

    closeAuthModal();
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error', e);
    }
    setCurrentUser(null);
    setFavorites([]);
    localStorage.removeItem(SESSION_KEY);
    addToast('You have been signed out.', 'info');
  };

  const toggleFavorite = (movieId: string) => {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    const movieTitle = movie ? `"${movie.title}"` : 'Movie';

    if (!currentUser) {
      openAuthModal({
        mode: 'signin',
        pendingMovieId: movieId,
        pendingMovieTitle: movie?.title,
      });
      addToast('Sign in to add movies to your Favorites List', 'info');
      return;
    }

    const userId = currentUser.id || `u-${currentUser.email}`;
    const exists = favorites.includes(movieId);

    if (exists) {
      // Optimistic UI update
      setFavorites((prev) => prev.filter((id) => id !== movieId));
      addToast(`Removed ${movieTitle} from your Favorites`, 'info');

      // Sync with Firestore backend
      removeFavoriteFromFirestore(userId, movieId).catch((err) => {
        console.warn('Firestore favorite removal sync notice:', err);
      });
    } else {
      // Optimistic UI update
      setFavorites((prev) => [...prev, movieId]);
      addToast(`Added ${movieTitle} to your Favorites!`, 'success');

      // Sync with Firestore backend
      addFavoriteToFirestore(userId, movieId, movie?.title).catch((err) => {
        console.warn('Firestore favorite addition sync notice:', err);
      });
    }
  };

  const isFavorite = (movieId: string) => favorites.includes(movieId);

  const favoriteMovies = MOVIES_DATA.filter((m) => favorites.includes(m.id));

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

    // Sync with Firestore backend
    if (currentUser.id) {
      saveUserProfileToFirestore(currentUser.id, updated).catch((err) => {
        console.warn('Firestore profile sync notice:', err);
      });
    }

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

      if (currentUser.id) {
        saveUserProfileToFirestore(currentUser.id, { favoriteGenres: prefs.favoriteGenres }).catch(() => {});
      }
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

    // Sync with Firestore backend
    if (currentUser.id) {
      saveRecommendationHistoryToFirestore(currentUser.id, entry).catch((err) => {
        console.warn('Firestore recommendation history sync notice:', err);
      });
    }
  };

  const userProfile = currentUser || GUEST_PROFILE;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn: currentUser !== null,
        login,
        signInWithFirebase,
        signUpWithFirebase,
        signInWithGoogle,
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


