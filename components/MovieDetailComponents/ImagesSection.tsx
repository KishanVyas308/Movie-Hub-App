import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ImagesSectionProps {
  images: MovieImages | null;
  loading: boolean;
  onImagePress: (imagePath: string) => void;
}

const ImageCard = ({ 
  image, 
  type, 
  onPress 
}: { 
  image: MovieImage; 
  type: 'backdrop' | 'poster';
  onPress: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  return (
    <TouchableOpacity onPress={onPress} className='mr-4'>
      <View className={`relative rounded-xl overflow-hidden shadow-lg ${
        type === 'backdrop' ? 'w-48 h-28' : 'w-32 h-48'
      }`}>
        {/* Loading State */}
        {imageLoading && (
          <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10'>
            <ActivityIndicator size="small" color="#FF6B35" />
          </View>
        )}
        
        {/* Image */}
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${image.file_path}` }}
          className='w-full h-full'
          style={{ borderRadius: 12 }}
          resizeMode='cover'
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
        
        {/* Overlay */}
        <View className='absolute inset-0 bg-black/10 rounded-xl' />
        
        {/* Quality Badge */}
        <View className='absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full'>
          <Text className='text-white text-xs font-medium'>HD</Text>
        </View>
        
        {/* Rating Badge */}
        {image.vote_average > 0 && (
          <View className='absolute bottom-2 left-2 bg-yellow-500/80 px-2 py-1 rounded-full'>
            <Text className='text-white text-xs font-bold'>
              ★ {image.vote_average.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ImagesSection = ({ images, loading, onImagePress }: ImagesSectionProps) => {
  if (loading) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Photos & Images</Text>
        <View className='bg-dark-100/50 rounded-xl h-48 items-center justify-center'>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className='text-light-200 text-sm mt-3'>Loading images...</Text>
        </View>
      </View>
    );
  }

  if (!images || (!images.backdrops?.length && !images.posters?.length)) {
    return null; // Don't show section if no images
  }

  const backdrops = images.backdrops || [];
  const posters = images.posters || [];
  const totalImages = backdrops.length + posters.length;
  const topBackdrops = backdrops
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, backdrops.length);
  const topPosters = posters
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, posters.length);

  return (
    <View className='mb-8'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-bold text-xl'>Photos & Images</Text>
        <View className='bg-accent/20 px-3 py-1 rounded-full'>
          <Text className='text-accent text-sm font-medium'>{totalImages} images</Text>
        </View>
      </View>

      {/* Backdrops */}
      {topBackdrops.length > 0 && (
        <View className='mb-6'>
          <View className='flex-row justify-between items-center mb-3'>
            <Text className='text-white font-semibold text-lg'>
              Backdrops
            </Text>
            <View className='bg-blue-500/20 px-2 py-1 rounded-full'>
              <Text className='text-blue-400 text-xs font-medium'>
                {backdrops.length} photos
              </Text>
            </View>
          </View>
          <FlatList
            data={topBackdrops}
            renderItem={({ item }) => (
              <ImageCard 
                image={item} 
                type="backdrop"
                onPress={() => onImagePress(item.file_path)} 
              />
            )}
            keyExtractor={(item, index) => `backdrop-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>
      )}

      {/* Posters */}
      {topPosters.length > 0 && (
        <View>
          <View className='flex-row justify-between items-center mb-3'>
            <Text className='text-white font-semibold text-lg'>
              Posters
            </Text>
            <View className='bg-purple-500/20 px-2 py-1 rounded-full'>
              <Text className='text-purple-400 text-xs font-medium'>
                {posters.length} posters
              </Text>
            </View>
          </View>
          <FlatList
            data={topPosters}
            renderItem={({ item }) => (
              <ImageCard 
                image={item} 
                type="poster"
                onPress={() => onImagePress(item.file_path)} 
              />
            )}
            keyExtractor={(item, index) => `poster-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>
      )}
    </View>
  );
};

export default ImagesSection;