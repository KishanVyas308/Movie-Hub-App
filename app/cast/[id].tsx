import { icons } from '@/constants/icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState, useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native'
import { fetchPersonDetails, fetchPersonMovieCredits, fetchPersonImages } from '@/services/api'
import useFetch from '@/services/useFetch'

const CastDetails = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const personId = React.useMemo(() => {
    if (!id) return null
    return Array.isArray(id) ? id[0] : id
  }, [id])

  const isValidId = Boolean(personId && personId.toString().trim() !== '')

  // Fetch person data
  const { data: person, loading: personLoading, error: personError } = useFetch(
    () => isValidId ? fetchPersonDetails(personId!) : Promise.resolve(null),
    isValidId
  )

  const { data: movieCredits, loading: creditsLoading } = useFetch(
    () => isValidId ? fetchPersonMovieCredits(personId!) : Promise.resolve(null),
    isValidId
  )

  const { data: images, loading: imagesLoading } = useFetch(
    () => isValidId ? fetchPersonImages(personId!) : Promise.resolve(null),
    isValidId
  )

  const loading = personLoading || creditsLoading || imagesLoading

  const openIMDB = useCallback(() => {
    if (person?.imdb_id) {
      Linking.openURL(`https://www.imdb.com/name/${person.imdb_id}`)
    }
  }, [person?.imdb_id])

  const openHomepage = useCallback(() => {
    if (person?.homepage) {
      Linking.openURL(person.homepage)
    }
  }, [person?.homepage])

  const handleMoviePress = useCallback((movieId: number) => {
    router.push(`/movies/${movieId}`)
  }, [router])

  const calculateAge = useCallback((birthday: string, deathday?: string | null) => {
    const birthDate = new Date(birthday)
    const endDate = deathday ? new Date(deathday) : new Date()
    const age = endDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = endDate.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }, [])

  if (!isValidId) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Invalid person ID</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className='text-white text-sm mt-2'>Loading person details...</Text>
      </View>
    )
  }

  if (personError || !person) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Failed to load person details</Text>
        <Text className='text-light-200 text-sm mt-2'>Please try again later</Text>
      </View>
    )
  }

  // Process movie credits
  const sortedCastCredits = movieCredits?.cast
    ?.filter(movie => movie.poster_path)
    ?.sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime())
    ?.slice(0, 20) || []

  const sortedCrewCredits = movieCredits?.crew
    ?.filter(movie => movie.poster_path)
    ?.sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime())
    ?.slice(0, 10) || []

  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header with back button */}
        <View className='flex-row items-center px-5 pt-12 pb-4'>
          <TouchableOpacity onPress={() => router.back()} className='mr-4'>
            <Image source={icons.arrow} className='w-6 h-6' tintColor='white' />
          </TouchableOpacity>
          <Text className='text-white text-xl font-bold'>Person Details</Text>
        </View>

        {/* Profile Section */}
        <View className='px-5'>
          <View className='flex-row'>
            <TouchableOpacity
              onPress={() => person.profile_path && setSelectedImage(`https://image.tmdb.org/t/p/original${person.profile_path}`)}
            >
              <Image
                source={{
                  uri: person.profile_path 
                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                    : 'https://via.placeholder.com/300x450?text=No+Image'
                }}
                className='w-32 h-48 rounded-lg'
                resizeMode='cover'
              />
            </TouchableOpacity>
            
            <View className='flex-1 ml-4'>
              <Text className='text-white text-2xl font-bold mb-2'>
                {person.name}
              </Text>
              
              <View className='mb-2'>
                <Text className='text-light-200 text-sm'>Known For</Text>
                <Text className='text-white text-base font-medium'>
                  {person.known_for_department}
                </Text>
              </View>

              <View className='mb-2'>
                <Text className='text-light-200 text-sm'>Popularity</Text>
                <View className='flex-row items-center'>
                  <Image source={icons.star} className='w-4 h-4 mr-1' tintColor='#FFD700' />
                  <Text className='text-white text-base font-medium'>
                    {person.popularity.toFixed(1)}
                  </Text>
                </View>
              </View>

              {person.birthday && (
                <View className='mb-2'>
                  <Text className='text-light-200 text-sm'>
                    {person.deathday ? 'Born' : 'Age'}
                  </Text>
                  <Text className='text-white text-base'>
                    {person.deathday ? (
                      new Date(person.birthday).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    ) : (
                      `${calculateAge(person.birthday, person.deathday)} years old`
                    )}
                  </Text>
                </View>
              )}

              {person.deathday && (
                <View className='mb-2'>
                  <Text className='text-light-200 text-sm'>Died</Text>
                  <Text className='text-white text-base'>
                    {new Date(person.deathday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Biography */}
          {person.biography && (
            <View className='mt-6'>
              <Text className='text-white text-lg font-bold mb-3'>Biography</Text>
              <Text className='text-light-100 text-base leading-6'>
                {person.biography}
              </Text>
            </View>
          )}

          {/* Personal Info */}
          <View className='mt-6'>
            <Text className='text-white text-lg font-bold mb-3'>Personal Info</Text>
            
            {person.place_of_birth && (
              <View className='mb-3'>
                <Text className='text-light-200 text-sm'>Place of Birth</Text>
                <Text className='text-light-100 text-base'>
                  {person.place_of_birth}
                </Text>
              </View>
            )}

            {person.also_known_as && person.also_known_as.length > 0 && (
              <View className='mb-3'>
                <Text className='text-light-200 text-sm'>Also Known As</Text>
                {person.also_known_as.slice(0, 5).map((name, index) => (
                  <Text key={index} className='text-light-100 text-base'>
                    {name}
                  </Text>
                ))}
              </View>
            )}

            <View className='mb-3'>
              <Text className='text-light-200 text-sm'>Gender</Text>
              <Text className='text-light-100 text-base'>
                {person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Not specified'}
              </Text>
            </View>
          </View>

          {/* External Links */}
          <View className='flex-row gap-x-3 mt-6'>
            {person.imdb_id && (
              <TouchableOpacity
                onPress={openIMDB}
                className='flex-1 py-3 bg-yellow-600 rounded-lg items-center'
              >
                <Text className='text-white font-bold'>View on IMDb</Text>
              </TouchableOpacity>
            )}
            
            {person.homepage && (
              <TouchableOpacity
                onPress={openHomepage}
                className='flex-1 py-3 bg-blue-600 rounded-lg items-center'
              >
                <Text className='text-white font-bold'>Official Website</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Acting Credits */}
          {sortedCastCredits.length > 0 && (
            <View className='mt-8'>
              <Text className='text-white text-lg font-bold mb-4'>
                Acting ({movieCredits?.cast?.length || 0})
              </Text>
              <FlatList
                data={sortedCastCredits}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className='mr-4 w-32'
                    onPress={() => handleMoviePress(item.id)}
                  >
                    <Image
                      source={{
                        uri: item.poster_path 
                          ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                          : 'https://via.placeholder.com/300x450?text=No+Image'
                      }}
                      className='w-32 h-48 rounded-lg'
                      resizeMode='cover'
                    />
                    <Text className='text-white text-sm font-medium mt-2' numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.character && (
                      <Text className='text-light-200 text-xs' numberOfLines={1}>
                        as {item.character}
                      </Text>
                    )}
                    <Text className='text-light-300 text-xs'>
                      {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => `cast-${item.id}-${item.credit_id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>
          )}

          {/* Crew Credits */}
          {sortedCrewCredits.length > 0 && (
            <View className='mt-8'>
              <Text className='text-white text-lg font-bold mb-4'>
                Crew ({movieCredits?.crew?.length || 0})
              </Text>
              <FlatList
                data={sortedCrewCredits}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className='mr-4 w-32'
                    onPress={() => handleMoviePress(item.id)}
                  >
                    <Image
                      source={{
                        uri: item.poster_path 
                          ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                          : 'https://via.placeholder.com/300x450?text=No+Image'
                      }}
                      className='w-32 h-48 rounded-lg'
                      resizeMode='cover'
                    />
                    <Text className='text-white text-sm font-medium mt-2' numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.job && (
                      <Text className='text-light-200 text-xs' numberOfLines={1}>
                        {item.job}
                      </Text>
                    )}
                    <Text className='text-light-300 text-xs'>
                      {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => `crew-${item.id}-${item.credit_id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>
          )}

          {/* Photo Gallery */}
          {images?.profiles && images.profiles.length > 0 && (
            <View className='mt-8'>
              <Text className='text-white text-lg font-bold mb-4'>Photos</Text>
              <FlatList
                data={images.profiles.slice(0, 10)}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className='mr-4'
                    onPress={() => setSelectedImage(`https://image.tmdb.org/t/p/original${item.file_path}`)}
                  >
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w300${item.file_path}`
                      }}
                      className='w-24 h-32 rounded-lg'
                      resizeMode='cover'
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => `photo-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className='flex-1 bg-black/90 items-center justify-center'>
          <TouchableOpacity
            className='absolute top-12 right-5 z-10 bg-black/50 rounded-full p-2'
            onPress={() => setSelectedImage(null)}
          >
            <Text className='text-white text-xl font-bold'>×</Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className='w-full h-full'
              resizeMode='contain'
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

export default CastDetails