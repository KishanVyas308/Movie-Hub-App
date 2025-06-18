// Working AI service using free APIs and smart local processing
import { fetchMovies, searchPeople, multiSearch, fetchGenres } from './api';

interface AICache {
  [key: string]: {
    response: AISearchResponse;
    timestamp: number;
  };
}

const aiCache: AICache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Smart pattern recognition system
const SMART_PATTERNS = {
  // Person patterns with comprehensive coverage
  person: {
    indicators: [
      /\b(actor|actress|star|director|producer|starring|movies by|films by|directed by|featuring)\s+([a-zA-Z\s]+)/i,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(movies|films|filmography|acting|directing)/i,
      // Popular actors and directors
      /\b(tom hanks|leonardo dicaprio|brad pitt|will smith|robert downey|scarlett johansson|jennifer lawrence|chris evans|ryan reynolds|dwayne johnson|tom cruise|johnny depp|morgan freeman|samuel jackson|meryl streep|angelina jolie|matt damon|christian bale|hugh jackman|ryan gosling|emma stone|natalie portman|anne hathaway|sandra bullock|julia roberts|denzel washington|kevin hart|the rock)\b/i,
      /\b(christopher nolan|steven spielberg|martin scorsese|quentin tarantino|james cameron|ridley scott|tim burton|david fincher|denis villeneuve|jordan peele|greta gerwig|rian johnson|edgar wright|wes anderson|coen brothers)\b/i
    ],
    extract: (query: string) => {
      for (const pattern of SMART_PATTERNS.person.indicators) {
        const match = query.match(pattern);
        if (match) {
          // Return the person name, cleaning up common words
          const name = (match[2] || match[1] || match[0])
            .replace(/\b(movies|films|filmography|acting|directing|actor|actress|star|director|producer)\b/gi, '')
            .trim();
          return name || match[0];
        }
      }
      return query;
    }
  },

  // Mood patterns with emotional intelligence
  mood: {
    happy: {
      patterns: /\b(funny|comedy|laugh|humor|feel good|uplifting|cheerful|happy|lighthearted|amusing|hilarious|witty|joyful|entertaining|fun|silly|goofy)\b/i,
      genres: ['Comedy', 'Family', 'Animation', 'Adventure', 'Musical'],
      suggestions: ['comedy movies', 'feel good films', 'funny movies', 'family movies', 'animated movies']
    },
    sad: {
      patterns: /\b(sad|cry|emotional|drama|tearjerker|depressing|melancholy|heartbreaking|tragic|moving|touching|dramatic|serious|deep)\b/i,
      genres: ['Drama', 'Romance'],
      suggestions: ['drama movies', 'emotional films', 'sad movies', 'romantic dramas', 'tearjerker movies']
    },
    excited: {
      patterns: /\b(action|adventure|exciting|thrilling|intense|adrenaline|explosive|fast-paced|high-octane|energetic|dynamic)\b/i,
      genres: ['Action', 'Adventure', 'Thriller'],
      suggestions: ['action movies', 'adventure films', 'thrilling movies', 'exciting films', 'blockbuster movies']
    },
    scared: {
      patterns: /\b(horror|scary|fear|frightening|terrifying|spooky|creepy|haunting|nightmare|chilling|eerie|supernatural)\b/i,
      genres: ['Horror', 'Thriller'],
      suggestions: ['horror movies', 'scary films', 'frightening movies', 'supernatural films', 'thriller movies']
    },
    romantic: {
      patterns: /\b(romantic|love|romance|date night|relationship|couple|wedding|valentine|passionate|intimate)\b/i,
      genres: ['Romance', 'Drama'],
      suggestions: ['romantic movies', 'love stories', 'romantic comedies', 'date night movies', 'relationship films']
    },
    nostalgic: {
      patterns: /\b(classic|old|vintage|retro|nostalgic|90s|80s|70s|60s|throwback|timeless|golden age)\b/i,
      genres: ['Drama', 'Family', 'Adventure'],
      suggestions: ['classic movies', 'vintage films', 'retro movies', 'nostalgic films', 'timeless movies']
    }
  },

  // Genre patterns with comprehensive coverage
  genre: {
    action: /\b(action|fight|explosion|superhero|marvel|dc|war|military|combat|battle|spy|agent|guns|violence)\b/i,
    comedy: /\b(comedy|funny|humor|laugh|hilarious|amusing|witty|parody|satire|slapstick)\b/i,
    drama: /\b(drama|dramatic|serious|emotional|deep|intense|character study|biographical)\b/i,
    horror: /\b(horror|scary|fear|ghost|zombie|monster|slasher|supernatural|paranormal|demon)\b/i,
    thriller: /\b(thriller|suspense|mystery|crime|detective|noir|psychological|investigation|murder)\b/i,
    romance: /\b(romance|romantic|love|relationship|wedding|dating|passion|intimate)\b/i,
    'sci-fi': /\b(sci-fi|science fiction|space|alien|future|robot|cyberpunk|dystopian|time travel|technology)\b/i,
    fantasy: /\b(fantasy|magic|wizard|dragon|medieval|fairy tale|mythical|supernatural|enchanted)\b/i,
    animation: /\b(animated|animation|cartoon|pixar|disney|anime|family|kids|children)\b/i,
    documentary: /\b(documentary|real|true story|biography|historical|based on|factual)\b/i,
    western: /\b(western|cowboy|wild west|frontier|gunslinger|saloon)\b/i,
    musical: /\b(musical|music|singing|dance|broadway|soundtrack|opera)\b/i,
    war: /\b(war|military|soldier|battle|combat|army|navy|marines|conflict)\b/i,
    sports: /\b(sports|football|basketball|baseball|boxing|racing|olympics|athlete)\b/i
  },

  // Time patterns
  time: {
    year: /\b(19|20)\d{2}\b/,
    decade: /\b(\d{2})s\b/,
    era: {
      'silent era': /\b(silent|1920s|charlie chaplin|buster keaton)\b/i,
      'golden age': /\b(golden age|1930s|1940s|1950s|classic hollywood|old hollywood)\b/i,
      'new hollywood': /\b(new hollywood|1960s|1970s|counterculture)\b/i,
      'blockbuster era': /\b(1980s|1990s|blockbuster|summer movies)\b/i,
      'modern': /\b(2000s|2010s|2020s|modern|contemporary|recent|current)\b/i
    }
  },

  // Quality patterns
  quality: {
    best: /\b(best|top|greatest|excellent|masterpiece|oscar|award|acclaimed|legendary|iconic|perfect|outstanding)\b/i,
    recent: /\b(new|recent|latest|2023|2024|current|modern|fresh|newest)\b/i,
    popular: /\b(popular|trending|blockbuster|hit|famous|viral|mainstream|box office)\b/i,
    underrated: /\b(underrated|hidden gem|overlooked|cult|indie|independent|unknown)\b/i,
    critically_acclaimed: /\b(critically acclaimed|oscar winner|award winning|festival|cannes|sundance|golden globe)\b/i,
    high_rated: /\b(high rated|top rated|highly rated|well reviewed|critically praised)\b/i
  },

  // Similarity patterns
  similarity: /\b(like|similar to|movies like|films like|in the style of|reminiscent of|comparable to)\s+([^,\.!?]+)/i,

  // Franchise patterns
  franchise: /\b(marvel|dc|star wars|harry potter|lord of the rings|fast and furious|mission impossible|james bond|john wick|transformers|x-men|avengers)\b/i
};

export const workingAISearch = async (query: string): Promise<AISearchResponse> => {
  const cacheKey = query.toLowerCase().trim();
  
  // Check cache first
  if (aiCache[cacheKey] && Date.now() - aiCache[cacheKey].timestamp < CACHE_DURATION) {
    return aiCache[cacheKey].response;
  }

  try {
    const analysis = await analyzeQueryIntelligently(query);
    const result = await processIntelligentAnalysis(query, analysis);
    
    // Cache the result
    aiCache[cacheKey] = {
      response: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Working AI Search Error:', error);
    
    // Fallback to basic search
    const fallbackResults = await fetchMovies({ query });
    return {
      suggestions: generateSmartSuggestions(query),
      recommendations: fallbackResults.slice(0, 20),
      explanation: `Showing search results for "${query}"`,
      searchType: 'movie'
    };
  }
};

async function analyzeQueryIntelligently(query: string) {
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
    franchise: null as string | null,
    confidence: 0
  };

  let confidence = 0;

  // 1. Check for person search (highest priority)
  for (const pattern of SMART_PATTERNS.person.indicators) {
    if (pattern.test(query)) {
      analysis.searchType = 'person';
      analysis.person = SMART_PATTERNS.person.extract(query);
      confidence += 40;
      break;
    }
  }

  // 2. Check for franchise
  const franchiseMatch = lowerQuery.match(SMART_PATTERNS.franchise);
  if (franchiseMatch) {
    analysis.franchise = franchiseMatch[0];
    confidence += 30;
  }

  // 3. Check for mood (high priority)
  for (const [mood, config] of Object.entries(SMART_PATTERNS.mood)) {
    if (config.patterns.test(lowerQuery)) {
      analysis.mood = mood;
      if (analysis.searchType === 'movie') {
        analysis.searchType = 'mood';
      }
      confidence += 35;
      break;
    }
  }

  // 4. Check for genres
  for (const [genre, pattern] of Object.entries(SMART_PATTERNS.genre)) {
    if (pattern.test(lowerQuery)) {
      analysis.genres.push(genre);
      if (analysis.searchType === 'movie') {
        analysis.searchType = 'genre';
      }
      confidence += 25;
    }
  }

  // 5. Check for time filters
  const yearMatch = lowerQuery.match(SMART_PATTERNS.time.year);
  const decadeMatch = lowerQuery.match(SMART_PATTERNS.time.decade);
  
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    analysis.timeFilter = { start: year, end: year };
    confidence += 20;
  } else if (decadeMatch) {
    const decade = parseInt(decadeMatch[1]);
    const startYear = decade < 30 ? 2000 + decade : 1900 + decade;
    analysis.timeFilter = { start: startYear, end: startYear + 9 };
    confidence += 20;
  }

  // 6. Check for quality preferences
  for (const [quality, pattern] of Object.entries(SMART_PATTERNS.quality)) {
    if (pattern.test(lowerQuery)) {
      analysis.quality = quality;
      confidence += 15;
      break;
    }
  }

  // 7. Check for similarity
  const similarityMatch = lowerQuery.match(SMART_PATTERNS.similarity);
  if (similarityMatch) {
    analysis.similarity = similarityMatch[2].trim();
    analysis.searchType = 'complex';
    confidence += 25;
  }

  analysis.confidence = Math.min(confidence, 100);
  return analysis;
}

async function processIntelligentAnalysis(query: string, analysis: any): Promise<AISearchResponse> {
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
          suggestions = generateSmartSuggestions(personName);
        }
        break;

      case 'mood':
        const moodConfig = SMART_PATTERNS.mood[analysis.mood as keyof typeof SMART_PATTERNS.mood];
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
          suggestions = moodConfig.suggestions;
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
          recommendations = similarMovies;
          explanation = `Movies similar to "${analysis.similarity}"`;
          suggestions = [
            `movies like ${analysis.similarity}`,
            `${analysis.similarity} similar films`,
            `${analysis.similarity} recommendations`,
            `films similar to ${analysis.similarity}`,
            `${analysis.similarity} genre`
          ];
        } else {
          recommendations = await fetchMovies({ query });
          explanation = `Complex search results for "${query}"`;
          suggestions = generateSmartSuggestions(query);
        }
        break;

      default:
        // Handle franchise searches
        if (analysis.franchise) {
          recommendations = await fetchMovies({ query: analysis.franchise });
          explanation = `${analysis.franchise.charAt(0).toUpperCase() + analysis.franchise.slice(1)} movies`;
          suggestions = [
            `${analysis.franchise} movies`,
            `best ${analysis.franchise} films`,
            `${analysis.franchise} chronological order`,
            `${analysis.franchise} latest movie`,
            `${analysis.franchise} universe`
          ];
        } else {
          recommendations = await fetchMovies({ query });
          explanation = `Movies matching "${query}"`;
          suggestions = generateSmartSuggestions(query);
        }
    }

    // Apply intelligent filters
    if (analysis.timeFilter) {
      recommendations = recommendations.filter(movie => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear();
        return movieYear >= analysis.timeFilter!.start && movieYear <= analysis.timeFilter!.end;
      });
    }

    // Apply quality filters with smart sorting
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
        case 'high_rated':
          recommendations = recommendations
            .filter(movie => movie.vote_average >= 7.5)
            .sort((a, b) => b.vote_average - a.vote_average);
          break;
      }
    }

    // Default intelligent sorting
    if (!analysis.quality) {
      recommendations = recommendations
        .sort((a, b) => (b.vote_average * 0.7 + b.popularity * 0.3) - (a.vote_average * 0.7 + a.popularity * 0.3));
    }
    
    recommendations = recommendations.slice(0, 20);

    // Generate intelligent suggestions if none exist
    if (suggestions.length === 0) {
      suggestions = generateSmartSuggestions(query);
    }

  } catch (error) {
    console.error('Error processing intelligent analysis:', error);
    
    // Fallback
    recommendations = await fetchMovies({ query });
    explanation = `Search results for "${query}"`;
    suggestions = generateSmartSuggestions(query);
  }

  return {
    suggestions: suggestions.slice(0, 5),
    recommendations,
    explanation: explanation || `Showing results for "${query}"`,
    searchType: analysis.searchType
  };
}

function generateSmartSuggestions(query: string): string[] {
  const suggestions = [
    `${query} movies`,
    `${query} cast`,
    `${query} trailer`,
    `${query} review`,
    `movies like ${query}`
  ];

  // Add contextual suggestions based on query
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('action')) {
    suggestions.push('best action movies', 'action movies 2023', 'superhero movies');
  } else if (lowerQuery.includes('comedy')) {
    suggestions.push('funny comedies', 'comedy movies 2023', 'romantic comedies');
  } else if (lowerQuery.includes('horror')) {
    suggestions.push('scary horror movies', 'horror movies 2023', 'psychological thrillers');
  }

  return suggestions;
}

// Generate smart suggestions based on query
export const getWorkingAISuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) {
    return getTrendingSuggestions();
  }

  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  try {
    // Smart pattern-based suggestions
    for (const pattern of SMART_PATTERNS.person.indicators) {
      if (pattern.test(query)) {
        const person = SMART_PATTERNS.person.extract(query);
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
    for (const [mood, config] of Object.entries(SMART_PATTERNS.mood)) {
      if (config.patterns.test(lowerQuery)) {
        suggestions.push(...config.suggestions);
        break;
      }
    }

    // Genre suggestions
    for (const [genre, pattern] of Object.entries(SMART_PATTERNS.genre)) {
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
    return generateSmartSuggestions(query).slice(0, 5);
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
    `best movies ${year}`
  ];
  
  return [...seasonal, ...trending].slice(0, 8);
}

// Clear cache periodically
setInterval(() => {
  Object.keys(aiCache).forEach(key => {
    if (Date.now() - aiCache[key].timestamp > CACHE_DURATION) {
      delete aiCache[key];
    }
  });
}, CACHE_DURATION);