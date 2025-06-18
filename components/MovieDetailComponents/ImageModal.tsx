import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  TouchableOpacity, 
  Image, 
  Text, 
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal = ({ visible, imageUrl, onClose }: ImageModalProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleClose = () => {
    setImageLoading(true);
    setImageError(false);
    onClose();
  };

  if (!visible || !imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      
      <View className='flex-1 bg-black/95'>
        {/* Header */}
        <View className='absolute top-12 left-0 right-0 z-20 flex-row justify-between items-center px-5'>
          <View className='flex-1'>
            <Text className='text-white font-bold text-lg'>Movie Image</Text>
            <Text className='text-light-200 text-sm'>Tap anywhere to close</Text>
          </View>
          
          <TouchableOpacity 
            className='bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4'
            onPress={handleClose}
          >
            <Text className='text-white text-xl font-bold'>×</Text>
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <TouchableOpacity 
          className='flex-1 items-center justify-center px-5'
          onPress={handleClose}
          activeOpacity={1}
        >
          <View className='relative w-full h-full items-center justify-center'>
            {/* Loading State */}
            {imageLoading && !imageError && (
              <View className='absolute inset-0 items-center justify-center z-10'>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text className='text-white text-sm mt-3'>Loading high quality image...</Text>
              </View>
            )}

            {/* Error State */}
            {imageError && (
              <View className='absolute inset-0 items-center justify-center z-10'>
                <View className='bg-dark-100/80 rounded-xl p-6 items-center'>
                  <Text className='text-white text-lg font-bold mb-2'>Failed to load image</Text>
                  <Text className='text-light-200 text-sm text-center mb-4'>
                    The image could not be loaded. Please check your connection and try again.
                  </Text>
                  <TouchableOpacity 
                    className='bg-accent px-4 py-2 rounded-lg'
                    onPress={handleClose}
                  >
                    <Text className='text-white font-medium'>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Main Image */}
            <Image
              source={{ uri: imageUrl }}
              style={{ 
                width: screenWidth - 40,
                height: screenHeight - 120,
                maxWidth: screenWidth - 40,
                maxHeight: screenHeight - 120,
              }}
              resizeMode='contain'
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </View>
        </TouchableOpacity>

        {/* Bottom Info */}
        <View className='absolute bottom-8 left-5 right-5 bg-black/70 backdrop-blur-sm rounded-xl p-4'>
          <View className='flex-row justify-between items-center'>
            <View>
              <Text className='text-white font-medium'>High Resolution Image</Text>
              <Text className='text-light-200 text-sm'>Pinch to zoom • Swipe to dismiss</Text>
            </View>
            
            <View className='bg-accent/20 px-3 py-1 rounded-full'>
              <Text className='text-accent text-xs font-medium'>HD</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageModal;