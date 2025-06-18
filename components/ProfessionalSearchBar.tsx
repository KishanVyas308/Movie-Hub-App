import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard
} from 'react-native';
import { icons } from '@/constants/icons';
import { generateSmartSuggestions, getTrendingSuggestions, getContextualSuggestions } from '@/services/freeSuggestions';

interface ProfessionalSearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  searchType?: string;
  disabled?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const ProfessionalSearchBar = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onSubmit,
  searchType = 'all',
  disabled = false
}: ProfessionalSearchBarProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const inputRef = useRef<TextInput>(null);

  // Debounced suggestion loading
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length >= 2 && isFocused && !disabled) {
        setLoadingSuggestions(true);
        try {
          const smartSuggestions = await generateSmartSuggestions(value);
          setSuggestions(smartSuggestions);
          setShowSuggestions(true);
          setShowTrending(false);
          
          // Animate suggestions appearance
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } catch (error) {
          console.error('Error loading suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      } else if (value.length === 0 && isFocused && !disabled) {
        // Show trending suggestions when empty
        const trending = getTrendingSuggestions();
        const contextual = getContextualSuggestions();
        setSuggestions([...contextual.slice(0, 4), ...trending.slice(0, 8)]);
        setShowSuggestions(true);
        setShowTrending(true);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setShowSuggestions(false);
        setShowTrending(false);
        setSuggestions([]);
      }
    }, value.length >= 2 ? 300 : 100); // Faster for trending, slower for search

    return () => clearTimeout(timeoutId);
  }, [value, isFocused, disabled]);

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
    setShowTrending(false);
    Keyboard.dismiss();
    onSubmit?.(suggestion);
  };

  const handleSubmit = () => {
    setShowSuggestions(false);
    setShowTrending(false);
    Keyboard.dismiss();
    onSubmit?.(value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      setShowTrending(false);
    }, 150);
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const renderSuggestion = ({ item, index }: { item: string; index: number }) => {
    const isContextual = showTrending && index < 4;
    
    return (
      <TouchableOpacity
        onPress={() => handleSuggestionPress(item)}
        className={`px-4 py-3 border-b border-dark-100/10 ${
          index % 2 === 0 ? 'bg-dark-100/5' : 'bg-transparent'
        }`}
        style={{ minHeight: 48 }}
      >
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center flex-1'>
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              isContextual ? 'bg-accent/20' : 'bg-dark-100/20'
            }`}>
              {isContextual ? (
                <Text className='text-accent text-sm'>🔥</Text>
              ) : loadingSuggestions ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Image source={icons.search} className='w-4 h-4' tintColor='#9CA3AF' />
              )}
            </View>
            
            <View className='flex-1'>
              <Text className='text-white text-base font-medium' numberOfLines={1}>
                {item}
              </Text>
              {isContextual && (
                <Text className='text-accent text-xs mt-1'>Trending now</Text>
              )}
            </View>
          </View>
          
          <View className='ml-2'>
            <Image 
              source={icons.arrow} 
              className='w-4 h-4 transform rotate-180' 
              tintColor='#9CA3AF' 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getSuggestionHeader = () => {
    if (showTrending) {
      return (
        <View className='px-4 py-3 border-b border-dark-100/20 bg-dark-100/10'>
          <Text className='text-accent text-sm font-bold'>🔥 Trending & Seasonal</Text>
          <Text className='text-light-300 text-xs mt-1'>Popular searches right now</Text>
        </View>
      );
    } else {
      return (
        <View className='px-4 py-3 border-b border-dark-100/20 bg-dark-100/10'>
          <Text className='text-accent text-sm font-bold'>💡 Smart Suggestions</Text>
          <Text className='text-light-300 text-xs mt-1'>Based on your search</Text>
        </View>
      );
    }
  };

  return (
    <View className='relative'>
      {/* Search Bar */}
      <View className={`flex-row items-center bg-dark-200/80 backdrop-blur-sm rounded-2xl px-5 py-4 border-2 ${
        isFocused ? 'border-accent/50 bg-dark-200' : 'border-transparent'
      } ${disabled ? 'opacity-50' : ''}`}>
        
        {/* Search Icon */}
        <View className='mr-3'>
          <Image 
            source={icons.search} 
            className='w-5 h-5' 
            tintColor={isFocused ? "#FF6B35" : "#AB8BFF"} 
          />
        </View>
        
        {/* Text Input */}
        <TextInput 
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholderTextColor='#a8b5db'
          className='flex-1 text-white text-base font-medium'
          returnKeyType="search"
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="none"
        />
        
        {/* Loading indicator */}
        {loadingSuggestions && (
          <ActivityIndicator size="small" color="#AB8BFF" className='ml-2' />
        )}
        
        {/* Clear button */}
        {value.length > 0 && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            className='ml-2 w-6 h-6 rounded-full bg-dark-100/50 items-center justify-center'
          >
            <Text className='text-light-200 text-sm font-bold'>×</Text>
          </TouchableOpacity>
        )}
        
        {/* Search Type Indicator */}
        {searchType !== 'all' && (
          <View className='ml-2 bg-accent/20 rounded-full px-2 py-1'>
            <Text className='text-accent text-xs font-bold uppercase'>
              {searchType}
            </Text>
          </View>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {(showSuggestions || showTrending) && suggestions.length > 0 && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            maxWidth: screenWidth - 40,
          }}
          className='absolute top-full left-0 right-0 mt-2 bg-dark-100/95 backdrop-blur-lg rounded-2xl border border-dark-100/30 shadow-2xl z-50 overflow-hidden'
        >
          {/* Header */}
          {getSuggestionHeader()}
          
          {/* Suggestions List */}
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `suggestion-${index}-${item}`}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            style={{ maxHeight: 300 }}
            keyboardShouldPersistTaps="handled"
          />
          
          {/* Footer */}
          <View className='px-4 py-3 border-t border-dark-100/20 bg-dark-100/10'>
            <Text className='text-light-300 text-xs text-center'>
              {showTrending ? '🔥 Tap any suggestion to search' : '💡 Powered by smart algorithms'}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default ProfessionalSearchBar;