import { icons } from '@/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MovieHeroProps {
  movie: MovieDetails;
  mainTrailer?: MovieVideo;
  onPlayTrailer: () => void;
  onBack: () => void;
}

const MovieHero = ({ movie, mainTrailer, onPlayTrailer, onBack }: MovieHeroProps) => {
  const [backdropLoading, setBackdropLoading] = useState(true);
  const [posterLoading, setPosterLoading] = useState(true);

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Image';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#10B981'; // green
    if (rating >= 7) return '#F59E0B'; // yellow
    if (rating >= 5) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <View className='relative' style={{ height: screenHeight * 0.6 }}>
      {/* Backdrop Image with Loading */}
      <ImageBackground 
        source={{ uri: backdropUrl }}
        className='w-full h-full'
        resizeMode='cover'
        onLoadStart={() => setBackdropLoading(true)}
        onLoadEnd={() => setBackdropLoading(false)}
        onError={() => setBackdropLoading(false)}
      >
        {/* Loading Overlay */}
        {backdropLoading && (
          <View className='absolute inset-0 bg-dark-100 items-center justify-center'>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text className='text-light-200 text-sm mt-2'>Loading...</Text>
          </View>
        )}

        {/* Enhanced Gradient Overlays */}
        <LinearGradient
          colors={['rgba(18, 18, 18, 0.1)', 'rgba(18, 18, 18, 0.7)', 'rgba(18, 18, 18, 0.95)']}
          locations={[0, 0.6, 1]}
          className='absolute inset-0'
        />
        
        {/* Side Gradients for better text readability */}
        <LinearGradient
          colors={['rgba(18, 18, 18, 0.8)', 'transparent', 'rgba(18, 18, 18, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className='absolute inset-0'
        />

        {/* Header Controls */}
        <View className='absolute top-12 left-0 right-0 flex-row justify-between items-center px-5 z-20'>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={onBack}
            className='bg-primary/60 rounded-full p-3'
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Enhanced Rating Badge */}
          <View 
            className='bg-black/60 rounded-2xl px-4 py-2'
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <View className='flex-row items-center'>
              <View 
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: getRatingColor(movie.vote_average || 0) }}
              />
              <Image source={icons.star} className='w-4 h-4' tintColor='#EAB308' />
              <Text className='text-white font-bold text-sm ml-1'>
                {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}
              </Text>
              <Text className='text-light-200 text-xs ml-1'>/10</Text>
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View className='absolute bottom-0 left-0 right-0 p-5'>
          <View className='flex-row items-end'>
            {/* Enhanced Floating Poster */}
            <View 
              className='bg-primary/40 border border-solid border-white/15 rounded-3xl p-3 mr-4'
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 15,
              }}
            >
              <View className='relative'>
                {posterLoading && (
                  <View className='absolute inset-0 bg-dark-100 rounded-2xl items-center justify-center z-10'>
                    <ActivityIndicator size="small" color="#FF6B35" />
                  </View>
                )}
                <Image 
                  source={{ uri: posterUrl }} 
                  className='w-28 h-40 rounded-2xl' 
                  resizeMode='cover'
                  onLoadStart={() => setPosterLoading(true)}
                  onLoadEnd={() => setPosterLoading(false)}
                  onError={() => setPosterLoading(false)}
                />
                
                {/* Poster Quality Badge */}
                <View className='absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full'>
                  <Text className='text-white text-xs font-bold'>HD</Text>
                </View>
              </View>
            </View>

            {/* Movie Information */}
            <View className='flex-1 pb-2'>
              {/* Title */}
              <Text className='text-white font-bold text-2xl mb-2' numberOfLines={2}>
                {movie.title}
              </Text>
              
              {/* Tagline */}
              {movie.tagline && (
                <Text className='text-light-200 text-sm italic mb-3' numberOfLines={2}>
                  "{movie.tagline}"
                </Text>
              )}
              
              {/* Enhanced Meta Info */}
              <View className='flex-row items-center flex-wrap gap-2 mb-3'>
                {/* Year */}
                <View className='bg-white/20 px-3 py-1.5 rounded-full border border-solid border-white/25 '>
                  <Text className='text-white text-xs font-semibold'>
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                  </Text>
                </View>
                
                {/* Runtime */}
                {movie.runtime && (
                  <View className='bg-blue-500/30 px-3 py-1.5 rounded-full  border border-solid border-blue-500/35'>
                    <Text className='text-blue-200 text-xs font-semibold'>
                      {formatRuntime(movie.runtime)}
                    </Text>
                  </View>
                )}
                
                {/* Status */}
                <View className={`px-3 py-1.5 rounded-full ${
                  movie.status === 'Released' ? 'bg-green-500/30 border border-solid border-green-500/35' :
                  movie.status === 'In Production' ? 'bg-yellow-500/30 border border-solid border-yellow-500/35' :
                  'bg-gray-500/30  border border-solid border-gray-500/35'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    movie.status === 'Released' ? 'text-green-200' :
                    movie.status === 'In Production' ? 'text-yellow-200' :
                    'text-gray-200'
                  }`}>
                    {movie.status}
                  </Text>
                </View>
                
                {/* Adult Content */}
                {movie.adult && (
                  <View className='bg-red-600 px-3 py-1.5 rounded-full'>
                    <Text className='text-white text-xs font-bold'>18+</Text>
                  </View>
                )}
              </View>

              {/* Vote Count */}
              <Text className='text-light-200 text-xs'>
                {movie.vote_count ? `${(movie.vote_count / 1000).toFixed(1)}K votes` : 'No votes yet'}
              </Text>
            </View>
          </View>

          {/* Enhanced Play Trailer Button */}
          {mainTrailer && (
            <TouchableOpacity 
              className='absolute bottom-0 transform translate-y-4 right-5 border border-solid border-red-600 rounded-full p-3 flex-row items-center'
              onPress={onPlayTrailer}
              style={{
              shadowColor: '#DC2626',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
              }}
            >
              <Icon name="play-circle" size={20} color={'red'} style={{ marginRight: 8 }} />
              <Text className='text-white font-bold text-sm'>TRAILER</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default MovieHero;