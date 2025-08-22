import { ConfigSchema, OperationMappingSchema } from '../src/types';

describe('Type Schemas', () => {
  describe('OperationMappingSchema', () => {
    it('should validate valid operation mapping', () => {
      const validMapping = {
        name: 'Task',
        linearStatus: 'Tasking',
        description: 'Task operation',
      };

      const result = OperationMappingSchema.safeParse(validMapping);
      expect(result.success).toBe(true);
    });

    it('should validate operation mapping without description', () => {
      const validMapping = {
        name: 'Task',
        linearStatus: 'Tasking',
      };

      const result = OperationMappingSchema.safeParse(validMapping);
      expect(result.success).toBe(true);
    });

    it('should reject invalid operation mapping', () => {
      const invalidMapping = {
        name: 'Task',
        // Missing linearStatus
      };

      const result = OperationMappingSchema.safeParse(invalidMapping);
      expect(result.success).toBe(false);
    });
  });

  describe('ConfigSchema', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
        version: '1.0.0',
        issuePrefixes: ['AM', 'BUG'],
        operations: [
          { name: 'Task', linearStatus: 'Tasking' },
          { name: 'Review', linearStatus: 'Review' },
        ],
        settings: {
          timeout: 5000,
          debug: true,
        },
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate configuration without settings', () => {
      const validConfig = {
        version: '1.0.0',
        issuePrefixes: ['AM'],
        operations: [{ name: 'Task', linearStatus: 'Tasking' }],
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject configuration with missing version', () => {
      const invalidConfig = {
        issuePrefixes: ['AM'],
        operations: [{ name: 'Task', linearStatus: 'Tasking' }],
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with missing issuePrefixes', () => {
      const invalidConfig = {
        version: '1.0.0',
        operations: [{ name: 'Task', linearStatus: 'Tasking' }],
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with missing operations', () => {
      const invalidConfig = {
        version: '1.0.0',
        issuePrefixes: ['AM'],
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with invalid operations', () => {
      const invalidConfig = {
        version: '1.0.0',
        issuePrefixes: ['AM'],
        operations: [
          { name: 'Task' }, // Missing linearStatus
        ],
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should accept empty arrays for issuePrefixes and operations', () => {
      const config = {
        version: '1.0.0',
        issuePrefixes: [],
        operations: [],
      };

      const result = ConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });
});
