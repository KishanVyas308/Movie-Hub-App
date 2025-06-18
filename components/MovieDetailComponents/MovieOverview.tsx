import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MovieOverviewProps {
  overview: string | null;
}

const MovieOverview = ({ overview }: MovieOverviewProps) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!overview) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Overview</Text>
        <View className='bg-dark-100/50 rounded-xl p-4 border border-dark-100/30'>
          <Text className='text-light-200 text-center italic'>
            No overview available for this movie.
          </Text>
        </View>
      </View>
    );
  }

  const shouldTruncate = overview.length > 300;
  const displayText = expanded || !shouldTruncate 
    ? overview 
    : overview.substring(0, 300) + '...';

  return (
    <View className='mb-8'>
      <Text className='text-white font-bold text-xl mb-4'>Overview</Text>
      <View className='bg-dark-100/30 rounded-xl p-4 border border-dark-100/20'>
        <Text className='text-light-100 text-base leading-6 mb-3'>
          {displayText}
        </Text>
        
        {shouldTruncate && (
          <TouchableOpacity 
            onPress={() => setExpanded(!expanded)}
            className='self-start'
          >
            <Text className='text-accent font-medium text-sm'>
              {expanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MovieOverview;