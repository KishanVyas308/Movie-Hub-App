import EnhancedMovieCard from '@/components/EnhancedMovieCard'
import FilterModal from '@/components/FilterModal'
import PeopleFilterModal from '@/components/PeopleFilterModal'
import PersonCard from '@/components/PersonCard'
import SearchBar from '@/components/SearchBar'
import { images } from '@/constants/images'
import { fetchGenres, fetchMoviesWithFilters, multiSearch } from '@/services/api'
import useFetch from '@/services/useFetch'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'movies' | 'people' | 'filter'>('movies')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showPeopleFilterModal, setShowPeopleFilterModal] = useState(false)
  const [filters, setFilters] = useState<MovieFilters>({})
  const [peopleFilters, setPeopleFilters] = useState<PeopleFilters>({})

  // Pagination states
  const [moviesList, setMoviesList] = useState<Movie[]>([])
  const [peopleList, setPeopleList] = useState<any[]>([])
  const [filterMoviesList, setFilterMoviesList] = useState<Movie[]>([])
  const [currentMoviePage, setCurrentMoviePage] = useState(1)
  const [currentPeoplePage, setCurrentPeoplePage] = useState(1)
  const [currentFilterPage, setCurrentFilterPage] = useState(1)
  const [hasMoreMovies, setHasMoreMovies] = useState(true)
  const [hasMorePeople, setHasMorePeople] = useState(true)
  const [hasMoreFilterMovies, setHasMoreFilterMovies] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalMovieResults, setTotalMovieResults] = useState(0)
  const [totalPeopleResults, setTotalPeopleResults] = useState(0)
  const [totalFilterResults, setTotalFilterResults] = useState(0)

  // Fetch genres for display purposes
  const { data: genres } = useFetch(() => fetchGenres())

  // Reset pagination when search query or filters change
  const resetPagination = useCallback(() => {
    setMoviesList([])
    setPeopleList([])
    setFilterMoviesList([])
    setCurrentMoviePage(1)
    setCurrentPeoplePage(1)
    setCurrentFilterPage(1)
    setHasMoreMovies(true)
    setHasMorePeople(true)
    setHasMoreFilterMovies(true)
    setTotalMovieResults(0)
    setTotalPeopleResults(0)
    setTotalFilterResults(0)
  }, [])

  // Sort people results based on filters
  const sortPeopleResults = useCallback((people: any[], sortBy: string) => {
    const sorted = [...people]
    switch (sortBy) {
      case 'popularity.desc':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      case 'popularity.asc':
        return sorted.sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
      case 'name.asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      case 'name.desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      default:
        return sorted
    }
  }, [])

  // Filter people results based on filters
  const filterPeopleResults = useCallback((people: any[], filters: PeopleFilters) => {
    let filtered = [...people]

    if (filters.department) {
      filtered = filtered.filter(person =>
        person.known_for_department === filters.department
      )
    }

    if (filters.gender !== undefined) {
      filtered = filtered.filter(person => person.gender === filters.gender)
    }

    if (filters.sortBy) {
      filtered = sortPeopleResults(filtered, filters.sortBy)
    }

    return filtered
  }, [sortPeopleResults])

  // Movies search with filters
  const fetchMoviesPage = useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (!searchQuery.trim() && searchMode !== 'filter') return

    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      }

      const searchFilters = searchMode === 'filter' ? filters : {
        query: searchQuery,
        page: page,
        ...filters
      }

      const response = await fetchMoviesWithFilters({
        ...searchFilters,
        page: page
      })

      if (response && response.results) {
        if (searchMode === 'filter') {
          if (isLoadMore) {
            setFilterMoviesList(prev => [...prev, ...response.results])
          } else {
            setFilterMoviesList(response.results)
          }
          setHasMoreFilterMovies(page < response.total_pages)
          setTotalFilterResults(response.total_results)
        } else {
          if (isLoadMore) {
            setMoviesList(prev => [...prev, ...response.results])
          } else {
            setMoviesList(response.results)
          }
          setHasMoreMovies(page < response.total_pages)
          setTotalMovieResults(response.total_results)
        }
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      }
    }
  }, [searchQuery, filters, searchMode])

  // People search
  const fetchPeoplePage = useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (!searchQuery.trim()) return

    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      }

      const response = await multiSearch(searchQuery, page)

      if (response && response.results) {
        let filteredPeople = response.results.filter(item => item.media_type === 'person')

        // Apply people filters
        if (Object.keys(peopleFilters).length > 0) {
          filteredPeople = filterPeopleResults(filteredPeople, peopleFilters)
        }

        if (isLoadMore) {
          setPeopleList(prev => [...prev, ...filteredPeople])
        } else {
          setPeopleList(filteredPeople)
        }

        setHasMorePeople(page < response.total_pages)
        setTotalPeopleResults(response.total_results)
      }
    } catch (error) {
      console.error('Error fetching people:', error)
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      }
    }
  }, [searchQuery, peopleFilters, filterPeopleResults])

  // Initial search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim() || searchMode === 'filter') {
        resetPagination()
        if (searchMode === 'movies') {
          await fetchMoviesPage(1)
        } else if (searchMode === 'people') {
          await fetchPeoplePage(1)
        } else if (searchMode === 'filter') {
          await fetchMoviesPage(1)
        }
      } else {
        resetPagination()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchMode, filters, peopleFilters, fetchMoviesPage, fetchPeoplePage, resetPagination])

  // Handle filter changes
  const handleApplyFilters = useCallback((newFilters: MovieFilters) => {
    setFilters(newFilters)
    resetPagination()
    if (searchMode === 'filter' || (searchQuery.trim() && searchMode === 'movies')) {
      fetchMoviesPage(1)
    }
  }, [searchQuery, searchMode, fetchMoviesPage, resetPagination])

  // Handle people filter changes
  const handleApplyPeopleFilters = useCallback((newFilters: PeopleFilters) => {
    setPeopleFilters(newFilters)
    if (searchQuery.trim() && searchMode === 'people') {
      resetPagination()
      fetchPeoplePage(1)
    }
  }, [searchQuery, searchMode, fetchPeoplePage, resetPagination])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return

    if (searchMode === 'movies' && hasMoreMovies) {
      const nextPage = currentMoviePage + 1
      setCurrentMoviePage(nextPage)
      fetchMoviesPage(nextPage, true)
    } else if (searchMode === 'people' && hasMorePeople) {
      const nextPage = currentPeoplePage + 1
      setCurrentPeoplePage(nextPage)
      fetchPeoplePage(nextPage, true)
    } else if (searchMode === 'filter' && hasMoreFilterMovies) {
      const nextPage = currentFilterPage + 1
      setCurrentFilterPage(nextPage)
      fetchMoviesPage(nextPage, true)
    }
  }, [searchMode, hasMoreMovies, hasMorePeople, hasMoreFilterMovies, currentMoviePage, currentPeoplePage, currentFilterPage, isLoadingMore, fetchMoviesPage, fetchPeoplePage])

  // Get current data and loading states
  const getCurrentData = () => {
    switch (searchMode) {
      case 'movies':
        return moviesList
      case 'people':
        return peopleList
      case 'filter':
        return filterMoviesList
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  const currentLoading = currentData.length === 0 && (searchQuery.trim() !== '' || searchMode === 'filter')
  const hasMore = searchMode === 'movies' ? hasMoreMovies :
    searchMode === 'people' ? hasMorePeople : hasMoreFilterMovies

  // Render footer component for load more
  const renderFooter = () => {
    if (!hasMore || currentData.length === 0) return null

    return (
      <View className='py-4 items-center'>
        {isLoadingMore ? (
          <ActivityIndicator size="large" color='#FF6B35' />
        ) : (
          <TouchableOpacity
            onPress={handleLoadMore}
            className='bg-accent px-6 py-3 rounded-full'
          >
            <Text className='text-white font-medium'>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Get total results count
  const getTotalResults = () => {
    switch (searchMode) {
      case 'movies':
        return totalMovieResults
      case 'people':
        return totalPeopleResults
      case 'filter':
        return totalFilterResults
      default:
        return 0
    }
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover' />

      <FlatList
        key={searchMode} // Force re-render when search mode changes
        data={currentData}
        renderItem={({ item }) => (
          (searchMode === 'movies' || searchMode === 'filter') ? (
            <EnhancedMovieCard  {...item} isFromSearchPage={true} showActions={true} />
          ) : (
            <PersonCard person={{
              id: item.id,
              name: item.name || '',
              profile_path: item.profile_path || null,
              known_for_department: item.known_for_department || '',
              popularity: item.popularity || 0,
              gender: item.gender || 0,
              adult: item.adult || false,
              known_for: item.known_for || []

            }} size='large' />
          )
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        className='px-5'
        numColumns={ 3}
        columnWrapperStyle={{
          justifyContent: 'center',
          marginVertical: 16,
          gap: 16
        }}
        contentContainerStyle={{
          paddingBottom: 100
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <>
            <View className='mt-16 mb-5'>
              <SearchBar
                placeholder={
                  searchMode === 'movies' ? 'Search Movies...' :
                    searchMode === 'people' ? 'Search Cast, Crew & Directors...' :
                      'Filter-based Movie Discovery'
                }
                value={searchQuery}
                autoFocus={searchMode !== 'filter'}
                onChangeText={(text: any) => setSearchQuery(text)}
                editable={searchMode !== 'filter'}
              />
            </View>


            <View className='flex flex-row'>


              {/* Search Mode Toggle */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='mb-4'
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                <View className='flex-row bg-dark-100 rounded-full p-1'>
                  <TouchableOpacity
                    onPress={() => {
                      if (searchMode !== 'movies') {
                        setSearchMode('movies')
                        if (searchQuery.trim()) {
                          resetPagination()
                          fetchMoviesPage(1)
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-full ${searchMode === 'movies' ? 'bg-accent' : 'bg-transparent'
                      }`}
                  >
                    <Text className={`text-sm font-medium ${searchMode === 'movies' ? 'text-white' : 'text-light-100'
                      }`}>
                      Movies
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (searchMode !== 'people') {
                        setSearchMode('people')
                        if (searchQuery.trim()) {
                          resetPagination()
                          fetchPeoplePage(1)
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-full ${searchMode === 'people' ? 'bg-accent' : 'bg-transparent'
                      }`}
                  >
                    <Text className={`text-sm font-medium ${searchMode === 'people' ? 'text-white' : 'text-light-100'
                      }`}>
                      People
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (searchMode !== 'filter') {
                        setSearchMode('filter')
                        resetPagination()
                        fetchMoviesPage(1)
                      }
                    }}
                    className={`px-4 py-2 rounded-full ${searchMode === 'filter' ? 'bg-accent' : 'bg-transparent'
                      }`}
                  >
                    <Text className={`text-sm font-medium ${searchMode === 'filter' ? 'text-white' : 'text-light-100'
                      }`}>
                      Discover
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Filter Buttons */}
              <View className='flex-row justify-center items-center mb-4 px-2 gap-3'>
             
                {searchMode === 'people' && (
                  <TouchableOpacity
                    onPress={() => setShowPeopleFilterModal(true)}
                    className='bg-dark-100 px-4 py-3 rounded-full border border-secondary flex-row items-center'
                  >
                    <Ionicons name="people" size={16} color="#AB8BFF" />
                    <Text className='text-light-100 ml-2 font-medium'>Filters</Text>
                  </TouchableOpacity>
                )}
                {
                  searchMode === 'filter' && (
                    <TouchableOpacity
                      onPress={() => setShowFilterModal(true)}
                      className='bg-dark-100 px-4 py-3 rounded-full border border-secondary flex-row items-center'
                    >
                      <Ionicons name="filter" size={16} color="#AB8BFF" />
                      <Text className='text-light-100 ml-2 font-medium'>Filters</Text>
                    </TouchableOpacity>
                  )
                }
              </View>
            </View>

            {/* Active Filters Display */}
            {(searchMode === 'filter') && Object.keys(filters).length > 0 && (
              <View className='mb-4'>
                <Text className='text-light-200 text-sm mb-2'>Active Movie Filters:</Text>
                <View className='flex-row flex-wrap'>
                  {filters.genres && filters.genres.length > 0 && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>
                        Genres: {filters.genres.map(genreId =>
                          genres?.find(g => g.id === genreId)?.name || genreId
                        ).join(', ')}
                      </Text>
                    </View>
                  )}
                  {filters.genre && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>
                        Genre: {genres?.find(g => g.id === filters.genre)?.name || filters.genre}
                      </Text>
                    </View>
                  )}
                  {filters.year && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Year: {filters.year}</Text>
                    </View>
                  )}
                  {filters.minRating && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Min Rating: {filters.minRating}</Text>
                    </View>
                  )}
                  {filters.maxRating && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Max Rating: {filters.maxRating}</Text>
                    </View>
                  )}
                  {filters.sortBy && filters.sortBy !== 'popularity.desc' && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Sort: {filters.sortBy}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Active People Filters Display */}
            {searchMode === 'people' && Object.keys(peopleFilters).length > 0 && (
              <View className='mx-4'>
                <Text className='text-light-200 text-sm mb-2 '>Active People Filters:</Text>
                <View className='flex-row flex-wrap'>
                  {peopleFilters.sortBy && peopleFilters.sortBy !== 'popularity.desc' && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Sort: {peopleFilters.sortBy}</Text>
                    </View>
                  )}
                  {peopleFilters.department && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Department: {peopleFilters.department}</Text>
                    </View>
                  )}
                  {peopleFilters.gender !== undefined && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>
                        Gender: {peopleFilters.gender === 1 ? 'Female' : peopleFilters.gender === 2 ? 'Male' : 'Not Specified'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {currentLoading && (
              <ActivityIndicator
                size="large"
                color='#FF6B35'
                className="my-3"
              />
            )}

            {((searchQuery.trim() && searchMode !== 'filter') || (searchMode === 'filter')) && currentData.length > 0 && (
              <Text className='text-xl text-white font-bold mb-4'>
                {searchMode === 'movies' ? 'Movies' :
                  searchMode === 'people' ? 'People' :
                    'Discovered Movies'}
                {searchMode !== 'filter' && (
                  <>
                    {' for '}
                    <Text className='text-accent'>{searchQuery.trim()}</Text>
                  </>
                )}
                <Text className='text-sm text-light-200 font-normal'>
                  {'\n'}Found {getTotalResults()} results
                  {currentData.length < getTotalResults() &&
                    ` (showing ${currentData.length})`
                  }
                </Text>
              </Text>
            )}
          </>
        }

        ListEmptyComponent={
          !currentLoading ? (
            <View className='mt-10 px-5'>
              <Text className='text-center text-gray-500'>
                {searchMode === 'filter' ? (
                  Object.keys(filters).length === 0 ?
                    'Apply filters to discover movies' :
                    'No movies found with current filters'
                ) : (
                  searchQuery.trim()
                    ? `No ${searchMode === 'movies' ? 'movies' : 'people'} found`
                    : `Search for ${searchMode === 'movies' ? 'movies' : 'cast, crew, directors, or other people'}`
                )}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modals */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />

      <PeopleFilterModal
        visible={showPeopleFilterModal}
        onClose={() => setShowPeopleFilterModal(false)}
        onApplyFilters={handleApplyPeopleFilters}
        initialFilters={peopleFilters}
      />
    </View>
  )
}

export default Search