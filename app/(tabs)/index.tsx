import EnhancedMovieCard from "@/components/EnhancedMovieCard";
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
}

const MovieSection = ({ title, movies, loading, onSeeAll }: MovieSectionProps) => {
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
        renderItem={({ item }) => (
          <View className="mr-4 w-32">
            <EnhancedMovieCard {...item} showActions={false} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        
        
      />
    </View>
  );
};

export default function Index() {
  const router = useRouter();

  const { data: popularMovies, loading: popularLoading, error: popularError } = 
    useFetch(() => fetchMovies({ query: '' }));
  
  const { data: trendingMovies, loading: trendingLoading } = 
    useFetch(() => fetchTrendingMovies('week'));
  
  const { data: topRatedMovies, loading: topRatedLoading } = 
    useFetch(() => fetchTopRatedMovies());
  
  const { data: upcomingMovies, loading: upcomingLoading } = 
    useFetch(() => fetchUpcomingMovies());
  
  const { data: nowPlayingMovies, loading: nowPlayingLoading } = 
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
              <View className='flex-row items-center justify-center mb-5'>
                      <Image source={icons.logo} className='w-12 h-10' />
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
                </TouchableOpacity>
              </View>
            )}

            {/* Movie Sections */}
            <MovieSection
              title="Trending This Week"
              movies={trendingMovies || []}
              loading={trendingLoading}
              onSeeAll={handleSeeAllTrending}
            />

            <MovieSection
              title="Now Playing"
              movies={nowPlayingMovies || []}
              loading={nowPlayingLoading}
              onSeeAll={handleSeeAllNowPlaying}
            />

            <MovieSection
              title="Top Rated"
              movies={topRatedMovies || []}
              loading={topRatedLoading}
              onSeeAll={handleSeeAllTopRated}
            />

            <MovieSection
              title="Coming Soon"
              movies={upcomingMovies || []}
              loading={upcomingLoading}
              onSeeAll={handleSeeAllUpcoming}
            />

            <MovieSection
              title="Popular Movies"
              movies={popularMovies || []}
              loading={popularLoading}
              onSeeAll={handleSeeAllPopular}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
