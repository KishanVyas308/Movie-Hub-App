import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface GenreChipProps {
  genre: Genre;
  selected?: boolean;
  onPress?: (genre: Genre) => void;
}

const GenreChip = ({ genre, selected = false, onPress }: GenreChipProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(genre)}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        selected 
          ? 'bg-accent' 
          : 'bg-dark-100 border border-light-300'
      }`}
    >
      <Text className={`text-sm font-medium ${
        selected ? 'text-white' : 'text-light-100'
      }`}>
        {genre.name}
      </Text>
    </TouchableOpacity>
  );
};

export default GenreChip;