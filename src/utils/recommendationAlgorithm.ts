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
  if (movieRating >= preferredRating) {
    return 1.0;
  }
  const diff = preferredRating - movieRating;
  return Math.max(0, 1 - diff / 4.0);
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
      if (year >= currentYear - 6) return 1.0;
      if (year >= currentYear - 12) return 0.75;
      return Math.max(0.3, (year - 1970) / (currentYear - 1970));
    case 'classics':
      if (year <= 2005) return 1.0;
      if (year <= 2012) return 0.7;
      return 0.3;
    case 'highly_rated':
    case 'popular':
    case 'all':
    default:
      return 0.9;
  }
}

/**
 * Computes recommendation score and explanation for a given movie based on:
 * - Genre Similarity: 35%
 * - Language Match: 20%
 * - Industry Match: 15%
 * - Rating Similarity: 15%
 * - Popularity: 10%
 * - Year Preference: 5%
 */
export function evaluateMovieRecommendation(
  movie: Movie,
  prefs: UserPreferences,
  seedMovie?: Movie
): RecommendationResult {
  // 1. Genre Similarity (35%)
  let genreSimilarity = 0.5;
  const targetGenres = seedMovie ? seedMovie.genres : (prefs.favoriteGenres || []);
  if (targetGenres.length > 0) {
    const matchingGenres = movie.genres.filter((g) =>
      targetGenres.some((tg) => tg.toLowerCase() === g.toLowerCase())
    );
    if (matchingGenres.length > 0) {
      const matchRatio = matchingGenres.length / targetGenres.length;
      genreSimilarity = Math.min(1.0, 0.75 + 0.25 * matchRatio);
    } else {
      genreSimilarity = 0.15;
    }
  } else {
    genreSimilarity = 0.75; // neutral when unconstrained
  }
  const genreScore = genreSimilarity * 35;

  // 2. Language Match (20%)
  let languageSimilarity = 0.75;
  const targetLanguage = seedMovie
    ? seedMovie.language
    : (prefs.preferredLanguage && prefs.preferredLanguage !== 'All' ? prefs.preferredLanguage : '');

  if (targetLanguage) {
    const tLang = targetLanguage.toLowerCase().trim();
    const mLang = movie.language.toLowerCase().trim();

    if (mLang === tLang) {
      languageSimilarity = 1.0;
    } else if (
      // High-affinity crossover for Indian multilingual/pan-Indian releases
      (tLang === 'telugu' && mLang === 'kannada') ||
      (tLang === 'kannada' && mLang === 'telugu') ||
      (tLang === 'tamil' && mLang === 'malayalam') ||
      (tLang === 'malayalam' && mLang === 'tamil') ||
      (tLang === 'hindi' && (mLang === 'telugu' || mLang === 'tamil' || mLang === 'kannada'))
    ) {
      languageSimilarity = 0.5;
    } else {
      languageSimilarity = 0.2;
    }
  }
  const languageScore = languageSimilarity * 20;

  // 3. Industry Match (15%)
  let industrySimilarity = 0.75;
  const targetIndustry = seedMovie
    ? seedMovie.industry
    : (prefs.preferredIndustry && prefs.preferredIndustry !== 'All' ? prefs.preferredIndustry : '');

  if (targetIndustry) {
    const tInd = targetIndustry.toLowerCase().trim();
    const mInd = (movie.industry || '').toLowerCase().trim();

    if (mInd === tInd) {
      industrySimilarity = 1.0;
    } else if (
      // Regional / pan-Indian cinema affinity
      (tInd === 'tollywood' && mInd === 'sandalwood') ||
      (tInd === 'sandalwood' && mInd === 'tollywood') ||
      (tInd === 'kollywood' && mInd === 'mollywood') ||
      (tInd === 'mollywood' && mInd === 'kollywood') ||
      (tInd === 'bollywood' && ['tollywood', 'kollywood', 'sandalwood'].includes(mInd))
    ) {
      industrySimilarity = 0.55;
    } else {
      industrySimilarity = 0.2;
    }
  }
  const industryScore = industrySimilarity * 15;

  // 4. Rating Similarity (15%)
  const targetRating = prefs.preferredRating || 8.0;
  const ratingSimilarity = calculateRatingSimilarity(movie.rating, targetRating);
  const ratingScore = ratingSimilarity * 15;

  // 5. Popularity (10%)
  const popularityNormalized = Math.min(1.0, (movie.popularity || 80) / 100);
  const popularityScore = popularityNormalized * 10;

  // 6. Year Preference (5%)
  const yearNormalized = calculateYearPreferenceScore(
    movie.year,
    prefs.preferredMovieType || 'all'
  );
  const yearScore = yearNormalized * 5;

  // Total weighted score
  const totalRaw =
    genreScore + languageScore + industryScore + ratingScore + popularityScore + yearScore;
  const score = Math.round(Math.min(99, Math.max(15, totalRaw)));

  const breakdown: RecommendationBreakdown = {
    genreScore: Number(genreScore.toFixed(1)),
    languageScore: Number(languageScore.toFixed(1)),
    industryScore: Number(industryScore.toFixed(1)),
    ratingScore: Number(ratingScore.toFixed(1)),
    popularityScore: Number(popularityScore.toFixed(1)),
    yearScore: Number(yearScore.toFixed(1)),
  };

  // Human-readable explanation and match reasons
  const matchReasons: string[] = [];
  const matchingGenres = movie.genres.filter((g) =>
    (targetGenres || []).some((tg) => tg.toLowerCase() === g.toLowerCase())
  );

  if (matchingGenres.length > 0) {
    matchReasons.push(`Shares ${matchingGenres.join(' & ')} genre`);
  }
  if (targetLanguage && movie.language.toLowerCase() === targetLanguage.toLowerCase()) {
    matchReasons.push(`Original ${movie.language} language production`);
  }
  if (targetIndustry && movie.industry.toLowerCase() === targetIndustry.toLowerCase()) {
    matchReasons.push(`${movie.industry} cinema favorite`);
  }
  if (movie.rating >= targetRating - 0.3) {
    matchReasons.push(`Exceptional ${movie.rating} ⭐ rating matches target`);
  }
  if (movie.popularity >= 92) {
    matchReasons.push(`Trending with high audience engagement (${movie.popularity}%)`);
  }

  let explanation = '';
  if (seedMovie) {
    explanation = `Recommended because you watched "${seedMovie.title}" (${seedMovie.industry}, ${matchingGenres.join(', ')}).`;
  } else if (targetLanguage && matchingGenres.length > 0) {
    explanation = `Recommended because you enjoy ${movie.language} ${matchingGenres.join(' & ').toLowerCase()} movies.`;
  } else if (targetIndustry && matchingGenres.length > 0) {
    explanation = `Recommended because you enjoy ${movie.industry} ${matchingGenres.join(' & ').toLowerCase()} movies.`;
  } else if (matchingGenres.length > 0) {
    explanation = `Matches your preference for ${matchingGenres.join(' & ')} movies with a top-rated score.`;
  } else {
    explanation = `Highly acclaimed ${movie.industry} title with ${movie.rating} ⭐ rating and high viewer ratings.`;
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
  limit: number = 12,
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
 * Finds movies most similar to a given reference movie based on genre, industry, language, director, keywords, and rating.
 */
export function getSimilarMovies(
  referenceMovie: Movie,
  allMovies: Movie[],
  limit: number = 6
): RecommendationResult[] {
  const candidates = allMovies.filter((m) => m.id !== referenceMovie.id);

  const results: RecommendationResult[] = candidates.map((movie) => {
    // 1. Shared genres (35%)
    const sharedGenres = movie.genres.filter((g) => referenceMovie.genres.includes(g));
    const genreSim = sharedGenres.length / Math.max(1, referenceMovie.genres.length);
    const genreScore = genreSim * 35;

    // 2. Language match (20%)
    const langSim = movie.language === referenceMovie.language ? 1.0 : 0.3;
    const languageScore = langSim * 20;

    // 3. Industry match (15%)
    const indSim = movie.industry === referenceMovie.industry ? 1.0 : 0.3;
    const industryScore = indSim * 15;

    // 4. Rating proximity (15%)
    const ratingSim = 1 - Math.min(1, Math.abs(movie.rating - referenceMovie.rating) / 4);
    const ratingScore = Math.max(0, ratingSim) * 15;

    // 5. Popularity (10%)
    const popSim = (movie.popularity || 80) / 100;
    const popularityScore = popSim * 10;

    // 6. Director match / Year (5%)
    const directorMatch = movie.director === referenceMovie.director;
    const yearScore = directorMatch ? 5 : 3;

    const totalRaw =
      genreScore + languageScore + industryScore + ratingScore + popularityScore + yearScore;
    const score = Math.round(Math.min(99, Math.max(20, totalRaw)));

    const matchReasons: string[] = [];
    if (sharedGenres.length > 0) matchReasons.push(`Shares ${sharedGenres.slice(0, 2).join(', ')} genre`);
    if (directorMatch) matchReasons.push(`Directed by ${movie.director}`);
    if (movie.industry === referenceMovie.industry) matchReasons.push(`Same ${movie.industry} cinema heritage`);

    return {
      movie,
      score,
      breakdown: {
        genreScore: Number(genreScore.toFixed(1)),
        languageScore: Number(languageScore.toFixed(1)),
        industryScore: Number(industryScore.toFixed(1)),
        ratingScore: Number(ratingScore.toFixed(1)),
        popularityScore: Number(popularityScore.toFixed(1)),
        yearScore: Number(yearScore.toFixed(1)),
      },
      explanation: directorMatch
        ? `Both directed by ${movie.director} with shared ${movie.industry} roots.`
        : `Recommended based on similar themes (${sharedGenres.join(', ')}) to "${referenceMovie.title}".`,
      matchReasons,
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
