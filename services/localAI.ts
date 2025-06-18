// Local AI service with no external dependencies or rate limits
import { fetchMovies, searchPeople, multiSearch, fetchGenres } from './api';

interface LocalAICache {
  [key: string]: {
    response: AISearchResponse;
    timestamp: number;
  };
}

const localCache: LocalAICache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Advanced pattern recognition for intelligent search
const SEARCH_PATTERNS = {
  // Person patterns
  person: {
    patterns: [
      /\b(actor|actress|star|director|producer|starring|movies by|films by|directed by)\s+([a-zA-Z\s]+)/i,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(movies|films|filmography)/i,
      /\b(tom hanks|leonardo dicaprio|brad pitt|will smith|robert downey|scarlett johansson|jennifer lawrence|chris evans|ryan reynolds|dwayne johnson|tom cruise|johnny depp|morgan freeman|samuel jackson|meryl streep|angelina jolie|matt damon|christian bale|hugh jackman|christopher nolan|steven spielberg|martin scorsese|quentin tarantino)\b/i
    ],
    extract: (query: string) => {
      for (const pattern of SEARCH_PATTERNS.person.patterns) {
        const match = query.match(pattern);
        if (match) {
          return match[2] || match[1] || match[0];
        }
      }
      return query;
    }
  },

  // Mood patterns with emotional intelligence
  mood: {
    happy: {
      patterns: /\b(funny|comedy|laugh|humor|feel good|uplifting|cheerful|happy|lighthearted|amusing|hilarious|witty|joyful)\b/i,
      genres: ['Comedy', 'Family', 'Animation', 'Adventure'],
      keywords: ['comedy', 'funny', 'laugh', 'humor', 'feel good']
    },
    sad: {
      patterns: /\b(sad|cry|emotional|drama|tearjerker|depressing|melancholy|heartbreaking|tragic|moving|touching)\b/i,
      genres: ['Drama', 'Romance'],
      keywords: ['drama', 'emotional', 'sad', 'cry', 'heartbreaking']
    },
    excited: {
      patterns: /\b(action|adventure|exciting|thrilling|intense|adrenaline|explosive|fast-paced|high-octane)\b/i,
      genres: ['Action', 'Adventure', 'Thriller'],
      keywords: ['action', 'adventure', 'exciting', 'thrilling', 'intense']
    },
    scared: {
      patterns: /\b(horror|scary|fear|frightening|terrifying|spooky|creepy|haunting|nightmare|chilling)\b/i,
      genres: ['Horror', 'Thriller'],
      keywords: ['horror', 'scary', 'fear', 'frightening', 'spooky']
    },
    romantic: {
      patterns: /\b(romantic|love|romance|date night|relationship|couple|wedding|valentine|passionate)\b/i,
      genres: ['Romance', 'Drama'],
      keywords: ['romantic', 'love', 'romance', 'relationship', 'couple']
    },
    nostalgic: {
      patterns: /\b(classic|old|vintage|retro|nostalgic|90s|80s|70s|throwback|timeless)\b/i,
      genres: ['Drama', 'Family', 'Adventure'],
      keywords: ['classic', 'old', 'vintage', 'retro', 'nostalgic']
    }
  },

  // Genre patterns with comprehensive coverage
  genre: {
    action: /\b(action|fight|explosion|superhero|marvel|dc|war|military|combat|battle|spy|agent)\b/i,
    comedy: /\b(comedy|funny|humor|laugh|hilarious|amusing|witty|parody|satire)\b/i,
    drama: /\b(drama|dramatic|serious|emotional|deep|intense|character study)\b/i,
    horror: /\b(horror|scary|fear|ghost|zombie|monster|slasher|supernatural|paranormal)\b/i,
    thriller: /\b(thriller|suspense|mystery|crime|detective|noir|psychological|investigation)\b/i,
    romance: /\b(romance|romantic|love|relationship|wedding|dating|passion)\b/i,
    'sci-fi': /\b(sci-fi|science fiction|space|alien|future|robot|cyberpunk|dystopian|time travel)\b/i,
    fantasy: /\b(fantasy|magic|wizard|dragon|medieval|fairy tale|mythical|supernatural)\b/i,
    animation: /\b(animated|animation|cartoon|pixar|disney|anime|family|kids)\b/i,
    documentary: /\b(documentary|real|true story|biography|historical|based on)\b/i,
    western: /\b(western|cowboy|wild west|frontier|gunslinger)\b/i,
    musical: /\b(musical|music|singing|dance|broadway|soundtrack)\b/i
  },

  // Time patterns
  time: {
    year: /\b(19|20)\d{2}\b/,
    decade: /\b(\d{2})s\b/,
    era: {
      'silent era': /\b(silent|1920s|charlie chaplin)\b/i,
      'golden age': /\b(golden age|1930s|1940s|1950s|classic hollywood)\b/i,
      'new hollywood': /\b(new hollywood|1960s|1970s)\b/i,
      'blockbuster era': /\b(1980s|1990s|blockbuster)\b/i,
      'modern': /\b(2000s|2010s|2020s|modern|contemporary|recent)\b/i
    }
  },

  // Quality patterns
  quality: {
    best: /\b(best|top|greatest|excellent|masterpiece|oscar|award|acclaimed|legendary|iconic)\b/i,
    recent: /\b(new|recent|latest|2023|2024|current|modern|fresh)\b/i,
    popular: /\b(popular|trending|blockbuster|hit|famous|viral|mainstream)\b/i,
    underrated: /\b(underrated|hidden gem|overlooked|cult|indie|independent)\b/i,
    critically_acclaimed: /\b(critically acclaimed|oscar winner|award winning|festival|cannes|sundance)\b/i
  },

  // Similarity patterns
  similarity: /\b(like|similar to|movies like|films like|in the style of|reminiscent of)\s+([^,\.!?]+)/i
};

export const localAISearch = async (query: string): Promise<AISearchResponse> => {
  const cacheKey = query.toLowerCase().trim();
  
  // Check cache first
  if (localCache[cacheKey] && Date.now() - localCache[cacheKey].timestamp < CACHE_DURATION) {
    return localCache[cacheKey].response;
  }

  try {
    const analysis = await analyzeQuery(query);
    const result = await processAnalysis(query, analysis);
    
    // Cache the result
    localCache[cacheKey] = {
      response: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Local AI Search Error:', error);
    
    // Fallback to basic search
    const fallbackResults = await fetchMovies({ query });
    return {
      suggestions: generateBasicSuggestions(query),
      recommendations: fallbackResults.slice(0, 20),
      explanation: `Showing search results for "${query}"`,
      searchType: 'movie'
    };
  }
};

async function analyzeQuery(query: string) {
  const lowerQuery = query.toLowerCase();
  const analysis = {
    searchType: 'movie' as 'movie' | 'person' | 'genre' | 'mood' | 'complex',
    extractedTerms: [query],
    mood: null as string | null,
    genres: [] as string[],
    person: null as string | null,
    timeFilter: null as { start: number; end: number } | null,
    quality: null as string | null,
    similarity: null as string | null,
    confidence: 0
  };

  let confidence = 0;

  // 1. Check for person search
  for (const pattern of SEARCH_PATTERNS.person.patterns) {
    if (pattern.test(query)) {
      analysis.searchType = 'person';
      analysis.person = SEARCH_PATTERNS.person.extract(query);
      confidence += 30;
      break;
    }
  }

  // 2. Check for mood
  for (const [mood, config] of Object.entries(SEARCH_PATTERNS.mood)) {
    if (config.patterns.test(lowerQuery)) {
      analysis.mood = mood;
      analysis.searchType = 'mood';
      confidence += 25;
      break;
    }
  }

  // 3. Check for genres
  for (const [genre, pattern] of Object.entries(SEARCH_PATTERNS.genre)) {
    if (pattern.test(lowerQuery)) {
      analysis.genres.push(genre);
      if (analysis.searchType === 'movie') {
        analysis.searchType = 'genre';
      }
      confidence += 20;
    }
  }

  // 4. Check for time filters
  const yearMatch = lowerQuery.match(SEARCH_PATTERNS.time.year);
  const decadeMatch = lowerQuery.match(SEARCH_PATTERNS.time.decade);
  
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    analysis.timeFilter = { start: year, end: year };
    confidence += 15;
  } else if (decadeMatch) {
    const decade = parseInt(decadeMatch[1]);
    const startYear = decade < 30 ? 2000 + decade : 1900 + decade;
    analysis.timeFilter = { start: startYear, end: startYear + 9 };
    confidence += 15;
  }

  // 5. Check for quality preferences
  for (const [quality, pattern] of Object.entries(SEARCH_PATTERNS.quality)) {
    if (pattern.test(lowerQuery)) {
      analysis.quality = quality;
      confidence += 10;
      break;
    }
  }

  // 6. Check for similarity
  const similarityMatch = lowerQuery.match(SEARCH_PATTERNS.similarity);
  if (similarityMatch) {
    analysis.similarity = similarityMatch[2].trim();
    analysis.searchType = 'complex';
    confidence += 20;
  }

  analysis.confidence = Math.min(confidence, 100);
  return analysis;
}

async function processAnalysis(query: string, analysis: any): Promise<AISearchResponse> {
  let recommendations: Movie[] = [];
  let explanation = '';
  let suggestions: string[] = [];

  try {
    switch (analysis.searchType) {
      case 'person':
        const personName = analysis.person || query;
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
          recommendations = await fetchMovies({ query: personName });
          explanation = `Search results for "${personName}"`;
        }
        break;

      case 'mood':
        const moodConfig = SEARCH_PATTERNS.mood[analysis.mood as keyof typeof SEARCH_PATTERNS.mood];
        if (moodConfig) {
          const genres = await fetchGenres();
          const targetGenres = genres
            .filter(g => moodConfig.genres.includes(g.name))
            .map(g => g.id);
          
          if (targetGenres.length > 0) {
            recommendations = await fetchMovies({ 
              query: '', 
              genre: targetGenres[0]
            });
          }
          
          explanation = `${analysis.mood.charAt(0).toUpperCase() + analysis.mood.slice(1)} movies to match your mood`;
          suggestions = moodConfig.keywords.map(keyword => `${keyword} movies`);
        }
        break;

      case 'genre':
        const genres = await fetchGenres();
        const genreNames = analysis.genres;
        const targetGenreIds: number[] = [];
        
        for (const genreName of genreNames) {
          const genreObj = genres.find(g => g.name.toLowerCase() === genreName.toLowerCase());
          if (genreObj) {
            targetGenreIds.push(genreObj.id);
          }
        }
        
        if (targetGenreIds.length > 0) {
          recommendations = await fetchMovies({ 
            query: '', 
            genre: targetGenreIds[0]
          });
        }
        
        explanation = `Great ${genreNames.join(' and ')} movies for you`;
        suggestions = genreNames.flatMap(genre => [
          `best ${genre} movies`,
          `${genre} movies 2023`,
          `top ${genre} films`
        ]);
        break;

      case 'complex':
        if (analysis.similarity) {
          // Search for the similar movie first
          const similarMovies = await fetchMovies({ query: analysis.similarity });
          if (similarMovies.length > 0) {
            // Use the first result to find similar movies
            recommendations = await fetchMovies({ query: analysis.similarity });
            explanation = `Movies similar to "${analysis.similarity}"`;
            suggestions = [
              `movies like ${analysis.similarity}`,
              `${analysis.similarity} similar films`,
              `${analysis.similarity} recommendations`,
              `films similar to ${analysis.similarity}`,
              `${analysis.similarity} genre`
            ];
          }
        } else {
          recommendations = await fetchMovies({ query });
          explanation = `Complex search results for "${query}"`;
        }
        break;

      default:
        recommendations = await fetchMovies({ query });
        explanation = `Movies matching "${query}"`;
        suggestions = generateBasicSuggestions(query);
    }

    // Apply filters
    if (analysis.timeFilter) {
      recommendations = recommendations.filter(movie => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear();
        return movieYear >= analysis.timeFilter!.start && movieYear <= analysis.timeFilter!.end;
      });
    }

    // Apply quality filters
    if (analysis.quality) {
      switch (analysis.quality) {
        case 'best':
          recommendations = recommendations
            .filter(movie => movie.vote_average >= 7.0)
            .sort((a, b) => b.vote_average - a.vote_average);
          break;
        case 'popular':
          recommendations = recommendations
            .sort((a, b) => b.popularity - a.popularity);
          break;
        case 'recent':
          const currentYear = new Date().getFullYear();
          recommendations = recommendations
            .filter(movie => {
              if (!movie.release_date) return false;
              const movieYear = new Date(movie.release_date).getFullYear();
              return movieYear >= currentYear - 2;
            })
            .sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());
          break;
        case 'critically_acclaimed':
          recommendations = recommendations
            .filter(movie => movie.vote_average >= 8.0 && movie.vote_count >= 1000)
            .sort((a, b) => b.vote_average - a.vote_average);
          break;
      }
    }

    // Default sorting and limit
    if (!analysis.quality) {
      recommendations = recommendations
        .sort((a, b) => (b.vote_average * 0.7 + b.popularity * 0.3) - (a.vote_average * 0.7 + a.popularity * 0.3));
    }
    
    recommendations = recommendations.slice(0, 20);

    // Generate suggestions if none exist
    if (suggestions.length === 0) {
      suggestions = generateBasicSuggestions(query);
    }

  } catch (error) {
    console.error('Error processing analysis:', error);
    
    // Fallback
    recommendations = await fetchMovies({ query });
    explanation = `Search results for "${query}"`;
    suggestions = generateBasicSuggestions(query);
  }

  return {
    suggestions: suggestions.slice(0, 5),
    recommendations,
    explanation: explanation || `Showing results for "${query}"`,
    searchType: analysis.searchType
  };
}

function generateBasicSuggestions(query: string): string[] {
  return [
    `${query} movies`,
    `${query} cast`,
    `${query} trailer`,
    `${query} review`,
    `movies like ${query}`
  ];
}

// Generate smart suggestions based on query
export const getLocalAISuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) {
    return getTrendingSuggestions();
  }

  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Smart pattern-based suggestions
  try {
    // Person suggestions
    for (const pattern of SEARCH_PATTERNS.person.patterns) {
      if (pattern.test(query)) {
        const person = SEARCH_PATTERNS.person.extract(query);
        suggestions.push(
          `${person} movies`,
          `${person} best films`,
          `${person} latest movies`,
          `${person} filmography`
        );
        break;
      }
    }

    // Mood suggestions
    for (const [mood, config] of Object.entries(SEARCH_PATTERNS.mood)) {
      if (config.patterns.test(lowerQuery)) {
        suggestions.push(...config.keywords.map(k => `${k} movies`));
        break;
      }
    }

    // Genre suggestions
    for (const [genre, pattern] of Object.entries(SEARCH_PATTERNS.genre)) {
      if (pattern.test(lowerQuery)) {
        suggestions.push(
          `${genre} movies`,
          `best ${genre} films`,
          `${genre} movies 2023`,
          `top ${genre} movies`
        );
        break;
      }
    }

    // Add general suggestions
    suggestions.push(
      `${query} movies`,
      `${query} cast`,
      `${query} trailer`,
      `movies like ${query}`,
      `${query} review`
    );

    // Remove duplicates and return top 6
    return [...new Set(suggestions)].slice(0, 6);

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return generateBasicSuggestions(query).slice(0, 5);
  }
};

function getTrendingSuggestions(): string[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  const seasonal: string[] = [];
  
  // Seasonal suggestions
  if (month >= 9 && month <= 11) { // Oct-Dec
    seasonal.push('Halloween movies', 'Christmas films', 'holiday movies');
  } else if (month >= 0 && month <= 2) { // Jan-Mar
    seasonal.push('Oscar nominees', 'award winners', 'winter movies');
  } else if (month >= 3 && month <= 5) { // Apr-Jun
    seasonal.push('spring movies', 'feel good films', 'family movies');
  } else { // Jul-Sep
    seasonal.push('summer blockbusters', 'action movies', 'adventure films');
  }
  
  const trending = [
    'Marvel movies',
    'action movies',
    'comedy films',
    'horror movies',
    'romantic movies',
    'sci-fi movies',
    'animated movies',
    'Netflix movies',
    'Disney movies',
    `best movies ${year}`
  ];
  
  return [...seasonal, ...trending].slice(0, 8);
}

// Clear cache periodically
setInterval(() => {
  Object.keys(localCache).forEach(key => {
    if (Date.now() - localCache[key].timestamp > CACHE_DURATION) {
      delete localCache[key];
    }
  });
}, CACHE_DURATION);