import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieReviews,
  fetchMovieVideos,
  fetchSimilarMovies,
  fetchMovieImages
} from '@/services/api'
import {
  addToFavorites,
  addToWatchlist,
  isFavorite,
  isInWatchlist,
  isWatched,
  markAsWatched,
  removeFromFavorites,
  removeFromWatchlist,
  removeFromWatched
} from '@/services/storage'
import useFetch from '@/services/useFetch'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState, memo } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  View
} from 'react-native'

// Import modular components
import MovieHero from '@/components/MovieDetailComponents/MovieHero'
import MovieInfo from '@/components/MovieDetailComponents/MovieInfo'
import MovieActions from '@/components/MovieDetailComponents/MovieActions'
import MovieOverview from '@/components/MovieDetailComponents/MovieOverview'
import VideosSection from '@/components/MovieDetailComponents/VideosSection'
import ImagesSection from '@/components/MovieDetailComponents/ImagesSection'
import CastSection from '@/components/MovieDetailComponents/CastSection'
import ReviewsSection from '@/components/MovieDetailComponents/ReviewsSection'
import BoxOfficeSection from '@/components/MovieDetailComponents/BoxOfficeSection'
import SimilarMoviesSection from '@/components/MovieDetailComponents/SimilarMoviesSection'
import ImageModal from '@/components/MovieDetailComponents/ImageModal'

const MovieDetails = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [inFavorites, setInFavorites] = useState(false)
  const [watched, setWatched] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Safely get movie ID
  const movieId = React.useMemo(() => {
    if (!id) return null
    return Array.isArray(id) ? id[0] : id
  }, [id])

  const isValidId = Boolean(movieId && movieId.toString().trim() !== '')

  // Fetch movie data
  const { data: movie, loading: movieLoading, error: movieError } = useFetch(
    () => isValidId ? fetchMovieDetails(movieId!) : Promise.resolve(null),
    isValidId
  )
  
  const { data: credits, loading: creditsLoading } = useFetch(
    () => isValidId ? fetchMovieCredits(movieId!) : Promise.resolve(null),
    isValidId
  )
  
  const { data: videos, loading: videosLoading } = useFetch(
    () => isValidId ? fetchMovieVideos(movieId!) : Promise.resolve(null),
    isValidId
  )
  
  const { data: images, loading: imagesLoading } = useFetch(
    () => isValidId ? fetchMovieImages(movieId!) : Promise.resolve(null),
    isValidId
  )
  
  const { data: similarMovies, loading: similarLoading } = useFetch(
    () => isValidId ? fetchSimilarMovies(movieId!) : Promise.resolve([]),
    isValidId
  )

  const { data: reviews, loading: reviewsLoading } = useFetch(
    () => isValidId ? fetchMovieReviews(movieId!) : Promise.resolve(null),
    isValidId
  )

  // Check movie status
  const checkMovieStatus = useCallback(async () => {
    if (!movie?.id) return
    
    try {
      const [watchlistStatus, favoriteStatus, watchedStatus] = await Promise.all([
        isInWatchlist(movie.id),
        isFavorite(movie.id),
        isWatched(movie.id)
      ])
      setInWatchlist(watchlistStatus)
      setInFavorites(favoriteStatus)
      setWatched(watchedStatus)
    } catch (error) {
      console.error('Error checking movie status:', error)
    }
  }, [movie?.id])

  useEffect(() => {
    if (movie?.id) {
      checkMovieStatus()
    }
  }, [movie?.id, checkMovieStatus])

  // Create movie data for storage
  const createMovieData = useCallback((): WatchlistItem | null => {
    if (!movie) return null
    
    return {
      id: Date.now(),
      movieId: Number(movie.id) || 0,
      title: movie.title || 'Unknown Title',
      poster_path: movie.poster_path || '',
      vote_average: movie.vote_average || 0,
      release_date: movie.release_date || 'Unknown Release Date',
      addedAt: new Date().toISOString()
    }
  }, [movie])

  // Action handlers with improved error handling and state management
  const handleWatchlistToggle = useCallback(async () => {
    if (actionLoading || !movie) return
    
    setActionLoading(true)
    const previousState = inWatchlist
    
    try {
      // Optimistic update
      setInWatchlist(!inWatchlist)
      
      if (inWatchlist) {
        await removeFromWatchlist(movie.id)
      } else {
        const movieData = createMovieData()
        if (movieData) {
          await addToWatchlist(movieData)
        } else {
          throw new Error('Failed to create movie data')
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setInWatchlist(previousState)
      console.error('Watchlist toggle error:', error)
      Alert.alert(
        'Error', 
        `Failed to ${inWatchlist ? 'remove from' : 'add to'} watchlist. Please try again.`
      )
    } finally {
      setActionLoading(false)
    }
  }, [actionLoading, movie, inWatchlist, createMovieData])

  const handleFavoriteToggle = useCallback(async () => {
    if (actionLoading || !movie) return
    
    setActionLoading(true)
    const previousState = inFavorites
    
    try {
      // Optimistic update
      setInFavorites(!inFavorites)
      
      if (inFavorites) {
        await removeFromFavorites(movie.id)
      } else {
        const movieData = createMovieData()
        if (movieData) {
          await addToFavorites(movieData)
        } else {
          throw new Error('Failed to create movie data')
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setInFavorites(previousState)
      console.error('Favorites toggle error:', error)
      Alert.alert(
        'Error', 
        `Failed to ${inFavorites ? 'remove from' : 'add to'} favorites. Please try again.`
      )
    } finally {
      setActionLoading(false)
    }
  }, [actionLoading, movie, inFavorites, createMovieData])

  const handleWatchedToggle = useCallback(async () => {
    if (actionLoading || !movie) return
    
    setActionLoading(true)
    const previousState = watched
    
    try {
      // Optimistic update
      setWatched(!watched)
      
      if (watched) {
        // Remove from watched
        await removeFromWatched(movie.id)
        Alert.alert(
          'Success', 
          'Movie removed from watched history!',
          [{ text: 'OK', style: 'default' }]
        )
      } else {
        // Mark as watched
        const movieData = createMovieData()
        if (movieData) {
          await markAsWatched(movieData)
          Alert.alert(
            'Success', 
            'Movie marked as watched!',
            [{ text: 'OK', style: 'default' }]
          )
        } else {
          throw new Error('Failed to create movie data')
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setWatched(previousState)
      console.error('Watched toggle error:', error)
      Alert.alert(
        'Error', 
        `Failed to ${watched ? 'remove from' : 'mark as'} watched. Please try again.`
      )
    } finally {
      setActionLoading(false)
    }
  }, [actionLoading, movie, watched, createMovieData])

  // Navigation handlers
  const handleVideoPress = useCallback((video: MovieVideo) => {
    if (video.site === 'YouTube') {
      Linking.openURL(`https://www.youtube.com/watch?v=${video.key}`)
    }
  }, [])

  const handleCastPress = useCallback((castId: number) => {
    router.push(`/cast/${castId}`)
  }, [router])

  const handleImagePress = useCallback((imagePath: string) => {
    setSelectedImage(`https://image.tmdb.org/t/p/original${imagePath}`)
  }, [])

  const handleGenrePress = useCallback((genreId: number, genreName: string) => {
    router.push(`/genres/${genreId}?name=${encodeURIComponent(genreName)}`)
  }, [router])

  const handleSimilarMoviePress = useCallback((movieId: number) => {
    router.push(`/movies/${movieId}`)
  }, [router])

  const handleViewAllCast = useCallback(() => {
    // Navigate to cast list page
    router.push(`/movies/${movieId}/cast`)
  }, [router, movieId])

  const handleViewAllReviews = useCallback(() => {
    // Navigate to reviews page
    router.push(`/movies/${movieId}/reviews`)
  }, [router, movieId])

  const handleViewAllSimilar = useCallback(() => {
    // Navigate to similar movies page
    router.push(`/movies/${movieId}/similar`)
  }, [router, movieId])

  // Validation checks
  if (!isValidId) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Invalid movie ID</Text>
        <Text className='text-light-200 text-sm mt-2'>Please select a valid movie</Text>
      </View>
    )
  }

  if (movieLoading) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className='text-white text-sm mt-2'>Loading movie details...</Text>
      </View>
    )
  }

  if (movieError || !movie) {
    return (
      <View className='flex-1 bg-primary items-center justify-center'>
        <Text className='text-white text-lg'>Failed to load movie</Text>
        <Text className='text-light-200 text-sm mt-2'>Please try again later</Text>
      </View>
    )
  }

  // Data processing
  const validVideos = videos?.results?.filter(item => item && item.id && item.key) || []
  const trailers = validVideos.filter(video => video.type === 'Trailer')
  const mainTrailer = trailers[0] || validVideos[0]

  const validCast = credits?.cast?.filter(item => item && item.id) || []
  const validSimilarMovies = Array.isArray(similarMovies) ? similarMovies : []
  const validImages = images || null
  const validReviews = reviews || null

  
  return (
    <View className='flex-1 bg-primary'>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <MovieHero
          movie={movie}
          mainTrailer={mainTrailer}
          onPlayTrailer={() => mainTrailer && handleVideoPress(mainTrailer)}
          onBack={() => router.back()}
        />

        {/* Main Content */}
        <View className='px-5 mt-8'>
          {/* Movie Information */}
          <MovieInfo
            movie={movie}
            onGenrePress={handleGenrePress}
          />

          {/* Action Buttons */}
          <MovieActions
            inWatchlist={inWatchlist}
            inFavorites={inFavorites}
            watched={watched}
            actionLoading={actionLoading}
            onWatchlistToggle={handleWatchlistToggle}
            onFavoriteToggle={handleFavoriteToggle}
            onWatchedToggle={handleWatchedToggle}
          />

          {/* Movie Overview */}
          <MovieOverview overview={movie.overview} />

          {/* Videos Section */}
          <VideosSection
            videos={validVideos}
            loading={videosLoading}
            onVideoPress={handleVideoPress}
          />

          {/* Images Section */}
          <ImagesSection
            images={validImages}
            loading={imagesLoading}
            onImagePress={handleImagePress}
          />

          {/* Cast Section */}
          <CastSection
            cast={validCast}
            loading={creditsLoading}
            onCastPress={handleCastPress}
            onViewAll={handleViewAllCast}
          />

          {/* Reviews Section */}
          <ReviewsSection
            reviews={validReviews}
            loading={reviewsLoading}
            onViewAll={handleViewAllReviews}
          />

          {/* Box Office Section */}
          <BoxOfficeSection movie={movie} />

          {/* Similar Movies Section */}
          <SimilarMoviesSection
            movies={validSimilarMovies}
            loading={similarLoading}
            onMoviePress={handleSimilarMoviePress}
            onViewAll={handleViewAllSimilar}
          />
        </View>
      </ScrollView>

      {/* Image Modal */}
      <ImageModal
        visible={selectedImage !== null}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  )
}

export default memo(MovieDetails)