import { icons } from '@/constants/icons';
import { fetchMovieReviews } from '@/services/api';
import useFetch from '@/services/useFetch';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ReviewCard = ({ review }: { review: MovieReview }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const avatarUrl = review.author_details.avatar_path
    ? review.author_details.avatar_path.startsWith('/https')
      ? review.author_details.avatar_path.substring(1)
      : `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}`
    : 'https://via.placeholder.com/185x185?text=No+Avatar';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return '#9CA3AF';
    if (rating >= 8) return '#10B981';
    if (rating >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <View className='bg-dark-100/30 rounded-xl p-4 mb-4 border border-dark-100/20'>
      {/* Author Info */}
      <View className='flex-row items-center mb-3'>
        <View className='relative mr-3'>
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-12 h-12 rounded-full'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          <Image
            source={{ uri: avatarUrl }}
            className='w-12 h-12 rounded-full'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </View>
        
        <View className='flex-1'>
          <Text className='text-white text-lg font-bold'>
            {review.author_details.name || review.author}
          </Text>
          <Text className='text-light-200 text-sm'>
            @{review.author_details.username || review.author}
          </Text>
        </View>

        {/* Rating */}
        {review.author_details.rating && (
          <View className='flex-row items-center bg-dark-100/50 px-3 py-1 rounded-full'>
            <Image source={icons.star} className='w-4 h-4 mr-1' tintColor={getRatingColor(review.author_details.rating)} />
            <Text 
              className='font-bold text-sm'
              style={{ color: getRatingColor(review.author_details.rating) }}
            >
              {review.author_details.rating}/10
            </Text>
          </View>
        )}
      </View>

      {/* Review Content */}
      <View className='mb-3'>
        <Text className='text-light-100 text-base leading-6'>
          {expanded ? review.content : truncateContent(review.content)}
        </Text>
        
        {review.content.length > 300 && (
          <TouchableOpacity 
            onPress={() => setExpanded(!expanded)}
            className='mt-2'
          >
            <Text className='text-accent font-medium'>
              {expanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Date */}
      <View className='flex-row items-center justify-between'>
        <Text className='text-light-300 text-sm'>
          {formatDate(review.created_at)}
        </Text>
        
        {review.updated_at !== review.created_at && (
          <Text className='text-light-300 text-xs'>
            Updated: {formatDate(review.updated_at)}
          </Text>
        )}
      </View>
    </View>
  );
};

const ViewAllReviews = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  const movieId = React.useMemo(() => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const isValidId = Boolean(movieId && movieId.toString().trim() !== '');

  const { data: reviewsData, loading, error } = useFetch(
    () => isValidId ? fetchMovieReviews(movieId!) : Promise.resolve(null),
    isValidId
  );

  if (!isValidId) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Invalid movie ID</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className='text-white text-sm mt-2'>Loading reviews...</Text>
      </View>
    );
  }

  if (error || !reviewsData) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Failed to load reviews</Text>
        <Text className='text-light-200 text-sm mt-2'>Please try again later</Text>
      </View>
    );
  }

  // Filter and sort reviews
  const filteredReviews = reviewsData.results?.filter(review =>
    review.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating':
        const ratingA = a.author_details.rating || 0;
        const ratingB = b.author_details.rating || 0;
        return ratingB - ratingA;
      default:
        return 0;
    }
  });

  const averageRating = filteredReviews.length > 0
    ? filteredReviews
        .filter(review => review.author_details.rating)
        .reduce((sum, review) => sum + (review.author_details.rating || 0), 0) /
      filteredReviews.filter(review => review.author_details.rating).length
    : 0;

  const renderEmptyState = () => (
    <View className='flex-1 items-center justify-center px-5'>
      <Image source={icons.star} className='w-16 h-16 mb-4' tintColor='#9CA3AF' />
      <Text className='text-white text-xl font-bold mb-2'>No Reviews Found</Text>
      <Text className='text-light-200 text-center'>
        {searchQuery 
          ? 'No reviews match your search criteria. Try adjusting your search terms.'
          : 'This movie doesn\'t have any reviews yet. Be the first to share your thoughts!'
        }
      </Text>
    </View>
  );

  return (
    <View className='flex-1 bg-primary'>
      {/* Header */}
      <View className='flex-row items-center px-5 pt-12 pb-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
           <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className='text-white text-xl font-bold'>Reviews</Text>
      </View>

      {/* Search Bar */}
      <View className='px-5 mb-4'>
        <View className='bg-dark-100/50 rounded-xl px-4 py-3 flex-row items-center border border-dark-100/20'>
          <Image source={icons.search} className='w-5 h-5 mr-3' tintColor='#9CA3AF' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reviews..."
            placeholderTextColor='#9CA3AF'
            className='flex-1 text-white text-base'
          />
        </View>
      </View>

      {/* Stats and Sort */}
      <View className='px-5 mb-4'>
        <View className='bg-dark-100/30 rounded-xl p-4 border border-dark-100/20 mb-4'>
          <View className='flex-row justify-between items-center'>
            <View className='items-center flex-1'>
              <Text className='text-white font-bold text-lg'>{filteredReviews.length}</Text>
              <Text className='text-light-200 text-xs'>Total Reviews</Text>
            </View>
            
            <View className='w-px h-8 bg-dark-100' />
            
            <View className='items-center flex-1'>
              <View className='flex-row items-center'>
                <Image source={icons.star} className='w-4 h-4 mr-1' tintColor='#FFD700' />
                <Text className='text-white font-bold text-lg'>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </Text>
              </View>
              <Text className='text-light-200 text-xs'>Average Rating</Text>
            </View>
            
            <View className='w-px h-8 bg-dark-100' />
            
            <View className='items-center flex-1'>
              <Text className='text-white font-bold text-lg'>
                {filteredReviews.filter(r => r.author_details.rating).length}
              </Text>
              <Text className='text-light-200 text-xs'>With Ratings</Text>
            </View>
          </View>
        </View>

        {/* Sort Options */}
        <View className='flex-row bg-dark-100/30 rounded-xl p-1'>
          {[
            { key: 'newest', label: 'Newest' },
            { key: 'oldest', label: 'Oldest' },
            { key: 'rating', label: 'Rating' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key as any)}
              className={`flex-1 py-2 rounded-lg items-center ${
                sortBy === option.key ? 'bg-accent' : 'bg-transparent'
              }`}
            >
              <Text className={`font-medium ${
                sortBy === option.key ? 'text-white' : 'text-light-200'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <View className='flex-1 px-5'>
        {sortedReviews.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={sortedReviews}
            renderItem={({ item }) => <ReviewCard review={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
};

export default ViewAllReviews;