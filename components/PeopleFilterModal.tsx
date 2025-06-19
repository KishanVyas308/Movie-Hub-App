import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface PeopleFilters {
  sortBy?: string;
  department?: string;
  gender?: number;
}

interface PeopleFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: PeopleFilters) => void;
  initialFilters?: PeopleFilters;
}

const PeopleFilterModal = ({ visible, onClose, onApplyFilters, initialFilters }: PeopleFilterModalProps) => {
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'popularity.desc');
  const [department, setDepartment] = useState(initialFilters?.department || '');
  const [gender, setGender] = useState<number | undefined>(initialFilters?.gender);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'name.asc', label: 'Name A-Z' },
    { value: 'name.desc', label: 'Name Z-A' },
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Acting', label: 'Acting' },
    { value: 'Directing', label: 'Directing' },
    { value: 'Writing', label: 'Writing' },
    { value: 'Production', label: 'Production' },
    { value: 'Camera', label: 'Camera' },
    { value: 'Editing', label: 'Editing' },
    { value: 'Sound', label: 'Sound' },
    { value: 'Art', label: 'Art' },
    { value: 'Costume & Make-Up', label: 'Costume & Make-Up' },
    { value: 'Visual Effects', label: 'Visual Effects' },
  ];

  const genderOptions = [
    { value: undefined, label: 'All Genders' },
    { value: 1, label: 'Female' },
    { value: 2, label: 'Male' },
    { value: 0, label: 'Not Specified' },
  ];

  const handleApplyFilters = () => {
    const newFilters: PeopleFilters = {
      sortBy,
      department: department || undefined,
      gender,
    };

    onApplyFilters(newFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setSortBy('popularity.desc');
    setDepartment('');
    setGender(undefined);
    onApplyFilters({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-primary'>
        <View className='flex-row justify-between items-center p-5  border-b border-dark-100'>
          <TouchableOpacity onPress={onClose}>
            <Text className='text-accent text-lg font-medium'>Cancel</Text>
          </TouchableOpacity>
          <Text className='text-white text-xl font-bold'>People Filters</Text>
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

          {/* Department */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Department</Text>
            <View className='flex-row flex-wrap'>
              {departmentOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setDepartment(option.value)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    department === option.value 
                      ? 'bg-accent' 
                      : 'bg-dark-100 border border-light-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    department === option.value ? 'text-white' : 'text-light-100'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gender */}
          <View className='mb-6'>
            <Text className='text-white text-lg font-bold mb-3'>Gender</Text>
            <View className='flex-row flex-wrap'>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value?.toString() || 'all'}
                  onPress={() => setGender(option.value)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    gender === option.value 
                      ? 'bg-accent' 
                      : 'bg-dark-100 border border-light-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    gender === option.value ? 'text-white' : 'text-light-100'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
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

export default PeopleFilterModal;