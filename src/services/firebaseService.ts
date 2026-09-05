import {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { UserProfile, UserPreferences, Movie } from '../types';

export interface FirebaseFavoriteEntry {
  movieId: string;
  movieTitle?: string;
  addedAt: any;
}

export interface FirebaseRecommendationEntry {
  id?: string;
  timestamp: number;
  preferences: UserPreferences;
  recommendedMovieIds: string[];
}

/**
 * Save or update user profile document in Firestore at /users/{userId}
 */
export async function saveUserProfileToFirestore(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Add a movie to user's favorites collection in Firestore
 */
export async function addFavoriteToFirestore(
  userId: string,
  movieId: string,
  movieTitle?: string
): Promise<void> {
  const path = `users/${userId}/favorites/${movieId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', movieId);
    await setDoc(favRef, {
      movieId,
      movieTitle: movieTitle || '',
      addedAt: serverTimestamp(),
    });

    // Also update parent user's favoriteMovieIds array for fast queries
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const existing = (userSnap.data()?.favoriteMovieIds as string[]) || [];
      if (!existing.includes(movieId)) {
        await updateDoc(userRef, {
          favoriteMovieIds: [...existing, movieId],
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Remove a movie from user's favorites collection in Firestore
 */
export async function removeFavoriteFromFirestore(userId: string, movieId: string): Promise<void> {
  const path = `users/${userId}/favorites/${movieId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', movieId);
    await deleteDoc(favRef);

    // Also update parent user's favoriteMovieIds array
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const existing = (userSnap.data()?.favoriteMovieIds as string[]) || [];
      await updateDoc(userRef, {
        favoriteMovieIds: existing.filter((id) => id !== movieId),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to real-time favorites changes for a user
 */
export function subscribeToUserFavorites(
  userId: string,
  onUpdate: (movieIds: string[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/favorites`;
  try {
    const favsCollection = collection(db, 'users', userId, 'favorites');
    const unsubscribe = onSnapshot(
      favsCollection,
      (snapshot) => {
        const movieIds = snapshot.docs.map((doc) => doc.id);
        onUpdate(movieIds);
      },
      (error) => {
        console.error('Favorites real-time sync error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save recommendation generation history to Firestore
 */
export async function saveRecommendationHistoryToFirestore(
  userId: string,
  entry: FirebaseRecommendationEntry
): Promise<void> {
  const path = `users/${userId}/recommendations`;
  try {
    const recsRef = doc(collection(db, 'users', userId, 'recommendations'));
    await setDoc(recsRef, {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
