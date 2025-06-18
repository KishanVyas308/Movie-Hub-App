import React, { useState } from 'react'
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native'
import { useRouter } from 'expo-router'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchGenres } from '@/services/api'
import useFetch from '@/services/useFetch'
import GenreChip from '@/components/GenreChip'

const GenresPage = () => {
  const router = useRouter()
  const { data: genres, loading: genresLoading, error: genresError } = useFetch(() => fetchGenres())

  const handleGenrePress = (genre: Genre) => {
    router.push(`/genres/${genre.id}?name=${encodeURIComponent(genre.name)}`)
  }

  const renderGenreItem = ({ item }: { item: Genre }) => (
    <TouchableOpacity
      onPress={() => handleGenrePress(item)}
      className='bg-dark-100 p-4 rounded-lg m-2 flex-1 min-w-[45%] items-center'
    >
      <Text className='text-white font-bold text-lg text-center'>
        {item.name}
      </Text>
      <Text className='text-light-200 text-sm mt-1'>
        Explore {item.name.toLowerCase()} movies
      </Text>
    </TouchableOpacity>
  )

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />
      
      {/* Header */}
      <View className='pt-20 pb-5 px-5'>
        <View className='flex-row items-center justify-center mb-5'>
          <Image source={icons.logo} className='w-12 h-10' />
        </View>
        <Text className='text-white text-2xl font-bold text-center'>
          Browse by Genre
        </Text>
        <Text className='text-light-200 text-center mt-2'>
          Discover movies by your favorite genres
        </Text>
      </View>

      {/* Content */}
      <View className='flex-1 px-5'>
        {genresLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className='text-light-200 mt-3'>Loading genres...</Text>
          </View>
        ) : genresError ? (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-red-500 text-center'>
              Error loading genres: {genresError.message}
            </Text>
          </View>
        ) : (
          <FlatList
            data={genres}
            renderItem={renderGenreItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{
              paddingBottom: 100
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

export default GenresPage