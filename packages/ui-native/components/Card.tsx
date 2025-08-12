import React from 'react'
import { View } from 'react-native'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  className?: string
  testID?: string
}

export function Card({ 
  children, 
  variant = 'default',
  className = '',
  testID
}: CardProps) {
  const baseClasses = 'rounded-lg p-4'
  
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-gray-200',
  }
  
  return (
    <View 
      // @ts-ignore - className prop for NativeWind
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      testID={testID}
    >
      {children}
    </View>
  )
}