import { Movie, UserPreferences, RecommendationResult, FilterOptions, AnalyticsData } from '../types';
import { MOVIES_DATA, ALL_GENRES } from '../data/movies';
import { getPersonalizedRecommendations, getSimilarMovies as computeSimilarMovies } from '../utils/recommendationAlgorithm';
import { INDUSTRIES, LANGUAGES } from '../utils/movieHelpers';

/**
 * Service Layer for Movie Discovery and Recommendation Engine.
 * Follows the Strategy Pattern so that alternative ML algorithms
 * can be plugged in without touching UI components.
 */
export interface IRecommendationEngine {
  name: string;
  description: string;
  getRecommendations(prefs: UserPreferences, movies: Movie[], limit?: number): Promise<RecommendationResult[]>;
}

export class ContentBasedEngine implements IRecommendationEngine {
  name = 'Multi-Dimensional Content-Based Filtering (Indian & Global Cinema)';
  description = 'Weighted scoring across Genre Similarity (35%), Language Match (20%), Industry Match (15%), Rating Similarity (15%), Popularity (10%), and Year Preference (5%).';

  async getRecommendations(prefs: UserPreferences, movies: Movie[], limit: number = 12): Promise<RecommendationResult[]> {
    // Artificial small async tick to simulate processing/ML calculation
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getPersonalizedRecommendations(movies, prefs, limit);
  }
}

/**
 * Pluggable Remote ML Engine connector for future Python/FastAPI integration.
 */
export class RemoteMLEngine implements IRecommendationEngine {
  name = 'Remote Python / Machine Learning Microservice';
  description = 'Connects to an external REST or microservice endpoint executing matrix factorization or deep embeddings.';
  private backendUrl: string;
  private fallbackEngine: ContentBasedEngine;

  constructor(backendUrl: string = '/api/recommendations') {
    this.backendUrl = backendUrl;
    this.fallbackEngine = new ContentBasedEngine();
  }

  async getRecommendations(prefs: UserPreferences, movies: Movie[], limit: number = 12): Promise<RecommendationResult[]> {
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
    const key = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_TMDB_API_KEY;
    if (key) {
      this.tmdbApiKey = key;
    }
  }

  /**
   * Allows hot-swapping recommendation engines.
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
   * Retrieves all available movies.
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
  public async getRecommendations(prefs: UserPreferences, limit: number = 12): Promise<RecommendationResult[]> {
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
   * Dedicated Trending in India collection
   * Displays: Pushpa 2, Jawan, Kalki 2898 AD, KGF 2, RRR, Stree 2
   */
  public async getTrendingInIndia(): Promise<Movie[]> {
    const priorityKeywords = [
      'pushpa 2',
      'jawan',
      'kalki 2898 ad',
      'k.g.f: chapter 2',
      'rrr',
      'stree 2',
    ];

    const trending = this.movies.filter((m) => {
      const lower = m.title.toLowerCase();
      return m.trendingInIndia || priorityKeywords.some((pk) => lower.includes(pk));
    });

    trending.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const idxA = priorityKeywords.findIndex((k) => aLower.includes(k));
      const idxB = priorityKeywords.findIndex((k) => bLower.includes(k));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.popularity - a.popularity;
    });

    return trending;
  }

  /**
   * Get movies by specific industry
   */
  public getMoviesByIndustry(industry: string): Movie[] {
    if (!industry || industry === 'All') return this.movies;
    const lower = industry.toLowerCase().trim();
    return this.movies.filter((m) => (m.industry || '').toLowerCase() === lower);
  }

  /**
   * Search movies by title, actor/cast, director, language, industry, keywords, or genre
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
      const matchLanguage = movie.language.toLowerCase().includes(q);
      const matchIndustry = (movie.industry || '').toLowerCase().includes(q);
      return (
        matchTitle ||
        matchDirector ||
        matchCast ||
        matchLanguage ||
        matchIndustry ||
        matchGenre ||
        matchKeyword
      );
    });
  }

  /**
   * Filter and sort movies according to browse preferences
   */
  public filterMovies(options: FilterOptions): Movie[] {
    let result = this.searchMovies(options.searchQuery);

    if (options.industry && options.industry !== 'All') {
      result = result.filter(
        (m) => (m.industry || '').toLowerCase() === options.industry!.toLowerCase()
      );
    }

    if (options.genre && options.genre !== 'All') {
      result = result.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === options.genre.toLowerCase())
      );
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
    const avgRating = Number(
      (this.movies.reduce((acc, m) => acc + m.rating, 0) / Math.max(1, total)).toFixed(2)
    );

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

    const mostPopularGenre = genresDistribution[0]?.genre || 'Action';

    // Industries distribution
    const industryMap = new Map<string, { count: number; totalRating: number }>();
    INDUSTRIES.filter((i) => i !== 'All').forEach((ind) =>
      industryMap.set(ind, { count: 0, totalRating: 0 })
    );

    this.movies.forEach((m) => {
      const ind = m.industry || 'Hollywood';
      const entry = industryMap.get(ind) || { count: 0, totalRating: 0 };
      entry.count += 1;
      entry.totalRating += m.rating;
      industryMap.set(ind, entry);
    });

    const industriesDistribution = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        count: data.count,
        avgRating: data.count > 0 ? Number((data.totalRating / data.count).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostPopularIndustry = industriesDistribution[0]?.industry || 'Bollywood';

    // Languages distribution
    const langMap = new Map<string, number>();
    LANGUAGES.filter((l) => l !== 'All').forEach((lang) => langMap.set(lang, 0));

    this.movies.forEach((m) => {
      const count = langMap.get(m.language) || 0;
      langMap.set(m.language, count + 1);
    });

    const languagesDistribution = Array.from(langMap.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

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
      { period: 'Classic (Pre-2000)', count: this.movies.filter((m) => m.year < 2000).length },
      { period: '2000s', count: this.movies.filter((m) => m.year >= 2000 && m.year < 2010).length },
      { period: '2010s', count: this.movies.filter((m) => m.year >= 2010 && m.year < 2020).length },
      { period: '2020s+', count: this.movies.filter((m) => m.year >= 2020).length },
    ];

    return {
      totalMovies: total,
      averageRating: avgRating,
      mostPopularGenre,
      mostPopularIndustry,
      highestRatedMovie,
      genresDistribution,
      industriesDistribution,
      languagesDistribution,
      ratingsDistribution,
      yearDistribution,
    };
  }
}

export const recommendationService = new RecommendationService();
