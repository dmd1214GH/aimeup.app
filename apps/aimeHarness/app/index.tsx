import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'react-native-elements';
import { tokens } from '@aimeup/tokens';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text h1 style={styles.title} testID="home.title.text">
        aimeHarness
      </Text>
      <Text style={styles.subtitle} testID="home.subtitle.text">
        React Native + Web App
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.push('/kitchensink')}
          style={[styles.button, styles.primaryButton]}
          testID="home.navigate.kitchensink"
        >
          <Text style={styles.buttonTitle}>View Kitchen Sink</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.push('/tokens-debug')}
          style={[styles.button, styles.infoButton]}
          testID="home.navigate.tokens"
        >
          <Text style={styles.buttonTitle}>Tokens Debug Guide</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.push('/env-test')}
          style={[styles.button, styles.successButton]}
          testID="home.navigate.envtest"
        >
          <Text style={styles.buttonTitle}>Test Environment Variables</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.push('/env-error-demo')}
          style={[styles.button, styles.dangerButton]}
          testID="home.navigate.enverror"
        >
          <Text style={styles.buttonTitle}>Environment Error Demo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.white as string,
    padding: tokens.spacing[5],
  },
  title: {
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: tokens.fontSize.base.size,
    color: (tokens.colors.neutral as any)[600],
    marginTop: tokens.spacing[2],
    marginBottom: tokens.spacing[8],
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: tokens.spacing[2.5],
    minWidth: 200,
  },
  button: {
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Ensure minimum touch target size
  },
  buttonTitle: {
    fontSize: tokens.fontSize.base.size,
    fontWeight: tokens.fontWeight.semibold as any,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#841584',
  },
  infoButton: {
    backgroundColor: (tokens.colors.info as any)[500],
  },
  successButton: {
    backgroundColor: (tokens.colors.success as any)[500],
  },
  dangerButton: {
    backgroundColor: (tokens.colors.danger as any)[500],
  },
});
