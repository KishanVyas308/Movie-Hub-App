import React, { useState, useEffect, useCallback } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl 
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { getUserStats, clearAllData } from '@/services/storage'

const Profile = () => {
  const [stats, setStats] = useState<UserStats>({
    totalWatched: 0,
    totalWatchlist: 0,
    favoriteGenres: [],
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async () => {
    try {
      const userStats = await getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadStats()
  }

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your movie data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData()
              await loadStats()
              Alert.alert('Success', 'All data has been cleared')
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data')
            }
          }
        }
      ]
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon 
  }: { 
    title: string
    value: string | number
    subtitle?: string
    icon?: any 
  }) => (
    <View className='bg-dark-100 p-4 rounded-lg flex-1 mx-1'>
      {icon && (
        <Image source={icon} className='w-6 h-6 mb-2' tintColor='#F59E0B' />
      )}
      <Text className='text-2xl font-bold text-white mb-1'>
        {value}
      </Text>
      <Text className='text-light-200 text-sm font-medium'>
        {title}
      </Text>
      {subtitle && (
        <Text className='text-light-300 text-xs mt-1'>
          {subtitle}
        </Text>
      )}
    </View>
  )

  const GenreCard = ({ genre }: { genre: { name: string; count: number } }) => (
    <View className='bg-dark-100 px-4 py-2 rounded-full mr-2 mb-2'>
      <Text className='text-light-100 text-sm'>
        {genre.name} ({genre.count})
      </Text>
    </View>
  )

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      <ScrollView 
        className='flex-1'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header */}
        <View className='pt-20 pb-5 px-5'>
          <View className='flex-row items-center justify-center mb-5'>
            <Image source={icons.logo} className='w-12 h-10' />
          </View>
          <Text className='text-white text-2xl font-bold text-center'>
            My Profile
          </Text>
        </View>

        {/* User Avatar */}
        <View className='items-center mb-8'>
          <View className='w-24 h-24 bg-dark-100 rounded-full items-center justify-center mb-3'>
            <Image source={icons.person} className='w-12 h-12' tintColor='#9CA3AF' />
          </View>
          <Text className='text-white text-xl font-bold'>Movie Enthusiast</Text>
          <Text className='text-light-200 text-sm'>
            Member since {new Date().getFullYear()}
          </Text>
        </View>

        {/* Statistics */}
        <View className='px-5 mb-8'>
          <Text className='text-white text-lg font-bold mb-4'>Statistics</Text>
          
          {/* Main Stats Row */}
          <View className='flex-row mb-4'>
            <StatCard
              title='Movies Watched'
              value={stats.totalWatched}
              icon={icons.star}
            />
            <StatCard
              title='In Watchlist'
              value={stats.totalWatchlist}
              icon={icons.save}
            />
          </View>

          {/* Average Rating */}
          <View className='bg-dark-100 p-4 rounded-lg mb-4'>
            <View className='flex-row items-center justify-between'>
              <View>
                <Text className='text-white text-lg font-bold'>
                  Average Rating
                </Text>
                <Text className='text-light-200 text-sm'>
                  Your movie ratings
                </Text>
              </View>
              <View className='flex-row items-center'>
                <Image source={icons.star} className='w-6 h-6 mr-2' />
                <Text className='text-2xl font-bold text-white'>
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Favorite Genres */}
          {stats.favoriteGenres.length > 0 && (
            <View className='mb-6'>
              <Text className='text-white text-lg font-bold mb-3'>
                Favorite Genres
              </Text>
              <View className='flex-row flex-wrap'>
                {stats.favoriteGenres.map((genre, index) => (
                  <GenreCard key={index} genre={genre} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Activity Summary */}
        <View className='px-5 mb-8'>
          <Text className='text-white text-lg font-bold mb-4'>Activity Summary</Text>
          
          <View className='bg-dark-100 p-4 rounded-lg'>
            <View className='flex-row justify-between items-center mb-3'>
              <Text className='text-light-200'>Total Movies Tracked</Text>
              <Text className='text-white font-bold'>
                {stats.totalWatched + stats.totalWatchlist}
              </Text>
            </View>
            
            <View className='flex-row justify-between items-center mb-3'>
              <Text className='text-light-200'>Completion Rate</Text>
              <Text className='text-white font-bold'>
                {stats.totalWatched + stats.totalWatchlist > 0 
                  ? Math.round((stats.totalWatched / (stats.totalWatched + stats.totalWatchlist)) * 100)
                  : 0
                }%
              </Text>
            </View>
            
            <View className='flex-row justify-between items-center'>
              <Text className='text-light-200'>Movies to Watch</Text>
              <Text className='text-white font-bold'>
                {stats.totalWatchlist}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className='px-5 mb-8'>
          <Text className='text-white text-lg font-bold mb-4'>Settings</Text>
          
          <TouchableOpacity
            onPress={handleClearData}
            className='bg-red-600 p-4 rounded-lg items-center'
          >
            <Text className='text-white font-bold'>Clear All Data</Text>
            <Text className='text-red-200 text-sm mt-1'>
              This will remove all your saved movies and preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className='px-5 pb-20'>
          <Text className='text-white text-lg font-bold mb-4'>About</Text>
          
          <View className='bg-dark-100 p-4 rounded-lg'>
            <Text className='text-light-200 text-sm leading-5'>
              Movie Hub App - Your personal movie companion. Discover, track, and organize your favorite movies all in one place.
            </Text>
            <Text className='text-light-300 text-xs mt-3'>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Profile