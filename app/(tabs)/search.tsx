import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import FilterModal from '@/components/FilterModal'
import PersonCard from '@/components/PersonCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMoviesWithFilters, searchPeople } from '@/services/api'
import useFetch from '@/services/useFetch'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'movies' | 'people'>('movies')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState<MovieFilters>({})

  // Movies search with filters
  const { data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset: resetMovies,
  } = useFetch(() => fetchMoviesWithFilters({
    query: searchQuery,
    ...filters
  }), false)

  // People search
  const { data: peopleResults,
    loading: peopleLoading,
    error: peopleError,
    refetch: loadPeopleResults,
    reset: resetPeople,
  } = useFetch(() => searchPeople(searchQuery), false)

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        if (searchMode === 'movies') {
          await loadMovies()
        } else {
          await loadPeopleResults()
        }
      } else {
        resetMovies()
        resetPeople()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchMode, filters])

  const handleApplyFilters = (newFilters: MovieFilters) => {
    setFilters(newFilters)
    if (searchQuery.trim()) {
      loadMovies()
    }
  }

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'movies' ? 'people' : 'movies')
    if (searchQuery.trim()) {
      if (searchMode === 'movies') {
        loadPeopleResults()
      } else {
        loadMovies()
      }
    }
  }

  const currentData = searchMode === 'movies' ? movies : peopleResults?.results
  const currentLoading = searchMode === 'movies' ? moviesLoading : peopleLoading
  const currentError = searchMode === 'movies' ? moviesError : peopleError

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover' />

      <FlatList 
        data={currentData} 
        renderItem={({ item }) => (
          searchMode === 'movies' ? (
            <MovieCard {...item} />
          ) : (
            <PersonCard person={item} />
          )
        )}
        keyExtractor={(item) => item.id.toString()}
        className='px-5'
        numColumns={searchMode === 'movies' ? 3 : 2}
        columnWrapperStyle={searchMode === 'movies' ? {
          justifyContent: 'center',
          marginVertical: 16,
          gap: 16
        } : {
          justifyContent: 'space-around',
          marginVertical: 8,
          gap: 8
        }}
        contentContainerStyle={{
          paddingBottom: 100
        }}
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center mt-20' >
              <Image source={icons.logo} className='w-12 h-10' />
            </View>
            
            <View className='my-5'>
              <SearchBar
                placeholder={searchMode === 'movies' ? 'Search Movies...' : 'Search People...'}
                value={searchQuery}
                onChangeText={(text: any) => setSearchQuery(text)}
              />
            </View>

            {/* Search Mode Toggle and Filter Button */}
            <View className='flex-row justify-between items-center mb-4 px-2'>
              <View className='flex-row bg-dark-100 rounded-full p-1'>
                <TouchableOpacity
                  onPress={() => setSearchMode('movies')}
                  className={`px-4 py-2 rounded-full ${
                    searchMode === 'movies' ? 'bg-accent' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    searchMode === 'movies' ? 'text-white' : 'text-light-100'
                  }`}>
                    Movies
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSearchMode('people')}
                  className={`px-4 py-2 rounded-full ${
                    searchMode === 'people' ? 'bg-accent' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    searchMode === 'people' ? 'text-white' : 'text-light-100'
                  }`}>
                    People
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filter Button - Only show for movies mode */}
              {searchMode === 'movies' && (
                <TouchableOpacity
                  onPress={() => setShowFilterModal(true)}
                  className='bg-dark-100 p-3 rounded-full border border-light-300'
                >
                  <Image source={icons.filter} className='w-5 h-5' tintColor='#FF6B35' />
                </TouchableOpacity>
              )}
            </View>

            {/* Active Filters Display */}
            {searchMode === 'movies' && Object.keys(filters).length > 0 && (
              <View className='mb-4'>
                <Text className='text-light-200 text-sm mb-2'>Active Filters:</Text>
                <View className='flex-row flex-wrap'>
                  {filters.genre && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Genre: {filters.genre}</Text>
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
                  {filters.sortBy && filters.sortBy !== 'popularity.desc' && (
                    <View className='bg-accent/20 px-3 py-1 rounded-full mr-2 mb-2'>
                      <Text className='text-accent text-xs'>Sort: {filters.sortBy}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {currentLoading &&
              <ActivityIndicator
                size="large"
                color='#FF6B35'
                className="my-3"
              />
            }
            
            {currentError &&
              <View className='my-3'>
                <Text className='text-red-500 text-center'>
                  Error: {currentError?.message}
                </Text>
              </View>
            }

            {!currentLoading && !currentError && searchQuery.trim() && currentData?.length > 0 && (
              <Text className='text-xl text-white font-bold mb-4'>
                {searchMode === 'movies' ? 'Movies' : 'People'} for {" "}
                <Text className='text-accent'>{searchQuery.trim()}</Text>
                {searchMode === 'people' && (
                  <Text className='text-sm text-light-200 font-normal'>
                    {'\n'}Found {peopleResults?.total_results} results
                  </Text>
                )}
              </Text>
            )}
          </>
        }

        ListEmptyComponent={
          !currentLoading && !currentError ? (
            <View className='mt-10 px-5'>
              <Text className='text-center text-gray-500'>
                {searchQuery.trim() 
                  ? `No ${searchMode === 'movies' ? 'movies' : 'people'} found` 
                  : `Search for ${searchMode === 'movies' ? 'movies' : 'actors, directors, or other people'}`
                }
              </Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  )
}

export default Search