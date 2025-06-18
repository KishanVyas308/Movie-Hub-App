import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

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

  const ActionButton = ({ 
    type, 
    isActive, 
    icon, 
    activeIcon, 
    title, 
    subtitle, 
    onPress, 
    activeColor = '#FF6B35',
    inactiveColor = '#6B7280'
  }: {
    type: string;
    isActive: boolean;
    icon: any;
    activeIcon?: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    activeColor?: string;
    inactiveColor?: string;
  }) => (
    <TouchableOpacity
      onPress={() => handlePress(type, onPress)}
      disabled={actionLoading}
      className={`flex-1 p-4 rounded-xl border-2 ${
        isActive 
          ? 'bg-white/5 border-white/20' 
          : 'bg-transparent border-white/10'
      }`}
      style={{
        transform: [{ scale: pressedButton === type ? 0.95 : 1 }],
        shadowColor: isActive ? activeColor : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isActive ? 0.2 : 0.1,
        shadowRadius: 4,
        elevation: isActive ? 4 : 2,
      }}
    >
      <View className='items-center'>
        {actionLoading && pressedButton === type ? (
          <View className='w-8 h-8 items-center justify-center mb-2'>
            <ActivityIndicator size="small" color={isActive ? activeColor : inactiveColor} />
          </View>
        ) : (
          <View 
            className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${
              isActive ? 'bg-white/20' : 'bg-white/5'
            }`}
          >
            <Image 
              source={isActive && activeIcon ? activeIcon : icon} 
              className='w-5 h-5' 
              tintColor={isActive ? activeColor : inactiveColor} 
            />
          </View>
        )}
        
        <Text className={`font-semibold text-sm text-center mb-1 ${
          isActive ? 'text-white' : 'text-light-200'
        }`}>
          {title}
        </Text>
        
        <Text className={`text-xs text-center ${
          isActive ? 'text-white/70' : 'text-light-200/70'
        }`}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className='mb-8'>
      {/* Main Actions */}
      <View className='flex-row gap-3 mb-4'>
        <ActionButton
          type="watchlist"
          isActive={inWatchlist}
          icon={{ uri: 'https://example.com/icons/bookmark.png' }}
          title={inWatchlist ? 'In Watchlist' : 'Watchlist'}
          subtitle={inWatchlist ? 'Remove' : 'Add to list'}
          onPress={onWatchlistToggle}
          activeColor="#FF6B35"
        />
        
        <ActionButton
          type="favorites"
          isActive={inFavorites}
          icon={{ uri: 'https://example.com/icons/heart.png' }}
          title={inFavorites ? 'Favorited' : 'Favorite'}
          subtitle={inFavorites ? 'Remove' : 'Add to favorites'}
          onPress={onFavoriteToggle}
          activeColor="#EF4444"
        />
        
        <ActionButton
          type="watched"
          isActive={watched}
          icon={{ uri: 'https://example.com/icons/check.png' }}
          title={watched ? 'Watched' : 'Watch'}
          subtitle={watched ? 'Unmark' : 'Mark as watched'}
          onPress={onWatchedToggle}
          activeColor="#10B981"
        />
      </View>

      {/* Status Indicator */}
      <View className='bg-white/5 rounded-xl p-4 border border-white/10'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-white font-medium text-sm'>Movie Status</Text>
          <View className='flex-row items-center gap-4'>
            {/* Watchlist Status */}
            <View className='flex-row items-center'>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                inWatchlist ? 'bg-orange-500' : 'bg-gray-500'
              }`} />
              <Text className='text-light-200 text-xs'>Watchlist</Text>
            </View>
            
            {/* Favorites Status */}
            <View className='flex-row items-center'>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                inFavorites ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <Text className='text-light-200 text-xs'>Favorite</Text>
            </View>
            
            {/* Watched Status */}
            <View className='flex-row items-center'>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                watched ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <Text className='text-light-200 text-xs'>Watched</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MovieActions;