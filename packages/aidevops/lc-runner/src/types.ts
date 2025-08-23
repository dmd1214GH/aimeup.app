import { z } from 'zod';

export const TransitionSchema = z.object({
  success: z.string(),
  blocked: z.string(),
});

export const OperationMappingSchema = z.object({
  operationName: z.string(),
  linearIssueStatus: z.string(),
  promptFile: z.string(),
  transitions: TransitionSchema,
});

export const LinearConfigSchema = z.object({
  apiUrl: z.string(),
  apiKeyEnvVar: z.string(),
  issuePrefix: z.string(),
});

export const ConfigSchema = z.object({
  version: z.number(),
  workroot: z.string(),
  generalPrompt: z.string(),
  linear: LinearConfigSchema,
  'lc-runner-operations': z.record(OperationMappingSchema),
});

export type Transition = z.infer<typeof TransitionSchema>;
export type OperationMapping = z.infer<typeof OperationMappingSchema>;
export type LinearConfig = z.infer<typeof LinearConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;
