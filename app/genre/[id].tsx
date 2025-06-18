import EnhancedMovieCard from '@/components/EnhancedMovieCard'
import { icons } from '@/constants/icons'
import { fetchMoviesByGenre, fetchGenres } from '@/services/api'
import useFetch from '@/services/useFetch'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const GenreMovies = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(1)

  const { data: genres } = useFetch(() => fetchGenres())
  const { data: movies, loading: moviesLoading } = useFetch(
    () => fetchMoviesByGenre(parseInt(id as string), page)
  )

  const currentGenre = genres?.find(genre => genre.id === parseInt(id as string))

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  if (moviesLoading && page === 1) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className='text-white text-sm mt-2'>Loading movies...</Text>
      </View>
    )
  }

  return (
    <View className='bg-primary flex-1'>
      {/* Header */}
      <View className='flex-row items-center px-5 pt-12 pb-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <Image source={icons.arrow} className='w-6 h-6' tintColor='white' />
        </TouchableOpacity>
        <Text className='text-white text-xl font-bold'>
          {currentGenre?.name || 'Genre'} Movies
        </Text>
      </View>

      {/* Movies Grid */}
      <FlatList
        data={movies || []}
        renderItem={({ item }) => (
          <View className='w-1/2 p-2'>
            <EnhancedMovieCard {...item} isFromSearchPage={true} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          moviesLoading ? (
            <View className='py-4'>
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default GenreMovies