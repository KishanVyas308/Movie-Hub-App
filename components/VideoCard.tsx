import React from 'react';
import { Image, Text, TouchableOpacity, View, Linking } from 'react-native';
import { icons } from '@/constants/icons';

interface VideoCardProps {
  video: MovieVideo;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const handlePress = () => {
    if (video.site === 'YouTube') {
      const url = `https://www.youtube.com/watch?v=${video.key}`;
      Linking.openURL(url);
    }
  };

  const getThumbnail = () => {
    if (video.site === 'YouTube') {
      return `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
    }
    return 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
  };

  return (
    <TouchableOpacity onPress={handlePress} className='mr-4 w-40'>
      <View className='relative'>
        <Image
          source={{ uri: getThumbnail() }}
          className='w-40 h-24 rounded-lg'
          resizeMode='cover'
        />
        <View className='absolute inset-0 bg-black/30 rounded-lg items-center justify-center'>
          <Image source={icons.play} className='w-8 h-8' tintColor='white' />
        </View>
        <View className='absolute top-2 right-2 bg-red-600 px-2 py-1 rounded'>
          <Text className='text-white text-xs font-bold'>
            {video.type}
          </Text>
        </View>
      </View>
      <Text className='text-white text-sm font-medium mt-2' numberOfLines={2}>
        {video.name}
      </Text>
      <Text className='text-light-200 text-xs'>
        {video.site} • {video.official ? 'Official' : 'Fan Made'}
      </Text>
    </TouchableOpacity>
  );
};

export default VideoCard;