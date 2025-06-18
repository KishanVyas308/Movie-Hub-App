// Free suggestion service using multiple sources
import { fetchMovies, searchPeople, fetchGenres } from './api';

interface SuggestionCache {
  [key: string]: {
    suggestions: string[];
    timestamp: number;
  };
}

// Cache suggestions for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const suggestionCache: SuggestionCache = {};

// Popular movie keywords and patterns
const POPULAR_KEYWORDS = [
  'action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy',
  'adventure', 'animation', 'documentary', 'mystery', 'crime', 'war', 'western',
  'superhero', 'marvel', 'dc', 'disney', 'pixar', 'netflix', 'best', 'top', 'new',
  'classic', 'old', 'recent', 'popular', 'trending', 'award', 'oscar', 'blockbuster'
];

const POPULAR_ACTORS = [
  'Tom Hanks', 'Leonardo DiCaprio', 'Brad Pitt', 'Will Smith', 'Robert Downey Jr',
  'Scarlett Johansson', 'Jennifer Lawrence', 'Chris Evans', 'Ryan Reynolds',
  'Dwayne Johnson', 'Tom Cruise', 'Johnny Depp', 'Morgan Freeman', 'Samuel L Jackson',
  'Meryl Streep', 'Angelina Jolie', 'Matt Damon', 'Christian Bale', 'Hugh Jackman'
];

const POPULAR_DIRECTORS = [
  'Christopher Nolan', 'Steven Spielberg', 'Martin Scorsese', 'Quentin Tarantino',
  'James Cameron', 'Ridley Scott', 'Tim Burton', 'David Fincher', 'Denis Villeneuve'
];

const MOOD_SUGGESTIONS = {
  'happy': ['comedy movies', 'feel good films', 'uplifting movies', 'family movies'],
  'sad': ['drama movies', 'emotional films', 'tearjerker movies', 'romantic dramas'],
  'excited': ['action movies', 'adventure films', 'superhero movies', 'blockbusters'],
  'scared': ['horror movies', 'thriller films', 'psychological thrillers', 'scary movies'],
  'romantic': ['romantic movies', 'love stories', 'romantic comedies', 'date night movies'],
  'nostalgic': ['classic movies', '90s films', '80s movies', 'retro films']
};

// Generate smart suggestions based on query
export const generateSmartSuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];

  const cacheKey = query.toLowerCase();
  
  // Check cache first
  if (suggestionCache[cacheKey] && 
      Date.now() - suggestionCache[cacheKey].timestamp < CACHE_DURATION) {
    return suggestionCache[cacheKey].suggestions;
  }

  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  try {
    // 1. Exact and partial matches from popular content
    POPULAR_ACTORS.forEach(actor => {
      if (actor.toLowerCase().includes(lowerQuery) || lowerQuery.includes(actor.toLowerCase())) {
        suggestions.push(`${actor} movies`, `${actor} best films`, `${actor} latest movies`);
      }
    });

    POPULAR_DIRECTORS.forEach(director => {
      if (director.toLowerCase().includes(lowerQuery) || lowerQuery.includes(director.toLowerCase())) {
        suggestions.push(`${director} films`, `${director} movies`, `${director} best work`);
      }
    });

    // 2. Genre and keyword suggestions
    POPULAR_KEYWORDS.forEach(keyword => {
      if (keyword.includes(lowerQuery) || lowerQuery.includes(keyword)) {
        suggestions.push(
          `${keyword} movies`,
          `best ${keyword} films`,
          `${keyword} movies 2023`,
          `top ${keyword} movies`
        );
      }
    });

    // 3. Mood-based suggestions
    Object.entries(MOOD_SUGGESTIONS).forEach(([mood, moodSuggestions]) => {
      if (lowerQuery.includes(mood) || moodSuggestions.some(s => s.includes(lowerQuery))) {
        suggestions.push(...moodSuggestions);
      }
    });

    // 4. Year-based suggestions
    const currentYear = new Date().getFullYear();
    const yearMatch = lowerQuery.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = yearMatch[0];
      suggestions.push(
        `${year} movies`,
        `best movies ${year}`,
        `${year} blockbusters`,
        `${year} oscar winners`
      );
    }

    // 5. Decade suggestions
    const decadeMatch = lowerQuery.match(/\b(\d{2})s\b/);
    if (decadeMatch) {
      const decade = decadeMatch[0];
      suggestions.push(
        `${decade} movies`,
        `classic ${decade} films`,
        `best ${decade} movies`,
        `${decade} blockbusters`
      );
    }

    // 6. Common patterns
    if (lowerQuery.includes('like') || lowerQuery.includes('similar')) {
      suggestions.push(
        'movies like Inception',
        'films similar to Avengers',
        'movies like The Dark Knight',
        'similar to Interstellar'
      );
    }

    // 7. Add basic query variations
    suggestions.push(
      `${query} movies`,
      `${query} cast`,
      `${query} trailer`,
      `${query} review`,
      `best ${query} movies`
    );

    // 8. Try to get real suggestions from TMDB if possible
    try {
      const movieResults = await fetchMovies({ query: query.substring(0, 20) });
      movieResults.slice(0, 3).forEach(movie => {
        suggestions.push(
          movie.title,
          `${movie.title} cast`,
          `movies like ${movie.title}`
        );
      });
    } catch (error) {
      // Ignore TMDB errors for suggestions
    }

    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = [...new Set(suggestions)]
      .filter(s => s.toLowerCase().includes(lowerQuery) || lowerQuery.length < 3)
      .slice(0, 8);

    // Cache the results
    suggestionCache[cacheKey] = {
      suggestions: uniqueSuggestions,
      timestamp: Date.now()
    };

    return uniqueSuggestions;

  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Fallback suggestions
    return [
      `${query} movies`,
      `${query} cast`,
      `best ${query}`,
      `${query} 2023`,
      `popular ${query}`
    ].slice(0, 5);
  }
};

// Get trending suggestions (no API calls needed)
export const getTrendingSuggestions = (): string[] => {
  const currentYear = new Date().getFullYear();
  
  return [
    `best movies ${currentYear}`,
    'Marvel movies',
    'action movies',
    'comedy movies',
    'horror movies',
    'romantic movies',
    'sci-fi movies',
    'animated movies',
    'Oscar winners',
    'Netflix movies',
    'Disney movies',
    'superhero movies'
  ];
};

// Get suggestions based on current trends and seasons
export const getContextualSuggestions = (): string[] => {
  const now = new Date();
  const month = now.getMonth();
  const suggestions: string[] = [];

  // Seasonal suggestions
  if (month >= 9 && month <= 11) { // October-December
    suggestions.push('Halloween movies', 'horror films', 'Christmas movies', 'holiday films');
  } else if (month >= 0 && month <= 2) { // January-March
    suggestions.push('Oscar nominees', 'award winning films', 'winter movies', 'romantic movies');
  } else if (month >= 3 && month <= 5) { // April-June
    suggestions.push('spring movies', 'feel good films', 'adventure movies', 'family movies');
  } else { // July-September
    suggestions.push('summer blockbusters', 'action movies', 'adventure films', 'popcorn movies');
  }

  // Add evergreen suggestions
  suggestions.push(
    'trending now',
    'popular movies',
    'top rated films',
    'new releases',
    'classic movies',
    'must watch films'
  );

  return suggestions;
};

// Clear cache periodically
export const clearSuggestionCache = (): void => {
  Object.keys(suggestionCache).forEach(key => {
    if (Date.now() - suggestionCache[key].timestamp > CACHE_DURATION) {
      delete suggestionCache[key];
    }
  });
};

// Initialize cache cleanup
setInterval(clearSuggestionCache, CACHE_DURATION);