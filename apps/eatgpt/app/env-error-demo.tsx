import React, { useState } from 'react';
import { View, Text, ScrollView, Button, TextInput } from 'react-native';
import { validateEnv, EnvValidationError } from '@aimeup/config';

export default function EnvErrorDemoScreen() {
  const [testResult, setTestResult] = useState<string>('');
  const [customEnv, setCustomEnv] = useState<string>(JSON.stringify({
    NODE_ENV: "development",
    EXPO_PUBLIC_API_URL: "http://localhost:3000",
    EXPO_PUBLIC_LOG_LEVEL: "debug"
  }, null, 2));

  const runValidationTest = (envConfig: Record<string, any>, description: string) => {
    try {
      const result = validateEnv(envConfig);
      setTestResult(`✅ ${description}\n\nValidation PASSED\n\nResult:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      if (error instanceof EnvValidationError) {
        setTestResult(`❌ ${description}\n\nValidation FAILED\n\n${error.message}`);
      } else {
        setTestResult(`❌ ${description}\n\nUnexpected error:\n${error}`);
      }
    }
  };

  const testScenarios = [
    {
      name: "Valid Configuration",
      config: {
        NODE_ENV: "development",
        EXPO_PUBLIC_API_URL: "http://localhost:3000",
        EXPO_PUBLIC_LOG_LEVEL: "debug",
        EXPO_PUBLIC_PREAUTH_MODE: "true"
      }
    },
    {
      name: "Invalid NODE_ENV",
      config: {
        NODE_ENV: "staging", // Invalid - must be development/test/production
        EXPO_PUBLIC_API_URL: "http://localhost:3000"
      }
    },
    {
      name: "Invalid URL Format",
      config: {
        NODE_ENV: "development",
        EXPO_PUBLIC_API_URL: "not-a-valid-url" // Invalid URL
      }
    },
    {
      name: "Invalid Log Level",
      config: {
        NODE_ENV: "development",
        EXPO_PUBLIC_LOG_LEVEL: "super-verbose" // Invalid - not in enum
      }
    },
    {
      name: "Multiple Errors",
      config: {
        NODE_ENV: "invalid-mode",
        EXPO_PUBLIC_API_URL: "ftp://wrong",
        EXPO_PUBLIC_LOG_LEVEL: "verbose",
        EXPO_PUBLIC_OPENAI_API_KEY: "" // Empty string when should have content
      }
    }
  ];

  const runCustomTest = () => {
    try {
      const parsed = JSON.parse(customEnv);
      runValidationTest(parsed, "Custom Configuration");
    } catch (e) {
      setTestResult(`❌ Invalid JSON:\n${e}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Environment Validation Error Demo
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Click any button below to test different validation scenarios:
      </Text>

      <View style={{ marginBottom: 20 }}>
        {testScenarios.map((scenario, index) => (
          <View key={index} style={{ marginVertical: 5 }}>
            <Button
              title={scenario.name}
              onPress={() => runValidationTest(scenario.config, scenario.name)}
              color={scenario.name.includes("Valid") ? "#22c55e" : "#ef4444"}
            />
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>
        Custom Test:
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
          marginTop: 10,
          marginBottom: 10,
          minHeight: 150,
          fontFamily: 'monospace',
          fontSize: 12,
        }}
        multiline
        value={customEnv}
        onChangeText={setCustomEnv}
      />
      
      <Button
        title="Test Custom Configuration"
        onPress={runCustomTest}
        color="#3b82f6"
      />

      {testResult && (
        <View style={{ 
          marginTop: 20, 
          padding: 15, 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: 5,
          borderWidth: 1,
          borderColor: testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'
        }}>
          <Text style={{ 
            fontFamily: 'monospace', 
            fontSize: 12,
            color: testResult.includes('✅') ? '#155724' : '#721c24'
          }}>
            {testResult}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}