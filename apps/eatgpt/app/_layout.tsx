import "../global.css";
import { Stack } from "expo-router";
import { AppProviders } from "@aimeup/core-react";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ title: "EatGPT" }} />
        <Stack.Screen name="kitchensink" options={{ title: "Kitchen Sink" }} />
      </Stack>
    </AppProviders>
  );
}