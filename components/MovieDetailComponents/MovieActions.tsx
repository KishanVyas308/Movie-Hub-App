import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface MovieActionsProps {
  inWatchlist: boolean;
  inFavorites: boolean;
  watched: boolean;
  actionLoading: boolean;
  onWatchlistToggle: () => void;
  onFavoriteToggle: () => void;
  onWatchedToggle: () => void;
}

const MovieActions = ({
  inWatchlist,
  inFavorites,
  watched,
  actionLoading,
  onWatchlistToggle,
  onFavoriteToggle,
  onWatchedToggle
}: MovieActionsProps) => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handlePress = (buttonType: string, action: () => void) => {
    if (actionLoading) return;
    setPressedButton(buttonType);
    setTimeout(() => setPressedButton(null), 150);
    action();
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

  
    </View>
  );
};

export default MovieActions;