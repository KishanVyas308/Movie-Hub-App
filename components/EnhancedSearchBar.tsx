import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated
} from 'react-native';
import { icons } from '@/constants/icons';
import { getSearchSuggestions } from '@/services/aiSearch';

interface EnhancedSearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  showAISuggestions?: boolean;
}

const EnhancedSearchBar = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onSubmit,
  showAISuggestions = true 
}: EnhancedSearchBarProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length >= 2 && showAISuggestions && isFocused) {
        setLoadingSuggestions(true);
        try {
          const aiSuggestions = await getSearchSuggestions(value);
          setSuggestions(aiSuggestions);
          setShowSuggestions(true);
          
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
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, showAISuggestions, isFocused]);

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
    onSubmit?.(suggestion);
  };

  const handleSubmit = () => {
    setShowSuggestions(false);
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
    }, 150);
  };

  const renderSuggestion = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      onPress={() => handleSuggestionPress(item)}
      className='px-4 py-3 border-b border-dark-100/20'
      style={{
        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
      }}
    >
      <View className='flex-row items-center'>
        <Image source={icons.search} className='w-4 h-4 mr-3' tintColor='#9CA3AF' />
        <Text className='text-white text-base flex-1'>{item}</Text>
        <Text className='text-accent text-sm'>✨ AI</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className='relative'>
      {/* Search Bar */}
      <View className={`flex-row items-center bg-dark-200 rounded-full px-5 py-4 ${
        isFocused ? 'border-2 border-accent' : 'border-2 border-transparent'
      }`}>
        <Image source={icons.search} className='w-5 h-5' resizeMode='contain' tintColor="#AB8BFF"/>
        <TextInput 
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholderTextColor={'#a8b5db'}
          className='flex-1 ml-2 text-white text-base'
          returnKeyType="search"
        />
        
        {/* Loading indicator for suggestions */}
        {loadingSuggestions && (
          <ActivityIndicator size="small" color="#AB8BFF" className='ml-2' />
        )}
        
        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              setShowSuggestions(false);
            }}
            className='ml-2 p-1'
          >
            <Text className='text-light-200 text-lg'>×</Text>
          </TouchableOpacity>
        )}
        
        {/* AI indicator */}
        {showAISuggestions && (
          <View className='ml-2 bg-accent/20 rounded-full px-2 py-1'>
            <Text className='text-accent text-xs font-bold'>AI</Text>
          </View>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className='absolute top-full left-0 right-0 mt-2 bg-dark-100 rounded-xl border border-dark-100/30 shadow-lg z-50 max-h-64'
        >
          {/* Header */}
          <View className='px-4 py-2 border-b border-dark-100/20'>
            <Text className='text-accent text-sm font-bold'>✨ AI Suggestions</Text>
          </View>
          
          {/* Suggestions List */}
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `suggestion-${index}`}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
          
          {/* Footer */}
          <View className='px-4 py-2 border-t border-dark-100/20'>
            <Text className='text-light-300 text-xs text-center'>
              Powered by AI • Tap to search
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default EnhancedSearchBar;