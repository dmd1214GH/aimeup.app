import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { getEnv } from '@aimeup/config';
import { tokens } from '@aimeup/tokens';

export default function EnvTestScreen() {
  let env: any = {};
  let error: string | null = null;

  try {
    env = getEnv();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text h1 style={styles.title} testID="env-test.title.text">
          Environment Variables Test
        </Text>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText} testID="env-test.error.text">
              Error: {error}
            </Text>
          </View>
        ) : (
          <View>
            <Text h3 style={styles.sectionTitle} testID="env-test.loaded-env.title">
              Loaded Environment:
            </Text>

            <View style={styles.envCard}>
              <Text style={styles.envItem} testID="env-test.node-env.value">
                NODE_ENV: {env.NODE_ENV}
              </Text>
              <Text style={styles.envItem} testID="env-test.api-url.value">
                API_URL: {env.EXPO_PUBLIC_API_URL || 'Not set'}
              </Text>
              <Text style={styles.envItem} testID="env-test.openai-key.value">
                OPENAI_KEY: {env.EXPO_PUBLIC_OPENAI_API_KEY ? '***configured***' : 'Not set'}
              </Text>
              <Text style={styles.envItem} testID="env-test.preauth-mode.value">
                PREAUTH_MODE: {String(env.EXPO_PUBLIC_PREAUTH_MODE)}
              </Text>
              <Text style={styles.envItem} testID="env-test.log-level.value">
                LOG_LEVEL: {env.EXPO_PUBLIC_LOG_LEVEL}
              </Text>
              <Text style={styles.envItem} testID="env-test.firebase-project.value">
                FIREBASE_PROJECT: {env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
              </Text>
            </View>

            <Text h3 style={styles.sectionTitle} testID="env-test.raw-env.title">
              Raw Process Env (Web only):
            </Text>

            <View style={styles.rawEnvCard}>
              <Text style={styles.rawEnvText} testID="env-test.raw-env.content">
                {JSON.stringify(
                  typeof process !== 'undefined' && process.env
                    ? Object.keys(process.env)
                        .filter((key) => key.startsWith('EXPO_PUBLIC_') || key === 'NODE_ENV')
                        .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {})
                    : 'N/A on native',
                  null,
                  2
                )}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white as string,
  },
  content: {
    padding: tokens.spacing[5],
  },
  title: {
    marginBottom: tokens.spacing[5],
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: tokens.spacing[5],
    marginBottom: tokens.spacing[3],
  },
  errorCard: {
    backgroundColor: (tokens.colors.danger as any)[50],
    borderColor: (tokens.colors.danger as any)[200],
    borderWidth: tokens.borderWidth[1],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[3],
  },
  errorText: {
    color: (tokens.colors.danger as any)[700],
    fontSize: tokens.fontSize.base.size,
  },
  envCard: {
    backgroundColor: (tokens.colors.neutral as any)[50],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  },
  envItem: {
    fontSize: tokens.fontSize.base.size,
    color: (tokens.colors.neutral as any)[900],
    marginBottom: tokens.spacing[2],
    fontFamily: 'monospace',
  },
  rawEnvCard: {
    backgroundColor: (tokens.colors.neutral as any)[50],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[3],
  },
  rawEnvText: {
    fontSize: tokens.fontSize.sm.size,
    color: (tokens.colors.neutral as any)[700],
    fontFamily: 'monospace',
  },
});
