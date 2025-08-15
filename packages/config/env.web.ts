import { validateEnv, formatEnvReport } from './env.validator';
import type { Env } from './env.schema';

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const rawEnv: Record<string, string | undefined> = {};

  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('EXPO_PUBLIC_') || key === 'NODE_ENV') {
        rawEnv[key] = process.env[key];
      }
    });
  }

  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    Object.assign(rawEnv, (window as any).__ENV__);
  }

  try {
    cachedEnv = validateEnv(rawEnv);

    if (process.env.NODE_ENV === 'development') {
      console.log(formatEnvReport(cachedEnv));
    }

    return cachedEnv;
  } catch (error) {
    console.error('❌ Environment Validation Failed');
    console.error(error);

    if (process.env.NODE_ENV === 'development') {
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
