import React from 'react';
import { View, Text } from 'react-native';

interface BoxOfficeSectionProps {
  movie: MovieDetails;
}

const BoxOfficeSection = ({ movie }: BoxOfficeSectionProps) => {
  const hasBudget = movie.budget && movie.budget > 0;
  const hasRevenue = movie.revenue && movie.revenue > 0;
  
  if (!hasBudget && !hasRevenue) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const profit = hasRevenue && hasBudget ? movie.revenue - movie.budget : 0;
  const roi = hasBudget && hasRevenue && movie.budget > 0 
    ? ((movie.revenue - movie.budget) / movie.budget) * 100 
    : 0;

  return (
    <View className='mb-8'>
      <Text className='text-white font-bold text-xl mb-4'>Box Office</Text>
      
      <View className='bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4'>
        <View className='space-y-4'>
          {/* Budget and Revenue */}
          <View className='flex-row justify-between'>
            {hasBudget && (
              <View className='flex-1 mr-4'>
                <Text className='text-light-200 text-sm mb-1'>Budget</Text>
                <Text className='text-white font-bold text-lg'>
                  {formatCurrency(movie.budget)}
                </Text>
                <Text className='text-light-200 text-xs'>
                  ${movie.budget.toLocaleString()}
                </Text>
              </View>
            )}
            
            {hasRevenue && (
              <View className='flex-1'>
                <Text className='text-light-200 text-sm mb-1'>Box Office</Text>
                <Text className='text-white font-bold text-lg'>
                  {formatCurrency(movie.revenue)}
                </Text>
                <Text className='text-light-200 text-xs'>
                  ${movie.revenue.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Profit and ROI */}
          {profit > 0 && (
            <View className='border-t border-dark-100/30 pt-4'>
              <View className='flex-row justify-between'>
                <View className='flex-1 mr-4'>
                  <Text className='text-light-200 text-sm mb-1'>Profit</Text>
                  <Text className={`font-bold text-lg ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit > 0 ? '+' : ''}{formatCurrency(Math.abs(profit))}
                  </Text>
                  <Text className='text-light-200 text-xs'>
                    ${Math.abs(profit).toLocaleString()}
                  </Text>
                </View>
                
                <View className='flex-1'>
                  <Text className='text-light-200 text-sm mb-1'>ROI</Text>
                  <Text className={`font-bold text-lg ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                  </Text>
                  <Text className='text-light-200 text-xs'>
                    Return on Investment
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Performance Indicator */}
          {hasRevenue && hasBudget && (
            <View className='border-t border-dark-100/30 pt-4'>
              <Text className='text-light-200 text-sm mb-2'>Performance</Text>
              <View className='flex-row items-center'>
                <View className='flex-1 bg-dark-100 rounded-full h-2 mr-3'>
                  <View 
                    className={`h-2 rounded-full ${
                      roi > 100 ? 'bg-green-500' :
                      roi > 0 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(Math.max((roi + 100) / 3, 0), 100)}%` 
                    }}
                  />
                </View>
                <Text className={`text-sm font-medium ${
                  roi > 100 ? 'text-green-400' :
                  roi > 0 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {roi > 100 ? 'Highly Profitable' :
                   roi > 0 ? 'Profitable' :
                   'Loss'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default BoxOfficeSection;