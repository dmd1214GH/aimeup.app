import { z } from "zod";
import { envSchema, type Env } from "./env.schema";

export class EnvValidationError extends Error {
  constructor(public readonly errors: z.ZodError) {
    const formattedErrors = errors.errors
      .map(err => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    
    super(`Environment validation failed:\n${formattedErrors}`);
    this.name = "EnvValidationError";
  }
}

export function validateEnv(rawEnv: Record<string, string | undefined>): Env {
  try {
    const result = envSchema.parse(rawEnv);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new EnvValidationError(error);
    }
    throw error;
  }
}

export function getRequiredEnvVars(): string[] {
  const shape = envSchema.shape;
  const required: string[] = [];
  
  for (const [key, value] of Object.entries(shape)) {
    if (!value.isOptional()) {
      required.push(key);
    }
  }
  
  return required;
}

export function getMissingEnvVars(rawEnv: Record<string, string | undefined>): string[] {
  const required = getRequiredEnvVars();
  const missing: string[] = [];
  
  for (const key of required) {
    if (!rawEnv[key]) {
      missing.push(key);
    }
  }
  
  return missing;
}

export function formatEnvReport(env: Env): string {
  const lines: string[] = [
    "Environment Configuration:",
    `  Mode: ${env.NODE_ENV}`,
    `  Log Level: ${env.EXPO_PUBLIC_LOG_LEVEL}`,
    `  Preauth Mode: ${env.EXPO_PUBLIC_PREAUTH_MODE ? "ENABLED" : "DISABLED"}`,
  ];
  
  if (env.EXPO_PUBLIC_API_URL) {
    lines.push(`  API URL: ${env.EXPO_PUBLIC_API_URL}`);
  }
  
  if (env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    lines.push(`  Firebase Project: ${env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);
  }
  
  if (env.EXPO_PUBLIC_OPENAI_API_KEY) {
    lines.push(`  OpenAI: CONFIGURED`);
  }
  
  return lines.join("\n");
}