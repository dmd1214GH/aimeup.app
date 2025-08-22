import { z } from 'zod';

export const OperationMappingSchema = z.object({
  name: z.string(),
  linearStatus: z.string(),
  description: z.string().optional(),
});

export const ConfigSchema = z.object({
  version: z.string(),
  issuePrefixes: z.array(z.string()),
  operations: z.array(OperationMappingSchema),
  settings: z.record(z.unknown()).optional(),
});

export type OperationMapping = z.infer<typeof OperationMappingSchema>;
export type Config = z.infer<typeof ConfigSchema>;
