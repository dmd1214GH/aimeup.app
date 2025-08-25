import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@aimeup/core-react';
import { setComposerOpen, setTheme } from '@aimeup/core-react';
import {
  buttonVariants,
  buttonSizes,
  cardVariants,
  tokens,
  getColorToken,
  getFontWeightForRN,
} from '@aimeup/tokens';

export default function KitchenSinkScreen() {
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [multilineValue, setMultilineValue] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { composerOpen, theme } = useSelector((state: RootState) => state.ui);

  // Log Redux state changes
  console.log('Redux State:', { composerOpen, theme });

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Helper function to merge button styles
  const getButtonStyle = (variant: keyof typeof buttonVariants, size: keyof typeof buttonSizes) => {
    return {
      buttonStyle: [buttonVariants[variant].buttonStyle, buttonSizes[size].buttonStyle],
      titleStyle: [buttonVariants[variant].titleStyle, buttonSizes[size].titleStyle],
    };
  };

  return (
    <ScrollView style={styles.container} testID="kitchenSink.screen.scrollView">
      <View style={styles.content}>
        <View
          style={[styles.card, cardVariants.elevated.containerStyle]}
          testID="kitchenSink.intro.card"
        >
          <Text style={styles.title} testID="kitchenSink.intro.title">
            Kitchen Sink - UI Components Demo
          </Text>
          <Text style={styles.subtitle} testID="kitchenSink.intro.subtitle">
            This screen showcases React Native Elements components with theme configuration from
            @aimeup/tokens and demonstrates Redux state management.
          </Text>
        </View>

        <View style={styles.card} testID="kitchenSink.buttonVariants.card">
          <Text style={styles.sectionTitle} testID="kitchenSink.buttonVariants.title">
            Button Variants
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Primary Button"
              onPress={() => Alert.alert('Primary pressed')}
              buttonStyle={buttonVariants.primary.buttonStyle}
              titleStyle={buttonVariants.primary.titleStyle}
              testID="kitchenSink.buttonVariants.primary"
            />
            <Button
              title="Secondary Button"
              onPress={() => Alert.alert('Secondary pressed')}
              buttonStyle={buttonVariants.secondary.buttonStyle}
              titleStyle={buttonVariants.secondary.titleStyle}
              testID="kitchenSink.buttonVariants.secondary"
            />
            <Button
              title="Outline Button"
              onPress={() => Alert.alert('Outline pressed')}
              buttonStyle={buttonVariants.outline.buttonStyle}
              titleStyle={buttonVariants.outline.titleStyle}
              testID="kitchenSink.buttonVariants.outline"
            />
            <Button
              title="Loading Button"
              onPress={handleLoadingDemo}
              loading={loading}
              buttonStyle={buttonVariants.primary.buttonStyle}
              titleStyle={buttonVariants.primary.titleStyle}
              testID="kitchenSink.buttonVariants.loading"
            />
            <Button
              title="Disabled Button"
              onPress={() => {}}
              disabled={true}
              buttonStyle={buttonVariants.primary.buttonStyle}
              titleStyle={buttonVariants.primary.titleStyle}
              testID="kitchenSink.buttonVariants.disabled"
            />
          </View>
        </View>

        <View style={styles.card} testID="kitchenSink.buttonSizes.card">
          <Text style={styles.sectionTitle} testID="kitchenSink.buttonSizes.title">
            Button Sizes
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Small Button"
              onPress={() => {}}
              {...getButtonStyle('primary', 'sm')}
              testID="kitchenSink.buttonSizes.small"
            />
            <Button
              title="Medium Button"
              onPress={() => {}}
              {...getButtonStyle('primary', 'md')}
              testID="kitchenSink.buttonSizes.medium"
            />
            <Button
              title="Large Button"
              onPress={() => {}}
              {...getButtonStyle('primary', 'lg')}
              testID="kitchenSink.buttonSizes.large"
            />
          </View>
        </View>

        <View style={styles.card} testID="kitchenSink.inputs.card">
          <Text style={styles.sectionTitle} testID="kitchenSink.inputs.title">
            Input Components
          </Text>
          <View style={styles.inputContainer}>
            <Input
              label="Basic Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text..."
              containerStyle={styles.inputWrapper}
              testID="kitchenSink.inputs.basic"
            />
            <Input
              label="Password Input"
              value={passwordValue}
              onChangeText={setPasswordValue}
              placeholder="Enter password..."
              secureTextEntry={true}
              containerStyle={styles.inputWrapper}
              testID="kitchenSink.inputs.password"
            />
            <Input
              label="Input with Error"
              value={errorValue}
              onChangeText={setErrorValue}
              placeholder="This has an error..."
              errorMessage="This field is required"
              containerStyle={styles.inputWrapper}
              testID="kitchenSink.inputs.error"
            />
            <Input
              label="Multiline Input"
              value={multilineValue}
              onChangeText={setMultilineValue}
              placeholder="Enter multiple lines..."
              multiline={true}
              numberOfLines={3}
              containerStyle={styles.inputWrapper}
              testID="kitchenSink.inputs.multiline"
            />
          </View>
        </View>

        <View style={styles.card} testID="kitchenSink.cardVariants.card">
          <Text style={styles.sectionTitle} testID="kitchenSink.cardVariants.title">
            Card Variants
          </Text>
          <View style={styles.cardVariantsContainer}>
            <View
              style={[styles.variantCard, cardVariants.default.containerStyle]}
              testID="kitchenSink.cardVariants.default"
            >
              <Text style={styles.cardText}>Default Card</Text>
            </View>
            <View
              style={[styles.variantCard, cardVariants.elevated.containerStyle]}
              testID="kitchenSink.cardVariants.elevated"
            >
              <Text style={styles.cardText}>Elevated Card (with shadow)</Text>
            </View>
            <View
              style={[styles.variantCard, cardVariants.outlined.containerStyle]}
              testID="kitchenSink.cardVariants.outlined"
            >
              <Text style={styles.cardText}>Outlined Card (with border)</Text>
            </View>
          </View>
        </View>

        <View style={styles.card} testID="kitchenSink.redux.card">
          <Text style={styles.sectionTitle} testID="kitchenSink.redux.title">
            Redux State Demo
          </Text>
          <View style={styles.reduxContainer}>
            <Text style={styles.stateText} testID="kitchenSink.redux.composerState">
              Composer Open: {composerOpen ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.stateText} testID="kitchenSink.redux.themeState">
              Theme: {theme}
            </Text>

            <View style={styles.infoBox} testID="kitchenSink.redux.infoBox">
              <Text style={styles.infoText}>💡 Tap buttons below and watch the state change!</Text>
            </View>

            <Button
              title={composerOpen ? 'Close Composer' : 'Open Composer'}
              onPress={() => dispatch(setComposerOpen(!composerOpen))}
              buttonStyle={buttonVariants.outline.buttonStyle}
              titleStyle={buttonVariants.outline.titleStyle}
              testID="kitchenSink.redux.composerToggle"
            />

            <View style={styles.themeButtonRow}>
              <Button
                title="Light"
                onPress={() => dispatch(setTheme('light'))}
                {...getButtonStyle(theme === 'light' ? 'primary' : 'outline', 'sm')}
                containerStyle={styles.themeButton}
                testID="kitchenSink.redux.lightTheme"
              />
              <Button
                title="Dark"
                onPress={() => dispatch(setTheme('dark'))}
                {...getButtonStyle(theme === 'dark' ? 'primary' : 'outline', 'sm')}
                containerStyle={styles.themeButton}
                testID="kitchenSink.redux.darkTheme"
              />
              <Button
                title="System"
                onPress={() => dispatch(setTheme('system'))}
                {...getButtonStyle(theme === 'system' ? 'primary' : 'outline', 'sm')}
                containerStyle={styles.themeButton}
                testID="kitchenSink.redux.systemTheme"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColorToken('neutral', 50),
  },
  content: {
    padding: tokens.spacing[4],
  },
  card: {
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
    backgroundColor: getColorToken('white'),
  },
  title: {
    fontSize: tokens.fontSize.xl.size,
    fontWeight: getFontWeightForRN('bold'),
    color: getColorToken('neutral', 900),
    marginBottom: tokens.spacing[4],
  },
  subtitle: {
    fontSize: tokens.fontSize.base.size,
    color: getColorToken('neutral', 600),
    lineHeight: tokens.fontSize.base.lineHeight,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.lg.size,
    fontWeight: getFontWeightForRN('semibold'),
    color: getColorToken('neutral', 900),
    marginBottom: tokens.spacing[3],
  },
  buttonContainer: {
    gap: tokens.spacing[3],
  },
  inputContainer: {
    gap: tokens.spacing[2],
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  cardVariantsContainer: {
    gap: tokens.spacing[3],
  },
  variantCard: {
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[3],
    margin: 0,
  },
  cardText: {
    fontSize: tokens.fontSize.base.size,
    color: getColorToken('neutral', 900),
  },
  reduxContainer: {
    gap: tokens.spacing[3],
  },
  stateText: {
    fontSize: tokens.fontSize.base.size,
    color: getColorToken('neutral', 600),
  },
  infoBox: {
    marginTop: tokens.spacing[2],
    padding: tokens.spacing[2],
    backgroundColor: getColorToken('primary', 50),
    borderRadius: tokens.borderRadius.md,
  },
  infoText: {
    fontSize: tokens.fontSize.xs.size,
    color: getColorToken('primary', 800),
  },
  themeButtonRow: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
  },
  themeButton: {
    flex: 1,
  },
});
