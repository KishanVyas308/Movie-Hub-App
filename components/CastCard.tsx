import React from 'react';
import { Image, Text, View } from 'react-native';

interface CastCardProps {
  cast: CastMember;
}

const CastCard = ({ cast }: CastCardProps) => {
  return (
    <View className='mr-4 items-center w-24'>
      <View className='relative'>
        <Image
          source={{
            uri: cast.profile_path 
              ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
              : 'https://via.placeholder.com/185x278?text=No+Image'
          }}
          className='w-20 h-24 rounded-lg'
          resizeMode='cover'
        />
        <View className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg' />
      </View>
      
      <Text className='text-white text-xs font-medium mt-2 text-center' numberOfLines={2}>
        {cast.name}
      </Text>
      <Text className='text-light-200 text-xs text-center' numberOfLines={2}>
        {cast.character}
      </Text>
      
      {cast.known_for_department && (
        <Text className='text-light-300 text-xs text-center mt-1'>
          {cast.known_for_department}
        </Text>
      )}
    </View>
  );
};

export default CastCard;