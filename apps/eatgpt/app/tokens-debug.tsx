import React, { useState, useRef, useEffect } from 'react'
import { ScrollView, View, Text, Pressable, Platform } from 'react-native'
import { tokens } from '@aimeup/tokens'

// Type definitions for better IntelliSense
type TokenCategory = 'colors' | 'spacing' | 'fontSize' | 'borderRadius' | 'shadows'

interface TokenInfo {
  category: TokenCategory
  name: string
  className: string
  value: any
  description: string
}

// Helper function to get computed styles (Web only)
const getComputedStylesWeb = (ref: any) => {
  if (Platform.OS !== 'web' || !ref?.current) return {}
  
  try {
    // Get the actual DOM element from React Native Web
    const element = ref.current
    const computedStyles = window.getComputedStyle(element)
    
    return {
      backgroundColor: computedStyles.backgroundColor,
      color: computedStyles.color,
      fontSize: computedStyles.fontSize,
      lineHeight: computedStyles.lineHeight,
      padding: computedStyles.padding,
      margin: computedStyles.margin,
      borderRadius: computedStyles.borderRadius,
      borderWidth: computedStyles.borderWidth,
      borderColor: computedStyles.borderColor,
      boxShadow: computedStyles.boxShadow,
      width: computedStyles.width,
      height: computedStyles.height,
      fontWeight: computedStyles.fontWeight,
      opacity: computedStyles.opacity
    }
  } catch (error) {
    console.warn('Could not get computed styles:', error)
    return {}
  }
}

// Component to show token info with computed styles
const TokenExample: React.FC<{
  tokenInfo: TokenInfo
  children: React.ReactNode
  className: string
}> = ({ tokenInfo, children, className }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [computedStyles, setComputedStyles] = useState<any>({})
  const elementRef = useRef(null)

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styles = getComputedStylesWeb(elementRef)
      setComputedStyles(styles)
    }
  }, [className])

  return (
    <View className="mb-4 border border-neutral-200 rounded-lg overflow-hidden">
      <Pressable
        ref={elementRef}
        className={className}
        onPress={() => setShowDetails(!showDetails)}
      >
        {children}
      </Pressable>
      
      {showDetails && (
        <View className="bg-neutral-50 p-4 border-t border-neutral-200">
          <Text className="text-sm font-semibold text-neutral-900 mb-2">
            Token Debug Info
          </Text>
          
          {/* Tailwind Class */}
          <View className="mb-3">
            <Text className="text-xs font-medium text-neutral-600 mb-1">
              Tailwind Class:
            </Text>
            <View className="bg-white p-2 rounded border">
              <Text className="text-xs font-mono text-primary-600">
                {tokenInfo.className}
              </Text>
            </View>
          </View>

          {/* Token Value */}
          <View className="mb-3">
            <Text className="text-xs font-medium text-neutral-600 mb-1">
              Token Value:
            </Text>
            <View className="bg-white p-2 rounded border">
              <Text className="text-xs font-mono text-success-600">
                {typeof tokenInfo.value === 'object' 
                  ? JSON.stringify(tokenInfo.value, null, 2)
                  : String(tokenInfo.value)
                }
              </Text>
            </View>
          </View>

          {/* Computed CSS (Web only) */}
          {Platform.OS === 'web' && Object.keys(computedStyles).length > 0 && (
            <View className="mb-3">
              <Text className="text-xs font-medium text-neutral-600 mb-1">
                Computed CSS (Browser):
              </Text>
              <View className="bg-white p-2 rounded border max-h-32">
                <ScrollView>
                  {Object.entries(computedStyles)
                    .filter(([_, value]) => value && value !== 'none' && value !== 'auto')
                    .map(([property, value]) => (
                      <Text key={property} className="text-xs font-mono text-neutral-700">
                        {property}: {String(value)}
                      </Text>
                    ))
                  }
                </ScrollView>
              </View>
            </View>
          )}

          <Text className="text-xs text-neutral-500">
            {tokenInfo.description}
          </Text>
        </View>
      )}
    </View>
  )
}

// Color swatch component
const ColorSwatch: React.FC<{ colorKey: string; colorValue: string }> = ({ 
  colorKey, 
  colorValue 
}) => (
  <TokenExample
    tokenInfo={{
      category: 'colors',
      name: colorKey,
      className: `bg-${colorKey}`,
      value: colorValue,
      description: `Background color token: ${colorKey} = ${colorValue}`
    }}
    className={`bg-${colorKey} p-4 rounded-lg min-w-20 items-center justify-center`}
  >
    <Text 
      className={`text-xs font-medium ${
        ['50', '100', '200', '300'].some(shade => colorKey.endsWith(shade))
          ? 'text-neutral-900' 
          : 'text-white'
      }`}
    >
      {colorKey.split('-').pop()}
    </Text>
  </TokenExample>
)

// Typography example
const TypographyExample: React.FC<{ sizeKey: string }> = ({ sizeKey }) => {
  const fontSize = tokens.fontSize[sizeKey as keyof typeof tokens.fontSize]
  
  return (
    <TokenExample
      tokenInfo={{
        category: 'fontSize',
        name: sizeKey,
        className: `text-${sizeKey}`,
        value: fontSize,
        description: `Font size token: text-${sizeKey} = ${fontSize?.size}px / ${fontSize?.lineHeight}px line-height`
      }}
      className={`text-${sizeKey} text-neutral-900 p-2`}
    >
      <Text className={`text-${sizeKey}`}>
        text-{sizeKey} ({fontSize?.size}px)
      </Text>
    </TokenExample>
  )
}

// Spacing example
const SpacingExample: React.FC<{ spaceKey: string }> = ({ spaceKey }) => {
  const spaceValue = tokens.spacing[spaceKey as keyof typeof tokens.spacing]
  
  return (
    <TokenExample
      tokenInfo={{
        category: 'spacing',
        name: spaceKey,
        className: `w-${spaceKey} h-${spaceKey}`,
        value: `${spaceValue}px`,
        description: `Spacing token: w-${spaceKey} h-${spaceKey} = ${spaceValue}px`
      }}
      className={`w-${spaceKey} h-${spaceKey} bg-primary-500 rounded`}
    >
      <Text className="text-xs text-white text-center">
        {spaceKey}
      </Text>
    </TokenExample>
  )
}

export default function TokensDebugScreen() {
  const [selectedCategory, setSelectedCategory] = useState<TokenCategory>('colors')
  const [showInspectorGuide, setShowInspectorGuide] = useState(false)

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-neutral-900 mb-2">
            Design Tokens Debug
          </Text>
          <Text className="text-base text-neutral-600 mb-4">
            Interactive guide to understanding how design tokens translate to CSS in React Native Web
          </Text>
          
          {/* Platform indicator */}
          <View className="bg-info-50 p-3 rounded-lg border border-info-200">
            <Text className="text-sm text-info-800">
              Platform: {Platform.OS} • 
              {Platform.OS === 'web' ? ' Browser DevTools available' : ' Limited debugging on native'}
            </Text>
          </View>
        </View>

        {/* Inspector Guide */}
        <View className="mb-6">
          <Pressable
            className="bg-primary-600 active:bg-primary-700 p-4 rounded-lg"
            onPress={() => setShowInspectorGuide(!showInspectorGuide)}
          >
            <Text className="text-white font-semibold text-center">
              {showInspectorGuide ? 'Hide' : 'Show'} Browser DevTools Guide
            </Text>
          </Pressable>
          
          {showInspectorGuide && (
            <View className="bg-neutral-50 p-4 rounded-lg mt-2 border border-neutral-200">
              <Text className="text-lg font-semibold text-neutral-900 mb-3">
                How to Inspect Tokens in Browser DevTools
              </Text>
              
              <View className="space-y-3">
                <View>
                  <Text className="text-sm font-medium text-neutral-800 mb-1">
                    1. Open DevTools
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Press F12 or right-click → "Inspect Element"
                  </Text>
                </View>
                
                <View>
                  <Text className="text-sm font-medium text-neutral-800 mb-1">
                    2. Inspect Elements
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Click the inspect tool and hover over elements below to see:
                  </Text>
                  <View className="ml-4 mt-1">
                    <Text className="text-xs text-neutral-600">• CSS class names generated by Tailwind</Text>
                    <Text className="text-xs text-neutral-600">• Computed CSS values from tokens</Text>
                    <Text className="text-xs text-neutral-600">• CSS custom properties (variables)</Text>
                  </View>
                </View>
                
                <View>
                  <Text className="text-sm font-medium text-neutral-800 mb-1">
                    3. View CSS Variables
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    In the Elements panel, look for :root or html to see CSS custom properties like --color-primary-500
                  </Text>
                </View>
                
                <View>
                  <Text className="text-sm font-medium text-neutral-800 mb-1">
                    4. Interactive Debug
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Tap any element below to see its token mapping and computed styles
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Category Selector */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-neutral-900 mb-3">
            Token Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {(['colors', 'spacing', 'fontSize', 'borderRadius', 'shadows'] as TokenCategory[]).map((category) => (
                <Pressable
                  key={category}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedCategory === category
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-neutral-300'
                  }`}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'text-neutral-700'
                    }`}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Token Examples */}
        {selectedCategory === 'colors' && (
          <View>
            <Text className="text-xl font-semibold text-neutral-900 mb-4">
              Color Tokens
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Tap any color to see how the bg-* class maps to CSS values
            </Text>
            
            {Object.entries(tokens.colors).map(([colorFamily, shades]) => {
              if (typeof shades === 'string') {
                return (
                  <View key={colorFamily} className="mb-4">
                    <Text className="text-sm font-medium text-neutral-700 mb-2">
                      {colorFamily}
                    </Text>
                    <ColorSwatch colorKey={colorFamily} colorValue={shades} />
                  </View>
                )
              }
              
              return (
                <View key={colorFamily} className="mb-6">
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    {colorFamily}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {Object.entries(shades).map(([shade, value]) => (
                      <ColorSwatch 
                        key={`${colorFamily}-${shade}`}
                        colorKey={`${colorFamily}-${shade}`} 
                        colorValue={value} 
                      />
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {selectedCategory === 'fontSize' && (
          <View>
            <Text className="text-xl font-semibold text-neutral-900 mb-4">
              Typography Tokens
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Tap any text to see how text-* classes map to font-size and line-height
            </Text>
            
            {Object.keys(tokens.fontSize).map((sizeKey) => (
              <TypographyExample key={sizeKey} sizeKey={sizeKey} />
            ))}
          </View>
        )}

        {selectedCategory === 'spacing' && (
          <View>
            <Text className="text-xl font-semibold text-neutral-900 mb-4">
              Spacing Tokens
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Tap any square to see how w-* and h-* classes map to pixel values
            </Text>
            
            <View className="flex-row flex-wrap gap-4 items-end">
              {['1', '2', '4', '6', '8', '10', '12', '16', '20', '24'].map((spaceKey) => (
                <View key={spaceKey} className="items-center">
                  <SpacingExample spaceKey={spaceKey} />
                  <Text className="text-xs text-neutral-500 mt-1">
                    {tokens.spacing[spaceKey as keyof typeof tokens.spacing]}px
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedCategory === 'borderRadius' && (
          <View>
            <Text className="text-xl font-semibold text-neutral-900 mb-4">
              Border Radius Tokens
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Tap any shape to see how rounded-* classes map to border-radius values
            </Text>
            
            <View className="flex-row flex-wrap gap-4">
              {Object.entries(tokens.borderRadius).map(([radiusKey, radiusValue]) => (
                <TokenExample
                  key={radiusKey}
                  tokenInfo={{
                    category: 'borderRadius',
                    name: radiusKey,
                    className: `rounded-${radiusKey === 'base' ? '' : radiusKey}`,
                    value: `${radiusValue}px`,
                    description: `Border radius token: rounded-${radiusKey} = ${radiusValue}px`
                  }}
                  className={`bg-primary-100 p-6 ${
                    radiusKey === 'base' ? 'rounded' : `rounded-${radiusKey}`
                  } border border-primary-300`}
                >
                  <Text className="text-xs text-primary-800 text-center">
                    {radiusKey}
                  </Text>
                  <Text className="text-xs text-primary-600 text-center">
                    {radiusValue}px
                  </Text>
                </TokenExample>
              ))}
            </View>
          </View>
        )}

        {selectedCategory === 'shadows' && (
          <View>
            <Text className="text-xl font-semibold text-neutral-900 mb-4">
              Shadow Tokens
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Tap any card to see how shadow-* classes map to box-shadow values
            </Text>
            
            <View className="gap-4">
              {Object.entries(tokens.shadows).map(([shadowKey, shadowValue]) => (
                <TokenExample
                  key={shadowKey}
                  tokenInfo={{
                    category: 'shadows',
                    name: shadowKey,
                    className: `shadow-${shadowKey === 'base' ? '' : shadowKey}`,
                    value: shadowValue,
                    description: `Shadow token: shadow-${shadowKey} maps to elevation and box-shadow`
                  }}
                  className={`bg-white p-6 rounded-lg ${
                    shadowKey === 'base' ? 'shadow' : `shadow-${shadowKey}`
                  }`}
                >
                  <Text className="text-sm font-medium text-neutral-900">
                    shadow-{shadowKey}
                  </Text>
                  <Text className="text-xs text-neutral-600">
                    elevation: {shadowValue.elevation}
                  </Text>
                </TokenExample>
              ))}
            </View>
          </View>
        )}

        {/* CSS Variables Section */}
        <View className="mt-8 mb-6">
          <Text className="text-xl font-semibold text-neutral-900 mb-4">
            CSS Variables Mapping
          </Text>
          <Text className="text-sm text-neutral-600 mb-4">
            How tokens become CSS custom properties in the browser
          </Text>
          
          <View className="bg-neutral-900 p-4 rounded-lg">
            <Text className="text-green-400 text-xs font-mono mb-2">
              /* Tailwind generates CSS variables from tokens */
            </Text>
            <Text className="text-white text-xs font-mono mb-1">
              :root {'{'}
            </Text>
            <Text className="text-blue-400 text-xs font-mono ml-4 mb-1">
              --color-primary-500: #3b82f6;
            </Text>
            <Text className="text-blue-400 text-xs font-mono ml-4 mb-1">
              --spacing-4: 16px;
            </Text>
            <Text className="text-blue-400 text-xs font-mono ml-4 mb-1">
              --font-size-lg: 18px;
            </Text>
            <Text className="text-white text-xs font-mono mb-2">
              {'}'}
            </Text>
            <Text className="text-green-400 text-xs font-mono mb-2">
              /* Classes use the variables */
            </Text>
            <Text className="text-yellow-400 text-xs font-mono mb-1">
              .bg-primary-500 {'{'}
            </Text>
            <Text className="text-blue-400 text-xs font-mono ml-4 mb-1">
              background-color: var(--color-primary-500);
            </Text>
            <Text className="text-yellow-400 text-xs font-mono">
              {'}'}
            </Text>
          </View>
        </View>

        {/* Interactive Example */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-neutral-900 mb-4">
            Interactive Token Example
          </Text>
          <Text className="text-sm text-neutral-600 mb-4">
            A complex component showing multiple tokens working together
          </Text>
          
          <TokenExample
            tokenInfo={{
              category: 'colors',
              name: 'complex-card',
              className: 'bg-white shadow-lg rounded-xl p-6 border border-neutral-200',
              value: 'Multiple tokens combined',
              description: 'Card component using background, shadow, border-radius, padding, and border tokens'
            }}
            className="bg-white shadow-lg rounded-xl p-6 border border-neutral-200"
          >
            <View className="mb-4">
              <Text className="text-xl font-bold text-neutral-900 mb-2">
                Interactive Card
              </Text>
              <Text className="text-sm text-neutral-600 mb-4">
                This card uses multiple design tokens:
              </Text>
              <View className="space-y-2">
                <Text className="text-xs text-neutral-500">• bg-white (background)</Text>
                <Text className="text-xs text-neutral-500">• shadow-lg (elevation)</Text>
                <Text className="text-xs text-neutral-500">• rounded-xl (border-radius)</Text>
                <Text className="text-xs text-neutral-500">• p-6 (padding)</Text>
                <Text className="text-xs text-neutral-500">• border border-neutral-200 (border)</Text>
              </View>
            </View>
            
            <View className="flex-row gap-2">
              <View className="bg-primary-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Primary</Text>
              </View>
              <View className="bg-success-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Success</Text>
              </View>
              <View className="bg-warning-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Warning</Text>
              </View>
            </View>
          </TokenExample>
        </View>

        {/* Footer */}
        <View className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <Text className="text-sm font-medium text-neutral-900 mb-2">
            Pro Tips for Token Debugging:
          </Text>
          <View className="space-y-1">
            <Text className="text-xs text-neutral-600">
              • Use browser DevTools to inspect generated CSS classes
            </Text>
            <Text className="text-xs text-neutral-600">
              • Check the :root element for CSS custom properties
            </Text>
            <Text className="text-xs text-neutral-600">
              • Tokens are defined in packages/tokens/src/tokens.ts
            </Text>
            <Text className="text-xs text-neutral-600">
              • Tailwind config extends theme with tokens in tailwind.config.js
            </Text>
            <Text className="text-xs text-neutral-600">
              • React Native Web converts styles to CSS automatically
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}