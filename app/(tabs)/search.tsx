import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  TextInput,
  Keyboard,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { images } from '@/constants/images';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { 
  fetchMoviesWithFilters, 
  searchPeople, 
  multiSearch, 
  searchCollections,
  discoverMovies,
  fetchGenres
} from '@/services/api';
import EnhancedMovieCard from '@/components/EnhancedMovieCard';
import PersonCard from '@/components/PersonCard';
import MultiSearchCard from '@/components/MultiSearchCard';
import SearchFiltersModal, { SearchFilters } from '@/components/SearchFiltersModal';

const { width } = Dimensions.get('window');

type SearchType = 'all' | 'movies' | 'people' | 'collections';

interface SearchState {
  query: string;
  searchType: SearchType;
  results: {
    movies: Movie[];
    people: SearchPerson[];
    collections: SearchCollection[];
    multi: MultiSearchResult[];
  };
  loading: boolean;
  loadingMore: boolean;
  page: number;
  hasMore: boolean;
  explanation: string;
}

const Search = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    searchType: 'movies',
    results: {
      movies: [],
      people: [],
      collections: [],
      multi: []
    },
    loading: false,
    loadingMore: false,
    page: 1,
    hasMore: true,
    explanation: ''
  });

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    selectedGenre: null,
    selectedYear: null,
    selectedRating: null,
    selectedSort: 'popularity.desc',
    selectedDecade: null,
    selectedLanguage: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Search function with infinite scrolling support
  const performSearch = useCallback(async (
    query: string, 
    searchType: SearchType, 
    page: number = 1, 
    isRefresh: boolean = false,
    isLoadMore: boolean = false
  ) => {
    if (!query.trim() && !(searchType === 'movies' && hasActiveFilters())) return;

    if (isLoadMore) {
      setState(prev => ({ ...prev, loadingMore: true }));
    } else {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      let newResults = { ...state.results };
      let explanation = '';
      let hasMoreResults = true;

      switch (searchType) {
        case 'movies':
          // Determine year range based on decade or specific year
          let yearFilter = searchFilters.selectedYear;
          let startYear, endYear;
          
          if (searchFilters.selectedDecade) {
            const decade = parseInt(searchFilters.selectedDecade);
            startYear = decade;
            endYear = decade + 9;
          } else if (searchFilters.selectedYear) {
            startYear = searchFilters.selectedYear;
            endYear = searchFilters.selectedYear;
          }

          const movieResults = query 
            ? await fetchMoviesWithFilters({
                query,
                page,
                genre: searchFilters.selectedGenre || undefined,
                year: yearFilter || undefined,
                sortBy: searchFilters.selectedSort,
                minRating: searchFilters.selectedRating || undefined
              })
            : await discoverMovies({
                with_genres: searchFilters.selectedGenre ? searchFilters.selectedGenre.toString() : undefined,
                primary_release_year: searchFilters.selectedYear || undefined,
                'primary_release_date.gte': startYear ? `${startYear}-01-01` : undefined,
                'primary_release_date.lte': endYear ? `${endYear}-12-31` : undefined,
                sort_by: searchFilters.selectedSort,
                vote_average_gte: searchFilters.selectedRating || undefined,
                with_original_language: searchFilters.selectedLanguage || undefined,
                page
              });
          
          newResults.movies = isRefresh || page === 1 ? movieResults : [...state.results.movies, ...movieResults];
          hasMoreResults = movieResults.length === 20; // TMDB returns 20 items per page
          
          // Enhanced explanation
          let filterDescription = '';
          const activeFilters = [];
          if (searchFilters.selectedGenre) {
            // We'll get genre name from the filter modal
            activeFilters.push('Genre filtered');
          }
          if (searchFilters.selectedDecade) activeFilters.push(`${searchFilters.selectedDecade}s`);
          if (searchFilters.selectedYear) activeFilters.push(searchFilters.selectedYear.toString());
          if (searchFilters.selectedRating) activeFilters.push(`${searchFilters.selectedRating}+ rated`);
          if (searchFilters.selectedLanguage) activeFilters.push(searchFilters.selectedLanguage.toUpperCase());
          
          if (activeFilters.length > 0) {
            filterDescription = ` (${activeFilters.join(', ')})`;
          }
          
          explanation = `Found ${newResults.movies.length} movies${query ? ` for "${query}"` : ''}${filterDescription}`;
          break;

        case 'people':
          const peopleResults = await searchPeople(query, page);
          newResults.people = isRefresh || page === 1 ? peopleResults.results : [...state.results.people, ...peopleResults.results];
          hasMoreResults = peopleResults.results.length === 20;
          explanation = `Found ${peopleResults.total_results} people matching "${query}"`;
          break;

        case 'collections':
          const collectionResults = await searchCollections(query, page);
          newResults.collections = isRefresh || page === 1 ? collectionResults.results : [...state.results.collections, ...collectionResults.results];
          hasMoreResults = collectionResults.results.length === 20;
          explanation = `Found ${collectionResults.total_results} movie collections for "${query}"`;
          break;

        case 'all':
        default:
          const multiResults = await multiSearch(query, page);
          
          // Filter out TV shows - only keep movies and people
          const filteredResults = multiResults.results.filter(r => r.media_type !== 'tv');
          
          newResults.multi = isRefresh || page === 1 ? filteredResults : [...state.results.multi, ...filteredResults];
          hasMoreResults = filteredResults.length === 20;
          
          const movies = filteredResults.filter(r => r.media_type === 'movie');
          newResults.movies = isRefresh || page === 1 ? movies.map(m => ({
            id: m.id,
            title: m.title || '',
            adult: m.adult || false,
            backdrop_path: m.backdrop_path || '',
            genre_ids: m.genre_ids || [],
            original_language: m.original_language || '',
            original_title: m.original_title || '',
            overview: m.overview || '',
            popularity: m.popularity,
            poster_path: m.poster_path || '',
            release_date: m.release_date || '',
            video: m.video || false,
            vote_average: m.vote_average || 0,
            vote_count: m.vote_count || 0
          })) : [...state.results.movies, ...movies.map(m => ({
            id: m.id,
            title: m.title || '',
            adult: m.adult || false,
            backdrop_path: m.backdrop_path || '',
            genre_ids: m.genre_ids || [],
            original_language: m.original_language || '',
            original_title: m.original_title || '',
            overview: m.overview || '',
            popularity: m.popularity,
            poster_path: m.poster_path || '',
            release_date: m.release_date || '',
            video: m.video || false,
            vote_average: m.vote_average || 0,
            vote_count: m.vote_count || 0
          }))];

          explanation = `Found ${multiResults.total_results} results (movies and people only)`;
          break;
      }

      setState(prev => ({
        ...prev,
        results: newResults,
        loading: false,
        loadingMore: false,
        page: isLoadMore ? page : 1,
        hasMore: hasMoreResults,
        explanation
      }));

    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        loadingMore: false,
        explanation: 'Search failed. Please try again.'
      }));
    }
  }, [state.results, searchFilters]);

  // Load more results for infinite scrolling
  const loadMoreResults = useCallback(() => {
    if (state.loadingMore || !state.hasMore) return;
    
    const nextPage = state.page + 1;
    performSearch(state.query, state.searchType, nextPage, false, true);
  }, [state.loadingMore, state.hasMore, state.page, state.query, state.searchType, performSearch]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.query.trim() || (state.searchType === 'movies' && hasActiveFilters())) {
        performSearch(state.query, state.searchType, 1, true);
      } else {
        setState(prev => ({
          ...prev,
          results: {
            movies: [],
            people: [],
            collections: [],
            multi: []
          },
          explanation: '',
          hasMore: true
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.query, state.searchType, searchFilters]);

  const hasActiveFilters = () => {
    return searchFilters.selectedGenre !== null ||
           searchFilters.selectedYear !== null ||
           searchFilters.selectedRating !== null ||
           searchFilters.selectedSort !== 'popularity.desc' ||
           searchFilters.selectedDecade !== null ||
           searchFilters.selectedLanguage !== null;
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setState(prev => ({ ...prev, searchType: type, page: 1, hasMore: true }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (state.query.trim() || hasActiveFilters()) {
      await performSearch(state.query, state.searchType, 1, true);
    }
    setRefreshing(false);
  };

  const clearAllFilters = () => {
    setSearchFilters({
      selectedGenre: null,
      selectedYear: null,
      selectedRating: null,
      selectedSort: 'popularity.desc',
      selectedDecade: null,
      selectedLanguage: null
    });
  };

  const getResultCount = () => {
    switch (state.searchType) {
      case 'movies':
        return state.results.movies.length;
      case 'people':
        return state.results.people.length;
      case 'collections':
        return state.results.collections.length;
      default:
        return state.results.multi.length;
    }
  };

  const renderSearchHeader = () => (
    <View className='px-5 pt-16 pb-4'>
      <Text className='text-white text-3xl font-bold mb-2'>Search</Text>
      <Text className='text-light-200 text-base'>Discover your next favorite movie</Text>
    </View>
  );

  const renderSearchBar = () => (
    <View className='px-5 mb-4'>
      <View className={`flex-row items-center rounded-2xl px-5 py-4 ${
        isFocused ? 'bg-dark-200 border-2 border-accent' : 'bg-dark-200/90'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? "#AB8BFF" : "#9CA3AF"} 
        />
        
        <TextInput
          ref={searchInputRef}
          placeholder={`Search ${state.searchType === 'all' ? 'movies & people' : state.searchType}...`}
          value={state.query}
          onChangeText={(text) => setState(prev => ({ ...prev, query: text }))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor='#9CA3AF'
          className='flex-1 ml-3 text-white text-base'
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        
        {state.loading && (
          <ActivityIndicator size="small" color="#AB8BFF" className='ml-2' />
        )}
        
        {state.query.length > 0 && !state.loading && (
          <TouchableOpacity
            onPress={() => setState(prev => ({ ...prev, query: '' }))}
            className='ml-2 w-8 h-8 rounded-full bg-dark-100/50 items-center justify-center'
          >
            <Text className='text-light-200 text-lg font-bold'>×</Text>
          </TouchableOpacity>
        )}
        
        {state.searchType === 'movies' && (
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${
              hasActiveFilters() ? 'bg-accent' : 'bg-dark-100/50'
            }`}
            style={{
              shadowColor: hasActiveFilters() ? '#AB8BFF' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: hasActiveFilters() ? 0.4 : 0.1,
              shadowRadius: 4,
              elevation: hasActiveFilters() ? 6 : 2,
            }}
          >
            <MaterialIcons 
              name="tune" 
              size={20} 
              color={hasActiveFilters() ? "#FFFFFF" : "#9CA3AF"} 
            />
            {hasActiveFilters() && (
              <View className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center'>
                <Text className='text-white text-xs font-bold'>!</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSearchTypes = () => (
    <View className='mb-6'>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {[
          { key: 'movies', label: 'Movies', icon: '🎬' },
          { key: 'all', label: 'All', icon: '🔍' },
          { key: 'people', label: 'People', icon: '👤' },
          { key: 'collections', label: 'Collections', icon: '📚' }
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            onPress={() => handleSearchTypeChange(type.key as SearchType)}
            className={`mr-3 px-6 py-3 rounded-full flex-row items-center ${
              state.searchType === type.key ? 'bg-accent' : 'bg-dark-100/50'
            }`}
            style={{
              shadowColor: state.searchType === type.key ? '#AB8BFF' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: state.searchType === type.key ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: state.searchType === type.key ? 6 : 2,
            }}
          >
            <Text className='mr-2 text-lg'>{type.icon}</Text>
            <Text className={`font-semibold ${
              state.searchType === type.key ? 'text-white' : 'text-light-200'
            }`}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters()) return null;

    const activeFilters = [];
    if (searchFilters.selectedGenre) activeFilters.push('Genre');
    if (searchFilters.selectedDecade) activeFilters.push(`${searchFilters.selectedDecade}s`);
    if (searchFilters.selectedYear) activeFilters.push(searchFilters.selectedYear.toString());
    if (searchFilters.selectedRating) activeFilters.push(`${searchFilters.selectedRating}+ Rating`);
    if (searchFilters.selectedLanguage) activeFilters.push('Language');
    if (searchFilters.selectedSort !== 'popularity.desc') activeFilters.push('Custom Sort');

    return (
      <View className='px-5 mb-4'>
        <View className='bg-accent/10 rounded-xl p-4 border border-accent/20'>
          <View className='flex-row items-center justify-between mb-3'>
            <Text className='text-accent font-bold text-base'>🎯 Active Filters</Text>
            <TouchableOpacity 
              onPress={clearAllFilters}
              className='bg-accent/20 px-3 py-1 rounded-full'
            >
              <Text className='text-accent text-sm font-medium'>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View className='flex-row flex-wrap'>
            {activeFilters.map((filter, index) => (
              <View key={index} className='bg-accent/20 rounded-full px-3 py-1 mr-2 mb-2'>
                <Text className='text-accent text-sm font-medium'>{filter}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className='flex-1 items-center justify-center px-8 py-20'>
      <Text className='text-8xl mb-6'>🎬</Text>
      <Text className='text-white text-2xl font-bold mb-3 text-center'>
        Discover Movies
      </Text>
      <Text className='text-light-200 text-center text-base mb-8 leading-6'>
        Search for movies, people, and collections or use filters to discover new content
      </Text>
      
      <View className='w-full'>
        <Text className='text-white font-bold mb-4 text-lg'>🔍 Quick Searches:</Text>
        {[
          { query: 'Marvel movies', icon: '🦸' },
          { query: 'Tom Hanks', icon: '🎭' },
          { query: 'Action movies', icon: '💥' },
          { query: 'Comedy movies', icon: '😂' }
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setState(prev => ({ ...prev, query: item.query }))}
            className='bg-dark-100/40 rounded-2xl p-4 mb-3 border border-accent/10'
          >
            <View className='flex-row items-center'>
              <Text className='text-2xl mr-3'>{item.icon}</Text>
              <Text className='text-white text-base font-medium flex-1'>"{item.query}"</Text>
              <Ionicons name="chevron-forward" size={16} color="#AB8BFF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!state.loadingMore) return null;
    
    return (
      <View className='py-4 items-center'>
        <ActivityIndicator size="small" color="#AB8BFF" />
        <Text className='text-light-200 text-sm mt-2'>Loading more...</Text>
      </View>
    );
  };

  const renderResults = () => {
    if (state.loading && state.page === 1) {
      return (
        <View className='flex-1 items-center justify-center py-20'>
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className='text-white text-base mt-4 font-medium'>Searching...</Text>
        </View>
      );
    }

    if (!state.query.trim() && !hasActiveFilters()) {
      return renderEmptyState();
    }

    const resultCount = getResultCount();
    if (resultCount === 0) {
      return (
        <View className='flex-1 items-center justify-center py-20 px-8'>
          <Text className='text-8xl mb-6'>😔</Text>
          <Text className='text-white text-xl font-bold mb-3'>No Results Found</Text>
          <Text className='text-light-200 text-center mb-8 leading-6'>
            Try adjusting your search terms or filters
          </Text>
          {state.searchType === 'movies' && (
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className='bg-accent rounded-2xl px-8 py-4'
              style={{
                shadowColor: '#AB8BFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className='text-white font-bold text-base'>🎬 Try Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Render based on search type
    switch (state.searchType) {
      case 'people':
        return (
          <FlatList
            data={state.results.people}
            renderItem={({ item }) => <PersonCard person={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 16 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        );

      case 'all':
        return (
          <FlatList
            data={state.results.multi}
            renderItem={({ item }) => <MultiSearchCard item={item} />}
            keyExtractor={(item) => `${item.media_type}-${item.id}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 16 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        );

      case 'collections':
        return (
          <FlatList
            data={state.results.collections}
            renderItem={({ item }) => (
              <View className='bg-dark-100/30 rounded-xl p-4 mb-3 mx-5'>
                <Text className='text-white font-bold text-lg mb-2'>{item.name}</Text>
                <Text className='text-light-200 text-sm'>{item.overview}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        );

      default:
        return (
          <FlatList
            data={state.results.movies}
            renderItem={({ item }) => (
              <View className='mr-4 w-32'>
                <EnhancedMovieCard {...item} showActions={false} />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 16 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        );
    }
  };

  return (
    <View className='flex-1 bg-primary'>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Image source={images.bg} className='absolute w-full h-full' resizeMode='cover' />
      
      <ScrollView 
        className='flex-1' 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Header */}
        {renderSearchHeader()}

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Search Types */}
        {renderSearchTypes()}

        {/* Active Filters */}
        {renderActiveFilters()}

        {/* Results Info */}
        {(state.query.trim() || hasActiveFilters()) && state.explanation && (
          <View className='px-5 mb-6'>
            <View className='bg-dark-100/40 rounded-2xl p-4 border border-accent/10'>
              <View className='flex-row items-center'>
                <View className='w-8 h-8 rounded-full bg-accent/20 items-center justify-center mr-3'>
                  <Text className='text-accent font-bold'>{getResultCount()}</Text>
                </View>
                <Text className='text-white font-bold text-base flex-1'>
                  {getResultCount()} results found
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        {renderResults()}
      </ScrollView>

      {/* Search Filters Modal */}
      <SearchFiltersModal
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
};

export default Search;