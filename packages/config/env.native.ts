import Constants from 'expo-constants';
import { validateEnv, formatEnvReport } from './env.validator';
import type { Env } from './env.schema';

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ...Constants.expoConfig?.extra,
    ...Constants.manifest?.extra,
    ...Constants.manifest2?.extra,
  };

  try {
    cachedEnv = validateEnv(rawEnv);

    if (__DEV__) {
      console.log(formatEnvReport(cachedEnv));
    }

    return cachedEnv;
  } catch (error) {
    console.error('❌ Environment Validation Failed');
    console.error(error);

    if (__DEV__) {
      console.error('\n📋 Available environment variables:');
      console.error(JSON.stringify(rawEnv, null, 2));
    }

    throw error;
  }
}

export function initializeEnv(): void {
  try {
    getEnv();
    console.log('✅ Environment validated successfully');
  } catch (error) {
    console.error('❌ Failed to initialize environment');
    throw error;
  }
}
