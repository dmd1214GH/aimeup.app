import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Pressable, Platform, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { tokens } from '@aimeup/tokens';

// StyleSheet for replacing className props
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  padding: {
    padding: 16,
  },
  marginBottom4: {
    marginBottom: 16,
  },
  marginBottom6: {
    marginBottom: 24,
  },
  marginBottom8: {
    marginBottom: 32,
  },
  marginTop8: {
    marginTop: 32,
  },
  marginTop2: {
    marginTop: 8,
  },
  marginTop1: {
    marginTop: 4,
  },
  marginLeft4: {
    marginLeft: 16,
  },
  marginBottom2: {
    marginBottom: 8,
  },
  marginBottom3: {
    marginBottom: 12,
  },
  marginBottom1: {
    marginBottom: 4,
  },
  border: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  borderNeutral200: {
    borderColor: '#e5e7eb',
  },
  borderNeutral300: {
    borderColor: '#d1d5db',
  },
  borderPrimary600: {
    borderColor: '#2563eb',
  },
  borderPrimary300: {
    borderColor: '#93c5fd',
  },
  borderInfo200: {
    borderColor: '#bfdbfe',
  },
  borderTop: {
    borderTopWidth: 1,
  },
  rounded: {
    borderRadius: 8,
  },
  roundedLg: {
    borderRadius: 12,
  },
  roundedXl: {
    borderRadius: 16,
  },
  roundedFull: {
    borderRadius: 9999,
  },
  overflow: {
    overflow: 'hidden',
  },
  bgWhite: {
    backgroundColor: '#ffffff',
  },
  bgNeutral50: {
    backgroundColor: '#f9fafb',
  },
  bgNeutral900: {
    backgroundColor: '#111827',
  },
  bgPrimary50: {
    backgroundColor: '#eff6ff',
  },
  bgPrimary100: {
    backgroundColor: '#dbeafe',
  },
  bgPrimary500: {
    backgroundColor: '#3b82f6',
  },
  bgPrimary600: {
    backgroundColor: '#2563eb',
  },
  bgPrimary700: {
    backgroundColor: '#1d4ed8',
  },
  bgInfo50: {
    backgroundColor: '#eff6ff',
  },
  bgSuccess500: {
    backgroundColor: '#22c55e',
  },
  bgWarning500: {
    backgroundColor: '#eab308',
  },
  padding4: {
    padding: 16,
  },
  padding6: {
    padding: 24,
  },
  padding3: {
    padding: 12,
  },
  padding2: {
    padding: 8,
  },
  paddingHorizontal4: {
    paddingHorizontal: 16,
  },
  paddingVertical2: {
    paddingVertical: 8,
  },
  paddingHorizontal3: {
    paddingHorizontal: 12,
  },
  paddingVertical1: {
    paddingVertical: 4,
  },
  text3xl: {
    fontSize: 30,
    lineHeight: 36,
  },
  textXl: {
    fontSize: 20,
    lineHeight: 28,
  },
  textLg: {
    fontSize: 18,
    lineHeight: 28,
  },
  textBase: {
    fontSize: 16,
    lineHeight: 24,
  },
  textSm: {
    fontSize: 14,
    lineHeight: 20,
  },
  textXs: {
    fontSize: 12,
    lineHeight: 16,
  },
  fontBold: {
    fontWeight: 'bold',
  },
  fontSemibold: {
    fontWeight: '600',
  },
  fontMedium: {
    fontWeight: '500',
  },
  fontMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  textNeutral900: {
    color: '#111827',
  },
  textNeutral800: {
    color: '#1f2937',
  },
  textNeutral700: {
    color: '#374151',
  },
  textNeutral600: {
    color: '#4b5563',
  },
  textNeutral500: {
    color: '#6b7280',
  },
  textWhite: {
    color: '#ffffff',
  },
  textPrimary600: {
    color: '#2563eb',
  },
  textPrimary800: {
    color: '#1e40af',
  },
  textInfo800: {
    color: '#1e40af',
  },
  textSuccess600: {
    color: '#16a34a',
  },
  textGreen400: {
    color: '#4ade80',
  },
  textBlue400: {
    color: '#60a5fa',
  },
  textYellow400: {
    color: '#facc15',
  },
  textCenter: {
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  gap2: {
    gap: 8,
  },
  gap4: {
    gap: 16,
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  itemsCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  itemsEnd: {
    alignItems: 'flex-end',
  },
  minWidth20: {
    minWidth: 80,
  },
  maxHeight32: {
    maxHeight: 128,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  activeBgPrimary700: {
    backgroundColor: '#1d4ed8',
  },
});

// Type definitions for better IntelliSense
type TokenCategory = 'colors' | 'spacing' | 'fontSize' | 'borderRadius' | 'shadows';

interface TokenInfo {
  category: TokenCategory;
  name: string;
  value: any;
  description: string;
}

// Helper function to get computed styles (Web only)
const getComputedStylesWeb = (ref: any) => {
  if (Platform.OS !== 'web' || !ref?.current) return {};

  try {
    // Get the actual DOM element from React Native Web
    const element = ref.current;
    const computedStyles = window.getComputedStyle(element);

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
      opacity: computedStyles.opacity,
    };
  } catch (error) {
    console.warn('Could not get computed styles:', error);
    return {};
  }
};

// Component to show token info with computed styles
const TokenExample: React.FC<{
  tokenInfo: TokenInfo;
  children: React.ReactNode;
  style?: any;
}> = ({ tokenInfo, children, style }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [computedStyles, setComputedStyles] = useState<any>({});
  const elementRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styles = getComputedStylesWeb(elementRef);
      setComputedStyles(styles);
    }
  }, [style]);

  return (
    <View
      style={[
        styles.marginBottom4,
        styles.border,
        styles.borderNeutral200,
        styles.roundedLg,
        styles.overflow,
      ]}
    >
      <Pressable ref={elementRef} style={style} onPress={() => setShowDetails(!showDetails)}>
        {children}
      </Pressable>

      {showDetails && (
        <View
          style={[styles.bgNeutral50, styles.padding4, styles.borderTop, styles.borderNeutral200]}
        >
          <Text
            style={[
              styles.textSm,
              styles.fontSemibold,
              styles.textNeutral900,
              styles.marginBottom2,
            ]}
          >
            Token Debug Info
          </Text>

          {/* Token Value */}
          <View style={styles.marginBottom3}>
            <Text
              style={[
                styles.textXs,
                styles.fontMedium,
                styles.textNeutral600,
                styles.marginBottom1,
              ]}
            >
              Token Value:
            </Text>
            <View style={[styles.bgWhite, styles.padding2, styles.rounded, styles.border]}>
              <Text style={[styles.textXs, styles.fontMono, styles.textSuccess600]}>
                {typeof tokenInfo.value === 'object'
                  ? JSON.stringify(tokenInfo.value, null, 2)
                  : String(tokenInfo.value)}
              </Text>
            </View>
          </View>

          {/* Computed CSS (Web only) */}
          {Platform.OS === 'web' && Object.keys(computedStyles).length > 0 && (
            <View style={styles.marginBottom3}>
              <Text
                style={[
                  styles.textXs,
                  styles.fontMedium,
                  styles.textNeutral600,
                  styles.marginBottom1,
                ]}
              >
                Computed CSS (Browser):
              </Text>
              <View
                style={[
                  styles.bgWhite,
                  styles.padding2,
                  styles.rounded,
                  styles.border,
                  styles.maxHeight32,
                ]}
              >
                <ScrollView>
                  {Object.entries(computedStyles)
                    .filter(([_, value]) => value && value !== 'none' && value !== 'auto')
                    .map(([property, value]) => (
                      <Text
                        key={property}
                        style={[styles.textXs, styles.fontMono, styles.textNeutral700]}
                      >
                        {property}: {String(value)}
                      </Text>
                    ))}
                </ScrollView>
              </View>
            </View>
          )}

          <Text style={[styles.textXs, styles.textNeutral500]}>{tokenInfo.description}</Text>
        </View>
      )}
    </View>
  );
};

// Color swatch component
const ColorSwatch: React.FC<{ colorKey: string; colorValue: string }> = ({
  colorKey,
  colorValue,
}) => {
  // Determine text color based on background lightness
  const isLightBackground = ['50', '100', '200', '300'].some((shade) => colorKey.endsWith(shade));

  const swatchStyle = {
    backgroundColor: colorValue,
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <TokenExample
      tokenInfo={{
        category: 'colors',
        name: colorKey,
        value: colorValue,
        description: `Background color token: ${colorKey} = ${colorValue}`,
      }}
      style={swatchStyle}
    >
      <Text
        style={[
          styles.textXs,
          styles.fontMedium,
          isLightBackground ? styles.textNeutral900 : styles.textWhite,
        ]}
      >
        {colorKey.split('-').pop()}
      </Text>
    </TokenExample>
  );
};

// Typography example
const TypographyExample: React.FC<{ sizeKey: string }> = ({ sizeKey }) => {
  const fontSize = tokens.fontSize[sizeKey as keyof typeof tokens.fontSize];

  const typographyStyle = {
    fontSize: fontSize?.size || 16,
    lineHeight: fontSize?.lineHeight || 24,
    color: '#111827',
    padding: 8,
  };

  return (
    <TokenExample
      tokenInfo={{
        category: 'fontSize',
        name: sizeKey,
        value: fontSize,
        description: `Font size token: text-${sizeKey} = ${fontSize?.size}px / ${fontSize?.lineHeight}px line-height`,
      }}
      style={typographyStyle}
    >
      <Text style={typographyStyle}>
        text-{sizeKey} ({fontSize?.size}px)
      </Text>
    </TokenExample>
  );
};

// Spacing example
const SpacingExample: React.FC<{ spaceKey: string }> = ({ spaceKey }) => {
  const spaceValue = tokens.spacing[spaceKey as keyof typeof tokens.spacing];

  const spacingStyle = {
    width: spaceValue,
    height: spaceValue,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  };

  return (
    <TokenExample
      tokenInfo={{
        category: 'spacing',
        name: spaceKey,
        value: `${spaceValue}px`,
        description: `Spacing token: w-${spaceKey} h-${spaceKey} = ${spaceValue}px`,
      }}
      style={spacingStyle}
    >
      <Text style={[styles.textXs, styles.textWhite, styles.textCenter]}>{spaceKey}</Text>
    </TokenExample>
  );
};

export default function TokensDebugScreen() {
  const [selectedCategory, setSelectedCategory] = useState<TokenCategory>('colors');
  const [showInspectorGuide, setShowInspectorGuide] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.padding}>
        {/* Header */}
        <View style={styles.marginBottom6}>
          <Text
            style={[styles.text3xl, styles.fontBold, styles.textNeutral900, styles.marginBottom2]}
          >
            Design Tokens Debug
          </Text>
          <Text style={[styles.textBase, styles.textNeutral600, styles.marginBottom4]}>
            Interactive guide to understanding how design tokens translate to CSS in React Native
            Web
          </Text>

          {/* Platform indicator */}
          <View
            style={[
              styles.bgInfo50,
              styles.padding3,
              styles.roundedLg,
              styles.border,
              styles.borderInfo200,
            ]}
          >
            <Text style={[styles.textSm, styles.textInfo800]}>
              Platform: {Platform.OS} •
              {Platform.OS === 'web'
                ? ' Browser DevTools available'
                : ' Limited debugging on native'}
            </Text>
          </View>
        </View>

        {/* Inspector Guide */}
        <View style={styles.marginBottom6}>
          <Pressable
            style={[styles.bgPrimary600, styles.padding4, styles.roundedLg]}
            onPress={() => setShowInspectorGuide(!showInspectorGuide)}
          >
            <Text style={[styles.textWhite, styles.fontSemibold, styles.textCenter]}>
              {showInspectorGuide ? 'Hide' : 'Show'} Browser DevTools Guide
            </Text>
          </Pressable>

          {showInspectorGuide && (
            <View
              style={[
                styles.bgNeutral50,
                styles.padding4,
                styles.roundedLg,
                styles.marginTop2,
                styles.border,
                styles.borderNeutral200,
              ]}
            >
              <Text
                style={[
                  styles.textLg,
                  styles.fontSemibold,
                  styles.textNeutral900,
                  styles.marginBottom3,
                ]}
              >
                How to Inspect Tokens in Browser DevTools
              </Text>

              <View>
                <View style={styles.marginBottom3}>
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      styles.textNeutral800,
                      styles.marginBottom1,
                    ]}
                  >
                    1. Open DevTools
                  </Text>
                  <Text style={[styles.textSm, styles.textNeutral600]}>
                    Press F12 or right-click → "Inspect Element"
                  </Text>
                </View>

                <View style={styles.marginBottom3}>
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      styles.textNeutral800,
                      styles.marginBottom1,
                    ]}
                  >
                    2. Inspect Elements
                  </Text>
                  <Text style={[styles.textSm, styles.textNeutral600]}>
                    Click the inspect tool and hover over elements below to see:
                  </Text>
                  <View style={[styles.marginLeft4, styles.marginTop1]}>
                    <Text style={[styles.textXs, styles.textNeutral600]}>
                      • CSS class names generated by Tailwind
                    </Text>
                    <Text style={[styles.textXs, styles.textNeutral600]}>
                      • Computed CSS values from tokens
                    </Text>
                    <Text style={[styles.textXs, styles.textNeutral600]}>
                      • CSS custom properties (variables)
                    </Text>
                  </View>
                </View>

                <View style={styles.marginBottom3}>
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      styles.textNeutral800,
                      styles.marginBottom1,
                    ]}
                  >
                    3. View CSS Variables
                  </Text>
                  <Text style={[styles.textSm, styles.textNeutral600]}>
                    In the Elements panel, look for :root or html to see CSS custom properties like
                    --color-primary-500
                  </Text>
                </View>

                <View>
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      styles.textNeutral800,
                      styles.marginBottom1,
                    ]}
                  >
                    4. Interactive Debug
                  </Text>
                  <Text style={[styles.textSm, styles.textNeutral600]}>
                    Tap any element below to see its token mapping and computed styles
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Category Selector */}
        <View style={styles.marginBottom6}>
          <Text
            style={[
              styles.textLg,
              styles.fontSemibold,
              styles.textNeutral900,
              styles.marginBottom3,
            ]}
          >
            Token Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.flexRow, styles.gap2]}>
              {(
                ['colors', 'spacing', 'fontSize', 'borderRadius', 'shadows'] as TokenCategory[]
              ).map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.paddingHorizontal4,
                    styles.paddingVertical2,
                    styles.roundedLg,
                    styles.border,
                    selectedCategory === category
                      ? [styles.bgPrimary600, styles.borderPrimary600]
                      : [styles.bgWhite, styles.borderNeutral300],
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      selectedCategory === category ? styles.textWhite : styles.textNeutral700,
                    ]}
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
            <Text
              style={[
                styles.textXl,
                styles.fontSemibold,
                styles.textNeutral900,
                styles.marginBottom4,
              ]}
            >
              Color Tokens
            </Text>
            <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
              Tap any color to see how the bg-* class maps to CSS values
            </Text>

            {Object.entries(tokens.colors).map(([colorFamily, shades]) => {
              if (typeof shades === 'string') {
                return (
                  <View key={colorFamily} style={styles.marginBottom4}>
                    <Text
                      style={[
                        styles.textSm,
                        styles.fontMedium,
                        styles.textNeutral700,
                        styles.marginBottom2,
                      ]}
                    >
                      {colorFamily}
                    </Text>
                    <ColorSwatch colorKey={colorFamily} colorValue={shades} />
                  </View>
                );
              }

              return (
                <View key={colorFamily} style={styles.marginBottom6}>
                  <Text
                    style={[
                      styles.textSm,
                      styles.fontMedium,
                      styles.textNeutral700,
                      styles.marginBottom2,
                    ]}
                  >
                    {colorFamily}
                  </Text>
                  <View style={[styles.flexRow, styles.flexWrap, styles.gap2]}>
                    {Object.entries(shades).map(([shade, value]) => (
                      <ColorSwatch
                        key={`${colorFamily}-${shade}`}
                        colorKey={`${colorFamily}-${shade}`}
                        colorValue={value}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {selectedCategory === 'fontSize' && (
          <View>
            <Text
              style={[
                styles.textXl,
                styles.fontSemibold,
                styles.textNeutral900,
                styles.marginBottom4,
              ]}
            >
              Typography Tokens
            </Text>
            <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
              Tap any text to see how text-* classes map to font-size and line-height
            </Text>

            {Object.keys(tokens.fontSize).map((sizeKey) => (
              <TypographyExample key={sizeKey} sizeKey={sizeKey} />
            ))}
          </View>
        )}

        {selectedCategory === 'spacing' && (
          <View>
            <Text
              style={[
                styles.textXl,
                styles.fontSemibold,
                styles.textNeutral900,
                styles.marginBottom4,
              ]}
            >
              Spacing Tokens
            </Text>
            <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
              Tap any square to see how w-* and h-* classes map to pixel values
            </Text>

            <View style={[styles.flexRow, styles.flexWrap, styles.gap4, styles.itemsEnd]}>
              {['1', '2', '4', '6', '8', '10', '12', '16', '20', '24'].map((spaceKey) => (
                <View key={spaceKey} style={styles.itemsCenter}>
                  <SpacingExample spaceKey={spaceKey} />
                  <Text style={[styles.textXs, styles.textNeutral500, styles.marginTop1]}>
                    {tokens.spacing[spaceKey as keyof typeof tokens.spacing]}px
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedCategory === 'borderRadius' && (
          <View>
            <Text
              style={[
                styles.textXl,
                styles.fontSemibold,
                styles.textNeutral900,
                styles.marginBottom4,
              ]}
            >
              Border Radius Tokens
            </Text>
            <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
              Tap any shape to see how rounded-* classes map to border-radius values
            </Text>

            <View style={[styles.flexRow, styles.flexWrap, styles.gap4]}>
              {Object.entries(tokens.borderRadius).map(([radiusKey, radiusValue]) => (
                <TokenExample
                  key={radiusKey}
                  tokenInfo={{
                    category: 'borderRadius',
                    name: radiusKey,
                    value: `${radiusValue}px`,
                    description: `Border radius token: rounded-${radiusKey} = ${radiusValue}px`,
                  }}
                  style={[
                    styles.bgPrimary100,
                    styles.padding6,
                    { borderRadius: radiusKey === 'base' ? 8 : radiusValue },
                    styles.border,
                    styles.borderPrimary300,
                  ]}
                >
                  <Text style={[styles.textXs, styles.textPrimary800, styles.textCenter]}>
                    {radiusKey}
                  </Text>
                  <Text style={[styles.textXs, styles.textPrimary600, styles.textCenter]}>
                    {radiusValue}px
                  </Text>
                </TokenExample>
              ))}
            </View>
          </View>
        )}

        {selectedCategory === 'shadows' && (
          <View>
            <Text
              style={[
                styles.textXl,
                styles.fontSemibold,
                styles.textNeutral900,
                styles.marginBottom4,
              ]}
            >
              Shadow Tokens
            </Text>
            <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
              Tap any card to see how shadow-* classes map to box-shadow values
            </Text>

            <View style={styles.gap4}>
              {Object.entries(tokens.shadows).map(([shadowKey, shadowValue]) => {
                const shadowStyle = shadowKey === 'lg' ? styles.shadowLg : {};

                return (
                  <TokenExample
                    key={shadowKey}
                    tokenInfo={{
                      category: 'shadows',
                      name: shadowKey,
                      value: shadowValue,
                      description: `Shadow token: shadow-${shadowKey} maps to elevation and box-shadow`,
                    }}
                    style={[styles.bgWhite, styles.padding6, styles.roundedLg, shadowStyle]}
                  >
                    <Text style={[styles.textSm, styles.fontMedium, styles.textNeutral900]}>
                      shadow-{shadowKey}
                    </Text>
                    <Text style={[styles.textXs, styles.textNeutral600]}>
                      elevation: {shadowValue.elevation}
                    </Text>
                  </TokenExample>
                );
              })}
            </View>
          </View>
        )}

        {/* CSS Variables Section */}
        <View style={[styles.marginTop8, styles.marginBottom6]}>
          <Text
            style={[
              styles.textXl,
              styles.fontSemibold,
              styles.textNeutral900,
              styles.marginBottom4,
            ]}
          >
            CSS Variables Mapping
          </Text>
          <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
            How tokens become CSS custom properties in the browser
          </Text>

          <View style={[styles.bgNeutral900, styles.padding4, styles.roundedLg]}>
            <Text
              style={[styles.textGreen400, styles.textXs, styles.fontMono, styles.marginBottom2]}
            >
              /* Tailwind generates CSS variables from tokens */
            </Text>
            <Text style={[styles.textWhite, styles.textXs, styles.fontMono, styles.marginBottom1]}>
              :root {'{'}
            </Text>
            <Text
              style={[
                styles.textBlue400,
                styles.textXs,
                styles.fontMono,
                styles.marginLeft4,
                styles.marginBottom1,
              ]}
            >
              --color-primary-500: #3b82f6;
            </Text>
            <Text
              style={[
                styles.textBlue400,
                styles.textXs,
                styles.fontMono,
                styles.marginLeft4,
                styles.marginBottom1,
              ]}
            >
              --spacing-4: 16px;
            </Text>
            <Text
              style={[
                styles.textBlue400,
                styles.textXs,
                styles.fontMono,
                styles.marginLeft4,
                styles.marginBottom1,
              ]}
            >
              --font-size-lg: 18px;
            </Text>
            <Text style={[styles.textWhite, styles.textXs, styles.fontMono, styles.marginBottom2]}>
              {'}'}
            </Text>
            <Text
              style={[styles.textGreen400, styles.textXs, styles.fontMono, styles.marginBottom2]}
            >
              /* Classes use the variables */
            </Text>
            <Text
              style={[styles.textYellow400, styles.textXs, styles.fontMono, styles.marginBottom1]}
            >
              .bg-primary-500 {'{'}
            </Text>
            <Text
              style={[
                styles.textBlue400,
                styles.textXs,
                styles.fontMono,
                styles.marginLeft4,
                styles.marginBottom1,
              ]}
            >
              background-color: var(--color-primary-500);
            </Text>
            <Text style={[styles.textYellow400, styles.textXs, styles.fontMono]}>{'}'}</Text>
          </View>
        </View>

        {/* Interactive Example */}
        <View style={styles.marginBottom8}>
          <Text
            style={[
              styles.textXl,
              styles.fontSemibold,
              styles.textNeutral900,
              styles.marginBottom4,
            ]}
          >
            Interactive Token Example
          </Text>
          <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
            A complex component showing multiple tokens working together
          </Text>

          <TokenExample
            tokenInfo={{
              category: 'colors',
              name: 'complex-card',
              value: 'Multiple tokens combined',
              description:
                'Card component using background, shadow, border-radius, padding, and border tokens',
            }}
            style={[
              styles.bgWhite,
              styles.shadowLg,
              styles.roundedXl,
              styles.padding6,
              styles.border,
              styles.borderNeutral200,
            ]}
          >
            <View style={styles.marginBottom4}>
              <Text
                style={[
                  styles.textXl,
                  styles.fontBold,
                  styles.textNeutral900,
                  styles.marginBottom2,
                ]}
              >
                Interactive Card
              </Text>
              <Text style={[styles.textSm, styles.textNeutral600, styles.marginBottom4]}>
                This card uses multiple design tokens:
              </Text>
              <View>
                <Text style={[styles.textXs, styles.textNeutral500]}>• bg-white (background)</Text>
                <Text style={[styles.textXs, styles.textNeutral500]}>• shadow-lg (elevation)</Text>
                <Text style={[styles.textXs, styles.textNeutral500]}>
                  • rounded-xl (border-radius)
                </Text>
                <Text style={[styles.textXs, styles.textNeutral500]}>• p-6 (padding)</Text>
                <Text style={[styles.textXs, styles.textNeutral500]}>
                  • border border-neutral-200 (border)
                </Text>
              </View>
            </View>

            <View style={[styles.flexRow, styles.gap2]}>
              <View
                style={[
                  styles.bgPrimary500,
                  styles.paddingHorizontal3,
                  styles.paddingVertical1,
                  styles.roundedFull,
                ]}
              >
                <Text style={[styles.textWhite, styles.textXs, styles.fontMedium]}>Primary</Text>
              </View>
              <View
                style={[
                  styles.bgSuccess500,
                  styles.paddingHorizontal3,
                  styles.paddingVertical1,
                  styles.roundedFull,
                ]}
              >
                <Text style={[styles.textWhite, styles.textXs, styles.fontMedium]}>Success</Text>
              </View>
              <View
                style={[
                  styles.bgWarning500,
                  styles.paddingHorizontal3,
                  styles.paddingVertical1,
                  styles.roundedFull,
                ]}
              >
                <Text style={[styles.textWhite, styles.textXs, styles.fontMedium]}>Warning</Text>
              </View>
            </View>
          </TokenExample>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.bgNeutral50,
            styles.padding4,
            styles.roundedLg,
            styles.border,
            styles.borderNeutral200,
          ]}
        >
          <Text
            style={[styles.textSm, styles.fontMedium, styles.textNeutral900, styles.marginBottom2]}
          >
            Pro Tips for Token Debugging:
          </Text>
          <View>
            <Text style={[styles.textXs, styles.textNeutral600]}>
              • Use browser DevTools to inspect generated CSS classes
            </Text>
            <Text style={[styles.textXs, styles.textNeutral600]}>
              • Check the :root element for CSS custom properties
            </Text>
            <Text style={[styles.textXs, styles.textNeutral600]}>
              • Tokens are defined in packages/tokens/src/tokens.ts
            </Text>
            <Text style={[styles.textXs, styles.textNeutral600]}>
              • Tailwind config extends theme with tokens in tailwind.config.js
            </Text>
            <Text style={[styles.textXs, styles.textNeutral600]}>
              • React Native Web converts styles to CSS automatically
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
