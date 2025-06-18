import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WATCHLIST: 'movie_hub_watchlist',
  FAVORITES: 'movie_hub_favorites',
  WATCHED: 'movie_hub_watched',
  USER_RATINGS: 'movie_hub_user_ratings',
};

// Watchlist Management
export const addToWatchlist = async (movie: WatchlistItem): Promise<void> => {
  try {
    const existingWatchlist = await getWatchlist();
    const isAlreadyInWatchlist = existingWatchlist.some(item => item.movieId === movie.movieId);
    
    if (!isAlreadyInWatchlist) {
      const updatedWatchlist = [...existingWatchlist, { ...movie, addedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updatedWatchlist));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (movieId: number): Promise<void> => {
  try {
    const existingWatchlist = await getWatchlist();
    const updatedWatchlist = existingWatchlist.filter(item => item.movieId !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updatedWatchlist));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  try {
    const watchlistData = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return watchlistData ? JSON.parse(watchlistData) : [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};

export const isInWatchlist = async (movieId: number): Promise<boolean> => {
  try {
    const watchlist = await getWatchlist();
    return watchlist.some(item => item.movieId === movieId);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

// Favorites Management
export const addToFavorites = async (movie: WatchlistItem): Promise<void> => {
  try {
    const existingFavorites = await getFavorites();
    const isAlreadyFavorite = existingFavorites.some(item => item.movieId === movie.movieId);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...existingFavorites, { ...movie, addedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (movieId: number): Promise<void> => {
  try {
    const existingFavorites = await getFavorites();
    const updatedFavorites = existingFavorites.filter(item => item.movieId !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<WatchlistItem[]> => {
  try {
    const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favoritesData ? JSON.parse(favoritesData) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some(item => item.movieId === movieId);
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
};

// Watched Movies Management
export const markAsWatched = async (movie: WatchlistItem): Promise<void> => {
  try {
    const existingWatched = await getWatchedMovies();
    const isAlreadyWatched = existingWatched.some(item => item.movieId === movie.movieId);
    
    if (!isAlreadyWatched) {
      const updatedWatched = [...existingWatched, { ...movie, addedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHED, JSON.stringify(updatedWatched));
    }
  } catch (error) {
    console.error('Error marking as watched:', error);
    throw error;
  }
};

export const removeFromWatched = async (movieId: number): Promise<void> => {
  try {
    const existingWatched = await getWatchedMovies();
    const updatedWatched = existingWatched.filter(item => item.movieId !== movieId);
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHED, JSON.stringify(updatedWatched));
  } catch (error) {
    console.error('Error removing from watched:', error);
    throw error;
  }
};

export const getWatchedMovies = async (): Promise<WatchlistItem[]> => {
  try {
    const watchedData = await AsyncStorage.getItem(STORAGE_KEYS.WATCHED);
    return watchedData ? JSON.parse(watchedData) : [];
  } catch (error) {
    console.error('Error getting watched movies:', error);
    return [];
  }
};

export const isWatched = async (movieId: number): Promise<boolean> => {
  try {
    const watched = await getWatchedMovies();
    return watched.some(item => item.movieId === movieId);
  } catch (error) {
    console.error('Error checking watched status:', error);
    return false;
  }
};

// User Ratings Management
export const setUserRating = async (movieId: number, rating: number): Promise<void> => {
  try {
    const existingRatings = await getUserRatings();
    const updatedRatings = { ...existingRatings, [movieId]: rating };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_RATINGS, JSON.stringify(updatedRatings));
  } catch (error) {
    console.error('Error setting user rating:', error);
    throw error;
  }
};

export const getUserRating = async (movieId: number): Promise<number | null> => {
  try {
    const ratings = await getUserRatings();
    return ratings[movieId] || null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
};

export const getUserRatings = async (): Promise<{ [movieId: number]: number }> => {
  try {
    const ratingsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_RATINGS);
    return ratingsData ? JSON.parse(ratingsData) : {};
  } catch (error) {
    console.error('Error getting user ratings:', error);
    return {};
  }
};

// User Statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const [watchlist, favorites, watched, ratings] = await Promise.all([
      getWatchlist(),
      getFavorites(),
      getWatchedMovies(),
      getUserRatings(),
    ]);

    const ratingValues = Object.values(ratings);
    const averageRating = ratingValues.length > 0 
      ? ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length 
      : 0;

    // This is a simplified version - in a real app, you'd track genres more accurately
    const favoriteGenres = [
      { name: 'Action', count: Math.floor(Math.random() * 10) },
      { name: 'Drama', count: Math.floor(Math.random() * 8) },
      { name: 'Comedy', count: Math.floor(Math.random() * 6) },
    ];

    return {
      totalWatched: watched.length,
      totalWatchlist: watchlist.length,
      favoriteGenres,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalWatched: 0,
      totalWatchlist: 0,
      favoriteGenres: [],
      averageRating: 0,
    };
  }
};

// Clear all data (for testing or reset purposes)
export const clearAllData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.WATCHLIST),
      AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
      AsyncStorage.removeItem(STORAGE_KEYS.WATCHED),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_RATINGS),
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};