import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps {
  movie: MovieDetails;
  onGenrePress: (genreId: number, genreName: string) => void;
}

const MovieInfo = ({ movie, onGenrePress }: MovieInfoProps) => {
  return (
    <View className=' mb-6'>
      {/* Original Title */}
      {movie.original_title && movie.original_title !== movie.title && (
        <View className='mb-3'>
          <Text className='text-light-200 text-sm mb-1'>Original Title</Text>
          <Text className='text-white text-base font-medium'>
            {movie.original_title}
          </Text>
        </View>
      )}
      
      {/* Meta Information Grid */}
      <View className='bg-dark-100/50 rounded-xl p-4 mb-4'>
        <View className='flex-row flex-wrap gap-4'>
          {/* Release Date */}
          <View className='flex-1 min-w-[120px]'>
            <Text className='text-light-200 text-xs uppercase tracking-wide mb-1'>
              Release Date
            </Text>
            <Text className='text-white font-medium'>
              {movie.release_date 
                ? new Date(movie.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Unknown'
              }
            </Text>
          </View>

          {/* Runtime */}
          {movie.runtime && (
            <View className='flex-1 min-w-[120px]'>
              <Text className='text-light-200 text-xs uppercase tracking-wide mb-1'>
                Runtime
              </Text>
              <Text className='text-white font-medium'>
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </Text>
            </View>
          )}

          {/* Status */}
          <View className='flex-1 min-w-[120px]'>
            <Text className='text-light-200 text-xs uppercase tracking-wide mb-1'>
              Status
            </Text>
            <View className={`self-start px-3 py-1 rounded-full ${
              movie.status === 'Released' ? 'bg-green-600/20 border border-green-600/30' :
              movie.status === 'In Production' ? 'bg-blue-600/20 border border-blue-600/30' :
              'bg-yellow-600/20 border border-yellow-600/30'
            }`}>
              <Text className={`text-xs font-medium ${
                movie.status === 'Released' ? 'text-green-400' :
                movie.status === 'In Production' ? 'text-blue-400' :
                'text-yellow-400'
              }`}>
                {movie.status}
              </Text>
            </View>
          </View>

          {/* Language */}
          <View className='flex-1 min-w-[120px]'>
            <Text className='text-light-200 text-xs uppercase tracking-wide mb-1'>
              Language
            </Text>
            <Text className='text-white font-medium uppercase'>
              {movie.original_language}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Rating and Popularity */}
      <View className='flex-row gap-4 mb-4'>
        {/* TMDB Rating */}
        <View className='flex-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4'>
          <View className='flex-row items-center justify-between mb-2'>
            <Text className='text-yellow-400 text-sm font-medium'>TMDB Rating</Text>
            <Image source={icons.star} className='w-5 h-5' tintColor='#EAB308' />
          </View>
          <Text className='text-white font-bold text-2xl'>
            {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}
          </Text>
          <Text className='text-light-200 text-xs'>
            from {movie.vote_count ? (movie.vote_count / 1000).toFixed(1) : '0'}K votes
          </Text>
        </View>
        
        {/* Popularity */}
        <View className='flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4'>
          <View className='flex-row items-center justify-between mb-2'>
            <Text className='text-blue-400 text-sm font-medium'>Popularity</Text>
            <View className='w-5 h-5 bg-blue-500 rounded-full' />
          </View>
          <Text className='text-white font-bold text-2xl'>
            {movie.popularity ? Math.round(movie.popularity) : '0'}
          </Text>
          <Text className='text-light-200 text-xs'>trending score</Text>
        </View>
      </View>

      {/* Genres */}
      {movie.genres && movie.genres.length > 0 && (
        <View className='mb-4'>
          <Text className='text-light-200 text-sm mb-3'>Genres</Text>
          <View className='flex-row flex-wrap gap-2'>
            {movie.genres.map((genre) => (
              <TouchableOpacity 
                key={genre.id} 
                className='bg-accent/20 border border-accent/30 px-4 py-2 rounded-full'
                onPress={() => onGenrePress(genre.id, genre.name)}
              >
                <Text className='text-accent text-sm font-medium'>{genre.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Production Companies */}
      {movie.production_companies && movie.production_companies.length > 0 && (
        <View>
          <Text className='text-light-200 text-sm mb-3'>Production Companies</Text>
          <View className='flex-row flex-wrap gap-2'>
            {movie.production_companies.slice(0, 3).map((company) => (
              <View 
                key={company.id} 
                className='bg-dark-100/50 border border-dark-100 px-3 py-2 rounded-lg flex-row items-center'
              >
                {company.logo_path && (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w92${company.logo_path}` }}
                    className='w-4 h-4 mr-2'
                    resizeMode='contain'
                  />
                )}
                <Text className='text-light-100 text-xs font-medium'>
                  {company.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default MovieInfo;