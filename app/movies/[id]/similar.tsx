import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchSimilarMovies } from '@/services/api';
import useFetch from '@/services/useFetch';
import { icons } from '@/constants/icons';

const SimilarMovieCard = ({ 
  movie, 
  onPress 
}: { 
  movie: Movie; 
  onPress: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#10B981';
    if (rating >= 6) return '#F59E0B';
    if (rating >= 4) return '#EF4444';
    return '#9CA3AF';
  };

  return (
    <TouchableOpacity onPress={onPress} className='bg-dark-100/30 rounded-xl overflow-hidden mb-4 border border-dark-100/20'>
      <View className='flex-row'>
        {/* Movie Poster */}
        <View className='relative'>
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-28 h-40'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: posterUrl }}
            className='w-28 h-40'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Rating Badge */}
          <View className='absolute top-2 left-2 bg-black/70 rounded-full px-2 py-1'>
            <View className='flex-row items-center'>
              <Image source={icons.star} className='w-3 h-3 mr-1' tintColor={getRatingColor(movie.vote_average)} />
              <Text 
                className='text-xs font-bold'
                style={{ color: getRatingColor(movie.vote_average) }}
              >
                {movie.vote_average.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Movie Info */}
        <View className='flex-1 p-4 justify-between'>
          <View>
            <Text className='text-white text-lg font-bold mb-2' numberOfLines={2}>
              {movie.title}
            </Text>
            
            <Text className='text-light-200 text-sm mb-3' numberOfLines={3}>
              {movie.overview || 'No overview available.'}
            </Text>
          </View>
          
          <View>
            {/* Release Date */}
            <View className='flex-row items-center mb-2'>
              <Image source={icons.calendar} className='w-4 h-4 mr-2' tintColor='#9CA3AF' />
              <Text className='text-light-300 text-sm'>
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
              </Text>
            </View>
            
            {/* Popularity */}
            <View className='flex-row items-center'>
              <Image source={icons.trending} className='w-4 h-4 mr-2' tintColor='#FF6B35' />
              <Text className='text-light-300 text-sm'>
                {movie.popularity.toFixed(0)} popularity
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ViewAllSimilar = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'release_date' | 'title'>('popularity');

  const movieId = React.useMemo(() => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const isValidId = Boolean(movieId && movieId.toString().trim() !== '');

  const { data: similarMovies, loading, error } = useFetch(
    () => isValidId ? fetchSimilarMovies(movieId!) : Promise.resolve([]),
    isValidId
  );

  const handleMoviePress = useCallback((movieId: number) => {
    router.push(`/movies/${movieId}`);
  }, [router]);

  if (!isValidId) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Invalid movie ID</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className='text-white text-sm mt-2'>Loading similar movies...</Text>
      </View>
    );
  }

  if (error || !similarMovies) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Failed to load similar movies</Text>
        <Text className='text-light-200 text-sm mt-2'>Please try again later</Text>
      </View>
    );
  }

  // Filter movies based on search query
  const filteredMovies = similarMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'release_date':
        return new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const averageRating = filteredMovies.length > 0
    ? filteredMovies.reduce((sum, movie) => sum + movie.vote_average, 0) / filteredMovies.length
    : 0;

  const renderEmptyState = () => (
    <View className='flex-1 items-center justify-center px-5'>
      <Image source={icons.film} className='w-16 h-16 mb-4' tintColor='#9CA3AF' />
      <Text className='text-white text-xl font-bold mb-2'>No Similar Movies Found</Text>
      <Text className='text-light-200 text-center'>
        {searchQuery 
          ? 'No movies match your search criteria. Try adjusting your search terms.'
          : 'We couldn\'t find any similar movies for this title.'
        }
      </Text>
    </View>
  );

  return (
    <View className='flex-1 bg-primary'>
      {/* Header */}
      <View className='flex-row items-center px-5 pt-12 pb-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <Image source={icons.arrow} className='w-6 h-6' tintColor='white' />
        </TouchableOpacity>
        <Text className='text-white text-xl font-bold'>Similar Movies</Text>
      </View>

      {/* Search Bar */}
      <View className='px-5 mb-4'>
        <View className='bg-dark-100/50 rounded-xl px-4 py-3 flex-row items-center border border-dark-100/20'>
          <Image source={icons.search} className='w-5 h-5 mr-3' tintColor='#9CA3AF' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search similar movies..."
            placeholderTextColor='#9CA3AF'
            className='flex-1 text-white text-base'
          />
        </View>
      </View>

      {/* Stats and Sort */}
      <View className='px-5 mb-4'>
        <View className='bg-dark-100/30 rounded-xl p-4 border border-dark-100/20 mb-4'>
          <View className='flex-row justify-between items-center'>
            <View className='items-center flex-1'>
              <Text className='text-white font-bold text-lg'>{filteredMovies.length}</Text>
              <Text className='text-light-200 text-xs'>Similar Movies</Text>
            </View>
            
            <View className='w-px h-8 bg-dark-100' />
            
            <View className='items-center flex-1'>
              <View className='flex-row items-center'>
                <Image source={icons.star} className='w-4 h-4 mr-1' tintColor='#FFD700' />
                <Text className='text-white font-bold text-lg'>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </Text>
              </View>
              <Text className='text-light-200 text-xs'>Average Rating</Text>
            </View>
            
            <View className='w-px h-8 bg-dark-100' />
            
            <View className='items-center flex-1'>
              <Text className='text-white font-bold text-lg'>
                {filteredMovies.filter(m => m.vote_average >= 7).length}
              </Text>
              <Text className='text-light-200 text-xs'>Highly Rated</Text>
            </View>
          </View>
        </View>

        {/* Sort Options */}
        <View className='flex-row bg-dark-100/30 rounded-xl p-1'>
          {[
            { key: 'popularity', label: 'Popular' },
            { key: 'rating', label: 'Rating' },
            { key: 'release_date', label: 'Recent' },
            { key: 'title', label: 'A-Z' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key as any)}
              className={`flex-1 py-2 rounded-lg items-center ${
                sortBy === option.key ? 'bg-accent' : 'bg-transparent'
              }`}
            >
              <Text className={`font-medium text-sm ${
                sortBy === option.key ? 'text-white' : 'text-light-200'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Movies List */}
      <View className='flex-1 px-5'>
        {sortedMovies.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={sortedMovies}
            renderItem={({ item }) => (
              <SimilarMovieCard 
                movie={item} 
                onPress={() => handleMoviePress(item.id)} 
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
};

export default ViewAllSimilar;