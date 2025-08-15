import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { tokens } from '@aimeup/tokens';

export default function TokensDemoScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <Text className="text-3xl font-bold text-neutral-900 mb-6">Design Tokens Demo</Text>
        <Text className="text-base text-neutral-600 mb-8">
          This screen demonstrates the use of design tokens from @aimeup/tokens
        </Text>

        {/* Color Palette */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Color Palette</Text>

          {/* Primary Colors */}
          <Text className="text-sm font-medium text-neutral-600 mb-2">Primary</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-primary-50 p-4 rounded-lg">
              <Text className="text-xs">50</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-lg">
              <Text className="text-xs">100</Text>
            </View>
            <View className="bg-primary-200 p-4 rounded-lg">
              <Text className="text-xs">200</Text>
            </View>
            <View className="bg-primary-300 p-4 rounded-lg">
              <Text className="text-xs">300</Text>
            </View>
            <View className="bg-primary-400 p-4 rounded-lg">
              <Text className="text-xs text-white">400</Text>
            </View>
            <View className="bg-primary-500 p-4 rounded-lg">
              <Text className="text-xs text-white">500</Text>
            </View>
            <View className="bg-primary-600 p-4 rounded-lg">
              <Text className="text-xs text-white">600</Text>
            </View>
            <View className="bg-primary-700 p-4 rounded-lg">
              <Text className="text-xs text-white">700</Text>
            </View>
            <View className="bg-primary-800 p-4 rounded-lg">
              <Text className="text-xs text-white">800</Text>
            </View>
            <View className="bg-primary-900 p-4 rounded-lg">
              <Text className="text-xs text-white">900</Text>
            </View>
          </View>

          {/* Success Colors */}
          <Text className="text-sm font-medium text-neutral-600 mb-2">Success</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-success-50 p-4 rounded-lg">
              <Text className="text-xs">50</Text>
            </View>
            <View className="bg-success-100 p-4 rounded-lg">
              <Text className="text-xs">100</Text>
            </View>
            <View className="bg-success-200 p-4 rounded-lg">
              <Text className="text-xs">200</Text>
            </View>
            <View className="bg-success-300 p-4 rounded-lg">
              <Text className="text-xs">300</Text>
            </View>
            <View className="bg-success-400 p-4 rounded-lg">
              <Text className="text-xs">400</Text>
            </View>
            <View className="bg-success-500 p-4 rounded-lg">
              <Text className="text-xs text-white">500</Text>
            </View>
            <View className="bg-success-600 p-4 rounded-lg">
              <Text className="text-xs text-white">600</Text>
            </View>
            <View className="bg-success-700 p-4 rounded-lg">
              <Text className="text-xs text-white">700</Text>
            </View>
            <View className="bg-success-800 p-4 rounded-lg">
              <Text className="text-xs text-white">800</Text>
            </View>
            <View className="bg-success-900 p-4 rounded-lg">
              <Text className="text-xs text-white">900</Text>
            </View>
          </View>

          {/* Danger Colors */}
          <Text className="text-sm font-medium text-neutral-600 mb-2">Danger</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-danger-50 p-4 rounded-lg">
              <Text className="text-xs">50</Text>
            </View>
            <View className="bg-danger-100 p-4 rounded-lg">
              <Text className="text-xs">100</Text>
            </View>
            <View className="bg-danger-200 p-4 rounded-lg">
              <Text className="text-xs">200</Text>
            </View>
            <View className="bg-danger-300 p-4 rounded-lg">
              <Text className="text-xs">300</Text>
            </View>
            <View className="bg-danger-400 p-4 rounded-lg">
              <Text className="text-xs">400</Text>
            </View>
            <View className="bg-danger-500 p-4 rounded-lg">
              <Text className="text-xs text-white">500</Text>
            </View>
            <View className="bg-danger-600 p-4 rounded-lg">
              <Text className="text-xs text-white">600</Text>
            </View>
            <View className="bg-danger-700 p-4 rounded-lg">
              <Text className="text-xs text-white">700</Text>
            </View>
            <View className="bg-danger-800 p-4 rounded-lg">
              <Text className="text-xs text-white">800</Text>
            </View>
            <View className="bg-danger-900 p-4 rounded-lg">
              <Text className="text-xs text-white">900</Text>
            </View>
          </View>
        </View>

        {/* Typography */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Typography</Text>
          <Text className="text-xs mb-2">text-xs (12px)</Text>
          <Text className="text-sm mb-2">text-sm (14px)</Text>
          <Text className="text-base mb-2">text-base (16px)</Text>
          <Text className="text-lg mb-2">text-lg (18px)</Text>
          <Text className="text-xl mb-2">text-xl (20px)</Text>
          <Text className="text-2xl mb-2">text-2xl (24px)</Text>
          <Text className="text-3xl mb-2">text-3xl (30px)</Text>
        </View>

        {/* Spacing */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Spacing</Text>
          <View className="gap-2">
            <View className="flex-row items-center">
              <View className="bg-primary-500 h-4 w-4" />
              <Text className="ml-2 text-sm">w-4 h-4 (16px)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary-500 h-8 w-8" />
              <Text className="ml-2 text-sm">w-8 h-8 (32px)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary-500 h-12 w-12" />
              <Text className="ml-2 text-sm">w-12 h-12 (48px)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary-500 h-16 w-16" />
              <Text className="ml-2 text-sm">w-16 h-16 (64px)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-primary-500 h-20 w-20" />
              <Text className="ml-2 text-sm">w-20 h-20 (80px)</Text>
            </View>
          </View>
        </View>

        {/* Border Radius */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Border Radius</Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="bg-primary-100 p-4 rounded-none">
              <Text className="text-xs">none</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-sm">
              <Text className="text-xs">sm</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded">
              <Text className="text-xs">base</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-md">
              <Text className="text-xs">md</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-lg">
              <Text className="text-xs">lg</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-xl">
              <Text className="text-xs">xl</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-2xl">
              <Text className="text-xs">2xl</Text>
            </View>
            <View className="bg-primary-100 p-4 rounded-3xl">
              <Text className="text-xs">3xl</Text>
            </View>
            <View className="bg-primary-100 p-8 rounded-full">
              <Text className="text-xs">full</Text>
            </View>
          </View>
        </View>

        {/* Shadows */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Shadows</Text>
          <View className="gap-4">
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-sm">shadow-sm</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow">
              <Text className="text-sm">shadow</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-md">
              <Text className="text-sm">shadow-md</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-lg">
              <Text className="text-sm">shadow-lg</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-xl">
              <Text className="text-sm">shadow-xl</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-2xl">
              <Text className="text-sm">shadow-2xl</Text>
            </View>
          </View>
        </View>

        {/* Buttons using tokens */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Buttons with Token Styles</Text>
          <View className="gap-2">
            <Pressable className="bg-primary-600 active:bg-primary-700 px-4 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">Primary Button</Text>
            </Pressable>
            <Pressable className="bg-success-600 active:bg-success-700 px-4 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">Success Button</Text>
            </Pressable>
            <Pressable className="bg-danger-600 active:bg-danger-700 px-4 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">Danger Button</Text>
            </Pressable>
            <Pressable className="bg-warning-600 active:bg-warning-700 px-4 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">Warning Button</Text>
            </Pressable>
            <Pressable className="border border-neutral-300 px-4 py-3 rounded-lg">
              <Text className="text-neutral-900 text-center font-semibold">Outline Button</Text>
            </Pressable>
          </View>
        </View>

        {/* Direct token usage example */}
        <View className="mb-8">
          <Text className="text-xl font-semibold mb-4">Direct Token Usage</Text>
          <View className="bg-neutral-100 p-4 rounded-lg">
            <Text className="text-sm text-neutral-700 mb-2">
              Tokens can also be imported and used directly in JavaScript:
            </Text>
            <View className="bg-white p-3 rounded border border-neutral-200">
              <Text className="text-xs font-mono text-neutral-600">
                {`import { tokens } from '@aimeup/tokens'

// Use in styles
style={{
  color: tokens.colors.primary[600],
  fontSize: tokens.fontSize.lg.size,
  padding: tokens.spacing[4]
}}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
