import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CastSectionProps {
  cast: CastMember[];
  loading: boolean;
  onCastPress: (castId: number) => void;
  onViewAll: () => void;
}

const CastMemberCard = ({ 
  cast, 
  onPress 
}: { 
  cast: CastMember; 
  onPress: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const profileUrl = cast.profile_path 
    ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
    : 'https://via.placeholder.com/185x278?text=No+Image';

  return (
    <TouchableOpacity onPress={onPress} className='mr-4'>
      <View className='w-28 items-center'>
        {/* Profile Image */}
        <View className='relative rounded-xl overflow-hidden shadow-lg mb-2'>
          {/* Loading State */}
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-24 h-32 rounded-xl'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: profileUrl }}
            className='w-24 h-32 rounded-xl'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Gradient Overlay */}
          <View className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl' />
          
          {/* Popularity Badge */}
          {cast.popularity > 10 && (
            <View className='absolute top-2 right-2 bg-yellow-500 rounded-full w-6 h-6 items-center justify-center'>
              <Text className='text-white text-xs font-bold'>★</Text>
            </View>
          )}
        </View>
        
        {/* Cast Info */}
        <View className='items-center'>
          <Text className='text-white text-sm font-medium text-center mb-1' numberOfLines={2}>
            {cast.name}
          </Text>
          <Text className='text-light-200 text-xs text-center' numberOfLines={2}>
            {cast.character}
          </Text>
          
          {/* Department Badge */}
          {cast.known_for_department && (
            <View className='bg-accent/20 px-2 py-1 rounded-full mt-1'>
              <Text className='text-accent text-xs font-medium'>
                {cast.known_for_department}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CastSection = ({ cast, loading, onCastPress, onViewAll }: CastSectionProps) => {
  if (loading) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Cast & Crew</Text>
        <View className='bg-dark-100/50 rounded-xl h-48 items-center justify-center'>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className='text-light-200 text-sm mt-3'>Loading cast...</Text>
        </View>
      </View>
    );
  }

  if (!cast || cast.length === 0) {
    return null; // Don't show section if no cast
  }

  // Show top 8 cast members, sorted by order (main roles first)
  const mainCast = cast
    .filter(member => member.order !== undefined)
    .sort((a, b) => a.order - b.order)
    .slice(0, 8);

  return (
    <View className='mb-8'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-bold text-xl'>Cast & Crew</Text>
        <TouchableOpacity onPress={onViewAll} className='flex-row items-center'>
          <Text className='text-accent text-sm font-medium mr-1'>
            View All {cast.length}
          </Text>
          <Text className='text-accent text-sm'>→</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Cast Grid */}
      <View className='mb-4'>
        <Text className='text-white font-semibold text-lg mb-3'>Main Cast</Text>
        <FlatList
          data={mainCast}
          renderItem={({ item }) => (
            <CastMemberCard 
              cast={item} 
              onPress={() => onCastPress(item.id)} 
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      </View>

      {/* Cast Stats */}
      <View className='bg-dark-100/30 rounded-xl p-4 border border-dark-100/20'>
        <View className='flex-row justify-between items-center'>
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>{cast.length}</Text>
            <Text className='text-light-200 text-xs'>Total Cast</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>
              {cast.filter(member => member.gender === 2).length}
            </Text>
            <Text className='text-light-200 text-xs'>Male Actors</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>
              {cast.filter(member => member.gender === 1).length}
            </Text>
            <Text className='text-light-200 text-xs'>Female Actors</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CastSection;