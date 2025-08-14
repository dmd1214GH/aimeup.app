import { z } from "zod";

export const envModeSchema = z.enum(["development", "test", "production"]).default("development");

export const envSchema = z.object({
  NODE_ENV: envModeSchema,
  
  EXPO_PUBLIC_API_URL: z.string().url({
    message: "API_URL must be a valid URL (e.g., http://localhost:3000)"
  }).optional(),
  
  EXPO_PUBLIC_OPENAI_API_KEY: z.string().min(1, {
    message: "OpenAI API key cannot be empty when provided"
  }).optional(),
  
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),
  
  EXPO_PUBLIC_PREAUTH_MODE: z.string().transform(val => val === "true").default("false"),
  
  EXPO_PUBLIC_LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"], {
    errorMap: () => ({ message: "LOG_LEVEL must be one of: trace, debug, info, warn, error, fatal" })
  }).default("info"),
});

export type Env = z.infer<typeof envSchema>;

export type EnvMode = z.infer<typeof envModeSchema>;