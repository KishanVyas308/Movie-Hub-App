import { icons } from '@/constants/icons';
import React from 'react';
import { Image, TextInput, View } from 'react-native';

const SearchBar = ({ placeholder, onPress, value, onChangeText, autoFocus = false, editable = true }: { placeholder: string; onPress?: () => void , value?: string, onChangeText? : (text:string) => void,  autoFocus?: boolean, editable?: boolean }) => {
  return (
    <View className={`flex-row items-center bg-dark-200 rounded-full px-5 py-4 ${!editable ? 'opacity-60' : ''}`}>
      <Image source={icons.search} className='size-5' resizeMode='contain' tintColor="#AB8BFF"/>
      <TextInput 
        onPress={onPress}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor={'#a8b5db'}
        className='flex-1 ml-2 text-white'
        
      />
    </View>
  )
}

export default SearchBar    