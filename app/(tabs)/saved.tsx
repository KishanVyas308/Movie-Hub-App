import EnhancedMovieCard from '@/components/EnhancedMovieCard'
import SearchBar from '@/components/SearchBar'
import { images } from '@/constants/images'
import {
  addToFavorites,
  addToWatchlist,
  getFavorites,
  getWatchedMovies,
  getWatchlist,
  markAsWatched,
  removeFromFavorites,
  removeFromWatched,
  removeFromWatchlist
} from '@/services/storage'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Share,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

type TabType = 'watchlist' | 'favorites' | 'watched'
type ViewMode = 'grid' | 'list'
type SortOption = 'title' | 'date_added' | 'rating' | 'release_date'
type FilterOption = 'all' | 'high_rated' | 'recent' | 'old'

const { width, height } = Dimensions.get('window')

const Saved = () => {
  const [activeTab, setActiveTab] = useState<TabType>('watchlist')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [favorites, setFavorites] = useState<WatchlistItem[]>([])
  const [watched, setWatched] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // New state for enhanced functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date_added')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedMovies, setSelectedMovies] = useState<number[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

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



  // Enhanced data processing with search, sort, and filter
  const getCurrentData = useMemo(() => {
    let data: WatchlistItem[] = []
    
    switch (activeTab) {
      case 'watchlist':
        data = watchlist
        break
      case 'favorites':
        data = favorites
        break
      case 'watched':
        data = watched
        break
      default:
        data = []
    }

    // Apply search filter
    if (searchQuery.trim()) {
      data = data.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case 'high_rated':
        data = data.filter(item => item.vote_average >= 7.0)
        break
      case 'recent':
        data = data.filter(item => {
          const year = new Date(item.release_date).getFullYear()
          return year >= new Date().getFullYear() - 3
        })
        break
      case 'old':
        data = data.filter(item => {
          const year = new Date(item.release_date).getFullYear()
          return year < new Date().getFullYear() - 10
        })
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        data = [...data].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating':
        data = [...data].sort((a, b) => b.vote_average - a.vote_average)
        break
      case 'release_date':
        data = [...data].sort((a, b) => 
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        )
        break
      case 'date_added':
      default:
        // Keep original order (most recently added first)
        break
    }

    return data
  }, [activeTab, watchlist, favorites, watched, searchQuery, sortBy, filterBy])

  
  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `No movies found matching "${searchQuery}"`
    }
    
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

  // Bulk operations
  const handleBulkRemove = async () => {
    if (selectedMovies.length === 0) return

    Alert.alert(
      'Remove Movies',
      `Remove ${selectedMovies.length} selected movies?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const movieId of selectedMovies) {
                if (activeTab === 'watchlist') {
                  await removeFromWatchlist(movieId)
                } else if (activeTab === 'favorites') {
                  await removeFromFavorites(movieId)
                } else if (activeTab === 'watched') {
                  await removeFromWatched(movieId)
                }
              }
              loadData()
              setSelectedMovies([])
              setIsSelectionMode(false)
            } catch (error) {
              Alert.alert('Error', 'Failed to remove movies')
            }
          }
        }
      ]
    )
  }

  const handleBulkMove = async (targetTab: TabType) => {
    if (selectedMovies.length === 0 || targetTab === activeTab) return

    try {
      const moviesToMove = getCurrentData.filter(item => 
        selectedMovies.includes(item.movieId)
      )

      for (const movie of moviesToMove) {
        // Remove from current tab
        if (activeTab === 'watchlist') {
          await removeFromWatchlist(movie.movieId)
        } else if (activeTab === 'favorites') {
          await removeFromFavorites(movie.movieId)
        } else if (activeTab === 'watched') {
          await removeFromWatched(movie.movieId)
        }

        // Add to target tab
        if (targetTab === 'watchlist') {
          await addToWatchlist(movie)
        } else if (targetTab === 'favorites') {
          await addToFavorites(movie)
        } else if (targetTab === 'watched') {
          await markAsWatched(movie)
        }
      }

      loadData()
      setSelectedMovies([])
      setIsSelectionMode(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to move movies')
    }
  }

  const handleShare = async () => {
    try {
      const movieTitles = getCurrentData.map(item => item.title).join('\n')
      const message = `My ${activeTab} movies:\n\n${movieTitles}`
      
      await Share.share({
        message,
        title: `My ${activeTab} collection`
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const toggleMovieSelection = (movieId: number) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const resetFilters = () => {
    setSortBy('date_added')
    setFilterBy('all')
    setSearchQuery('')
  }

  const handleQuickAction = async (item: WatchlistItem) => {
    try {
      if (activeTab === 'watchlist') {
        // Move from watchlist to watched
        await removeFromWatchlist(item.movieId)
        await markAsWatched(item)
        setWatchlist(prev => prev.filter(movie => movie.movieId !== item.movieId))
        setWatched(prev => [...prev, item])
      } else if (activeTab === 'favorites') {
        // Move from favorites to watched
        await removeFromFavorites(item.movieId)
        await markAsWatched(item)
        setFavorites(prev => prev.filter(movie => movie.movieId !== item.movieId))
        setWatched(prev => [...prev, item])
      } else if (activeTab === 'watched') {
        // Remove from watched
        await removeFromWatched(item.movieId)
        setWatched(prev => prev.filter(movie => movie.movieId !== item.movieId))
      }
    } catch (error) {
      console.error('Quick action error:', error)
      Alert.alert('Error', 'Failed to update movie status. Please try again.')
    }
  }

  const getActionIcon = () => {
    switch (activeTab) {
      case 'watchlist':
        return 'checkmark' // Move to watched
      case 'favorites':
        return 'checkmark' // Move to watched
      case 'watched':
        return 'close-outline' // Remove from watched
      default:
        return 'close-outline'
    }
  }

  const getActionColor = () => {
    switch (activeTab) {
      case 'watchlist':
        return '#10B981' // Green for "mark as watched"
      case 'favorites':
        return '#10B981' // Green for "mark as watched"
      case 'watched':
        return '#EF4444' // Red for "remove"
      default:
        return '#EF4444'
    }
  }

  const renderGridItem = ({ item }: { item: WatchlistItem }) => {
    const isSelected = selectedMovies.includes(item.movieId)
    
    return (
      <View className='w-[30%] mb-4'>
        <TouchableOpacity
          onPress={() => {
            if (isSelectionMode) {
              toggleMovieSelection(item.movieId)
            } else {
              router.push(`/movies/${item.movieId}`)
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true)
              toggleMovieSelection(item.movieId)
            }
          }}
          activeOpacity={0.8}
          className={`relative ${isSelected ? 'opacity-80' : ''}`}
        >
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
          
          {/* Selection Mode Indicator */}
          {isSelectionMode && (
            <View className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 items-center justify-center ${
              isSelected ? 'bg-accent border-accent' : 'bg-black/50 border-white/50'
            }`}>
              {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
          )}

          {/* Quick Action Button */}
          {!isSelectionMode && (
            <TouchableOpacity
              onPress={() => handleQuickAction(item)}
              className='absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full items-center justify-center'
              activeOpacity={0.8}
            >
              <Ionicons 
                name={getActionIcon() as any} 
                size={16} 
                color={getActionColor()} 
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const renderListItem = ({ item }: { item: WatchlistItem }) => {
    const isSelected = selectedMovies.includes(item.movieId)
    
    return (
      <TouchableOpacity
        onPress={() => {
          if (isSelectionMode) {
            toggleMovieSelection(item.movieId)
          } else {
            router.push(`/movies/${item.movieId}`)
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true)
            toggleMovieSelection(item.movieId)
          }
        }}
        className={`flex-row bg-dark-100/50 rounded-xl mb-3 p-3 relative ${
          isSelected ? 'bg-accent/20 border border-accent/30' : ''
        }`}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
          className='w-16 h-24 rounded-lg'
          resizeMode='cover'
        />
        
        <View className='flex-1 ml-4 justify-between'>
          <View>
            <Text className='text-white font-bold text-base' numberOfLines={2}>
              {item.title}
            </Text>
            <Text className='text-light-300 text-sm mt-1'>
              {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
            </Text>
            {item.vote_average > 0 && (
              <View className='flex-row items-center mt-2'>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text className='text-light-200 text-sm ml-1'>
                  {item.vote_average.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Selection Mode Indicator */}
        {isSelectionMode && (
          <View className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected ? 'bg-accent border-accent' : 'bg-black/50 border-white/50'
          }`}>
            {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
          </View>
        )}

        {/* Quick Action Button */}
        {!isSelectionMode && (
          <TouchableOpacity
            onPress={() => handleQuickAction(item)}
            className='absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full items-center justify-center'
            activeOpacity={0.8}
          >
            <Ionicons 
              name={getActionIcon() as any} 
              size={16} 
              color={getActionColor()} 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  const TabButton = ({ tab, title, count }: { tab: TabType; title: string; count: number }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 py-2 px-3 flex-row items-center justify-center rounded-full  ${
        activeTab === tab ? 'bg-accent border border-accent/30' : 'bg-transparent'
      }`}
      activeOpacity={0.8}
    >
      <Text className={`font-semibold text-sm ${
        activeTab === tab ? 'text-white' : 'text-light-200'
      }`}>
        {title}
      </Text>
      <Text className={`text-xs ml-2 ${
        activeTab === tab ? 'text-white' : 'text-accent'
      }`}>
        {count}
      </Text>
    </TouchableOpacity>
  )

  // Modal Components
  const FilterModal = () => {
    // Local state for temporary selections
    const [tempSortBy, setTempSortBy] = useState<SortOption>(sortBy)
    const [tempFilterBy, setTempFilterBy] = useState<FilterOption>(filterBy)

    // Reset temp state when modal opens
    React.useEffect(() => {
      if (showFilterModal) {
        setTempSortBy(sortBy)
        setTempFilterBy(filterBy)
      }
    }, [showFilterModal, sortBy, filterBy])

    const handleApply = () => {
      setSortBy(tempSortBy)
      setFilterBy(tempFilterBy)
      setShowFilterModal(false)
    }

    const handleReset = () => {
      setTempSortBy('date_added')
      setTempFilterBy('all')
      setSortBy('date_added')
      setFilterBy('all')
      setSearchQuery('')
      setShowFilterModal(false)
    }

    const handleClose = () => {
      // Reset temp state to current values when closing without applying
      setTempSortBy(sortBy)
      setTempFilterBy(filterBy)
      setShowFilterModal(false)
    }

    return (
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-dark-100 rounded-t-3xl p-6'>
            <View className='flex-row items-center justify-between mb-6'>
              <Text className='text-white text-xl font-bold'>Sort & Filter</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          
          {/* Sort Section */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-semibold mb-3'>Sort by</Text>
            {[
              { key: 'date_added', label: 'Date Added', icon: 'time-outline' },
              { key: 'title', label: 'Title (A-Z)', icon: 'text-outline' },
              { key: 'rating', label: 'Rating', icon: 'star-outline' },
              { key: 'release_date', label: 'Release Date', icon: 'calendar-outline' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setTempSortBy(option.key as SortOption)}
                className={`flex-row items-center py-3 px-4 rounded-lg mb-2 ${
                  tempSortBy === option.key ? 'bg-accent/20 border border-accent/30' : 'bg-dark-200/30'
                }`}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={tempSortBy === option.key ? '#AB8BFF' : '#9CA3AF'} 
                />
                <Text className={`ml-3 text-base flex-1 ${
                  tempSortBy === option.key ? 'text-accent font-semibold' : 'text-light-200'
                }`}>
                  {option.label}
                </Text>
                {tempSortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#AB8BFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter Section */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-semibold mb-3'>Filter by</Text>
            {[
              { key: 'all', label: 'All Movies', icon: 'film-outline' },
              { key: 'high_rated', label: 'High Rated (7.0+)', icon: 'star' },
              { key: 'recent', label: 'Recent (Last 3 years)', icon: 'trending-up-outline' },
              { key: 'old', label: 'Classic (10+ years old)', icon: 'library-outline' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setTempFilterBy(option.key as FilterOption)}
                className={`flex-row items-center py-3 px-4 rounded-lg mb-2 ${
                  tempFilterBy === option.key ? 'bg-accent/20 border border-accent/30' : 'bg-dark-200/30'
                }`}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={tempFilterBy === option.key ? '#AB8BFF' : '#9CA3AF'} 
                />
                <Text className={`ml-3 text-base flex-1 ${
                  tempFilterBy === option.key ? 'text-accent font-semibold' : 'text-light-200'
                }`}>
                  {option.label}
                </Text>
                {tempFilterBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#AB8BFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Action Buttons */}
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={handleReset}
                className='flex-1 bg-red-500/20 border border-red-500/30 py-3 rounded-lg'
                activeOpacity={0.8}
              >
                <Text className='text-red-400 text-center font-semibold'>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleApply}
                className='flex-1 bg-accent py-3 rounded-lg'
                activeOpacity={0.8}
              >
                <Text className='text-white text-center font-semibold'>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  
  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      {/* Modals */}
      <FilterModal />
      
      {/* Compact Header */}
      <View className='pt-16 pb-2' />

      {/* Search Bar */}
      <View className='px-5 mb-3'>
        <SearchBar
          placeholder="Search your movies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View className='flex-row bg-dark-100/50 mx-5 rounded-full p-1 mb-3'>
        <TabButton tab='watchlist' title='Watchlist' count={watchlist.length} />
        <TabButton tab='favorites' title='Favorites' count={favorites.length} />
        <TabButton tab='watched' title='Watched' count={watched.length} />
      </View>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View className='px-5 mb-4'>
          <View className='flex-row items-center justify-between bg-accent/10 rounded-xl p-4'>
            <View className='flex-row items-center'>
              <Text className='text-accent font-bold text-lg mr-2'>
                {selectedMovies.length} selected
              </Text>
            </View>
            
            <View className='flex-row gap-2'>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMovies([])
                  setIsSelectionMode(false)
                }}
                className='bg-gray-500/20 px-4 py-2 rounded-lg'
              >
                <Text className='text-gray-400 font-semibold'>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBulkRemove}
                className='bg-red-500/20 px-4 py-2 rounded-lg'
              >
                <Text className='text-red-400 font-semibold'>Remove</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Move Movies',
                    'Move selected movies to:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      ...(activeTab !== 'watchlist' ? [{ text: 'Watchlist', onPress: () => handleBulkMove('watchlist') }] : []),
                      ...(activeTab !== 'favorites' ? [{ text: 'Favorites', onPress: () => handleBulkMove('favorites') }] : []),
                      ...(activeTab !== 'watched' ? [{ text: 'Watched', onPress: () => handleBulkMove('watched') }] : [])
                    ]
                  )
                }}
                className='bg-blue-500/20 px-4 py-2 rounded-lg'
              >
                <Text className='text-blue-400 font-semibold'>Move</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Controls & Header */}
      {!loading && getCurrentData.length > 0 && !isSelectionMode && (
        <View className='px-5 mb-3'>
          <View className='flex-row items-center justify-between mb-2'>
            <View className='flex-1 px-1'>
              <Text className='text-white text-lg  font-bold'>
                {activeTab === 'watchlist' && 'Movies to Watch'}
                {activeTab === 'favorites' && 'Your Favorite Movies'}
                {activeTab === 'watched' && 'Movies You\'ve Watched'}
              </Text>
              <Text className='text-light-200 text-xs mt-0.5'>
                {getCurrentData.length} movies
                {searchQuery && ` matching "${searchQuery}"`}
                {filterBy !== 'all' && ` • ${filterBy.replace('_', ' ')}`}
              </Text>
            </View>
            
            <View className='flex-row items-center gap-2'>
              {/* Combined Filter & Sort Button */}
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                className={`flex-row items-center px-3 py-2 rounded-lg ${
                  (sortBy !== 'date_added' || filterBy !== 'all') 
                    ? 'bg-accent/20 border border-accent/30' 
                    : 'bg-dark-200/30'
                }`}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="filter" 
                  size={16} 
                  color={(sortBy !== 'date_added' || filterBy !== 'all') ? '#AB8BFF' : '#9CA3AF'} 
                />
                <Text className={`ml-1 text-sm font-medium ${
                  (sortBy !== 'date_added' || filterBy !== 'all') ? 'text-accent' : 'text-light-300'
                }`}>
                  Filter
                </Text>
              </TouchableOpacity>
              
              {/* Share Button */}
              <TouchableOpacity
                onPress={handleShare}
                className='bg-dark-200/30 p-2 rounded-lg'
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              
              {/* View Mode Buttons */}
              <View className='flex-row bg-dark-200/30 rounded-lg p-1'>
                <TouchableOpacity
                  onPress={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent/20' : ''}`}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="grid-outline" 
                    size={14} 
                    color={viewMode === 'grid' ? '#AB8BFF' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent/20' : ''}`}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="list-outline" 
                    size={14} 
                    color={viewMode === 'list' ? '#AB8BFF' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {(searchQuery || sortBy !== 'date_added' || filterBy !== 'all') && (
            <TouchableOpacity
              onPress={resetFilters}
              className='bg-red-500/10 border border-red-500/30 py-1.5 px-3 rounded-lg self-start'
            >
              <Text className='text-red-400 text-xs font-semibold'>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      <View className='flex-1 px-5'>
        {loading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="#FF8E01" />
            <Text className='text-light-200 mt-4 text-lg'>Loading your collection...</Text>
          </View>
        ) : getCurrentData.length === 0 ? (
          <View className='flex-1 items-center justify-center px-10'>
            
            <Text className='text-light-200 text-center text-lg leading-7 mb-4'>
              {getEmptyMessage()}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              className='bg-accent py-3 px-6 rounded-xl'
              activeOpacity={0.8}
            >
              <Text className='text-white font-semibold'>Discover Movies</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getCurrentData}
            renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
            keyExtractor={(item) => `${activeTab}-${item.movieId}`}
            numColumns={viewMode === 'grid' ? 3 : 1}
            key={viewMode} // Force re-render when view mode changes
            columnWrapperStyle={viewMode === 'grid' ? {
              justifyContent: 'flex-start',
              gap: 16,
            } : undefined}
            contentContainerStyle={{
              paddingBottom: 100
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FF8E01"
                colors={['#FF8E01']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

export default Saved