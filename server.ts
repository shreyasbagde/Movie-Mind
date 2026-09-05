import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MOVIES_DATA } from './src/data/movies';
import { recommendationService } from './src/services/recommendationService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Get all movies or filter
  app.get('/api/movies', (req, res) => {
    const { genre, search } = req.query;
    let list = [...MOVIES_DATA];

    if (genre && typeof genre === 'string' && genre !== 'All') {
      list = list.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  // Get movie by ID
  app.get('/api/movies/:id', (req, res) => {
    const movie = MOVIES_DATA.find((m) => m.id === req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  });

  // Get recommendations
  app.post('/api/recommendations', async (req, res) => {
    const { preferences, limit = 10 } = req.body;
    const results = await recommendationService.getRecommendations(
      preferences || {
        favoriteGenres: ['Sci-Fi', 'Action'],
        preferredRating: 8.0,
        preferredMovieType: 'highly_rated',
      },
      Number(limit)
    );
    res.json(results);
  });

  // Get analytics data
  app.get('/api/analytics', (req, res) => {
    const analytics = recommendationService.getAnalytics();
    res.json(analytics);
  });

  // AI Movie Advisor Chat Endpoint (Gemini 2.5 Flash)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message parameter is required' });
      }

      const client = getGeminiClient();
      if (!client) {
        // Fallback if no API key provided
        const fallbackMovie = MOVIES_DATA[Math.floor(Math.random() * MOVIES_DATA.length)];
        return res.json({
          reply: `I recommend checking out "${fallbackMovie.title}" (${fallbackMovie.year}), directed by ${fallbackMovie.director}. It has an impressive rating of ${fallbackMovie.rating} ⭐ and explores themes of ${fallbackMovie.keywords.slice(0, 3).join(', ')}. To enable full dynamic conversational AI with real-time reasoning, please configure your GEMINI_API_KEY in the environment settings!`,
        });
      }

      const movieCatalogSnippet = MOVIES_DATA.slice(0, 15)
        .map((m) => `• "${m.title}" (${m.year}) - Genres: ${m.genres.join(', ')} | Rating: ${m.rating} | Director: ${m.director} | Synopsis: ${m.overview.slice(0, 120)}...`)
        .join('\n');

      const systemInstruction = `You are CineSuggest AI, an intelligent movie critic and recommendation advisor for a college Data Science showcase website called MovieMind.
Your goal is to suggest personalized movies, explain the cinematographic and narrative reasons why they match the viewer's preferences, and reference films from both the provided catalog and acclaimed cinema history.
Be insightful, enthusiastic, and concise. When you recommend a movie from our catalog, mention its title in quotation marks, its release year, and director.
Available movies in MovieMind catalog:
${movieCatalogSnippet}`;

      // Convert conversation history into contents format
      const formattedContents = history.map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.parts?.[0]?.text || item.text || '' }],
      }));

      // Append latest message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || 'I could not find a recommendation for that query.';
      res.json({ reply: text });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      res.status(500).json({
        reply: `Here's a great recommendation: "Interstellar" (2014) directed by Christopher Nolan. It's a breathtaking sci-fi adventure exploring love, gravity, and relativity with an 8.7 ⭐ rating. (System note: ${error.message || 'Service temporary unavailable'})`,
      });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MovieMind CineSuggest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
