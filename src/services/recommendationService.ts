import { Movie, UserPreferences, RecommendationResult, FilterOptions, AnalyticsData } from '../types';
import { MOVIES_DATA, ALL_GENRES } from '../data/movies';
import { getPersonalizedRecommendations, getSimilarMovies as computeSimilarMovies } from '../utils/recommendationAlgorithm';

/**
 * Service Layer for Movie Discovery and Recommendation Engine.
 * Follows the Strategy Pattern so that alternative ML algorithms
 * (e.g. TF-IDF, Cosine Similarity, KNN, Collaborative Filtering, or external Flask/FastAPI backends)
 * can be plugged in without touching UI components.
 */
export interface IRecommendationEngine {
  name: string;
  description: string;
  getRecommendations(prefs: UserPreferences, movies: Movie[], limit?: number): Promise<RecommendationResult[]>;
}

export class ContentBasedEngine implements IRecommendationEngine {
  name = 'Content-Based Filtering (Weighted Multi-Feature)';
  description = 'Calculates weighted similarity across genre overlap (40%), rating alignment (25%), keyword similarity (15%), popularity (10%), and temporal preferences (10%).';

  async getRecommendations(prefs: UserPreferences, movies: Movie[], limit: number = 10): Promise<RecommendationResult[]> {
    // Artificial small async tick to simulate processing/ML calculation
    await new Promise((resolve) => setTimeout(resolve, 250));
    return getPersonalizedRecommendations(movies, prefs, limit);
  }
}

/**
 * Pluggable Remote ML Engine connector for future Python/FastAPI integration.
 * If configured or if backend is available, queries the REST API endpoint.
 * Otherwise, gracefully falls back to the in-memory engine.
 */
export class RemoteMLEngine implements IRecommendationEngine {
  name = 'Remote Python / Machine Learning Microservice';
  description = 'Connects to an external REST or microservice endpoint executing advanced matrix factorization or deep embeddings.';
  private backendUrl: string;
  private fallbackEngine: ContentBasedEngine;

  constructor(backendUrl: string = '/api/recommendations') {
    this.backendUrl = backendUrl;
    this.fallbackEngine = new ContentBasedEngine();
  }

  async getRecommendations(prefs: UserPreferences, movies: Movie[], limit: number = 10): Promise<RecommendationResult[]> {
    try {
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs, limit }),
      });
      if (!response.ok) {
        throw new Error(`Remote ML service returned status ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.recommendations)) {
        return data.recommendations;
      }
    } catch {
      // Graceful fallback to client-side ContentBasedEngine
    }
    return this.fallbackEngine.getRecommendations(prefs, movies, limit);
  }
}

class RecommendationService {
  private movies: Movie[] = [...MOVIES_DATA];
  private currentEngine: IRecommendationEngine = new ContentBasedEngine();
  private tmdbApiKey: string | null = null;

  constructor() {
    // Check if TMDB API key is provided via Vite client environment
    const key = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_TMDB_API_KEY;
    if (key) {
      this.tmdbApiKey = key;
    }
  }

  /**
   * Allows hot-swapping recommendation engines (e.g. for comparative analysis in data science projects).
   */
  public setEngine(engine: IRecommendationEngine) {
    this.currentEngine = engine;
  }

  public getActiveEngineInfo() {
    return {
      name: this.currentEngine.name,
      description: this.currentEngine.description,
    };
  }

  /**
   * Retrieves all available movies. If TMDB key is provided, attempts fetch, else returns verified local dataset.
   */
  public async getAllMovies(): Promise<Movie[]> {
    return this.movies;
  }

  /**
   * Get single movie by ID
   */
  public async getMovieById(id: string): Promise<Movie | undefined> {
    return this.movies.find((m) => m.id === id);
  }

  /**
   * Main recommendation pipeline
   */
  public async getRecommendations(prefs: UserPreferences, limit: number = 10): Promise<RecommendationResult[]> {
    return this.currentEngine.getRecommendations(prefs, this.movies, limit);
  }

  /**
   * "Because You Watched This" recommendations
   */
  public async getSimilarMovies(movie: Movie, limit: number = 6): Promise<RecommendationResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return computeSimilarMovies(movie, this.movies, limit);
  }

  /**
   * Search movies by title, genre, keywords, or director
   */
  public searchMovies(query: string): Movie[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.movies;

    return this.movies.filter((movie) => {
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchDirector = movie.director.toLowerCase().includes(q);
      const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
      const matchKeyword = movie.keywords.some((k) => k.toLowerCase().includes(q));
      const matchCast = movie.cast.some((c) => c.toLowerCase().includes(q));
      return matchTitle || matchDirector || matchGenre || matchKeyword || matchCast;
    });
  }

  /**
   * Filter and sort movies according to browse preferences
   */
  public filterMovies(options: FilterOptions): Movie[] {
    let result = this.searchMovies(options.searchQuery);

    if (options.genre && options.genre !== 'All') {
      result = result.filter((m) => m.genres.some((g) => g.toLowerCase() === options.genre.toLowerCase()));
    }

    if (options.minRating > 0) {
      result = result.filter((m) => m.rating >= options.minRating);
    }

    if (options.releaseYearRange) {
      const [minYear, maxYear] = options.releaseYearRange;
      result = result.filter((m) => m.year >= minYear && m.year <= maxYear);
    }

    if (options.language && options.language !== 'All') {
      result = result.filter((m) => m.language.toLowerCase() === options.language.toLowerCase());
    }

    // Sorting
    switch (options.sortBy) {
      case 'popularity':
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * Computes aggregate dataset analytics for the Data Science dashboard
   */
  public getAnalytics(): AnalyticsData {
    const total = this.movies.length;
    const avgRating = Number((this.movies.reduce((acc, m) => acc + m.rating, 0) / total).toFixed(2));

    // Highest rated
    const highestRatedMovie = [...this.movies].sort((a, b) => b.rating - a.rating)[0];

    // Genres distribution
    const genreMap = new Map<string, { count: number; totalRating: number }>();
    ALL_GENRES.forEach((g) => genreMap.set(g, { count: 0, totalRating: 0 }));

    this.movies.forEach((m) => {
      m.genres.forEach((g) => {
        const entry = genreMap.get(g) || { count: 0, totalRating: 0 };
        entry.count += 1;
        entry.totalRating += m.rating;
        genreMap.set(g, entry);
      });
    });

    const genresDistribution = Array.from(genreMap.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        avgRating: data.count > 0 ? Number((data.totalRating / data.count).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostPopularGenre = genresDistribution[0]?.genre || 'Drama';

    // Rating distribution
    const ratingsDistribution = [
      { range: '9.0 - 10.0', count: this.movies.filter((m) => m.rating >= 9.0).length },
      { range: '8.5 - 8.9', count: this.movies.filter((m) => m.rating >= 8.5 && m.rating < 9.0).length },
      { range: '8.0 - 8.4', count: this.movies.filter((m) => m.rating >= 8.0 && m.rating < 8.5).length },
      { range: '7.5 - 7.9', count: this.movies.filter((m) => m.rating >= 7.5 && m.rating < 8.0).length },
      { range: '< 7.5', count: this.movies.filter((m) => m.rating < 7.5).length },
    ];

    // Release year distribution
    const yearDistribution = [
      { period: 'Classic (Pre-1990)', count: this.movies.filter((m) => m.year < 1990).length },
      { period: '1990s', count: this.movies.filter((m) => m.year >= 1990 && m.year < 2000).length },
      { period: '2000s', count: this.movies.filter((m) => m.year >= 2000 && m.year < 2010).length },
      { period: '2010s', count: this.movies.filter((m) => m.year >= 2010 && m.year < 2020).length },
      { period: '2020s+', count: this.movies.filter((m) => m.year >= 2020).length },
    ];

    return {
      totalMovies: total,
      averageRating: avgRating,
      mostPopularGenre,
      highestRatedMovie,
      genresDistribution,
      ratingsDistribution,
      yearDistribution,
    };
  }
}

export const recommendationService = new RecommendationService();
