export type MovieIndustry =
  | 'Bollywood'
  | 'Tollywood'
  | 'Kollywood'
  | 'Mollywood'
  | 'Sandalwood'
  | 'Hollywood';

export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number; // 0.0 - 10.0
  popularity: number; // 0 - 100
  language: string;
  industry: MovieIndustry | string;
  runtime: number; // minutes
  overview: string;
  keywords: string[];
  director: string;
  cast: string[];
  poster: string;
  backdrop: string;
  trailerUrl?: string;
  featured?: boolean;
  trendingInIndia?: boolean;
}

export type MovieTypePreference = 'all' | 'recent' | 'classics' | 'highly_rated' | 'popular';

export interface UserPreferences {
  favoriteGenres: string[];
  preferredRating: number; // 1 - 10
  preferredMovieType: MovieTypePreference;
  preferredLanguage?: string; // 'All' | 'Telugu' | 'Hindi' | 'Tamil' | 'Malayalam' | 'Kannada' | 'English'
  preferredIndustry?: string; // 'All' | 'Bollywood' | 'Tollywood' | 'Kollywood' | 'Mollywood' | 'Sandalwood' | 'Hollywood'
  keywords?: string[];
  selectedMovieId?: string; // Optional: seed movie for content similarity
}

export interface RecommendationBreakdown {
  genreScore: number;       // 0 - 35 (Genre Similarity → 35%)
  languageScore: number;    // 0 - 20 (Language Match → 20%)
  industryScore: number;    // 0 - 15 (Industry Match → 15%)
  ratingScore: number;      // 0 - 15 (Rating Similarity → 15%)
  popularityScore: number;  // 0 - 10 (Popularity → 10%)
  yearScore: number;        // 0 - 5  (Year Preference → 5%)
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
  industry?: string;
  minRating: number;
  releaseYearRange: [number, number];
  language: string;
  sortBy: 'popularity' | 'rating' | 'newest' | 'title';
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  favoriteGenres: string[];
  favoriteMovieIds: string[];
  recommendationHistory: {
    timestamp: number;
    preferences: UserPreferences;
    recommendedMovieIds: string[];
  }[];
  joinedDate: string;
}

export interface AuthModalState {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  pendingMovieId?: string;
  pendingMovieTitle?: string;
}

export interface AnalyticsData {
  totalMovies: number;
  averageRating: number;
  mostPopularGenre: string;
  mostPopularIndustry: string;
  highestRatedMovie: Movie;
  genresDistribution: { genre: string; count: number; avgRating: number }[];
  industriesDistribution: { industry: string; count: number; avgRating: number }[];
  languagesDistribution: { language: string; count: number }[];
  ratingsDistribution: { range: string; count: number }[];
  yearDistribution: { period: string; count: number }[];
}
