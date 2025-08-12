import { View, Text } from "react-native";

export default function HomePage() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold text-gray-900">EatGPT</Text>
      <Text className="text-base text-gray-600 mt-2">React Native + Web App</Text>
    </View>
  );
}