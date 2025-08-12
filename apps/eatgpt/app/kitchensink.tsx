import React, { useState } from 'react'
import { ScrollView, View, Text } from 'react-native'
import { Button, Input, Card } from '@aimeup/ui-native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@aimeup/core-react'
import { setComposerOpen, setTheme } from '@aimeup/core-react'

export default function KitchenSinkScreen() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  
  const dispatch = useDispatch()
  const { composerOpen, theme } = useSelector((state: RootState) => state.ui)
  
  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-6">
        
        <Card variant="elevated">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Kitchen Sink - UI Components Demo
          </Text>
          <Text className="text-gray-600">
            This screen showcases core @aimeup/ui-native components with various states and interactions.
          </Text>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Button Variants
          </Text>
          <View className="space-y-3">
            <Button
              title="Primary Button"
              onPress={() => alert('Primary pressed')}
              variant="primary"
            />
            <Button
              title="Secondary Button"
              onPress={() => alert('Secondary pressed')}
              variant="secondary"
            />
            <Button
              title="Outline Button"
              onPress={() => alert('Outline pressed')}
              variant="outline"
            />
            <Button
              title="Loading Button"
              onPress={handleLoadingDemo}
              loading={loading}
              variant="primary"
            />
            <Button
              title="Disabled Button"
              onPress={() => {}}
              disabled={true}
            />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Button Sizes
          </Text>
          <View className="space-y-3">
            <Button title="Small Button" size="sm" onPress={() => {}} />
            <Button title="Medium Button" size="md" onPress={() => {}} />
            <Button title="Large Button" size="lg" onPress={() => {}} />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Input Components
          </Text>
          <View className="space-y-4">
            <Input
              label="Basic Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text..."
            />
            <Input
              label="Password Input"
              value=""
              onChangeText={() => {}}
              placeholder="Enter password..."
              secureTextEntry={true}
            />
            <Input
              label="Input with Error"
              value=""
              onChangeText={() => {}}
              placeholder="This has an error..."
              error="This field is required"
            />
            <Input
              label="Multiline Input"
              value=""
              onChangeText={() => {}}
              placeholder="Enter multiple lines..."
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Card Variants
          </Text>
          <View className="space-y-3">
            <Card variant="default">
              <Text className="text-gray-900">Default Card</Text>
            </Card>
            <Card variant="elevated">
              <Text className="text-gray-900">Elevated Card (with shadow)</Text>
            </Card>
            <Card variant="outlined">
              <Text className="text-gray-900">Outlined Card (with border)</Text>
            </Card>
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Redux State Demo
          </Text>
          <View className="space-y-3">
            <Text className="text-gray-600">
              Composer Open: {composerOpen ? 'Yes' : 'No'}
            </Text>
            <Text className="text-gray-600">
              Theme: {theme}
            </Text>
            <Button
              title={composerOpen ? 'Close Composer' : 'Open Composer'}
              onPress={() => dispatch(setComposerOpen(!composerOpen))}
              variant="outline"
            />
            <View className="flex-row space-x-2">
              <Button
                title="Light"
                onPress={() => dispatch(setTheme('light'))}
                variant={theme === 'light' ? 'primary' : 'outline'}
                size="sm"
              />
              <Button
                title="Dark"
                onPress={() => dispatch(setTheme('dark'))}
                variant={theme === 'dark' ? 'primary' : 'outline'}
                size="sm"
              />
              <Button
                title="System"
                onPress={() => dispatch(setTheme('system'))}
                variant={theme === 'system' ? 'primary' : 'outline'}
                size="sm"
              />
            </View>
          </View>
        </Card>

      </View>
    </ScrollView>
  )
}