import EnhancedMovieCard from "@/components/EnhancedMovieCard";
import OptionsModal from "@/components/OptionsModal";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  fetchMovies,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies
} from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import '../global.css';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  loading: boolean;
  onSeeAll?: () => void;
  onOptionsPress?: (movie: Movie) => void;
  refreshTrigger?: number;
  updatedMovieIds?: Set<number>;
}

const MovieSection = ({ title, movies, loading, onSeeAll, onOptionsPress, refreshTrigger, updatedMovieIds }: MovieSectionProps) => {
  if (loading) {
    return (
      <View className="mt-6">
        <Text className="text-lg text-white font-bold mb-3">{title}</Text>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (!movies || movies.length === 0) return null;

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg text-white font-bold">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text className="text-accent font-medium">See All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={movies.slice(0, 6)}
        renderItem={({ item }) => {
          const isUpdated = updatedMovieIds?.has(item.id) || false;
          return (
            <View className={`mr-4 w-32 ${isUpdated ? 'opacity-80' : ''}`}>
              <EnhancedMovieCard 
                {...item} 
                showActions={false} 
                onOptionsPress={onOptionsPress} 
                refreshTrigger={refreshTrigger}
              />
            </View>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        extraData={refreshTrigger} // Force re-render when refreshTrigger changes
      />
    </View>
  );
};

export default function Index() {
  const router = useRouter();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [updatedMovieIds, setUpdatedMovieIds] = useState<Set<number>>(new Set());

  const { data: popularMovies, loading: popularLoading, error: popularError, refetch: refetchPopular } = 
    useFetch(() => fetchMovies({ query: '' }));
  
  const { data: trendingMovies, loading: trendingLoading, refetch: refetchTrending } = 
    useFetch(() => fetchTrendingMovies('week'));
  
  const { data: topRatedMovies, loading: topRatedLoading, refetch: refetchTopRated } = 
    useFetch(() => fetchTopRatedMovies());
  
  const { data: upcomingMovies, loading: upcomingLoading, refetch: refetchUpcoming } = 
    useFetch(() => fetchUpcomingMovies());
  
  const { data: nowPlayingMovies, loading: nowPlayingLoading, refetch: refetchNowPlaying } = 
    useFetch(() => fetchNowPlayingMovies());

  const handleSeeAllPopular = () => {
    router.push('/movies/category/popular');
  };

  const handleSeeAllTrending = () => {
    router.push('/movies/category/trending');
  };

  const handleSeeAllTopRated = () => {
    router.push('/movies/category/top-rated');
  };

  const handleSeeAllUpcoming = () => {
    router.push('/movies/category/upcoming');
  };

  const handleSeeAllNowPlaying = () => {
    router.push('/movies/category/now-playing');
  };

  const handleOptionsPress = (movie: Movie | null = null) => {
    setSelectedMovie(movie);
    setShowOptionsModal(true);
  };

  const handleCloseOptions = () => {
    setShowOptionsModal(false);
    setSelectedMovie(null);
  };

  const handleStatusChange = (movieId?: number) => {
    // Only proceed if movieId is provided
    if (!movieId) return;
    
    // Provide visual feedback only - no section reloading
    setRefreshTrigger(prev => prev + 1);
    setUpdatedMovieIds(prev => new Set([...prev, movieId]));
    
    // Clear visual feedback after 800ms
    setTimeout(() => {
      setUpdatedMovieIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }, 800);
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100
        }}
      >
        
        {popularLoading && !popularMovies ? (
          <ActivityIndicator
            size="large"
            color='#0000ff'
            className="mt-10 self-center"
          />
        ) : popularError ? (
          <View className="mt-10">
            <Text className="text-red-500 text-center">
              Error: {popularError?.message}
            </Text>
          </View>
        ) : (
          <View className="flex-1 mt-20">
            {/* Header with Logo and Options Menu */}
            <View className='flex-row items-center justify-between mb-5 px-2'>
             
              <View className='flex-row items-center justify-center flex-1'>
                <Image source={icons.logo} className='w-12 h-10' />
              </View>
             
            </View>
            
            <SearchBar
              onPress={() => router.push('/search')}
              placeholder="Search Movies"
            />

            {/* Hero Section - Featured Movie */}
            {popularMovies && popularMovies.length > 0 && (
              <View className="mt-6">
                <Text className="text-xl text-white font-bold mb-3">Featured</Text>
                <TouchableOpacity 
                  onPress={() => router.push(`/movies/${popularMovies[0].id}`)}
                  className="relative rounded-lg overflow-hidden"
                >
                  <Image
                    source={{
                      uri: popularMovies[0].backdrop_path
                        ? `https://image.tmdb.org/t/p/w780${popularMovies[0].backdrop_path}`
                        : `https://image.tmdb.org/t/p/w500${popularMovies[0].poster_path}`
                    }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/40 justify-end p-4">
                    <View className="flex-row justify-between items-end">
                      <View className="flex-1">
                        <Text className="text-white font-bold text-xl mb-2">
                          {popularMovies[0].title}
                        </Text>
                        <View className="flex-row items-center">
                          <Image source={icons.star} className="w-4 h-4 mr-1" />
                          <Text className="text-white font-bold mr-3">
                            {popularMovies[0].vote_average.toFixed(1)}
                          </Text>
                          <Text className="text-light-200">
                            {new Date(popularMovies[0].release_date).getFullYear()}
                          </Text>
                        </View>
                      </View>
                     
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Movie Sections */}
            <MovieSection
              title="Trending This Week"
              movies={trendingMovies || []}
              loading={trendingLoading}
              onSeeAll={handleSeeAllTrending}
              onOptionsPress={handleOptionsPress}
              refreshTrigger={refreshTrigger}
              updatedMovieIds={updatedMovieIds}
            />

            <MovieSection
              title="Now Playing"
              movies={nowPlayingMovies || []}
              loading={nowPlayingLoading}
              onSeeAll={handleSeeAllNowPlaying}
              onOptionsPress={handleOptionsPress}
              refreshTrigger={refreshTrigger}
              updatedMovieIds={updatedMovieIds}
            />

            <MovieSection
              title="Top Rated"
              movies={topRatedMovies || []}
              loading={topRatedLoading}
              onSeeAll={handleSeeAllTopRated}
              onOptionsPress={handleOptionsPress}
              refreshTrigger={refreshTrigger}
              updatedMovieIds={updatedMovieIds}
            />

            <MovieSection
              title="Coming Soon"
              movies={upcomingMovies || []}
              loading={upcomingLoading}
              onSeeAll={handleSeeAllUpcoming}
              onOptionsPress={handleOptionsPress}
              refreshTrigger={refreshTrigger}
              updatedMovieIds={updatedMovieIds}
            />

            <MovieSection
              title="Popular Movies"
              movies={popularMovies || []}
              loading={popularLoading}
              onSeeAll={handleSeeAllPopular}
              onOptionsPress={handleOptionsPress}
              refreshTrigger={refreshTrigger}
              updatedMovieIds={updatedMovieIds}
            />
          </View>
        )}
      </ScrollView>

      {/* Options Modal */}
      <OptionsModal
        visible={showOptionsModal}
        onClose={handleCloseOptions}
        movieData={selectedMovie}
        onStatusChange={handleStatusChange}
      />
    </View>
  );
}
