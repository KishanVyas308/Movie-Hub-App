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

interface ReviewsSectionProps {
  reviews: MovieReviews | null;
  loading: boolean;
  onViewAll: () => void;
}

const ReviewCard = ({ review }: { review: MovieReview }) => {
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

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-light-200';
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBg = (rating: number | null) => {
    if (!rating) return 'bg-gray-500/20';
    if (rating >= 8) return 'bg-green-500/20';
    if (rating >= 6) return 'bg-yellow-500/20';
    if (rating >= 4) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <View className='bg-dark-100/50 border border-dark-100/30 p-4 rounded-xl mr-4 w-80'>
      {/* Review Header */}
      <View className='flex-row items-center mb-3'>
        <Image
          source={{ uri: getAvatarUrl() }}
          className='w-12 h-12 rounded-full border-2 border-dark-100'
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
                <View className={`flex-row items-center px-2 py-1 rounded-full ${getRatingBg(review.author_details.rating)}`}>
                  <Image source={icons.star} className='w-3 h-3' tintColor='#EAB308' />
                  <Text className={`text-xs ml-1 font-bold ${getRatingColor(review.author_details.rating)}`}>
                    {review.author_details.rating}/10
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      
      {/* Review Content */}
      <Text className='text-light-100 text-sm leading-5 mb-3'>
        {expanded ? review.content : truncateContent(review.content)}
      </Text>
      
      {/* Actions */}
      <View className='flex-row justify-between items-center'>
        {review.content.length > 200 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text className='text-accent text-sm font-medium'>
              {expanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        
        <View className='flex-row items-center'>
          <Text className='text-light-200 text-xs'>
            {review.content.length} characters
          </Text>
        </View>
      </View>
    </View>
  );
};

const ReviewsSection = ({ reviews, loading, onViewAll }: ReviewsSectionProps) => {
  if (loading) {
    return (
      <View className='mb-8'>
        <Text className='text-white font-bold text-xl mb-4'>Reviews</Text>
        <View className='bg-dark-100/50 rounded-xl h-48 items-center justify-center'>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className='text-light-200 text-sm mt-3'>Loading reviews...</Text>
        </View>
      </View>
    );
  }

  if (!reviews || !reviews.results || reviews.results.length === 0) {
    return null; // Don't show section if no reviews
  }

  // Sort reviews by rating (highest first), then by date
  const sortedReviews = [...reviews.results]
    .sort((a, b) => {
      const ratingA = a.author_details.rating || 0;
      const ratingB = b.author_details.rating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5); // Show top 5 reviews

  // Calculate average rating
  const ratingsOnly = reviews.results
    .map(r => r.author_details.rating)
    .filter(r => r !== null) as number[];
  const averageRating = ratingsOnly.length > 0 
    ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length 
    : 0;

  return (
    <View className='mb-8'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-bold text-xl'>Reviews</Text>
        <TouchableOpacity onPress={onViewAll} className='flex-row items-center'>
          <Text className='text-accent text-sm font-medium mr-1'>
            View All {reviews.total_results}
          </Text>
          <Text className='text-accent text-sm'>→</Text>
        </TouchableOpacity>
      </View>

      {/* Review Stats */}
      <View className='bg-dark-100/30 rounded-xl p-4 mb-4 border border-dark-100/20'>
        <View className='flex-row justify-between items-center'>
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>
              {reviews.total_results}
            </Text>
            <Text className='text-light-200 text-xs'>Total Reviews</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <View className='flex-row items-center'>
              <Image source={icons.star} className='w-4 h-4' tintColor='#EAB308' />
              <Text className='text-white font-bold text-lg ml-1'>
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <Text className='text-light-200 text-xs'>Average Rating</Text>
          </View>
          
          <View className='w-px h-8 bg-dark-100' />
          
          <View className='items-center flex-1'>
            <Text className='text-white font-bold text-lg'>
              {ratingsOnly.length}
            </Text>
            <Text className='text-light-200 text-xs'>With Ratings</Text>
          </View>
        </View>
      </View>
      
      {/* Reviews List */}
      <FlatList
        data={sortedReviews}
        renderItem={({ item }) => <ReviewCard review={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />
    </View>
  );
};

export default ReviewsSection;