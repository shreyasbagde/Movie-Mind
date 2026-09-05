import { Movie, UserPreferences, RecommendationResult, RecommendationBreakdown } from '../types';

/**
 * Calculates Jaccard similarity between two arrays of strings.
 */
export function calculateJaccardSimilarity(setA: string[], setB: string[]): number {
  if (!setA.length || !setB.length) return 0;
  const lowerA = setA.map((s) => s.toLowerCase().trim());
  const lowerB = setB.map((s) => s.toLowerCase().trim());
  const union = new Set([...lowerA, ...lowerB]);
  const intersection = lowerA.filter((item) => lowerB.includes(item));
  return intersection.length / union.size;
}

/**
 * Calculates rating similarity based on how close the movie's rating is to the user's preference.
 * Scaled 0 to 1.
 */
export function calculateRatingSimilarity(movieRating: number, preferredRating: number): number {
  const maxDiff = 9; // Range from 1 to 10
  const diff = Math.abs(movieRating - preferredRating);
  // Exponential decay or linear proximity:
  return Math.max(0, 1 - diff / maxDiff);
}

/**
 * Calculates year preference score based on user preference category.
 */
export function calculateYearPreferenceScore(
  year: number,
  preference: UserPreferences['preferredMovieType']
): number {
  const currentYear = 2026;
  switch (preference) {
    case 'recent':
      // Favors movies released within last 6 years
      if (year >= currentYear - 6) return 1.0;
      if (year >= currentYear - 12) return 0.7;
      return Math.max(0.2, (year - 1970) / (currentYear - 1970));
    case 'classics':
      // Favors movies before 2005
      if (year <= 2000) return 1.0;
      if (year <= 2008) return 0.7;
      return 0.3;
    case 'highly_rated':
    case 'popular':
    case 'all':
    default:
      // Neutral distribution
      return 0.85;
  }
}

/**
 * Computes recommendation score and explanation for a given movie based on user preferences.
 */
export function evaluateMovieRecommendation(
  movie: Movie,
  prefs: UserPreferences,
  seedMovie?: Movie
): RecommendationResult {
  // 1. Genre Similarity (40%)
  let genreSimilarity = 0;
  const targetGenres = seedMovie ? seedMovie.genres : prefs.favoriteGenres;
  if (targetGenres && targetGenres.length > 0) {
    const matchingGenres = movie.genres.filter((g) =>
      targetGenres.some((tg) => tg.toLowerCase() === g.toLowerCase())
    );
    genreSimilarity = matchingGenres.length / Math.max(1, targetGenres.length);
    // Cap at 1.0
    genreSimilarity = Math.min(1.0, genreSimilarity);
  } else {
    genreSimilarity = 0.5; // neutral if no genres specified
  }

  // 2. Rating Similarity (25%)
  const targetRating = prefs.preferredRating || 8.0;
  const ratingSimilarity = calculateRatingSimilarity(movie.rating, targetRating);

  // 3. Keyword Similarity (15%)
  let keywordSimilarity = 0;
  const targetKeywords = seedMovie ? seedMovie.keywords : (prefs.keywords || []);
  if (targetKeywords.length > 0) {
    keywordSimilarity = calculateJaccardSimilarity(movie.keywords, targetKeywords);
  } else {
    // If no explicit keywords, correlate through overview matching or general thematic richness
    keywordSimilarity = 0.5;
  }

  // 4. Popularity (10%)
  // Normalized 0 - 100 to 0 - 1
  const popularityScoreNormalized = (movie.popularity || 80) / 100;

  // 5. Release-year preference (10%)
  const yearPreferenceNormalized = calculateYearPreferenceScore(
    movie.year,
    prefs.preferredMovieType || 'all'
  );

  // Weighted composition:
  // 40% Genre + 25% Rating + 15% Keyword + 10% Popularity + 10% Year
  const genreScore = genreSimilarity * 40;
  const ratingScore = ratingSimilarity * 25;
  const keywordScore = keywordSimilarity * 15;
  const popularityScore = popularityScoreNormalized * 10;
  const yearScore = yearPreferenceNormalized * 10;

  const totalRaw = genreScore + ratingScore + keywordScore + popularityScore + yearScore;
  const score = Math.round(Math.min(100, Math.max(10, totalRaw)));

  const breakdown: RecommendationBreakdown = {
    genreScore: Number(genreScore.toFixed(1)),
    ratingScore: Number(ratingScore.toFixed(1)),
    keywordScore: Number(keywordScore.toFixed(1)),
    popularityScore: Number(popularityScore.toFixed(1)),
    yearScore: Number(yearScore.toFixed(1)),
  };

  // Generate clear natural language explanation for college presentation
  const matchReasons: string[] = [];
  const matchingGenres = movie.genres.filter((g) =>
    (targetGenres || []).some((tg) => tg.toLowerCase() === g.toLowerCase())
  );

  if (matchingGenres.length > 0) {
    matchReasons.push(`Shares ${matchingGenres.join(' & ')} genres`);
  }
  if (movie.rating >= targetRating - 0.5) {
    matchReasons.push(`High rating of ${movie.rating} ⭐ meets your expectation`);
  }
  if (movie.popularity >= 90) {
    matchReasons.push(`Critically acclaimed and high popularity score (${movie.popularity}/100)`);
  }
  if (prefs.preferredMovieType === 'recent' && movie.year >= 2018) {
    matchReasons.push(`Recent contemporary release (${movie.year})`);
  } else if (prefs.preferredMovieType === 'classics' && movie.year <= 2005) {
    matchReasons.push(`Timeless cinematic classic from ${movie.year}`);
  }

  let explanation = '';
  if (seedMovie) {
    explanation = `Recommended because you watched "${seedMovie.title}" (${matchingGenres.join(', ')}).`;
  } else if (matchingGenres.length > 0) {
    explanation = `Matches your preference for ${matchingGenres.join(' & ')} movies with a stellar ${movie.rating} rating.`;
  } else {
    explanation = `Top-rated cinematic pick with strong critical acclaim (${movie.rating} ⭐) and high viewer engagement.`;
  }

  return {
    movie,
    score,
    breakdown,
    explanation,
    matchReasons,
  };
}

/**
 * Computes recommendations across an entire movie collection and sorts by descending recommendation score.
 */
export function getPersonalizedRecommendations(
  movies: Movie[],
  preferences: UserPreferences,
  limit: number = 10,
  excludeMovieId?: string
): RecommendationResult[] {
  const filtered = excludeMovieId ? movies.filter((m) => m.id !== excludeMovieId) : movies;

  const results = filtered.map((movie) => evaluateMovieRecommendation(movie, preferences));

  // Sort strictly by recommendation score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Content-based filtering for "Because You Watched This":
 * Finds movies most similar to a given reference movie based on genre, director, keywords, and rating.
 */
export function getSimilarMovies(
  referenceMovie: Movie,
  allMovies: Movie[],
  limit: number = 6
): RecommendationResult[] {
  const candidates = allMovies.filter((m) => m.id !== referenceMovie.id);

  const results: RecommendationResult[] = candidates.map((movie) => {
    // Shared genres (40%)
    const sharedGenres = movie.genres.filter((g) => referenceMovie.genres.includes(g));
    const genreSim = sharedGenres.length / Math.max(1, referenceMovie.genres.length);

    // Shared keywords (25%)
    const sharedKeywords = movie.keywords.filter((k) =>
      referenceMovie.keywords.some((rk) => rk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(rk.toLowerCase()))
    );
    const keywordSim = sharedKeywords.length / Math.max(1, referenceMovie.keywords.length);

    // Director match bonus (15%)
    const directorMatch = movie.director === referenceMovie.director ? 1.0 : 0.0;

    // Rating proximity (10%)
    const ratingSim = 1 - Math.min(1, Math.abs(movie.rating - referenceMovie.rating) / 5);

    // Popularity (10%)
    const popSim = movie.popularity / 100;

    const genreScore = genreSim * 40;
    const keywordScore = keywordSim * 25;
    const directorScore = directorMatch * 15;
    const ratingScore = ratingSim * 10;
    const popularityScore = popSim * 10;

    const totalRaw = genreScore + keywordScore + directorScore + ratingScore + popularityScore;
    const score = Math.round(Math.min(99, Math.max(20, totalRaw)));

    const matchReasons: string[] = [];
    if (sharedGenres.length > 0) matchReasons.push(`Shares ${sharedGenres.slice(0, 2).join(', ')} genre`);
    if (directorMatch) matchReasons.push(`Directed by ${movie.director}`);
    if (sharedKeywords.length > 0) matchReasons.push(`Similar themes: ${sharedKeywords.slice(0, 2).join(', ')}`);

    return {
      movie,
      score,
      breakdown: {
        genreScore: Number(genreScore.toFixed(1)),
        ratingScore: Number(ratingScore.toFixed(1)),
        keywordScore: Number(keywordScore.toFixed(1)),
        popularityScore: Number(popularityScore.toFixed(1)),
        yearScore: Number(directorScore.toFixed(1)), // used for director/theme alignment
      },
      explanation: directorMatch
        ? `Both directed by ${movie.director} with shared ${sharedGenres.join('/')} elements.`
        : `Recommended based on similar themes (${sharedGenres.join(', ')}) to "${referenceMovie.title}".`,
      matchReasons,
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
