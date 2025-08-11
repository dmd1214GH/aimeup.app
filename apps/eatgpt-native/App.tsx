import React from "react";
import "./global.css";
import { Providers } from "@aimeup/core-react";
import { View, Text } from "react-native";

export default function App() {
  return (
    <Providers>
      <View className="flex-1 items-center justify-center">
        <Text>Native is wired.</Text>
      </View>
    </Providers>
  );
}
