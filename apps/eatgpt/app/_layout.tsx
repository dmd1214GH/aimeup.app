import '../global.css';
import { Stack } from 'expo-router';
import { AppProviders } from '@aimeup/core-react';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'EatGPT' }} />
        <Stack.Screen name="kitchensink" options={{ title: 'Kitchen Sink' }} />
        <Stack.Screen name="tokens-debug" options={{ title: 'Tokens Debug' }} />
        <Stack.Screen name="env-test" options={{ title: 'Environment Test' }} />
        <Stack.Screen name="env-error-demo" options={{ title: 'Env Error Demo' }} />
      </Stack>
    </AppProviders>
  );
}
