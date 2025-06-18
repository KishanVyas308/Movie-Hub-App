import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { icons } from '@/constants/icons';

interface SimilarMoviesSectionProps {
  movies: Movie[];
  loading: boolean;
  onMoviePress: (movieId: number) => void;
  onViewAll: () => void;
}

const SimilarMovieCard = ({ 
  movie, 
  onPress 
}: { 
  movie: Movie; 
  onPress: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  return (
    <TouchableOpacity onPress={onPress} className='mr-4'>
      <View className='w-32 items-center'>
        {/* Poster */}
        <View className='relative rounded-xl overflow-hidden shadow-lg mb-2'>
          {/* Loading State */}
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-32 h-48 rounded-xl'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: posterUrl }}
            className='w-32 h-48 rounded-xl'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Gradient Overlay */}
          <View className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl' />
          
          {/* Rating Badge */}
          <View className='absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1'>
            <View className='flex-row items-center'>
              <Image source={icons.star} className='w-3 h-3' tintColor='#EAB308' />
              <Text className='text-white text-xs font-bold ml-1'>
                {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}
              </Text>
            </View>
          </View>
          
          {/* Adult Content Badge */}
          {movie.adult && (
            <View className='absolute top-2 left-2 bg-red-600 rounded-full px-2 py-1'>
              <Text className='text-white text-xs font-bold'>18+</Text>
            </View>
          )}
          
          {/* Year Badge */}
          <View className='absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1'>
            <Text className='text-white text-xs font-medium'>
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
            </Text>
          </View>
        </View>
        
        {/* Movie Info */}
        <View className='items-center'>
          <Text className='text-white text-sm font-medium text-center mb-1' numberOfLines={2}>
            {movie.title}
          </Text>
          
          {/* Popularity Indicator */}
          <View className='flex-row items-center'>
            <View className={`w-2 h-2 rounded-full mr-1 ${
              movie.popularity > 50 ? 'bg-green-500' :
              movie.popularity > 20 ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <Text className='text-light-200 text-xs'>
              {movie.popularity > 50 ? 'Hot' :
               movie.popularity > 20 ? 'Popular' :
               'New'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SimilarMoviesSection = ({ movies, loading, onMoviePress, onViewAll }: SimilarMoviesSectionProps) => {
  if (loading) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Similar Movies</Text>
        <View className='bg-dark-100/50 rounded-xl h-64 items-center justify-center'>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className='text-light-200 text-sm mt-3'>Loading similar movies...</Text>
        </View>
      </View>
    );
  }

  if (!movies || movies.length === 0) {
    return null; // Don't show section if no similar movies
  }

  // Sort by popularity and rating, show top 10
  const topSimilarMovies = [...movies]
    .sort((a, b) => {
      const scoreA = (a.vote_average * 0.7) + (a.popularity * 0.3);
      const scoreB = (b.vote_average * 0.7) + (b.popularity * 0.3);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  // Calculate average rating of similar movies
  const averageRating = movies.length > 0 
    ? movies.reduce((sum, movie) => sum + movie.vote_average, 0) / movies.length 
    : 0;

  return (
    <View className='mb-8'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-bold text-xl'>Similar Movies</Text>
        <TouchableOpacity onPress={onViewAll} className='flex-row items-center'>
          <Text className='text-accent text-sm font-medium mr-1'>
            View All {movies.length}
          </Text>
          <Text className='text-accent text-sm'>→</Text>
        </TouchableOpacity>
      </View>

      {/* Similar Movies Stats */}
      <View className='bg-dark-100/30 rounded-xl p-4 mb-4 border border-dark-100/20'>
        <View className='flex-row justify-between items-center'>
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>{movies.length}</Text>
            <Text className='text-light-200 text-xs'>Similar Movies</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <View className='flex-row items-center'>
              <Image source={icons.star} className='w-4 h-4' tintColor='#EAB308' />
              <Text className='text-white font-bold text-lg ml-1'>
                {averageRating.toFixed(1)}
              </Text>
            </View>
            <Text className='text-light-200 text-xs'>Average Rating</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>
              {movies.filter(m => m.vote_average >= 7).length}
            </Text>
            <Text className='text-light-200 text-xs'>Highly Rated</Text>
          </View>
        </View>
      </View>
      
      {/* Movies List */}
      <FlatList
        data={topSimilarMovies}
        renderItem={({ item }) => (
          <SimilarMovieCard 
            movie={item} 
            onPress={() => onMoviePress(item.id)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />
    </View>
  );
};

export default SimilarMoviesSection;