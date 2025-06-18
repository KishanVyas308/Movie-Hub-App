import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';

interface MultiSearchCardProps {
  item: MultiSearchResult;
}

const MultiSearchCard = ({ item }: MultiSearchCardProps) => {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);

  const handlePress = () => {
    if (item.media_type === 'movie') {
      router.push(`/movies/${item.id}`);
    } else if (item.media_type === 'person') {
      router.push(`/cast/${item.id}`);
    }
    // TV shows would go to a TV show page if implemented
  };

  const getImageUrl = () => {
    if (item.media_type === 'person') {
      return item.profile_path 
        ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
        : 'https://via.placeholder.com/185x278?text=No+Image';
    } else {
      return item.poster_path 
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';
    }
  };

  const getTitle = () => {
    if (item.media_type === 'person') {
      return item.name || 'Unknown Person';
    } else if (item.media_type === 'tv') {
      return item.name || item.original_name || 'Unknown TV Show';
    } else {
      return item.title || item.original_title || 'Unknown Movie';
    }
  };

  const getSubtitle = () => {
    if (item.media_type === 'person') {
      return item.known_for_department || 'Person';
    } else if (item.media_type === 'tv') {
      return item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : 'TV Show';
    } else {
      return item.release_date ? new Date(item.release_date).getFullYear().toString() : 'Movie';
    }
  };

  const getMediaTypeColor = () => {
    switch (item.media_type) {
      case 'movie':
        return 'bg-blue-500';
      case 'tv':
        return 'bg-green-500';
      case 'person':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMediaTypeIcon = () => {
    switch (item.media_type) {
      case 'movie':
        return '🎬';
      case 'tv':
        return '📺';
      case 'person':
        return '👤';
      default:
        return '❓';
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} className='mr-4 mb-4'>
      <View className='w-28 items-center'>
        {/* Image */}
        <View className='relative rounded-xl overflow-hidden shadow-lg mb-2'>
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-28 h-40 rounded-xl'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: getImageUrl() }}
            className='w-28 h-40 rounded-xl'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Gradient Overlay */}
          <View className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl' />
          
          {/* Media Type Badge */}
          <View className={`absolute top-2 left-2 ${getMediaTypeColor()} rounded-full px-2 py-1`}>
            <Text className='text-white text-xs font-bold'>
              {getMediaTypeIcon()}
            </Text>
          </View>
          
          {/* Rating/Popularity Badge */}
          {(item.vote_average || item.popularity) && (
            <View className='absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1'>
              <View className='flex-row items-center'>
                <Image source={icons.star} className='w-3 h-3 mr-1' tintColor='#FFD700' />
                <Text className='text-white text-xs font-bold'>
                  {item.vote_average ? item.vote_average.toFixed(1) : item.popularity.toFixed(0)}
                </Text>
              </View>
            </View>
          )}
          
          {/* Year/Department Badge */}
          <View className='absolute bottom-2 left-2 bg-black/70 rounded-full px-2 py-1'>
            <Text className='text-white text-xs font-medium'>
              {getSubtitle()}
            </Text>
          </View>
        </View>
        
        {/* Info */}
        <View className='items-center'>
          <Text className='text-white text-sm font-medium text-center mb-1' numberOfLines={2}>
            {getTitle()}
          </Text>
          
          {/* Media Type Label */}
          <View className={`${getMediaTypeColor()}/20 px-2 py-1 rounded-full`}>
            <Text className={`text-xs font-medium ${
              item.media_type === 'movie' ? 'text-blue-400' :
              item.media_type === 'tv' ? 'text-green-400' :
              'text-purple-400'
            }`}>
              {item.media_type.toUpperCase()}
            </Text>
          </View>
          
          {/* Additional Info */}
          {item.media_type === 'person' && item.known_for && item.known_for.length > 0 && (
            <Text className='text-light-200 text-xs text-center mt-1' numberOfLines={1}>
              {item.known_for[0].title}
            </Text>
          )}
          
          {item.media_type !== 'person' && item.overview && (
            <Text className='text-light-200 text-xs text-center mt-1' numberOfLines={2}>
              {item.overview.substring(0, 50)}...
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MultiSearchCard;