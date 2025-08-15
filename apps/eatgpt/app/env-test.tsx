import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getEnv } from '@aimeup/config';

export default function EnvTestScreen() {
  let env: any = {};
  let error: string | null = null;

  try {
    env = getEnv();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Environment Variables Test
      </Text>

      {error ? (
        <View style={{ backgroundColor: '#fee', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: '#c00' }}>Error: {error}</Text>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Loaded Environment:
          </Text>

          <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 5 }}>
            <Text>NODE_ENV: {env.NODE_ENV}</Text>
            <Text>API_URL: {env.EXPO_PUBLIC_API_URL || 'Not set'}</Text>
            <Text>
              OPENAI_KEY: {env.EXPO_PUBLIC_OPENAI_API_KEY ? '***configured***' : 'Not set'}
            </Text>
            <Text>PREAUTH_MODE: {String(env.EXPO_PUBLIC_PREAUTH_MODE)}</Text>
            <Text>LOG_LEVEL: {env.EXPO_PUBLIC_LOG_LEVEL}</Text>
            <Text>FIREBASE_PROJECT: {env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
            Raw Process Env (Web only):
          </Text>

          <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 5 }}>
            <Text style={{ fontSize: 12 }}>
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
    </ScrollView>
  );
}
