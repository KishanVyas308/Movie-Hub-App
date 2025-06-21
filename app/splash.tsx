import {
  fetchMovies,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies
} from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const rotateValue = useRef(new Animated.Value(0)).current;
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    // Start clockwise rotation for 1 second
    const rotateAnimation = Animated.timing(rotateValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    rotateAnimation.start();

    // Preload data in the background
    const preloadData = async () => {
      try {
        const promises = [
          fetchMovies({ query: '' }),
          fetchTrendingMovies('week'),
          fetchTopRatedMovies(),
          fetchUpcomingMovies(),
          fetchNowPlayingMovies()
        ];

        await Promise.allSettled(promises);
        setPreloadComplete(true);
      } catch (error) {
        console.log('Preload error:', error);
        setPreloadComplete(true);
      }
    };

    preloadData();

    // Navigate to main app after 1 second AND preload is complete
    const timer = setTimeout(() => {

      router.replace('/(tabs)');

    }, 1000);

    return () => {
      clearTimeout(timer);
      rotateAnimation.stop();
    };
  }, [preloadComplete]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View className="flex-1 bg-dark-200 justify-center items-center">
      <Animated.View
        style={{
          transform: [{ rotate }],
        }}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            width: 120,
            height: 120,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}