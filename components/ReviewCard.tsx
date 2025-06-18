import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { icons } from '@/constants/icons';

interface ReviewCardProps {
  review: MovieReview;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvatarUrl = () => {
    if (review.author_details.avatar_path) {
      if (review.author_details.avatar_path.startsWith('/https://')) {
        return review.author_details.avatar_path.substring(1);
      }
      return `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`;
    }
    return 'https://via.placeholder.com/45x45?text=User';
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <View className='bg-dark-100 p-4 rounded-lg mr-4 w-80'>
      <View className='flex-row items-center mb-3'>
        <Image
          source={{ uri: getAvatarUrl() }}
          className='w-10 h-10 rounded-full'
          resizeMode='cover'
        />
        <View className='ml-3 flex-1'>
          <Text className='text-white font-bold text-sm'>
            {review.author}
          </Text>
          <View className='flex-row items-center mt-1'>
            <Text className='text-light-200 text-xs'>
              {formatDate(review.created_at)}
            </Text>
            {review.author_details.rating && (
              <>
                <Text className='text-light-200 text-xs mx-2'>•</Text>
                <View className='flex-row items-center'>
                  <Image source={icons.star} className='w-3 h-3' />
                  <Text className='text-white text-xs ml-1 font-bold'>
                    {review.author_details.rating}/10
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      
      <Text className='text-light-100 text-sm leading-5'>
        {expanded ? review.content : truncateContent(review.content)}
      </Text>
      
      {review.content.length > 200 && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} className='mt-2'>
          <Text className='text-accent text-sm font-medium'>
            {expanded ? 'Show Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReviewCard;