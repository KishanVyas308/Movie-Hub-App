import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
} from '@/services/storage';

// Import Movie interface from global types
declare global {
  interface Movie {
    id: number;
    title: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }
}

const { height, width } = Dimensions.get('window');

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  movieData?: Movie | null;
  onStatusChange?: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  movieData,
  onStatusChange
}) => {
  const [inFavorites, setInFavorites] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchedMovie, setIsWatchedMovie] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(460)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, [movieData]);

  useEffect(() => {
    if (visible) {
      // Reset animation to start position
      slideAnim.setValue(460);
      fadeAnim.setValue(0);
      
      // Start animations with a small delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 20,
            friction: 8,
            velocity: 50,
          })
        ]).start();
      }, 50);
    }
  }, [visible]);

  const loadUserData = async () => {
    if (!movieData) return;
    
    try {
      const [favoriteStatus, watchlistStatus, watchedStatus] = await Promise.all([
        isFavorite(movieData.id),
        isInWatchlist(movieData.id),
        isWatched(movieData.id)
      ]);
      
      setInFavorites(favoriteStatus);
      setInWatchlist(watchlistStatus);
      setIsWatchedMovie(watchedStatus);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 460,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const handleAddToFavorites = async () => {
    if (!movieData) return;

    try {
      const movieItem = {
        id: Date.now(),
        movieId: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path || '',
        vote_average: movieData.vote_average,
        release_date: movieData.release_date,
        addedAt: new Date().toISOString()
      };

      if (inFavorites) {
        await removeFromFavorites(movieData.id);
        setInFavorites(false);
      } else {
        await addToFavorites(movieItem);
        setInFavorites(true);
      }
      
      // Trigger refresh of movie cards
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleSaveMovie = async () => {
    if (!movieData) return;

    try {
      const movieItem = {
        id: Date.now(),
        movieId: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path || '',
        vote_average: movieData.vote_average,
        release_date: movieData.release_date,
        addedAt: new Date().toISOString()
      };

      if (inWatchlist) {
        await removeFromWatchlist(movieData.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(movieItem);
        setInWatchlist(true);
      }
      
      // Trigger refresh of movie cards
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!movieData) return;

    try {
      const movieItem = {
        id: Date.now(),
        movieId: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path || '',
        vote_average: movieData.vote_average,
        release_date: movieData.release_date,
        addedAt: new Date().toISOString()
      };

      if (isWatchedMovie) {
        await removeFromWatched(movieData.id);
        setIsWatchedMovie(false);
      } else {
        await markAsWatched(movieItem);
        setIsWatchedMovie(true);
      }
      
      // Trigger refresh of movie cards
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating watched status:', error);
    }
  };

  const handleShare = async () => {
    if (!movieData) return;

    try {
      const tmdbUrl = `https://www.themoviedb.org/movie/${movieData.id}`;
      const shareContent = {
        message: `Check out this movie: ${movieData.title}\n\nRating: ${movieData.vote_average}/10\nRelease Date: ${movieData.release_date}\n\n${movieData.overview}\n\nMore info: ${tmdbUrl}`,
        title: movieData.title,
        url: tmdbUrl
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const options = [
    {
      id: 'favorite',
      title: inFavorites ? 'Remove from Favorites' : 'Add to Favorites',
      icon: inFavorites ? 'heart' : 'heart-outline',
      iconLibrary: 'Ionicons' as const,
      color: inFavorites ? '#AB8BFF' : '#6B7280',
      isActive: inFavorites,
      onPress: handleAddToFavorites
    },
    {
      id: 'save',
      title: inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist',
      icon: inWatchlist ? 'bookmark' : 'bookmark-outline',
      iconLibrary: 'Ionicons' as const,
      color: inWatchlist ? '#AB8BFF' : '#6B7280',
      isActive: inWatchlist,
      onPress: handleSaveMovie
    },
    {
      id: 'watched',
      title: isWatchedMovie ? 'Mark as Unwatched' : 'Mark as Watched',
      icon: isWatchedMovie ? 'checkmark-circle' : 'checkmark-circle-outline',
      iconLibrary: 'Ionicons' as const,
      color: isWatchedMovie ? '#AB8BFF' : '#6B7280',
      isActive: isWatchedMovie,
      onPress: handleMarkAsWatched
    },
    {
      id: 'share',
      title: 'Share Movie',
      icon: 'share-outline',
      iconLibrary: 'Ionicons' as const,
      color: '#6B7280',
      isActive: false,
      onPress: handleShare
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouch}
          activeOpacity={1} 
          onPress={closeModal}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Movie Options</Text>
              {movieData && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {movieData.title}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={closeModal}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                style={[
                  styles.optionItem,
                  option.isActive && styles.optionItemActive
                ]}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: option.isActive ? 'rgba(171, 139, 255, 0.15)' : 'rgba(107, 114, 128, 0.1)' }
                ]}>
                  {option.iconLibrary === 'Ionicons' ? (
                    <Ionicons name={option.icon as any} size={22} color={option.color} />
                  ) : (
                    <MaterialIcons name={option.icon as any} size={22} color={option.color} />
                  )}
                </View>
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    option.isActive && styles.optionTitleActive
                  ]}>
                    {option.title}
                  </Text>
                  {option.isActive && (
                    <Text style={styles.optionStatus}>Active</Text>
                  )}
                </View>
                <View style={styles.optionArrow}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={option.isActive ? '#AB8BFF' : '#6B7280'} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e', // Using secondary color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 460,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171, 139, 255, 0.1)', // Using accent color with opacity
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 31, 61, 0.8)', // Using dark-100 color
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 31, 61, 0.3)', // Using dark-100 with opacity
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(171, 139, 255, 0.08)', // Using accent color with low opacity
    borderColor: 'rgba(171, 139, 255, 0.2)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionTitleActive: {
    color: '#AB8BFF', // Using accent color
  },
  optionStatus: {
    color: '#AB8BFF', // Using accent color
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.8,
  },
  optionArrow: {
    marginLeft: 8,
  },
});

export default OptionsModal;