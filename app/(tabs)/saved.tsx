import React, { useState, useEffect, useCallback } from 'react'
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Alert 
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { 
  getWatchlist, 
  getFavorites, 
  getWatchedMovies, 
  removeFromWatchlist, 
  removeFromFavorites 
} from '@/services/storage'
import EnhancedMovieCard from '@/components/EnhancedMovieCard'

type TabType = 'watchlist' | 'favorites' | 'watched'

const Saved = () => {
  const [activeTab, setActiveTab] = useState<TabType>('watchlist')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [favorites, setFavorites] = useState<WatchlistItem[]>([])
  const [watched, setWatched] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [watchlistData, favoritesData, watchedData] = await Promise.all([
        getWatchlist(),
        getFavorites(),
        getWatchedMovies()
      ])
      
      setWatchlist(watchlistData)
      setFavorites(favoritesData)
      setWatched(watchedData)
    } catch (error) {
      console.error('Error loading saved data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleRemoveItem = (movieId: number, type: TabType) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove this movie from your ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'watchlist') {
                await removeFromWatchlist(movieId)
                setWatchlist(prev => prev.filter(item => item.movieId !== movieId))
              } else if (type === 'favorites') {
                await removeFromFavorites(movieId)
                setFavorites(prev => prev.filter(item => item.movieId !== movieId))
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item')
            }
          }
        }
      ]
    )
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'watchlist':
        return watchlist
      case 'favorites':
        return favorites
      case 'watched':
        return watched
      default:
        return []
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'watchlist':
        return 'No movies in your watchlist yet.\nAdd movies you want to watch later!'
      case 'favorites':
        return 'No favorite movies yet.\nMark movies as favorites to see them here!'
      case 'watched':
        return 'No watched movies yet.\nMark movies as watched to track your viewing history!'
      default:
        return ''
    }
  }

  const renderMovieItem = ({ item }: { item: WatchlistItem }) => (
    <View className='w-[30%] mb-4'>
      <EnhancedMovieCard
        id={item.movieId}
        title={item.title}
        poster_path={item.poster_path}
        vote_average={item.vote_average}
        release_date={item.release_date}
        adult={false}
        backdrop_path=""
        genre_ids={[]}
        original_language=""
        original_title={item.title}
        overview=""
        popularity={0}
        video={false}
        vote_count={0}
        showActions={false}
      />
      
      {(activeTab === 'watchlist' || activeTab === 'favorites') && (
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.movieId, activeTab)}
          className='mt-2 bg-red-600 py-2 rounded-md items-center'
        >
          <Text className='text-white text-xs font-medium'>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const TabButton = ({ tab, title, count }: { tab: TabType; title: string; count: number }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 py-3 items-center border-b-2 ${
        activeTab === tab ? 'border-accent' : 'border-transparent'
      }`}
    >
      <Text className={`font-bold ${
        activeTab === tab ? 'text-accent' : 'text-light-200'
      }`}>
        {title}
      </Text>
      <Text className={`text-xs mt-1 ${
        activeTab === tab ? 'text-accent' : 'text-light-300'
      }`}>
        {count} movies
      </Text>
    </TouchableOpacity>
  )

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      {/* Header */}
      <View className='pt-20 pb-5 px-5'>
        <View className='flex-row items-center justify-center mb-5'>
          <Image source={icons.logo} className='w-12 h-10' />
        </View>
        <Text className='text-white text-2xl font-bold text-center'>
          My Collection
        </Text>
      </View>

      {/* Tabs */}
      <View className='flex-row bg-dark-100 mx-5 rounded-lg mb-5'>
        <TabButton tab='watchlist' title='Watchlist' count={watchlist.length} />
        <TabButton tab='favorites' title='Favorites' count={favorites.length} />
        <TabButton tab='watched' title='Watched' count={watched.length} />
      </View>

      {/* Content */}
      <View className='flex-1 px-5'>
        {loading ? (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-light-200'>Loading...</Text>
          </View>
        ) : getCurrentData().length === 0 ? (
          <View className='flex-1 items-center justify-center px-10'>
            <Text className='text-light-200 text-center text-lg leading-6'>
              {getEmptyMessage()}
            </Text>
          </View>
        ) : (
          <FlatList
            data={getCurrentData()}
            renderItem={renderMovieItem}
            keyExtractor={(item) => `${activeTab}-${item.movieId}`}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              gap: 16,
            }}
            contentContainerStyle={{
              paddingBottom: 100
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
              />
            }
            ListHeaderComponent={
              <View className='mb-4'>
                <Text className='text-white text-lg font-bold'>
                  {activeTab === 'watchlist' && 'Movies to Watch'}
                  {activeTab === 'favorites' && 'Your Favorite Movies'}
                  {activeTab === 'watched' && 'Movies You\'ve Watched'}
                </Text>
                <Text className='text-light-200 text-sm mt-1'>
                  {getCurrentData().length} movies
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

export default Saved