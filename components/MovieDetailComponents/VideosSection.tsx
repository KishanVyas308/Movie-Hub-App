import { icons } from '@/constants/icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface VideosSectionProps {
  videos: MovieVideo[];
  loading: boolean;
  onVideoPress: (video: MovieVideo) => void;
}

const VideoCard = ({ video, onPress, isMain = false }: { 
  video: MovieVideo; 
  onPress: () => void;
  isMain?: boolean;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const thumbnailUrl = video.site === 'YouTube' 
    ? `https://img.youtube.com/vi/${video.key}/${isMain ? 'maxresdefault' : 'hqdefault'}.jpg`
    : 'https://via.placeholder.com/320x180?text=Video';

  return (
    <TouchableOpacity onPress={onPress} className={isMain ? 'mb-6' : 'mr-4'}>
      <View className={`relative rounded-2xl overflow-hidden shadow-xl ${
        isMain ? 'w-full h-56' : 'w-48 h-28'
      }`}>
        {/* Loading State */}
        {imageLoading && (
          <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10'>
            <ActivityIndicator size="small" color="#FF6B35" />
            <Text className='text-light-200 text-xs mt-1'>Loading...</Text>
          </View>
        )}
        
        {/* Thumbnail */}
        <Image
          source={{ uri: thumbnailUrl }}
          className='w-full h-full'
          resizeMode='cover'
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
        
        {/* Overlay */}
        <View className='absolute inset-0 bg-black/40 items-center justify-center'>
          <View className={`bg-red-600 rounded-full shadow-xl ${
            isMain ? 'p-4' : 'p-2'
          }`}>
            <Image 
              source={icons.play} 
              className={isMain ? 'w-5 h-5' : 'w-3 h-3'} 
              tintColor='white' 
            />
          </View>
        </View>
        
        {/* Video Type Badge */}
        <View className={`absolute ${isMain ? 'top-4 left-4' : 'top-2 left-2'}`}>
          <View className={`bg-red-600 rounded-full ${isMain ? 'px-4 py-2' : 'px-2 py-1'}`}>
            <Text className={`text-white font-bold ${isMain ? 'text-sm' : 'text-xs'}`}>
              {video.type}
            </Text>
          </View>
        </View>
        
        {/* Quality Badge */}
        <View className={`absolute ${isMain ? 'top-4 right-4' : 'top-2 right-2'}`}>
          <View className={`bg-black/70 rounded-full ${isMain ? 'px-3 py-1' : 'px-2 py-1'}`}>
            <Text className={`text-white font-medium ${isMain ? 'text-xs' : 'text-xs'}`}>
              HD
            </Text>
          </View>
        </View>
        
        {/* Video Info */}
        <View className={`absolute ${isMain ? 'bottom-4 left-4 right-4' : 'bottom-2 left-2 right-2'}`}>
          <Text className={`text-white font-bold mb-1 ${isMain ? 'text-lg' : 'text-xs'}`} numberOfLines={isMain ? 2 : 1}>
            {video.name}
          </Text>
          {isMain && (
            <View className='flex-row items-center'>
              <Text className='text-light-200 text-sm'>
                {video.official ? 'Official' : 'Fan Made'}
              </Text>
              <Text className='text-light-200 text-sm mx-2'>•</Text>
              <Text className='text-light-200 text-sm'>{video.site}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const VideosSection = ({ videos, loading, onVideoPress }: VideosSectionProps) => {
  if (loading) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Videos & Trailers</Text>
        <View className='bg-dark-100/50 rounded-xl h-56 items-center justify-center'>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className='text-light-200 text-sm mt-3'>Loading videos...</Text>
        </View>
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return null; // Don't show section if no videos
  }

  // Prioritize trailers, then teasers, then other videos
  const sortedVideos = [...videos].sort((a, b) => {
    const typeOrder = { 'Trailer': 0, 'Teaser': 1, 'Clip': 2, 'Featurette': 3 };
    const aOrder = typeOrder[a.type as keyof typeof typeOrder] ?? 4;
    const bOrder = typeOrder[b.type as keyof typeof typeOrder] ?? 4;
    return aOrder - bOrder;
  });

  const mainVideo = sortedVideos[0];
  const otherVideos = sortedVideos.slice(1, 11); // Show up to 10 additional videos

  return (
    <View className='mb-8'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-bold text-xl'>Videos & Trailers</Text>
        <View className='bg-accent/20 px-3 py-1 rounded-full'>
          <Text className='text-accent text-sm font-medium'>{videos.length} videos</Text>
        </View>
      </View>
      
      {/* Main Video */}
      <VideoCard 
        video={mainVideo} 
        onPress={() => onVideoPress(mainVideo)} 
        isMain={true}
      />

      {/* Other Videos */}
      {otherVideos.length > 0 && (
        <View>
          <Text className='text-white font-semibold text-lg mb-3'>More Videos</Text>
          <FlatList
            data={otherVideos}
            renderItem={({ item }) => (
              <VideoCard video={item} onPress={() => onVideoPress(item)} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>
      )}
    </View>
  );
};

export default VideosSection;