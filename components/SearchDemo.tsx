import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { icons } from '@/constants/icons';

interface SearchDemoProps {
  visible: boolean;
  onClose: () => void;
}

const SearchDemo = ({ visible, onClose }: SearchDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "🔍 Enhanced Search",
      description: "Welcome to the new and improved search experience!",
      features: [
        "Multiple search types",
        "Smart suggestions",
        "Professional UI design",
        "Fast and reliable results"
      ]
    },
    {
      title: "🧠 Smart Search",
      description: "Use natural language to find exactly what you're looking for:",
      features: [
        '"funny movies from the 90s"',
        '"Tom Hanks best movies"',
        '"action movies like John Wick"',
        '"feel good romantic movies"'
      ]
    },
    {
      title: "🎬 Search Types",
      description: "Choose from different search modes:",
      features: [
        "All - Search everything at once",
        "Movies - Focus on films only",
        "People - Find actors & directors",
        "Collections - Discover movie series"
      ]
    },
    {
      title: "🤖 Smart Features",
      description: "Intelligent enhancements:",
      features: [
        "Auto-complete suggestions",
        "Mood-based recommendations", 
        "Pattern recognition",
        "Context-aware filtering"
      ]
    },
    {
      title: "🚀 Get Started",
      description: "Ready to explore? Here's how:",
      features: [
        "1. Try typing in the search bar",
        "2. Switch between search types",
        "3. Use natural language queries",
        "4. Enjoy smart discovery!"
      ]
    }
  ];

  const currentDemo = demoSteps[currentStep];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/80 items-center justify-center p-5'>
        <View className='bg-dark-100 rounded-2xl p-6 w-full max-w-sm'>
          {/* Header */}
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-white text-xl font-bold'>
              {currentDemo.title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className='text-light-200 text-2xl'>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className='max-h-80 mb-6'>
            <Text className='text-light-100 text-base mb-4 leading-6'>
              {currentDemo.description}
            </Text>

            <View className='space-y-2'>
              {currentDemo.features.map((feature, index) => (
                <View key={index} className='flex-row items-start'>
                  <Text className='text-accent mr-2'>•</Text>
                  <Text className='text-light-200 flex-1'>{feature}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Progress Indicator */}
          <View className='flex-row justify-center mb-4'>
            {demoSteps.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep ? 'bg-accent' : 'bg-dark-200'
                }`}
              />
            ))}
          </View>

          {/* Navigation */}
          <View className='flex-row justify-between'>
            <TouchableOpacity
              onPress={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg ${
                currentStep === 0 ? 'bg-dark-200' : 'bg-dark-200'
              }`}
            >
              <Text className={`font-medium ${
                currentStep === 0 ? 'text-light-300' : 'text-white'
              }`}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextStep}
              className='bg-accent px-4 py-2 rounded-lg'
            >
              <Text className='text-white font-medium'>
                {currentStep === demoSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SearchDemo;