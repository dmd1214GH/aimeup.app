import React from 'react';
import { TextInput, View, Text } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  className = '',
}: InputProps) {
  const inputClasses = `
    px-3 py-3 border rounded-lg text-base text-gray-900 bg-white
    ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}
    ${multiline ? 'min-h-[100px]' : 'min-h-[44px]'}
  `.trim();

  return (
    // @ts-ignore - NativeWind className prop. Types are defined but not always resolved in monorepo
    <View className={className}>
      {label && (
        // @ts-ignore - NativeWind className prop
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        // @ts-ignore - NativeWind className prop
        className={inputClasses}
        placeholderTextColor="#9CA3AF"
      />
      {error && (
        // @ts-ignore - NativeWind className prop
        <Text className="text-sm text-red-600 mt-1">{error}</Text>
      )}
    </View>
  );
}
