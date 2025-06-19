import { icons } from '@/constants/icons';
import { addToFavorites, addToWatchlist, isFavorite, isInWatchlist, isWatched, removeFromFavorites, removeFromWatchlist } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface EnhancedMovieCardProps extends Movie {
  showActions?: boolean;
  isFromSearchPage?: boolean;
  onOptionsPress?: (movie: Movie) => void;
  refreshTrigger?: number;
}

const EnhancedMovieCard = ({ 
  id, 
  poster_path, 
  title, 
  vote_average, 
  release_date,
  showActions = true,
  isFromSearchPage = false,
  onOptionsPress,
  refreshTrigger,
  ...movieData
}: EnhancedMovieCardProps) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [isWatchedMovie, setIsWatchedMovie] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [id, refreshTrigger]);

  const checkStatus = async () => {
    try {
      const [watchlistStatus, favoriteStatus, watchedStatus] = await Promise.all([
        isInWatchlist(id),
        isFavorite(id),
        isWatched(id)
      ]);
      setInWatchlist(watchlistStatus);
      setInFavorites(favoriteStatus);
      setIsWatchedMovie(watchedStatus);
    } catch (error) {
      console.error('Error checking movie status:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const movieData: WatchlistItem = {
        id: Date.now(),
        movieId: id,
        title,
        poster_path: poster_path || '',
        vote_average,
        release_date,
        addedAt: new Date().toISOString()
      };

      if (inWatchlist) {
        await removeFromWatchlist(id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(movieData);
        setInWatchlist(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update watchlist');
      console.error('Watchlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const movieData: WatchlistItem = {
        id: Date.now(),
        movieId: id,
        title,
        poster_path: poster_path || '',
        vote_average,
        release_date,
        addedAt: new Date().toISOString()
      };

      if (inFavorites) {
        await removeFromFavorites(id);
        setInFavorites(false);
      } else {
        await addToFavorites(movieData);
        setInFavorites(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
      console.error('Favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionsPress = () => {
    if (onOptionsPress) {
      const fullMovieData: Movie = {
        id,
        poster_path,
        title,
        vote_average,
        release_date,
        ...movieData
      };
      onOptionsPress(fullMovieData);
    }
  };

  return (
    <View className={` ${isFromSearchPage ? 'w-[30%]' : 'min-w-[30%]' }  mb-4`}>
      <View className='relative'>
        <Link href={`/movies/${id}`} asChild>
          <TouchableOpacity className=''>
            <Image
              source={{
                uri: poster_path 
                  ? `https://image.tmdb.org/t/p/w500${poster_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Image+Available'
              }}
              className='w-full h-52 rounded-lg'
              resizeMode='cover'
            />
          </TouchableOpacity>
        </Link>
        
        {/* Options Menu Button */}
        {onOptionsPress && (
          <TouchableOpacity 
            onPress={handleOptionsPress}
            className='absolute top-2 right-2 py-2 px-0.5 rounded-xl bg-black/60'
          >
            
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Status Badges */}
        <View className='absolute bottom-2 right-2 flex-row'>
          {inFavorites && (
            <View className='bg-red-500 rounded-full p-1 mr-1'>
              <Ionicons name="heart" size={10} color="white" />
            </View>
          )}
          {inWatchlist && (
            <View className='bg-accent rounded-full p-1 mr-1'>
              <Ionicons name="bookmark" size={10} color="white" />
            </View>
          )}
          {isWatchedMovie && (
            <View className='bg-green-500 rounded-full p-1'>
              <Ionicons name="checkmark" size={10} color="white" />
            </View>
          )}
        </View>
      </View>

      <Text className='text-white text-sm font-bold mt-2' numberOfLines={1}>
        {title}
      </Text>

      <View className='flex-row items-center justify-between mt-1'>
        <View className='flex-row items-center'>
          <Image source={icons.star} className='size-4' />
          <Text className='text-xs text-white font-bold ml-1'>
            {vote_average ? vote_average.toFixed(1) : '0.0'}
          </Text>
        </View>
        <Text className='text-xs text-light-300 font-medium'>
          {release_date?.split('-')[0]}
        </Text>
      </View>

      {showActions && (
        <View className='flex-row justify-between mt-2'>
            <TouchableOpacity
            onPress={handleWatchlistToggle}
            disabled={loading}
            className={`flex-1 mr-1 py-2 rounded-md items-center ${
              inWatchlist ? 'bg-accent' : 'bg-dark-100'
            }`}
            >
            <Ionicons 
              name={inWatchlist ? "bookmark" : "bookmark-outline"} 
              size={16} 
              color={inWatchlist ? 'white' : '#9CA3AF'} 
            />
            </TouchableOpacity>
            
            <TouchableOpacity
            onPress={handleFavoriteToggle}
            disabled={loading}
            className={`flex-1 ml-1 py-2 rounded-md items-center ${
              inFavorites ? 'bg-red-600' : 'bg-dark-100'
            }`}
            >
            <Ionicons 
              name={inFavorites ? "heart" : "heart-outline"} 
              size={16} 
              color={inFavorites ? 'white' : '#9CA3AF'} 
            />
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EnhancedMovieCard;