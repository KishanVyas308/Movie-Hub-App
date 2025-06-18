import { fetchMovies, searchPeople, multiSearch } from './api';

// Fallback AI search that works without external API
export const fallbackAiSearch = async (query: string): Promise<AISearchResponse> => {
  try {
    // Simple query analysis without external AI
    const lowerQuery = query.toLowerCase();
    
    // Detect search type based on keywords
    let searchType: 'movie' | 'person' | 'genre' | 'mood' | 'complex' = 'movie';
    let suggestions: string[] = [];
    let explanation = '';
    
    // Person detection
    if (lowerQuery.includes('actor') || lowerQuery.includes('actress') || 
        lowerQuery.includes('director') || lowerQuery.includes('star')) {
      searchType = 'person';
    }
    
    // Mood detection
    const moodKeywords = {
      'funny': ['comedy', 'laugh', 'humor'],
      'sad': ['cry', 'emotional', 'drama'],
      'scary': ['horror', 'fear', 'thriller'],
      'action': ['fight', 'adventure', 'explosion'],
      'romantic': ['love', 'romance', 'date']
    };
    
    let detectedMood = null;
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword)) || lowerQuery.includes(mood)) {
        detectedMood = mood;
        searchType = 'mood';
        break;
      }
    }
    
    // Year detection
    const yearMatch = lowerQuery.match(/\b(19|20)\d{2}\b/);
    const decadeMatch = lowerQuery.match(/\b(\d{2})s\b/);
    
    // Generate suggestions based on analysis
    if (searchType === 'person') {
      suggestions = [
        `${query} movies`,
        `${query} filmography`,
        `Best ${query} films`,
        `${query} recent movies`,
        `${query} popular films`
      ];
      explanation = `Searching for movies featuring ${query}`;
    } else if (searchType === 'mood') {
      suggestions = [
        `${detectedMood} movies`,
        `Best ${detectedMood} films`,
        `${detectedMood} movies 2023`,
        `Popular ${detectedMood} films`,
        `${detectedMood} movie recommendations`
      ];
      explanation = `Finding ${detectedMood} movies for your mood`;
    } else if (yearMatch || decadeMatch) {
      const year = yearMatch ? yearMatch[0] : `19${decadeMatch![1]}s`;
      suggestions = [
        `${year} movies`,
        `Best films ${year}`,
        `Popular ${year} cinema`,
        `${year} blockbusters`,
        `Classic ${year} films`
      ];
      explanation = `Discovering great movies from ${year}`;
    } else {
      suggestions = [
        `${query} movies`,
        `${query} cast`,
        `Similar to ${query}`,
        `${query} reviews`,
        `Best ${query} films`
      ];
      explanation = `Searching for movies related to "${query}"`;
    }
    
    // Perform the actual search
    let recommendations: Movie[] = [];
    
    try {
      // Try multi-search first for best results
      const multiResults = await multiSearch(query);
      recommendations = multiResults.results
        .filter(r => r.media_type === 'movie')
        .map(r => ({
          id: r.id,
          title: r.title || '',
          adult: r.adult || false,
          backdrop_path: r.backdrop_path || '',
          genre_ids: r.genre_ids || [],
          original_language: r.original_language || '',
          original_title: r.original_title || '',
          overview: r.overview || '',
          popularity: r.popularity,
          poster_path: r.poster_path || '',
          release_date: r.release_date || '',
          video: r.video || false,
          vote_average: r.vote_average || 0,
          vote_count: r.vote_count || 0
        }))
        .slice(0, 20);
    } catch (error) {
      // Fallback to regular movie search
      recommendations = await fetchMovies({ query });
    }
    
    // Sort by relevance (popularity + rating)
    recommendations = recommendations
      .sort((a, b) => (b.vote_average * 0.7 + b.popularity * 0.3) - (a.vote_average * 0.7 + a.popularity * 0.3))
      .slice(0, 20);
    
    return {
      suggestions,
      recommendations,
      explanation,
      searchType
    };
    
  } catch (error) {
    console.error('Fallback AI Search Error:', error);
    
    // Ultimate fallback
    const basicResults = await fetchMovies({ query });
    
    return {
      suggestions: [
        `Movies with "${query}"`,
        `${query} cast`,
        `Similar to ${query}`,
        `${query} genre`,
        `Best ${query} movies`
      ],
      recommendations: basicResults.slice(0, 20),
      explanation: `Showing search results for "${query}"`,
      searchType: 'movie'
    };
  }
};

// Smart suggestions without external AI
export const fallbackGetSuggestions = (query: string): string[] => {
  if (query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Common movie-related suggestions
  const suggestions = [
    `${query} movies`,
    `${query} cast`,
    `${query} trailer`,
    `${query} review`,
    `${query} similar movies`
  ];
  
  // Add context-specific suggestions
  if (lowerQuery.includes('action')) {
    suggestions.push('best action movies', 'action movies 2023', 'Marvel action films');
  } else if (lowerQuery.includes('comedy')) {
    suggestions.push('funny comedies', 'comedy movies 2023', 'romantic comedies');
  } else if (lowerQuery.includes('horror')) {
    suggestions.push('scary horror movies', 'horror movies 2023', 'psychological thrillers');
  }
  
  // Add year-based suggestions
  const currentYear = new Date().getFullYear();
  suggestions.push(`${query} ${currentYear}`, `${query} ${currentYear - 1}`);
  
  return suggestions.slice(0, 5);
};