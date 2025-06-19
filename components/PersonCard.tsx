import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface PersonCardProps {
  person: SearchPerson;
  size?: 'small' | 'medium' | 'large';
}

const PersonCard = ({ person, size = 'medium' }: PersonCardProps) => {
  const router = useRouter();
  const [imageLoading, setImageLoading] = useState(true);

  const profileUrl = person.profile_path 
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : 'https://via.placeholder.com/185x278?text=No+Image';

  const handlePress = () => {
    router.push(`/cast/${person.id}`);
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: 'w-20', height: 'h-28', textSize: 'text-xs' };
      case 'large':
        return { width: 'w-32', height: 'h-44', textSize: 'text-sm' };
      default:
        return { width: 'w-24', height: 'h-32', textSize: 'text-sm' };
    }
  };

  const cardSize = getCardSize();

  return (
    <TouchableOpacity onPress={handlePress} className='px-2 mb-4 w-[30%]'>
      <View className='items-center'>
        {/* Profile Image */}
        <View className={`relative rounded-xl overflow-hidden shadow-lg mb-2 ${cardSize.width} ${cardSize.height}`}>
          {imageLoading && (
            <View className={`absolute inset-0 bg-dark-100 items-center justify-center z-10 ${cardSize.width} ${cardSize.height} rounded-xl`}>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: profileUrl }}
            className={`${cardSize.width} ${cardSize.height} rounded-xl`}
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Gradient Overlay */}
          <View className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl' />
          
          {/* Popularity Badge */}
          {person.popularity > 10 && (
            <View className='absolute top-2 right-2 bg-yellow-500 rounded-full w-5 h-5 items-center justify-center'>
              <Text className='text-white text-xs font-bold'>★</Text>
            </View>
          )}
          
          {/* Gender Badge */}
          <View className='absolute bottom-2 left-2 bg-black/70 rounded-full px-2 py-1'>
            <Text className='text-white text-xs'>
              {person.gender === 1 ? '♀' : person.gender === 2 ? '♂' : '?'}
            </Text>
          </View>
        </View>
        
        {/* Person Info */}
        <View className='items-center max-w-24'>
          <Text className={`text-white font-medium text-center mb-1 ${cardSize.textSize}`} numberOfLines={2}>
            {person.name}
          </Text>
          
          {/* Department Badge */}
          {person.known_for_department && (
            <View className='bg-accent/20 px-2 py-1 rounded-full mb-1'>
              <Text className='text-accent text-xs font-medium'>
                {person.known_for_department}
              </Text>
            </View>
          )}
          
          {/* Known For Movies */}
          {person.known_for && person.known_for.length > 0 && (
            <Text className='text-light-200 text-xs text-center' numberOfLines={1}>
              Known for: {person.known_for[0].title}
            </Text>
          )}
          
          {/* Popularity Score */}
          <View className='flex-row items-center mt-1'>
            <Image source={icons.star} className='w-3 h-3 mr-1' tintColor='#FFD700' />
            <Text className='text-light-200 text-xs'>
              {person.popularity.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PersonCard;