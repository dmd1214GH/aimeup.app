import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { cssInterop } from 'react-native-css-interop';

// Register all React Native components that need className support
cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(ActivityIndicator, { className: 'style' });