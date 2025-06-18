import { icons } from '@/constants/icons'
import React from 'react'
import { Image, Text, View } from 'react-native'

interface MovieStatsProps {
  movie: MovieDetails
}

const MovieStats = ({ movie }: MovieStatsProps) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const getAge = (releaseDate: string) => {
    const release = new Date(releaseDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - release.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffYears = Math.floor(diffDays / 365)
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }
  }

  const getPopularityLevel = (popularity: number) => {
    if (popularity >= 100) return { level: 'Extremely Popular', color: 'text-red-500' }
    if (popularity >= 50) return { level: 'Very Popular', color: 'text-orange-500' }
    if (popularity >= 20) return { level: 'Popular', color: 'text-yellow-500' }
    if (popularity >= 10) return { level: 'Moderately Popular', color: 'text-green-500' }
    return { level: 'Less Popular', color: 'text-blue-500' }
  }

  const popularityInfo = getPopularityLevel(movie.popularity)

  return (
    <View className='mt-6 bg-dark-100 rounded-lg p-4'>
      <Text className='text-white font-bold text-lg mb-4'>Movie Statistics</Text>
      
      <View className='space-y-3'>
        {/* Popularity */}
        <View className='flex-row justify-between items-center'>
          <Text className='text-light-200 text-sm'>Popularity</Text>
          <View className='flex-row items-center'>
            <Text className={`text-sm font-medium ${popularityInfo.color}`}>
              {popularityInfo.level}
            </Text>
            <Text className='text-light-300 text-xs ml-2'>
              ({movie.popularity.toFixed(1)})
            </Text>
          </View>
        </View>

        {/* Release Info */}
        {movie.release_date && (
          <View className='flex-row justify-between items-center'>
            <Text className='text-light-200 text-sm'>Released</Text>
            <Text className='text-light-100 text-sm'>
              {getAge(movie.release_date)}
            </Text>
          </View>
        )}

        {/* Budget vs Revenue */}
        {(movie.budget > 0 || movie.revenue > 0) && (
          <>
            {movie.budget > 0 && (
              <View className='flex-row justify-between items-center'>
                <Text className='text-light-200 text-sm'>Budget</Text>
                <Text className='text-light-100 text-sm'>
                  {formatCurrency(movie.budget)}
                </Text>
              </View>
            )}
            
            {movie.revenue > 0 && (
              <View className='flex-row justify-between items-center'>
                <Text className='text-light-200 text-sm'>Box Office</Text>
                <Text className='text-light-100 text-sm'>
                  {formatCurrency(movie.revenue)}
                </Text>
              </View>
            )}

            {movie.budget > 0 && movie.revenue > 0 && (
              <View className='flex-row justify-between items-center'>
                <Text className='text-light-200 text-sm'>Profit</Text>
                <Text className={`text-sm font-medium ${
                  movie.revenue > movie.budget ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatCurrency(movie.revenue - movie.budget)}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Rating Distribution */}
        <View className='flex-row justify-between items-center'>
          <Text className='text-light-200 text-sm'>Rating</Text>
          <View className='flex-row items-center'>
            <View className='flex-row'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  source={icons.star}
                  className='w-3 h-3 mx-0.5'
                  tintColor={star <= Math.round(movie.vote_average / 2) ? '#FFD700' : '#666'}
                />
              ))}
            </View>
            <Text className='text-light-100 text-sm ml-2'>
              {movie.vote_average.toFixed(1)}/10
            </Text>
          </View>
        </View>

        {/* Vote Count */}
        <View className='flex-row justify-between items-center'>
          <Text className='text-light-200 text-sm'>Total Votes</Text>
          <Text className='text-light-100 text-sm'>
            {movie.vote_count.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default MovieStats