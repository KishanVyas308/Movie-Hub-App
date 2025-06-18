import EnhancedMovieCard from '@/components/EnhancedMovieCard'
import {
  fetchMovies,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies
} from '@/services/api'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const CategoryMovies = () => {
  const { type } = useLocalSearchParams()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const getCategoryTitle = () => {
    switch (type) {
      case 'trending': return 'Trending Movies'
      case 'top-rated': return 'Top Rated Movies'
      case 'upcoming': return 'Upcoming Movies'
      case 'now-playing': return 'Now Playing'
      case 'popular': return 'Popular Movies'
      default: return 'Movies'
    }
  }

  const fetchMoviesByCategory = async (pageNum: number) => {
    try {
      let response: Movie[] = []
      
      switch (type) {
        case 'trending':
          response = await fetchTrendingMovies('week')
          break
        case 'top-rated':
          response = await fetchTopRatedMovies(pageNum)
          break
        case 'upcoming':
          response = await fetchUpcomingMovies(pageNum)
          break
        case 'now-playing':
          response = await fetchNowPlayingMovies(pageNum)
          break
        case 'popular':
        default:
          response = await fetchMovies({ query: '', page: pageNum })
          break
      }
      
      return response || []
    } catch (error) {
      console.error('Error fetching movies:', error)
      return []
    }
  }

  const loadMovies = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const newMovies = await fetchMoviesByCategory(pageNum)
      
      if (newMovies.length === 0) {
        setHasMore(false)
      } else {
        setMovies(prev => isRefresh ? newMovies : [...prev, ...newMovies])
        if (newMovies.length < 20) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
      setLoading(false)
    }
  }, [type, loading])

  useEffect(() => {
    setMovies([])
    setPage(1)
    setHasMore(true)
    loadMovies(1, true)
  }, [type])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadMovies(nextPage)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    setHasMore(true)
    loadMovies(1, true)
  }

  const renderMovie = ({ item }: { item: Movie }) => (
    <View className='w-1/2 p-2'>
      <EnhancedMovieCard {...item} isFromSearchPage={false} />
    </View>
  )

  const renderFooter = () => {
    if (!loading) return null
    
    return (
      <View className='py-4'>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text className='text-light-200 text-center mt-2'>Loading more movies...</Text>
      </View>
    )
  }

  const renderEmpty = () => (
    <View className='flex-1 items-center justify-center py-20'>
      <Text className='text-white text-lg mb-2'>No movies found</Text>
      <Text className='text-light-200 text-center'>
        Try refreshing or check back later
      </Text>
    </View>
  )

  return (
    <View className='bg-primary flex-1'>
      {/* Header */}
      <View className='flex-row items-center px-5 pt-12 pb-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
           <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className='text-white text-xl font-bold flex-1'>
          {getCategoryTitle()}
        </Text>
      </View>

      {/* Movies Grid */}
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        contentContainerStyle={{ 
          padding: 10,
          paddingBottom: 100 
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshing={loading && page === 1}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default CategoryMovies