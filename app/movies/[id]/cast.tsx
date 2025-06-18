import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchMovieCredits } from '@/services/api';
import useFetch from '@/services/useFetch';
import { icons } from '@/constants/icons';

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
    <TouchableOpacity onPress={onPress} className='bg-dark-100/30 rounded-xl p-4 mb-4 border border-dark-100/20'>
      <View className='flex-row'>
        {/* Profile Image */}
        <View className='relative rounded-xl overflow-hidden shadow-lg mr-4'>
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-20 h-28 rounded-xl'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: profileUrl }}
            className='w-20 h-28 rounded-xl'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Popularity Badge */}
          {cast.popularity > 10 && (
            <View className='absolute top-2 right-2 bg-yellow-500 rounded-full w-5 h-5 items-center justify-center'>
              <Text className='text-white text-xs font-bold'>★</Text>
            </View>
          )}
        </View>
        
        {/* Cast Info */}
        <View className='flex-1 justify-center'>
          <Text className='text-white text-lg font-bold mb-1' numberOfLines={2}>
            {cast.name}
          </Text>
          <Text className='text-accent text-base font-medium mb-2' numberOfLines={2}>
            {cast.character}
          </Text>
          
          {/* Department Badge */}
          {cast.known_for_department && (
            <View className='bg-accent/20 px-3 py-1 rounded-full self-start mb-2'>
              <Text className='text-accent text-sm font-medium'>
                {cast.known_for_department}
              </Text>
            </View>
          )}
          
          {/* Popularity Score */}
          <View className='flex-row items-center'>
            <Image source={icons.star} className='w-4 h-4 mr-1' tintColor='#FFD700' />
            <Text className='text-light-200 text-sm'>
              {cast.popularity.toFixed(1)} popularity
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CrewMemberCard = ({ 
  crew, 
  onPress 
}: { 
  crew: CrewMember; 
  onPress: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const profileUrl = crew.profile_path 
    ? `https://image.tmdb.org/t/p/w185${crew.profile_path}`
    : 'https://via.placeholder.com/185x278?text=No+Image';

  return (
    <TouchableOpacity onPress={onPress} className='bg-dark-100/30 rounded-xl p-4 mb-4 border border-dark-100/20'>
      <View className='flex-row'>
        {/* Profile Image */}
        <View className='relative rounded-xl overflow-hidden shadow-lg mr-4'>
          {imageLoading && (
            <View className='absolute inset-0 bg-dark-100 items-center justify-center z-10 w-20 h-28 rounded-xl'>
              <ActivityIndicator size="small" color="#FF6B35" />
            </View>
          )}
          
          <Image
            source={{ uri: profileUrl }}
            className='w-20 h-28 rounded-xl'
            resizeMode='cover'
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </View>
        
        {/* Crew Info */}
        <View className='flex-1 justify-center'>
          <Text className='text-white text-lg font-bold mb-1' numberOfLines={2}>
            {crew.name}
          </Text>
          <Text className='text-accent text-base font-medium mb-2' numberOfLines={2}>
            {crew.job}
          </Text>
          
          {/* Department Badge */}
          <View className='bg-blue-500/20 px-3 py-1 rounded-full self-start mb-2'>
            <Text className='text-blue-400 text-sm font-medium'>
              {crew.department}
            </Text>
          </View>
          
          {/* Popularity Score */}
          <View className='flex-row items-center'>
            <Image source={icons.star} className='w-4 h-4 mr-1' tintColor='#FFD700' />
            <Text className='text-light-200 text-sm'>
              {crew.popularity.toFixed(1)} popularity
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ViewAllCast = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');
  const [searchQuery, setSearchQuery] = useState('');

  const movieId = React.useMemo(() => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const isValidId = Boolean(movieId && movieId.toString().trim() !== '');

  const { data: credits, loading, error } = useFetch(
    () => isValidId ? fetchMovieCredits(movieId!) : Promise.resolve(null),
    isValidId
  );

  const handlePersonPress = useCallback((personId: number) => {
    router.push(`/cast/${personId}`);
  }, [router]);

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
        <Text className='text-white text-sm mt-2'>Loading cast & crew...</Text>
      </View>
    );
  }

  if (error || !credits) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Failed to load cast & crew</Text>
        <Text className='text-light-200 text-sm mt-2'>Please try again later</Text>
      </View>
    );
  }

  // Filter data based on search query
  const filteredCast = credits.cast?.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.character.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCrew = credits.crew?.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group crew by department
  const crewByDepartment = filteredCrew.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, CrewMember[]>);

  const renderCastList = () => (
    <FlatList
      data={filteredCast}
      renderItem={({ item }) => (
        <CastMemberCard 
          cast={item} 
          onPress={() => handlePersonPress(item.id)} 
        />
      )}
      keyExtractor={(item) => `cast-${item.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );

  const renderCrewList = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {Object.entries(crewByDepartment).map(([department, members]) => (
        <View key={department} className='mb-6'>
          <Text className='text-white text-xl font-bold mb-4 px-1'>
            {department} ({members.length})
          </Text>
          {members.map((member) => (
            <CrewMemberCard 
              key={`crew-${member.id}-${member.credit_id}`}
              crew={member} 
              onPress={() => handlePersonPress(member.id)} 
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View className='flex-1 bg-primary'>
      {/* Header */}
      <View className='flex-row items-center px-5 pt-12 pb-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <Image source={icons.arrow} className='w-6 h-6' tintColor='white' />
        </TouchableOpacity>
        <Text className='text-white text-xl font-bold'>Cast & Crew</Text>
      </View>

      {/* Search Bar */}
      <View className='px-5 mb-4'>
        <View className='bg-dark-100/50 rounded-xl px-4 py-3 flex-row items-center border border-dark-100/20'>
          <Image source={icons.search} className='w-5 h-5 mr-3' tintColor='#9CA3AF' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor='#9CA3AF'
            className='flex-1 text-white text-base'
          />
        </View>
      </View>

      {/* Tab Selector */}
      <View className='flex-row mx-5 mb-4 bg-dark-100/30 rounded-xl p-1'>
        <TouchableOpacity
          onPress={() => setActiveTab('cast')}
          className={`flex-1 py-3 rounded-lg items-center ${
            activeTab === 'cast' ? 'bg-accent' : 'bg-transparent'
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === 'cast' ? 'text-white' : 'text-light-200'
          }`}>
            Cast ({filteredCast.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('crew')}
          className={`flex-1 py-3 rounded-lg items-center ${
            activeTab === 'crew' ? 'bg-accent' : 'bg-transparent'
          }`}
        >
          <Text className={`font-semibold ${
            activeTab === 'crew' ? 'text-white' : 'text-light-200'
          }`}>
            Crew ({filteredCrew.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className='flex-1 px-5'>
        {activeTab === 'cast' ? renderCastList() : renderCrewList()}
      </View>
    </View>
  );
};

export default ViewAllCast;