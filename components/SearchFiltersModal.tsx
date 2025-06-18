import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import { fetchGenres } from '@/services/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

export interface SearchFilters {
  selectedGenre: number | null;
  selectedYear: number | null;
  selectedRating: number | null;
  selectedSort: string;
  selectedDecade: string | null;
  selectedLanguage: string | null;
}

interface SearchFiltersModalProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  visible: boolean;
  onClose: () => void;
}

const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  filters,
  onFiltersChange,
  visible,
  onClose
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [modalVisible, setModalVisible] = useState(visible);
  
  // Animation values - use useRef to prevent recreation
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Reset animation values
      slideAnim.setValue(height);
      backdropAnim.setValue(0);
      
      // Start animations with a small delay to ensure modal is rendered
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            tension: 65,
            friction: 8,
          })
        ]).start();
      }, 50);
    } else if (modalVisible) {
      // Close animations
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: false,
        })
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, modalVisible, slideAnim, backdropAnim]);

  const loadGenres = async () => {
    try {
      const genreList = await fetchGenres();
      setGenres(genreList);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = {
      selectedGenre: null,
      selectedYear: null,
      selectedRating: null,
      selectedSort: 'popularity.desc',
      selectedDecade: null,
      selectedLanguage: null
    };
    setLocalFilters(resetFilters);
    // Also apply the reset immediately
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.selectedGenre) count++;
    if (localFilters.selectedYear) count++;
    if (localFilters.selectedRating) count++;
    if (localFilters.selectedSort !== 'popularity.desc') count++;
    if (localFilters.selectedDecade) count++;
    if (localFilters.selectedLanguage) count++;
    return count;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const decades = ['2020', '2010', '2000', '1990', '1980', '1970'];
  const ratings = [6, 7, 8, 9];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' }
  ];
  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Latest Release' },
    { value: 'vote_count.desc', label: 'Most Voted' }
  ];

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouch}
          activeOpacity={1} 
          onPress={onClose}
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
            <View>
              <Text style={styles.headerTitle}>🎬 Movie Filters</Text>
              <Text style={styles.headerSubtitle}>Customize your search</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={handleResetFilters}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Genres */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="movie" size={24} color="#AB8BFF" />
                <Text style={styles.sectionTitle}>Genres</Text>
              </View>
              <View style={styles.chipContainer}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre.id}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      selectedGenre: prev.selectedGenre === genre.id ? null : genre.id 
                    }))}
                    style={[
                      styles.chip,
                      localFilters.selectedGenre === genre.id ? styles.chipSelected : styles.chipUnselected
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      localFilters.selectedGenre === genre.id ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}>
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Period */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={24} color="#AB8BFF" />
                <Text style={styles.sectionTitle}>Time Period</Text>
              </View>
              
              {/* Decades */}
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Decades</Text>
                <View style={styles.chipContainer}>
                  {decades.map((decade) => (
                    <TouchableOpacity
                      key={decade}
                      onPress={() => setLocalFilters(prev => ({ 
                        ...prev, 
                        selectedDecade: prev.selectedDecade === decade ? null : decade,
                        selectedYear: null
                      }))}
                      style={[
                        styles.smallChip,
                        localFilters.selectedDecade === decade ? styles.chipSelected : styles.chipUnselected
                      ]}
                    >
                      <Text style={[
                        styles.chipText,
                        localFilters.selectedDecade === decade ? styles.chipTextSelected : styles.chipTextUnselected
                      ]}>
                        {decade}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recent Years */}
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Recent Years</Text>
                <View style={styles.chipContainer}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setLocalFilters(prev => ({ 
                        ...prev, 
                        selectedYear: prev.selectedYear === year ? null : year,
                        selectedDecade: null
                      }))}
                      style={[
                        styles.smallChip,
                        localFilters.selectedYear === year ? styles.chipSelected : styles.chipUnselected
                      ]}
                    >
                      <Text style={[
                        styles.chipText,
                        localFilters.selectedYear === year ? styles.chipTextSelected : styles.chipTextUnselected
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Language */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="language" size={24} color="#AB8BFF" />
                <Text style={styles.sectionTitle}>Language</Text>
              </View>
              <View style={styles.chipContainer}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      selectedLanguage: prev.selectedLanguage === language.code ? null : language.code 
                    }))}
                    style={[
                      styles.chip,
                      localFilters.selectedLanguage === language.code ? styles.chipSelected : styles.chipUnselected
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      localFilters.selectedLanguage === language.code ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}>
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={24} color="#AB8BFF" />
                <Text style={styles.sectionTitle}>Minimum Rating</Text>
              </View>
              <View style={styles.chipContainer}>
                {ratings.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      selectedRating: prev.selectedRating === rating ? null : rating 
                    }))}
                    style={[
                      styles.chip,
                      localFilters.selectedRating === rating ? styles.chipSelected : styles.chipUnselected
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      localFilters.selectedRating === rating ? styles.chipTextSelected : styles.chipTextUnselected
                    ]}>
                      {rating}+ ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="sort" size={24} color="#AB8BFF" />
                <Text style={styles.sectionTitle}>Sort By</Text>
              </View>
              <View>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setLocalFilters(prev => ({ ...prev, selectedSort: option.value }))}
                    style={[
                      styles.sortOption,
                      localFilters.selectedSort === option.value ? styles.sortOptionSelected : styles.sortOptionUnselected
                    ]}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      localFilters.selectedSort === option.value ? styles.sortOptionTextSelected : styles.sortOptionTextUnselected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleApplyFilters}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    minHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#F87171',
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#AB8BFF',
    borderColor: '#AB8BFF',
  },
  chipUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#9CA3AF',
  },
  sortOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sortOptionSelected: {
    backgroundColor: 'rgba(171, 139, 255, 0.2)',
    borderColor: '#AB8BFF',
  },
  sortOptionUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sortOptionText: {
    fontWeight: '500',
  },
  sortOptionTextSelected: {
    color: '#AB8BFF',
  },
  sortOptionTextUnselected: {
    color: '#9CA3AF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    backgroundColor: '#AB8BFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#AB8BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  filterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SearchFiltersModal;