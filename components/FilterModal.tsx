import { fetchGenres } from '@/services/api';
import useFetch from '@/services/useFetch';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import GenreChip from './GenreChip';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: MovieFilters) => void;
  initialFilters?: MovieFilters;
}

const FilterModal = ({ visible, onClose, onApplyFilters, initialFilters }: FilterModalProps) => {
  const [filters, setFilters] = useState<MovieFilters>(initialFilters || {});
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initialFilters?.genres || []);
  const [year, setYear] = useState(initialFilters?.year?.toString() || '');
  const [minRating, setMinRating] = useState(initialFilters?.minRating?.toString() || '');
  const [maxRating, setMaxRating] = useState(initialFilters?.maxRating?.toString() || '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'popularity.desc');

  const { data: genres, loading: genresLoading } = useFetch(() => fetchGenres());

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'A-Z' },
    { value: 'title.desc', label: 'Z-A' },
  ];

  const handleApplyFilters = () => {
    const newFilters: MovieFilters = {
      ...filters,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      year: year ? parseInt(year) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      sortBy,
    };

    // Validate year
    if (year && (parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 5)) {
      Alert.alert('Invalid Year', 'Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 5));
      return;
    }

    // Validate ratings
    if (minRating && (parseFloat(minRating) < 0 || parseFloat(minRating) > 10)) {
      Alert.alert('Invalid Rating', 'Minimum rating must be between 0 and 10');
      return;
    }

    if (maxRating && (parseFloat(maxRating) < 0 || parseFloat(maxRating) > 10)) {
      Alert.alert('Invalid Rating', 'Maximum rating must be between 0 and 10');
      return;
    }

    if (minRating && maxRating && parseFloat(minRating) > parseFloat(maxRating)) {
      Alert.alert('Invalid Range', 'Minimum rating cannot be greater than maximum rating');
      return;
    }

    onApplyFilters(newFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setYear('');
    setMinRating('');
    setMaxRating('');
    setSortBy('popularity.desc');
    onApplyFilters({});
    onClose();
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      
    >
      <View className='flex-1 bg-primary'>
        <View className='flex-row justify-between items-center p-5 border-b border-dark-100'>
          <TouchableOpacity onPress={onClose}>
            <Text className='text-accent text-lg font-medium'>Cancel</Text>
          </TouchableOpacity>
          <Text className='text-white text-xl font-bold'>Filters</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text className='text-accent text-lg font-medium'>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className='flex-1 p-5'>
          {/* Sort By */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Sort By</Text>
            <View className='flex-row flex-wrap'>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    sortBy === option.value 
                      ? 'bg-accent' 
                      : 'bg-dark-100 border border-light-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    sortBy === option.value ? 'text-white' : 'text-light-100'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Genres */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Genres (Multiple Selection)</Text>
            {genresLoading ? (
              <Text className='text-light-200'>Loading genres...</Text>
            ) : (
              <View className='flex-row flex-wrap'>
                {genres?.map((genre) => (
                  <GenreChip
                    key={genre.id}
                    genre={genre}
                    selected={selectedGenres.includes(genre.id)}
                    onPress={() => handleGenreToggle(genre.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Year */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Release Year</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="e.g., 2023"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className='bg-dark-100 text-white p-4 rounded-lg'
            />
          </View>

          {/* Rating Range */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Rating Range</Text>
            <View className='flex-row space-x-4'>
              <View className='flex-1'>
                <Text className='text-light-200 mb-2'>Minimum Rating</Text>
                <TextInput
                  value={minRating}
                  onChangeText={setMinRating}
                  placeholder="0.0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className='bg-dark-100 text-white p-4 rounded-lg'
                />
              </View>
              <View className='flex-1'>
                <Text className='text-light-200 mb-2'>Maximum Rating</Text>
                <TextInput
                  value={maxRating}
                  onChangeText={setMaxRating}
                  placeholder="10.0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className='bg-dark-100 text-white p-4 rounded-lg'
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View className='p-5 border-t border-dark-100'>
          <TouchableOpacity
            onPress={handleApplyFilters}
            className='bg-accent py-4 rounded-lg items-center'
          >
            <Text className='text-white text-lg font-bold'>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;