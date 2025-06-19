import { images } from '@/constants/images'
import {
  clearAllData,
  getFavorites,
  getWatchedMovies,
  getWatchlist
} from '@/services/storage'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

// Types
interface DetailedStats {
  totalWatched: number
  totalWatchlist: number
  totalFavorites: number
  averageRating: number
  favoriteGenres: { name: string; count: number }[]
  watchingStreak: number
  thisMonthWatched: number
  thisYearWatched: number
  topRatedMovie: string
  recentActivity: string[]
  completionRate: number
  totalHoursWatched: number
}

const { width } = Dimensions.get('window')

const Profile = () => {
  // State Management
  const [stats, setStats] = useState<DetailedStats>({
    totalWatched: 0,
    totalWatchlist: 0,
    totalFavorites: 0,
    averageRating: 0,
    favoriteGenres: [],
    watchingStreak: 0,
    thisMonthWatched: 0,
    thisYearWatched: 0,
    topRatedMovie: 'N/A',
    recentActivity: [],
    completionRate: 0,
    totalHoursWatched: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCoffeeModal, setShowCoffeeModal] = useState(false)

  // Data Loading Functions
  const calculateDetailedStats = async (): Promise<DetailedStats> => {
    try {
      const [watchedMovies, watchlistMovies, favoriteMovies] = await Promise.all([
        getWatchedMovies(),
        getWatchlist(),
        getFavorites()
      ])

      // Calculate basic stats
      const totalWatched = watchedMovies.length
      const totalWatchlist = watchlistMovies.length
      const totalFavorites = favoriteMovies.length

      // Calculate average rating
      const ratingsSum = watchedMovies.reduce((sum, movie) => sum + (movie.vote_average || 0), 0)
      const averageRating = totalWatched > 0 ? ratingsSum / totalWatched : 0

      // Calculate completion rate
      const totalMovies = totalWatched + totalWatchlist
      const completionRate = totalMovies > 0 ? (totalWatched / totalMovies) * 100 : 0

      // Estimate total hours watched (assuming 2 hours per movie)
      const totalHoursWatched = totalWatched * 2

      // Calculate this month/year stats
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const thisMonthWatched = watchedMovies.filter(movie => {
        if (!movie.addedAt) return false
        const movieDate = new Date(movie.addedAt)
        return movieDate.getMonth() === currentMonth && movieDate.getFullYear() === currentYear
      }).length

      const thisYearWatched = watchedMovies.filter(movie => {
        if (!movie.addedAt) return false
        const movieDate = new Date(movie.addedAt)
        return movieDate.getFullYear() === currentYear
      }).length

      // Find top rated movie
      const topRatedMovie = watchedMovies.reduce((top, movie) => {
        return (movie.vote_average || 0) > (top.vote_average || 0) ? movie : top
      }, watchedMovies[0])?.title || 'N/A'

      // Generate recent activity
      const recentActivity = [
        `Added ${totalFavorites} movies to favorites`,
        `Watched ${thisMonthWatched} movies this month`,
        `${totalWatchlist} movies in watchlist`,
        `Average rating: ${averageRating.toFixed(1)}/10`
      ]

      // Mock favorite genres (in a real app, you'd track this)
      const favoriteGenres = [
        { name: 'Action', count: Math.floor(totalWatched * 0.3) },
        { name: 'Drama', count: Math.floor(totalWatched * 0.25) },
        { name: 'Comedy', count: Math.floor(totalWatched * 0.2) },
        { name: 'Thriller', count: Math.floor(totalWatched * 0.15) },
        { name: 'Sci-Fi', count: Math.floor(totalWatched * 0.1) }
      ].filter(genre => genre.count > 0)

      return {
        totalWatched,
        totalWatchlist,
        totalFavorites,
        averageRating,
        favoriteGenres,
        watchingStreak: Math.floor(totalWatched / 7), // Mock streak
        thisMonthWatched,
        thisYearWatched,
        topRatedMovie,
        recentActivity,
        completionRate,
        totalHoursWatched
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      return {
        totalWatched: 0,
        totalWatchlist: 0,
        totalFavorites: 0,
        averageRating: 0,
        favoriteGenres: [],
        watchingStreak: 0,
        thisMonthWatched: 0,
        thisYearWatched: 0,
        topRatedMovie: 'N/A',
        recentActivity: [],
        completionRate: 0,
        totalHoursWatched: 0
      }
    }
  }

  const loadStats = async () => {
    try {
      const detailedStats = await calculateDetailedStats()
      setStats(detailedStats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Effects
  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [])
  )

  useEffect(() => {
    // Show coffee modal after 2 seconds when component mounts
    const timer = setTimeout(() => {
      setShowCoffeeModal(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Event Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadStats()
  }, [])

  const handleClearData = useCallback(() => {
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
  }, [])

  const handleBuyMeCoffee = useCallback(async () => {
    try {
      const url = 'https://buymeacoffee.com/kishanvyas'
      const supported = await Linking.canOpenURL(url)
      
      if (supported) {
        await Linking.openURL(url)
        setShowCoffeeModal(false)
      } else {
        Alert.alert('Error', 'Unable to open the link')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link')
    }
  }, [])

  const handleGitHub = useCallback(async () => {
    try {
      const url = 'https://github.com/kishanvyas308'
      const supported = await Linking.canOpenURL(url)
      
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert('Error', 'Unable to open GitHub link')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open GitHub link')
    }
  }, [])

  const handleShareApp = useCallback(async () => {
    try {
      // Replace this with your actual package name from Google Play Store
      const appPackageName = 'com.your.package.name';
      const playStoreLink = `https://play.google.com/store/apps/details?id=${appPackageName}`;
      
      await Share.share({
        message: `Check out this amazing Movie Hub app! Track your movies, create watchlists, and discover new films. 🎬✨\n\nDownload now: ${playStoreLink}`,
        title: 'Movie Hub App'
      });
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Could not share the app');
    }
  }, [])

  const handleRateApp = useCallback(() => {
    try {
      // Replace 'com.your.package.name' with your app's actual package name
      const appPackageName = 'com.your.package.name';
      
      // Try to open the Play Store app first
      const playStoreUrl = `market://details?id=${appPackageName}`;
      
      Linking.canOpenURL(playStoreUrl).then(supported => {
        if (supported) {
          Linking.openURL(playStoreUrl);
        } else {
          // Fallback to browser if Play Store app isn't available
          const webPlayStoreUrl = `https://play.google.com/store/apps/details?id=${appPackageName}`;
          Linking.openURL(webPlayStoreUrl);
        }
      }).catch(err => {
        Alert.alert('Error', 'Could not open Play Store');
        console.error('Error opening Play Store:', err);
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('Error in handleRateApp:', error);
    }
  }, [])

  // Component Definitions
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon,
    color = '#AB8BFF',
    trend
  }: { 
    title: string
    value: string | number
    subtitle?: string
    icon: string
    color?: string
    trend?: 'up' | 'down' | 'neutral'
  }) => (
    <View className='bg-dark-100/80 backdrop-blur-sm p-4 rounded-2xl flex-1 mx-1 border border-white/5'>
      <View className='flex-row items-center justify-between mb-3'>
        <View className={`w-10 h-10 rounded-xl items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        {trend && (
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
            size={16} 
            color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280'} 
          />
        )}
      </View>
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

  const ProgressCard = ({ 
    title, 
    value, 
    maxValue, 
    percentage, 
    color = '#AB8BFF' 
  }: {
    title: string
    value: number
    maxValue: number
    percentage: number
    color?: string
  }) => (
    <View className='bg-dark-100/80 backdrop-blur-sm p-4 rounded-2xl border border-white/5'>
      <View className='flex-row items-center justify-between mb-3'>
        <Text className='text-white font-semibold'>{title}</Text>
        <Text className='text-light-200 text-sm'>{percentage.toFixed(0)}%</Text>
      </View>
      <View className='flex-row items-center justify-between mb-2'>
        <Text className='text-2xl font-bold text-white'>{value}</Text>
        <Text className='text-light-300 text-sm'>of {maxValue}</Text>
      </View>
      <View className='w-full h-2 bg-dark-200 rounded-full overflow-hidden'>
        <View 
          className='h-full rounded-full' 
          style={{ 
            width: `${Math.min(percentage, 100)}%`, 
            backgroundColor: color 
          }} 
        />
      </View>
    </View>
  )

  const ActivityItem = ({ activity, index }: { activity: string; index: number }) => (
    <View className='flex-row items-center py-3 border-b border-white/5 last:border-b-0'>
      <View className='w-8 h-8 bg-accent/20 rounded-full items-center justify-center mr-3'>
        <Text className='text-accent text-xs font-bold'>{index + 1}</Text>
      </View>
      <Text className='text-light-200 flex-1'>{activity}</Text>
    </View>
  )

  const CoffeeModal = () => (
    showCoffeeModal && (
      <View className='absolute inset-0 bg-black/70 items-center justify-center z-50 px-5'>
        <View className='bg-dark-100 rounded-3xl p-6 w-full max-w-sm border border-accent/20'>
          {/* Coffee Animation */}
          <View className='items-center mb-6'>
            <View className='w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full items-center justify-center mb-4'>
              <Text className='text-4xl'>☕</Text>
            </View>
            <Text className='text-white text-xl font-bold text-center'>
              Enjoying the app?
            </Text>
            <Text className='text-light-200 text-center mt-2'>
              Support the developer with a coffee! ☕
            </Text>
          </View>

          {/* Features */}
          <View className='mb-6'>
            <View className='flex-row items-center mb-2'>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className='text-light-200 ml-2 text-sm'>Free movie tracking</Text>
            </View>
            <View className='flex-row items-center mb-2'>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className='text-light-200 ml-2 text-sm'>Detailed statistics</Text>
            </View>
            <View className='flex-row items-center mb-2'>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className='text-light-200 ml-2 text-sm'>Regular updates</Text>
            </View>
            <View className='flex-row items-center'>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className='text-light-200 ml-2 text-sm'>Open source on GitHub</Text>
            </View>
          </View>

          {/* Buttons */}
          <View className='gap-3'>
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={handleBuyMeCoffee}
                className='flex-1 bg-gray-800 border border-amber-400 py-4 rounded-2xl items-center'
                activeOpacity={0.8}
              >
                <View className='flex-row items-center'>
                  <Text className='text-white font-bold text-base mr-1'>☕</Text>
                  <Text className='text-white font-bold text-base'>Coffee</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleGitHub}
                className='flex-1 bg-gray-800 border border-gray-600 py-4 rounded-2xl items-center'
                activeOpacity={0.8}
              >
                <View className='flex-row items-center'>
                  <Ionicons name="logo-github" size={18} color="white" />
                  <Text className='text-white font-bold text-base ml-1'>GitHub</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => setShowCoffeeModal(false)}
              className='bg-dark-200/50 py-3 rounded-2xl items-center'
              activeOpacity={0.8}
            >
              <Text className='text-light-300 font-medium'>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  )

  if (loading) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
        <ActivityIndicator size="large" color="#AB8BFF" />
        <Text className='text-white mt-4'>Loading your stats...</Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#AB8BFF"
            colors={['#AB8BFF']}
          />
        }
      >
        {/* Header Section */}
        <View className='pt-16 pb-6 px-5'>
          <View className='flex-row items-center justify-between mb-6'>
            <View>
              <Text className='text-white text-3xl font-bold'>
                Your Stats
              </Text>
              <Text className='text-light-300 text-sm mt-1'>
                Track your movie journey
              </Text>
            </View>
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={handleGitHub}
                className='bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full flex-row items-center border border-gray-600/50'
                activeOpacity={0.8}
              >
                <Ionicons name="logo-github" size={16} color="white" />
                <Text className='text-white font-semibold text-xs ml-2'>GitHub</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBuyMeCoffee}
                className=' bg-gray-800/70 border border-amber-400  px-4 py-2 rounded-full flex-row items-center shadow-lg'
                activeOpacity={0.8}
              >
                <Text className='text-white font-semibold mr-1'>☕</Text>
                <Text className='text-white font-semibold text-xs'>Coffee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Support Banner - More Prominent */}
        <View className='px-5 mb-6'>
          <View className='bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 border border-white/10'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-1'>
                <View className='flex-row items-center mb-2'>
                  <Text className='text-2xl mr-2'>💝</Text>
                  <Text className='text-white text-lg font-bold'>Support the Developer</Text>
                </View>
                <Text className='text-white/90 text-sm mb-4'>
                  Help keep this app free and get new features faster!
                </Text>
                <View className='flex-row gap-3'>
                  <TouchableOpacity
                    onPress={handleBuyMeCoffee}
                    className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex-row items-center'
                    activeOpacity={0.8}
                  >
                    <Text className='text-white font-semibold text-sm mr-1'>☕</Text>
                    <Text className='text-white font-semibold text-sm'>Coffee</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleGitHub}
                    className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex-row items-center'
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-github" size={16} color="white" />
                    <Text className='text-white font-semibold text-sm ml-1'>GitHub</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className='ml-4'>
                <Text className='text-6xl'>🚀</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Statistics Grid */}
        <View className='px-5 mb-6'>
          <View className='flex-row mb-4'>
            <StatCard
              title='Movies Watched'
              value={stats.totalWatched}
              subtitle='Total completed'
              icon='play-circle'
              color='#10B981'
              trend='up'
            />
            <StatCard
              title='In Watchlist'
              value={stats.totalWatchlist}
              subtitle='To watch later'
              icon='bookmark'
              color='#3B82F6'
              trend='neutral'
            />
          </View>

          <View className='flex-row mb-4'>
            <StatCard
              title='Favorites'
              value={stats.totalFavorites}
              subtitle='Loved movies'
              icon='heart'
              color='#EF4444'
              trend='up'
            />
            <StatCard
              title='Avg Rating'
              value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              subtitle='Your ratings'
              icon='star'
              color='#F59E0B'
              trend='up'
            />
          </View>
        </View>

        {/* Progress Section */}
        <View className='px-5 mb-6'>
          <Text className='text-white text-xl font-bold mb-4'>Progress Tracking</Text>
          
          <View className='gap-4'>
            <ProgressCard
              title='Completion Rate'
              value={stats.totalWatched}
              maxValue={stats.totalWatched + stats.totalWatchlist}
              percentage={stats.completionRate}
              color='#10B981'
            />
            
            <View className='flex-row gap-4'>
              <View className='flex-1'>
                <StatCard
                  title='This Month'
                  value={stats.thisMonthWatched}
                  subtitle='Movies watched'
                  icon='calendar'
                  color='#8B5CF6'
                />
              </View>
              <View className='flex-1'>
                <StatCard
                  title='This Year'
                  value={stats.thisYearWatched}
                  subtitle='Total in 2024'
                  icon='trending-up'
                  color='#06B6D4'
                />
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Insights */}
        <View className='px-5 mb-6'>
          <Text className='text-white text-xl font-bold mb-4'>Insights</Text>
          
          <View className='bg-dark-100/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5'>
            <View className='flex-row items-center justify-between mb-4'>
              <View className='flex-row items-center'>
                <Ionicons name="time" size={20} color="#AB8BFF" />
                <Text className='text-white font-semibold ml-2'>Watch Time</Text>
              </View>
              <Text className='text-accent font-bold'>{stats.totalHoursWatched}h</Text>
            </View>
            
            <View className='flex-row items-center justify-between mb-4'>
              <View className='flex-row items-center'>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text className='text-white font-semibold ml-2'>Top Rated</Text>
              </View>
              <Text className='text-light-200 text-sm flex-1 text-right' numberOfLines={1}>
                {stats.topRatedMovie}
              </Text>
            </View>
            
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center'>
                <Ionicons name="flame" size={20} color="#EF4444" />
                <Text className='text-white font-semibold ml-2'>Streak</Text>
              </View>
              <Text className='text-accent font-bold'>{stats.watchingStreak} weeks</Text>
            </View>
          </View>
        </View>

        {/* Favorite Genres */}
        {stats.favoriteGenres.length > 0 && (
          <View className='px-5 mb-6'>
            <Text className='text-white text-xl font-bold mb-4'>Favorite Genres</Text>
            
            <View className='bg-dark-100/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5'>
              <View className='flex-row flex-wrap gap-2'>
                {stats.favoriteGenres.map((genre, index) => (
                  <View 
                    key={index}
                    className='bg-accent/20 border border-accent/30 px-3 py-2 rounded-full'
                  >
                    <Text className='text-accent text-sm font-medium'>
                      {genre.name} ({genre.count})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View className='px-5 mb-6'>
          <Text className='text-white text-xl font-bold mb-4'>Activity Summary</Text>
          
          <View className='bg-dark-100/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5'>
            {stats.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} index={index} />
            ))}
          </View>
        </View>

        {/* Actions Section */}
        <View className='px-5 mb-8'>
          <Text className='text-white text-xl font-bold mb-4'>Quick Actions</Text>
          
          <View className='gap-3'>
            {/* Primary Support Actions */}
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={handleBuyMeCoffee}
                className='flex-1 p-4 rounded-2xl items-center relative overflow-hidden'
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#F59E0B',
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                }}
              >
                <View className='absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 opacity-90' />
                <View className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                <Ionicons name="cafe" size={24} color="white" style={{ zIndex: 1 }} />
                <Text className='text-white font-bold text-sm mt-1 z-10'>Buy Coffee</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleGitHub}
                className='flex-1 bg-gray-800 border border-gray-600 p-4 rounded-2xl items-center relative overflow-hidden'
                activeOpacity={0.8}
                style={{
                  shadowColor: '#374151',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <View className='absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900' />
                <Ionicons name="logo-github" size={24} color="white" style={{ zIndex: 1 }} />
                <Text className='text-white font-bold text-sm mt-1 z-10'>GitHub</Text>
              </TouchableOpacity>
            </View>

            {/* Secondary Actions */}
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={handleShareApp}
                className='flex-1 bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl items-center'
                activeOpacity={0.8}
              >
                <Ionicons name="share-social" size={20} color="#3B82F6" />
                <Text className='text-blue-400 font-semibold text-sm mt-1'>Share App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRateApp}
                className='flex-1 bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-2xl items-center'
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className='text-yellow-400 font-semibold text-sm mt-1'>Rate App</Text>
              </TouchableOpacity>
            </View>
            
            {/* Danger Zone */}
            <TouchableOpacity
              onPress={handleClearData}
              className='bg-red-500/20 border border-red-500/30 p-4 rounded-2xl items-center mt-2'
              activeOpacity={0.8}
            >
              <View className='flex-row items-center'>
                <Ionicons name="trash" size={18} color="#EF4444" />
                <Text className='text-red-400 font-semibold ml-2'>Clear All Data</Text>
              </View>
              <Text className='text-red-300 text-xs mt-1 text-center'>
                This will remove all your saved movies and preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Section */}
        <View className='px-5 mb-8'>
          <Text className='text-white text-xl font-bold mb-4'>Meet the Developer</Text>
          
          <View className='bg-dark-100/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5'>
            <View className='flex-row items-center mb-4'>
              <View className='w-12 h-12 bg-dark-200/90 border border-dark-100 rounded-xl items-center justify-center mr-4'>
                <Text className='text-white font-bold text-lg'>K</Text>
              </View>
              <View className='flex-1'>
                <Text className='text-white font-bold text-lg'>Kishan Vyas</Text>
                <Text className='text-light-300 text-sm'>Full Stack Developer</Text>
              </View>
              <View className='flex-row gap-2'>
                <TouchableOpacity
                  onPress={handleGitHub}
                  className='bg-gray-800 p-2 rounded-lg'
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-github" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleBuyMeCoffee}
                  className='bg-amber-500 p-2 rounded-lg'
                  activeOpacity={0.8}
                >
                  <Text className='text-white text-lg'>☕</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text className='text-light-200 text-sm leading-5 mb-4'>
              Passionate about creating amazing mobile experiences. This app is built with love and dedication to help movie enthusiasts track their cinematic journey.
            </Text>
            
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center'>
                <Ionicons name="code-slash" size={16} color="#AB8BFF" />
                <Text className='text-accent text-sm ml-1 font-medium'>React Native • TypeScript</Text>
              </View>
              <View className='flex-row items-center'>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text className='text-red-400 text-sm ml-1 font-medium'>Made with passion</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className='px-5 pb-28'>
          <View className='bg-dark-100/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5'>
            <View className='flex-row items-center mb-3'>
              <Ionicons name="information-circle" size={20} color="#AB8BFF" />
              <Text className='text-white font-semibold ml-2'>About Movie Hub</Text>
            </View>
            <Text className='text-light-200 text-sm leading-5 mb-3'>
              Your personal movie companion. Discover, track, and organize your favorite movies all in one place.
            </Text>
            <View className='flex-row items-center justify-between'>
              <Text className='text-light-300 text-xs'>Version 1.0.0</Text>
              <Text className='text-light-300 text-xs'>Made with ❤️ by Kishan</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Coffee Modal */}
      <CoffeeModal />
    </View>
  )
}

export default Profile