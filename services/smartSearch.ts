import { fetchMovies, searchPeople, multiSearch, fetchGenres } from './api';

// Smart search without external AI - uses pattern recognition and TMDB data
interface SmartSearchCache {
  [key: string]: {
    result: AISearchResponse;
    timestamp: number;
  };
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const searchCache: SmartSearchCache = {};

// Pattern recognition for different search types
const PERSON_PATTERNS = [
  /\b(actor|actress|star|director|producer)\b/i,
  /\b(movies by|films by|directed by|starring)\b/i,
  /\b(tom hanks|leonardo dicaprio|brad pitt|will smith|robert downey|scarlett johansson|jennifer lawrence|chris evans|ryan reynolds|dwayne johnson|tom cruise|johnny depp|morgan freeman|samuel jackson|meryl streep|angelina jolie|matt damon|christian bale|hugh jackman)\b/i
];

const MOOD_PATTERNS = {
  happy: /\b(funny|comedy|laugh|humor|feel good|uplifting|cheerful|happy)\b/i,
  sad: /\b(sad|cry|emotional|drama|tearjerker|depressing|melancholy)\b/i,
  excited: /\b(action|adventure|exciting|thrilling|intense|adrenaline)\b/i,
  scared: /\b(horror|scary|fear|frightening|terrifying|spooky|creepy)\b/i,
  romantic: /\b(romantic|love|romance|date night|relationship|couple)\b/i,
  nostalgic: /\b(classic|old|vintage|retro|nostalgic|90s|80s|70s)\b/i
};

const GENRE_PATTERNS = {
  action: /\b(action|fight|explosion|superhero|marvel|dc|war|military)\b/i,
  comedy: /\b(comedy|funny|humor|laugh|hilarious|amusing)\b/i,
  drama: /\b(drama|dramatic|serious|emotional|deep)\b/i,
  horror: /\b(horror|scary|fear|ghost|zombie|monster|slasher)\b/i,
  thriller: /\b(thriller|suspense|mystery|crime|detective|noir)\b/i,
  romance: /\b(romance|romantic|love|relationship|wedding)\b/i,
  'sci-fi': /\b(sci-fi|science fiction|space|alien|future|robot|cyberpunk)\b/i,
  fantasy: /\b(fantasy|magic|wizard|dragon|medieval|fairy tale)\b/i,
  animation: /\b(animated|animation|cartoon|pixar|disney|anime)\b/i,
  documentary: /\b(documentary|real|true story|biography|historical)\b/i
};

const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const DECADE_PATTERN = /\b(\d{2})s\b/;
const QUALITY_PATTERNS = {
  high: /\b(best|top|greatest|excellent|masterpiece|oscar|award)\b/i,
  recent: /\b(new|recent|latest|2023|2024|current)\b/i,
  popular: /\b(popular|trending|blockbuster|hit|famous)\b/i
};

export const smartSearch = async (query: string): Promise<AISearchResponse> => {
  const cacheKey = query.toLowerCase().trim();
  
  // Check cache first
  if (searchCache[cacheKey] && 
      Date.now() - searchCache[cacheKey].timestamp < CACHE_DURATION) {
    return searchCache[cacheKey].result;
  }

  try {
    const lowerQuery = query.toLowerCase();
    let searchType: 'movie' | 'person' | 'genre' | 'mood' | 'complex' = 'movie';
    let explanation = '';
    let suggestions: string[] = [];
    let recommendations: Movie[] = [];

    // 1. Detect search type using patterns
    const isPersonSearch = PERSON_PATTERNS.some(pattern => pattern.test(query));
    
    let detectedMood: string | null = null;
    for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
      if (pattern.test(query)) {
        detectedMood = mood;
        searchType = 'mood';
        break;
      }
    }

    let detectedGenre: string | null = null;
    for (const [genre, pattern] of Object.entries(GENRE_PATTERNS)) {
      if (pattern.test(query)) {
        detectedGenre = genre;
        searchType = 'genre';
        break;
      }
    }

    if (isPersonSearch) {
      searchType = 'person';
    }

    // 2. Extract year information
    const yearMatch = query.match(YEAR_PATTERN);
    const decadeMatch = query.match(DECADE_PATTERN);
    let yearFilter: number | null = null;
    let yearRange: { start: number; end: number } | null = null;

    if (yearMatch) {
      yearFilter = parseInt(yearMatch[0]);
    } else if (decadeMatch) {
      const decade = parseInt(decadeMatch[1]);
      const startYear = decade < 30 ? 2000 + decade : 1900 + decade;
      yearRange = { start: startYear, end: startYear + 9 };
    }

    // 3. Detect quality preferences
    const isHighQuality = QUALITY_PATTERNS.high.test(query);
    const isRecent = QUALITY_PATTERNS.recent.test(query);
    const isPopular = QUALITY_PATTERNS.popular.test(query);

    // 4. Perform search based on detected type
    try {
      switch (searchType) {
        case 'person':
          // Extract person name from query
          const personName = query.replace(/\b(movies by|films by|directed by|starring|actor|actress|star|director|producer)\b/gi, '').trim();
          const personResults = await searchPeople(personName);
          
          if (personResults.results.length > 0) {
            const person = personResults.results[0];
            recommendations = person.known_for || [];
            explanation = `Movies featuring ${person.name}`;
            suggestions = [
              `${person.name} best movies`,
              `${person.name} latest films`,
              `${person.name} popular movies`,
              `${person.name} filmography`,
              `actors like ${person.name}`
            ];
          } else {
            // Fallback to regular search
            recommendations = await fetchMovies({ query });
            explanation = `Search results for "${query}"`;
          }
          break;

        case 'mood':
        case 'genre':
          // Get genre mapping
          const genres = await fetchGenres();
          let targetGenres: number[] = [];

          if (detectedMood) {
            const moodGenreMap: Record<string, string[]> = {
              happy: ['Comedy', 'Family', 'Animation', 'Adventure'],
              sad: ['Drama', 'Romance'],
              excited: ['Action', 'Adventure', 'Thriller'],
              scared: ['Horror', 'Thriller'],
              romantic: ['Romance', 'Drama'],
              nostalgic: ['Drama', 'Family']
            };
            
            const moodGenres = moodGenreMap[detectedMood] || [];
            targetGenres = genres
              .filter(g => moodGenres.includes(g.name))
              .map(g => g.id);
            
            explanation = `${detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)} movies to match your mood`;
            suggestions = [
              `best ${detectedMood} movies`,
              `${detectedMood} movies 2023`,
              `popular ${detectedMood} films`,
              `${detectedMood} movie recommendations`,
              `feel ${detectedMood} movies`
            ];
          } else if (detectedGenre) {
            const genreObj = genres.find(g => g.name.toLowerCase() === detectedGenre.toLowerCase());
            if (genreObj) {
              targetGenres = [genreObj.id];
            }
            
            explanation = `Great ${detectedGenre} movies for you`;
            suggestions = [
              `best ${detectedGenre} movies`,
              `${detectedGenre} movies 2023`,
              `top ${detectedGenre} films`,
              `popular ${detectedGenre} movies`,
              `${detectedGenre} blockbusters`
            ];
          }

          if (targetGenres.length > 0) {
            recommendations = await fetchMovies({ 
              query: '', 
              genre: targetGenres[0]
            });
          } else {
            recommendations = await fetchMovies({ query });
          }
          break;

        default:
          // Regular movie search
          recommendations = await fetchMovies({ query });
          explanation = `Movies matching "${query}"`;
          suggestions = [
            `${query} cast`,
            `${query} trailer`,
            `${query} review`,
            `movies like ${query}`,
            `${query} similar films`
          ];
      }

      // 5. Apply filters based on detected patterns
      if (yearFilter) {
        recommendations = recommendations.filter(movie => {
          if (!movie.release_date) return false;
          const movieYear = new Date(movie.release_date).getFullYear();
          return movieYear === yearFilter;
        });
      } else if (yearRange) {
        recommendations = recommendations.filter(movie => {
          if (!movie.release_date) return false;
          const movieYear = new Date(movie.release_date).getFullYear();
          return movieYear >= yearRange.start && movieYear <= yearRange.end;
        });
      }

      // 6. Apply quality filters
      if (isHighQuality) {
        recommendations = recommendations
          .filter(movie => movie.vote_average >= 7.0)
          .sort((a, b) => b.vote_average - a.vote_average);
      } else if (isPopular) {
        recommendations = recommendations
          .sort((a, b) => b.popularity - a.popularity);
      } else if (isRecent) {
        const currentYear = new Date().getFullYear();
        recommendations = recommendations
          .filter(movie => {
            if (!movie.release_date) return false;
            const movieYear = new Date(movie.release_date).getFullYear();
            return movieYear >= currentYear - 2;
          })
          .sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());
      } else {
        // Default sorting: balance of rating and popularity
        recommendations = recommendations
          .sort((a, b) => (b.vote_average * 0.7 + b.popularity * 0.3) - (a.vote_average * 0.7 + a.popularity * 0.3));
      }

      // Limit results
      recommendations = recommendations.slice(0, 20);

      // 7. Generate contextual suggestions if none exist
      if (suggestions.length === 0) {
        suggestions = [
          `${query} movies`,
          `${query} cast`,
          `best ${query}`,
          `${query} 2023`,
          `popular ${query}`
        ];
      }

    } catch (searchError) {
      console.error('Search error:', searchError);
      
      // Ultimate fallback
      recommendations = await fetchMovies({ query });
      explanation = `Search results for "${query}"`;
      suggestions = [
        `${query} movies`,
        `${query} cast`,
        `similar to ${query}`,
        `${query} genre`,
        `best ${query} films`
      ];
    }

    const result: AISearchResponse = {
      suggestions: suggestions.slice(0, 5),
      recommendations,
      explanation,
      searchType
    };

    // Cache the result
    searchCache[cacheKey] = {
      result,
      timestamp: Date.now()
    };

    return result;

  } catch (error) {
    console.error('Smart search error:', error);
    
    // Final fallback
    const fallbackResults = await fetchMovies({ query });
    
    return {
      suggestions: [
        `Movies with "${query}"`,
        `${query} cast`,
        `Similar to ${query}`,
        `${query} genre`,
        `Best ${query} movies`
      ],
      recommendations: fallbackResults.slice(0, 20),
      explanation: `Showing search results for "${query}"`,
      searchType: 'movie'
    };
  }
};

// Clear cache periodically
export const clearSmartSearchCache = (): void => {
  Object.keys(searchCache).forEach(key => {
    if (Date.now() - searchCache[key].timestamp > CACHE_DURATION) {
      delete searchCache[key];
    }
  });
};

// Initialize cache cleanup
setInterval(clearSmartSearchCache, CACHE_DURATION);