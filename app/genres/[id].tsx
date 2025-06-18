import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMoviesByGenre } from '@/services/api'
import useFetch from '@/services/useFetch'
import EnhancedMovieCard from '@/components/EnhancedMovieCard'

const GenreMoviesPage = () => {
  const { id, name } = useLocalSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const { data: movies, loading: moviesLoading, error: moviesError } = useFetch(
    () => fetchMoviesByGenre(parseInt(id as string), page)
  )

  useEffect(() => {
    if (movies && movies.length > 0) {
      if (page === 1) {
        setAllMovies(movies)
      } else {
        setAllMovies(prev => [...prev, ...movies])
      }
      setLoadingMore(false)
    }
  }, [movies, page])

  const loadMoreMovies = () => {
    if (!loadingMore && !moviesLoading) {
      setLoadingMore(true)
      setPage(prev => prev + 1)
    }
  }

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <EnhancedMovieCard {...item} />
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    
    return (
      <View className='py-4'>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    )
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      {/* Header */}
      <View className='pt-20 pb-5 px-5'>
        <TouchableOpacity 
          onPress={() => router.back()}
          className='flex-row items-center mb-4'
        >
          <Image source={icons.arrow} className='w-6 h-6 mr-2' tintColor='white' />
          <Text className='text-white font-medium'>Back to Genres</Text>
        </TouchableOpacity>
        
        <Text className='text-white text-2xl font-bold'>
          {decodeURIComponent(name as string)} Movies
        </Text>
        <Text className='text-light-200 mt-1'>
          Discover the best {decodeURIComponent(name as string).toLowerCase()} movies
        </Text>
      </View>

      {/* Content */}
      <View className='flex-1 px-5'>
        {moviesLoading && page === 1 ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className='text-light-200 mt-3'>Loading movies...</Text>
          </View>
        ) : moviesError ? (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-red-500 text-center'>
              Error loading movies: {moviesError.message}
            </Text>
          </View>
        ) : allMovies.length === 0 ? (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-light-200 text-center text-lg'>
              No {decodeURIComponent(name as string).toLowerCase()} movies found
            </Text>
          </View>
        ) : (
          <FlatList
            data={allMovies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              gap: 16,
              marginBottom: 16
            }}
            contentContainerStyle={{
              paddingBottom: 100
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreMovies}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={
              <View className='mb-4'>
                <Text className='text-light-200 text-sm'>
                  {allMovies.length} movies found
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

export default GenreMoviesPage