import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text testID="hello-world-text">Hello World</Text>
    </View>
  );
}
