import React from 'react'
import { Pressable, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg'
  
  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-600 active:bg-secondary-700',
    outline: 'border border-neutral-300 bg-transparent active:bg-neutral-50',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 min-h-[32px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  }
  
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-neutral-900 font-semibold',
  }
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }
  
  const disabledClasses = disabled || loading ? 'opacity-50' : ''
  
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      // @ts-ignore - NativeWind className prop. Types are defined but not always resolved in monorepo
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#374151' : '#ffffff'} 
          // @ts-ignore - NativeWind className prop
          className="mr-2"
          testID="activity-indicator"
        />
      )}
      {/* @ts-ignore - NativeWind className prop */}
      <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
        {title}
      </Text>
    </Pressable>
  )
}