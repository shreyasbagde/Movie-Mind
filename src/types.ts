export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number; // 0.0 - 10.0
  popularity: number; // 0 - 100
  language: string;
  runtime: number; // minutes
  overview: string;
  keywords: string[];
  director: string;
  cast: string[];
  poster: string;
  backdrop: string;
  trailerUrl?: string;
  featured?: boolean;
}

export type MovieTypePreference = 'all' | 'recent' | 'classics' | 'highly_rated' | 'popular';

export interface UserPreferences {
  favoriteGenres: string[];
  preferredRating: number; // 1 - 10
  preferredMovieType: MovieTypePreference;
  keywords?: string[];
  selectedMovieId?: string; // Optional: seed movie for content similarity
}

export interface RecommendationBreakdown {
  genreScore: number;       // 0 - 40
  ratingScore: number;      // 0 - 25
  keywordScore: number;     // 0 - 15
  popularityScore: number;  // 0 - 10
  yearScore: number;        // 0 - 10
}

export interface RecommendationResult {
  movie: Movie;
  score: number; // 0 - 100%
  breakdown: RecommendationBreakdown;
  explanation: string;
  matchReasons: string[];
}

export interface FilterOptions {
  searchQuery: string;
  genre: string;
  minRating: number;
  releaseYearRange: [number, number];
  language: string;
  sortBy: 'popularity' | 'rating' | 'newest' | 'title';
}

export interface UserProfile {
  name: string;
  email: string;
  favoriteGenres: string[];
  favoriteMovieIds: string[];
  recommendationHistory: {
    timestamp: number;
    preferences: UserPreferences;
    recommendedMovieIds: string[];
  }[];
  joinedDate: string;
}

export interface AnalyticsData {
  totalMovies: number;
  averageRating: number;
  mostPopularGenre: string;
  highestRatedMovie: Movie;
  genresDistribution: { genre: string; count: number; avgRating: number }[];
  ratingsDistribution: { range: string; count: number }[];
  yearDistribution: { period: string; count: number }[];
}
