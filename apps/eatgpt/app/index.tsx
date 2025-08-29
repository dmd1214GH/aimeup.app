import { Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    console.log('Increment button clicked! Count before:', count);
    // Set a breakpoint on the next line to test debugging
    setCount((prevCount) => prevCount + 1);
    console.log('Count after increment:', count + 1);
  };

  const handleDecrement = () => {
    console.log('Decrement button clicked! Count before:', count);
    // Set a breakpoint on the next line to test debugging
    setCount((prevCount) => prevCount - 1);
    console.log('Count after decrement:', count - 1);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text testID="hello-world-text">Hello World</Text>
      <Text style={{ fontSize: 24, marginVertical: 20 }}>Count: {count}</Text>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <TouchableOpacity
          onPress={handleIncrement}
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDecrement}
          style={{
            backgroundColor: '#FF3B30',
            padding: 15,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
