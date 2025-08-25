import { initializeEnv } from '@aimeup/config';

try {
  initializeEnv();
} catch (error) {
  console.error('Failed to start application due to environment configuration errors');
  console.error('Please check your .env file and ensure all required variables are set');
  throw error;
}

import 'expo-router/entry';
