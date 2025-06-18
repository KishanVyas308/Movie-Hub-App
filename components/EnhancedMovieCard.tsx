import { icons } from '@/constants/icons';
import { addToFavorites, addToWatchlist, isFavorite, isInWatchlist, removeFromFavorites, removeFromWatchlist } from '@/services/storage';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface EnhancedMovieCardProps extends Movie {
  showActions?: boolean;
  isFromSearchPage?: boolean;
}

const EnhancedMovieCard = ({ 
  id, 
  poster_path, 
  title, 
  vote_average, 
  release_date,
  showActions = true,
  isFromSearchPage = false
}: EnhancedMovieCardProps) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [id]);

  const checkStatus = async () => {
    try {
      const [watchlistStatus, favoriteStatus] = await Promise.all([
        isInWatchlist(id),
        isFavorite(id)
      ]);
      setInWatchlist(watchlistStatus);
      setInFavorites(favoriteStatus);
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

  return (
    <View className={` ${isFromSearchPage ? 'w-[30%]' : 'min-w-[30%]' }  mb-4`}>
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
            <Image 
              source={icons.save} 
              className='w-4 h-4' 
              tintColor={inWatchlist ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            disabled={loading}
            className={`flex-1 ml-1 py-2 rounded-md items-center ${
              inFavorites ? 'bg-red-600' : 'bg-dark-100'
            }`}
          >
            <Text className={`text-lg ${inFavorites ? 'text-white' : 'text-gray-400'}`}>
              ♥
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EnhancedMovieCard;