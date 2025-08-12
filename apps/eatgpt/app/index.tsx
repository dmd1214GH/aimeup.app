import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EatGPT</Text>
      <Text style={styles.subtitle}>React Native + Web App</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="View Kitchen Sink"
          onPress={() => router.push('/kitchensink')}
          color="#841584"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonContainer: {
    marginVertical: 10,
    minWidth: 200,
  },
});