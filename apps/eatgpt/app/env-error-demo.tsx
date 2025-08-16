import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Button, Input } from 'react-native-elements';
import { validateEnv, EnvValidationError } from '@aimeup/config';
import { tokens, getColorToken, getFontWeightForRN } from '@aimeup/tokens';

export default function EnvErrorDemoScreen() {
  const [testResult, setTestResult] = useState<string>('');
  const [customEnv, setCustomEnv] = useState<string>(
    JSON.stringify(
      {
        NODE_ENV: 'development',
        EXPO_PUBLIC_API_URL: 'http://localhost:3000',
        EXPO_PUBLIC_LOG_LEVEL: 'debug',
      },
      null,
      2
    )
  );

  const runValidationTest = (envConfig: Record<string, any>, description: string) => {
    try {
      const result = validateEnv(envConfig);
      setTestResult(
        `✅ ${description}\n\nValidation PASSED\n\nResult:\n${JSON.stringify(result, null, 2)}`
      );
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
      name: 'Valid Configuration',
      config: {
        NODE_ENV: 'development',
        EXPO_PUBLIC_API_URL: 'http://localhost:3000',
        EXPO_PUBLIC_LOG_LEVEL: 'debug',
        EXPO_PUBLIC_PREAUTH_MODE: 'true',
      },
    },
    {
      name: 'Invalid NODE_ENV',
      config: {
        NODE_ENV: 'staging', // Invalid - must be development/test/production
        EXPO_PUBLIC_API_URL: 'http://localhost:3000',
      },
    },
    {
      name: 'Invalid URL Format',
      config: {
        NODE_ENV: 'development',
        EXPO_PUBLIC_API_URL: 'not-a-valid-url', // Invalid URL
      },
    },
    {
      name: 'Invalid Log Level',
      config: {
        NODE_ENV: 'development',
        EXPO_PUBLIC_LOG_LEVEL: 'super-verbose', // Invalid - not in enum
      },
    },
    {
      name: 'Multiple Errors',
      config: {
        NODE_ENV: 'invalid-mode',
        EXPO_PUBLIC_API_URL: 'ftp://wrong',
        EXPO_PUBLIC_LOG_LEVEL: 'verbose',
        EXPO_PUBLIC_OPENAI_API_KEY: '', // Empty string when should have content
      },
    },
  ];

  const runCustomTest = () => {
    try {
      const parsed = JSON.parse(customEnv);
      runValidationTest(parsed, 'Custom Configuration');
    } catch (e) {
      setTestResult(`❌ Invalid JSON:\n${e}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text h1 style={styles.title} testID="env-error-demo.title.text">
          Environment Validation Error Demo
        </Text>

        <Text style={styles.description} testID="env-error-demo.description.text">
          Click any button below to test different validation scenarios:
        </Text>

        <View style={styles.buttonContainer}>
          {testScenarios.map((scenario, index) => (
            <View key={index} style={styles.buttonWrapper}>
              <Button
                title={scenario.name}
                onPress={() => runValidationTest(scenario.config, scenario.name)}
                buttonStyle={[
                  styles.testButton,
                  scenario.name.includes('Valid') ? styles.successButton : styles.errorButton,
                ]}
                titleStyle={styles.buttonTitle}
                testID={`env-error-demo.test.${scenario.name.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </View>
          ))}
        </View>

        <Text h3 style={styles.customTestTitle}>
          Custom Test:
        </Text>

        <Input
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.input}
          multiline
          value={customEnv}
          onChangeText={setCustomEnv}
          testID="env-error-demo.custom-input.field"
        />

        <Button
          title="Test Custom Configuration"
          onPress={runCustomTest}
          buttonStyle={[styles.testButton, styles.primaryButton]}
          titleStyle={styles.buttonTitle}
          testID="env-error-demo.test.custom"
        />

        {testResult && (
          <View
            style={[
              styles.resultCard,
              testResult.includes('✅') ? styles.successCard : styles.errorCard,
            ]}
          >
            <Text
              style={[
                styles.resultText,
                {
                  color: testResult.includes('✅')
                    ? getColorToken('success', 700)
                    : getColorToken('danger', 700),
                },
              ]}
              testID="env-error-demo.result.text"
            >
              {testResult}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColorToken('white'),
  },
  content: {
    padding: tokens.spacing[5],
  },
  title: {
    marginBottom: tokens.spacing[5],
    textAlign: 'center',
  },
  description: {
    fontSize: tokens.fontSize.base.size,
    color: getColorToken('neutral', 600),
    marginBottom: tokens.spacing[5],
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: tokens.spacing[5],
  },
  buttonWrapper: {
    marginVertical: tokens.spacing[1.5],
  },
  testButton: {
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
  },
  buttonTitle: {
    fontSize: tokens.fontSize.base.size,
    fontWeight: getFontWeightForRN('semibold'),
  },
  successButton: {
    backgroundColor: getColorToken('success', 500),
  },
  errorButton: {
    backgroundColor: getColorToken('danger', 500),
  },
  primaryButton: {
    backgroundColor: getColorToken('primary', 600),
  },
  customTestTitle: {
    marginTop: tokens.spacing[5],
    marginBottom: tokens.spacing[3],
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: tokens.spacing[4],
  },
  inputInnerContainer: {
    borderWidth: tokens.borderWidth[1],
    borderColor: getColorToken('neutral', 300),
    borderRadius: tokens.borderRadius.base,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    minHeight: 150,
    borderBottomWidth: tokens.borderWidth[1],
  },
  input: {
    fontSize: tokens.fontSize.sm.size,
    fontFamily: 'monospace',
    color: getColorToken('neutral', 900),
    textAlignVertical: 'top',
  },
  resultCard: {
    marginTop: tokens.spacing[5],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
  },
  successCard: {
    backgroundColor: getColorToken('success', 50),
    borderColor: getColorToken('success', 200),
    borderWidth: tokens.borderWidth[1],
  },
  errorCard: {
    backgroundColor: getColorToken('danger', 50),
    borderColor: getColorToken('danger', 200),
    borderWidth: tokens.borderWidth[1],
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSize.sm.size,
    lineHeight: tokens.fontSize.sm.lineHeight,
  },
});
