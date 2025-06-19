import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';

interface MovieActionsProps {
  inWatchlist: boolean;
  inFavorites: boolean;
  watched: boolean;
  actionLoading: boolean;
  onWatchlistToggle: () => void;
  onFavoriteToggle: () => void;
  onWatchedToggle: () => void;
  movieId?: number;
  movieTitle?: string;
}

interface StreamingPlatform {
  name: string;
  icon: string;
  color: string;
  url: string;
}

const MovieActions = ({
  inWatchlist,
  inFavorites,
  watched,
  actionLoading,
  onWatchlistToggle,
  onFavoriteToggle,
  onWatchedToggle,
  movieTitle = "this movie"
}: MovieActionsProps) => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handlePress = (buttonType: string, action: () => void) => {
    if (actionLoading) return;
    setPressedButton(buttonType);
    setTimeout(() => setPressedButton(null), 150);
    action();
  };

  // Popular streaming platforms
  const streamingPlatforms: StreamingPlatform[] = [
    {
      name: "Netflix",
      icon: "play-circle",
      color: "#E50914",
      url: "https://www.netflix.com/search?q="
    },
    {
      name: "Disney+",
      icon: "play-circle",
      color: "#113CCF",
      url: "https://www.disneyplus.com/search?q="
    },
    {
      name: "Prime Video",
      icon: "play-circle",
      color: "#00A8E1",
      url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase="
    },
    {
      name: "Hotstar",
      icon: "play-circle",
      color: "#1F80E0",
      url: "https://www.hotstar.com/in/search?q="
    },
    {
      name: "Hulu",
      icon: "play-circle",
      color: "#1CE783",
      url: "https://www.hulu.com/search?q="
    },
    {
      name: "HBO Max",
      icon: "play-circle",
      color: "#8B5CF6",
      url: "https://www.hbomax.com/search?q="
    }
  ];

  const handleStreamingPress = async (platform: StreamingPlatform) => {
    try {
      const searchUrl = `${platform.url}${encodeURIComponent(movieTitle)}`;
      const supported = await Linking.canOpenURL(searchUrl);
      
      if (supported) {
        await Linking.openURL(searchUrl);
      } else {
        Alert.alert(
          'Unable to Open',
          `Cannot open ${platform.name}. Please make sure the app is installed.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to open ${platform.name}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

 

  return (
    <View className='mb-8'>
      {/* Main Actions */}
      <View className='flex-row gap-3 mb-4'>
        {/* Watchlist Button */}
        <TouchableOpacity
          onPress={() => handlePress('watchlist', onWatchlistToggle)}
          disabled={actionLoading}
          className={`flex-1 py-4 px-4 rounded-xl items-center justify-center border-2 ${
            inWatchlist 
              ? 'bg-accent border-accent' 
              : 'bg-dark-100 border-dark-100'
          } ${
            pressedButton === 'watchlist' ? 'opacity-70' : ''
          }`}
        >
          <View className='flex-row items-center h-5'>
            {actionLoading && pressedButton === 'watchlist' ? (
              <ActivityIndicator size="small" color="white" className='absolute' />
            ) : (
              <>
                <Ionicons 
                  name={inWatchlist ? "bookmark" : "bookmark-outline"} 
                  size={16} 
                  color={inWatchlist ? "white" : "#9CA3AF"} 
                  style={{ marginRight: 4 }} 
                />
                <Text className={`font-semibold ${
                  inWatchlist ? 'text-white' : 'text-light-300'
                }`}>
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Secondary Actions */}
      <View className='flex-row gap-3'>
        {/* Favorites Button */}
        <TouchableOpacity
          onPress={() => handlePress('favorites', onFavoriteToggle)}
          disabled={actionLoading}
          className={`flex-1 py-3 px-4 rounded-lg items-center justify-center border border-solid ${
            inFavorites 
              ? 'bg-red-500 ' 
              : 'bg-dark-100 '
          } ${
            pressedButton === 'favorites' ? 'opacity-70' : ''
          }`}
        >
          <View className='flex-row items-center'>
            {actionLoading && pressedButton === 'favorites' ? (
              <ActivityIndicator size="small" color="white" className='absolute' />
            ) : (
                <>
                <Ionicons 
                  name={inFavorites ? "heart" : "heart-outline"} 
                  size={18} 
                  color={inFavorites ? "white" : "#9CA3AF"} 
                  style={{ marginRight: 4 }} 
                />
                <Text className={`font-medium text-sm ${
                  inFavorites ? 'text-white' : 'text-light-300'
                }`}>
                  {inFavorites ? 'Favorited' : 'Favorite'}
                </Text>
                </>
            )}
          </View>
        </TouchableOpacity>

        {/* Watched Button */}
        <TouchableOpacity
          onPress={() => handlePress('watched', onWatchedToggle)}
          disabled={actionLoading}
          className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${
            watched 
              ? 'bg-green-600' 
              : 'bg-dark-100'
          } ${
            pressedButton === 'watched' ? 'opacity-70' : ''
          }`}
        >
          <View className='flex-row items-center'>
            {actionLoading && pressedButton === 'watched' ? (
              <ActivityIndicator size="small" color="white" className='absolute'  />
            ) : (
              <>
                <Ionicons 
                  name={watched ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={18} 
                  color={watched ? "white" : "#9CA3AF"} 
                  style={{ marginRight: 4 }} 
                />
                <Text className={`font-medium text-sm ${
                  watched ? 'text-white' : 'text-light-300'
                }`}>
                  {watched ? 'Watched' : 'Mark Watched'}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Where to Watch Section */}
      <View className='mt-6'>
        <Text className='text-white text-lg font-bold mb-3'>Where to Watch</Text>
        <View className='flex-row flex-wrap justify-center gap-3'>
          {streamingPlatforms.map((platform, index) => (
            <TouchableOpacity
              key={platform.name}
              onPress={() => handleStreamingPress(platform)}
              className='flex-row items-center justify-center w-[48%] bg-dark-100 px-4 py-3 rounded-lg border border-dark-200 transition-all duration-200 '
            
            >
              <Ionicons 
                name={platform.icon as any}
                size={20} 
                color={platform.color}
                style={{ marginRight: 8 }}
              />
              <Text className='text-white font-medium text-sm flex-1'>
                {platform.name}
              </Text>
              <Ionicons 
                name="open-outline" 
                size={16} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Watch Note */}
        <View className='mt-4 p-3 bg-dark-100/50 rounded-lg border border-dark-200'>
          <View className='flex-row items-center mb-1'>
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
            <Text className='text-light-300 text-xs font-medium'>Note</Text>
          </View>
          <Text className='text-light-300 text-xs leading-4'>
            Availability may vary by region. Tapping will search for "{movieTitle}" on the respective platform.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MovieActions;