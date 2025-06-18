# Enhanced Search Features

## Overview
The Movie Hub app now includes advanced search capabilities with AI-powered suggestions and multiple search types.

## Search Types

### 1. All Search (Multi-Search)
- Searches across movies, TV shows, and people simultaneously
- Shows mixed results with clear media type indicators
- Perfect for general queries

### 2. Movies Search
- Dedicated movie search with advanced filtering
- Supports genre, year, rating, and other filters
- Includes AI-powered explanations of results

### 3. People Search
- Search for actors, directors, and other industry professionals
- Shows known works and popularity ratings
- Links to detailed person profiles

### 4. Collections Search
- Find movie collections and franchises
- Discover related movies in series

### 5. AI Search ✨
- **Powered by Groq API**
- Natural language queries like "funny movies from the 90s"
- Mood-based search: "sad romantic movies"
- Actor-specific queries: "Tom Hanks movies"
- Complex queries: "movies like Inception"
- Provides intelligent suggestions and explanations

## AI Features

### Smart Query Analysis
The AI analyzes your search query to understand:
- **Search Type**: movie, person, genre, mood, or complex
- **Extracted Terms**: Key elements from your query
- **Mood Detection**: Happy, sad, action, romantic, scary, funny
- **Time Periods**: Decades, years, or date ranges
- **Quality Filters**: Rating requirements

### Auto-Suggestions
- Real-time AI-powered search suggestions
- Context-aware recommendations
- Appears as you type (2+ characters)

### Result Explanations
- AI explains why certain movies were recommended
- Provides context for search results
- Helps users understand the connection between query and results

## Setup Instructions

### 1. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key

### 2. Configure Environment
Add your Groq API key to the `.env` file:
```
EXPO_PUBLIC_GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Restart the App
After adding the API key, restart your Expo development server:
```bash
npx expo start --clear
```

## Usage Examples

### Natural Language Queries
- "Show me funny movies from the 90s"
- "I want to watch something sad and romantic"
- "Best action movies with cars"
- "Movies similar to The Dark Knight"
- "Tom Hanks comedy films"

### Mood-Based Search
- "I'm feeling happy" → Comedy, Family, Animation
- "Something scary" → Horror, Thriller
- "Romantic mood" → Romance, Drama
- "Need action" → Action, Adventure, Thriller

### Advanced Filters (Movies)
- Genre filtering
- Year range selection
- Rating requirements
- Language preferences
- Runtime filters

## Components

### EnhancedSearchBar
- AI-powered auto-suggestions
- Real-time search with debouncing
- Visual feedback for AI features
- Clear and submit functionality

### PersonCard
- Professional person display
- Shows known works and popularity
- Gender and department indicators
- Links to detailed profiles

### MultiSearchCard
- Unified display for mixed results
- Media type indicators (Movie/TV/Person)
- Contextual information based on type
- Consistent interaction patterns

## API Integration

### TMDB API Endpoints
- `/search/movie` - Movie search
- `/search/person` - People search
- `/search/multi` - Multi-type search
- `/search/collection` - Collection search
- `/discover/movie` - Advanced movie discovery

### Groq AI Integration
- **Model**: llama3-8b-8192
- **Temperature**: 0.3-0.7 (context-dependent)
- **Max Tokens**: 150-1000 (based on task)
- **Features**: Query analysis, suggestions, explanations

## Error Handling

### Graceful Degradation
- Falls back to regular search if AI fails
- Shows appropriate error messages
- Maintains functionality without API keys

### Network Resilience
- Retry mechanisms for failed requests
- Offline state handling
- Loading states and user feedback

## Performance Optimizations

### Search Debouncing
- 500ms delay for regular search
- 300ms delay for AI suggestions
- Prevents excessive API calls

### Result Caching
- Caches recent search results
- Reduces redundant API calls
- Improves response times

### Lazy Loading
- Pagination for large result sets
- Progressive loading of images
- Memory-efficient rendering

## Future Enhancements

### Planned Features
- Voice search integration
- Search history and favorites
- Personalized recommendations
- Advanced AI conversation mode
- Multi-language support

### Potential Improvements
- Offline search capabilities
- Social search sharing
- Custom filter presets
- Search analytics and insights

## Troubleshooting

### Common Issues

1. **AI Search Not Working**
   - Check Groq API key in `.env` file
   - Verify internet connection
   - Check API key permissions

2. **Slow Search Results**
   - Check network connection
   - Verify TMDB API key
   - Clear app cache

3. **Missing Results**
   - Try different search terms
   - Check spelling and formatting
   - Use different search types

### Debug Mode
Enable debug logging by adding to your environment:
```
EXPO_PUBLIC_DEBUG_SEARCH=true
```

## Contributing

When adding new search features:
1. Update interfaces in `interfaces.d.ts`
2. Add API functions to `services/api.ts`
3. Update AI prompts in `services/aiSearch.ts`
4. Add corresponding UI components
5. Update this documentation

## License
This enhanced search functionality is part of the Movie Hub app and follows the same licensing terms.