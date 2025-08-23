import {
  ConfigSchema,
  OperationMappingSchema,
  LinearConfigSchema,
  TransitionSchema,
} from '../src/types';

describe('Type Schemas', () => {
  describe('TransitionSchema', () => {
    it('should validate valid transitions', () => {
      const validTransitions = {
        success: 'Delivery-Ready',
        blocked: 'Tasking-BLOCKED',
      };

      const result = TransitionSchema.safeParse(validTransitions);
      expect(result.success).toBe(true);
    });

    it('should reject transitions with missing fields', () => {
      const invalidTransitions = {
        success: 'Delivery-Ready',
        // Missing blocked
      };

      const result = TransitionSchema.safeParse(invalidTransitions);
      expect(result.success).toBe(false);
    });
  });

  describe('OperationMappingSchema', () => {
    it('should validate valid operation mapping', () => {
      const validMapping = {
        operationName: 'Task',
        linearIssueStatus: 'Tasking-ai',
        promptFile: 'tasking-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          blocked: 'Tasking-BLOCKED',
        },
      };

      const result = OperationMappingSchema.safeParse(validMapping);
      expect(result.success).toBe(true);
    });

    it('should reject operation mapping without required fields', () => {
      const invalidMapping = {
        operationName: 'Task',
        linearIssueStatus: 'Tasking-ai',
        // Missing promptFile and transitions
      };

      const result = OperationMappingSchema.safeParse(invalidMapping);
      expect(result.success).toBe(false);
    });

    it('should reject operation mapping with invalid transitions', () => {
      const invalidMapping = {
        operationName: 'Task',
        linearIssueStatus: 'Tasking-ai',
        promptFile: 'tasking-prompt.md',
        transitions: {
          success: 'Delivery-Ready',
          // Missing blocked
        },
      };

      const result = OperationMappingSchema.safeParse(invalidMapping);
      expect(result.success).toBe(false);
    });
  });

  describe('LinearConfigSchema', () => {
    it('should validate valid Linear configuration', () => {
      const validLinearConfig = {
        apiUrl: 'https://api.linear.app/graphql',
        apiKeyEnvVar: 'LINEAR_API_KEY',
        issuePrefix: 'AM-',
      };

      const result = LinearConfigSchema.safeParse(validLinearConfig);
      expect(result.success).toBe(true);
    });

    it('should reject Linear config with missing fields', () => {
      const invalidLinearConfig = {
        apiUrl: 'https://api.linear.app/graphql',
        // Missing apiKeyEnvVar and issuePrefix
      };

      const result = LinearConfigSchema.safeParse(invalidLinearConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('ConfigSchema', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
        version: 1,
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {
          Tasking: {
            operationName: 'Task',
            linearIssueStatus: 'Tasking-ai',
            promptFile: 'tasking-prompt.md',
            transitions: {
              success: 'Delivery-Ready',
              blocked: 'Tasking-BLOCKED',
            },
          },
        },
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate configuration with multiple operations', () => {
      const validConfig = {
        version: 1,
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {
          Tasking: {
            operationName: 'Task',
            linearIssueStatus: 'Tasking-ai',
            promptFile: 'tasking-prompt.md',
            transitions: {
              success: 'Delivery-Ready',
              blocked: 'Tasking-BLOCKED',
            },
          },
          Delivery: {
            operationName: 'Deliver',
            linearIssueStatus: 'Delivery-ai',
            promptFile: 'delivery-prompt.md',
            transitions: {
              success: 'Smoke-ai',
              blocked: 'Delivery-BLOCKED',
            },
          },
        },
      };

      const result = ConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject configuration with missing version', () => {
      const invalidConfig = {
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {},
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with missing workroot', () => {
      const invalidConfig = {
        version: 1,
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {},
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with missing linear config', () => {
      const invalidConfig = {
        version: 1,
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        'lc-runner-operations': {},
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject configuration with invalid operation', () => {
      const invalidConfig = {
        version: 1,
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {
          Tasking: {
            operationName: 'Task',
            // Missing required fields
          },
        },
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should accept empty lc-runner-operations', () => {
      const config = {
        version: 1,
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {},
      };

      const result = ConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject string version instead of number', () => {
      const invalidConfig = {
        version: '1.0.0', // Should be number
        workroot: '${REPO_PATH}/.linear-watcher',
        generalPrompt: 'lc-runner-general-prompt.md',
        linear: {
          apiUrl: 'https://api.linear.app/graphql',
          apiKeyEnvVar: 'LINEAR_API_KEY',
          issuePrefix: 'AM-',
        },
        'lc-runner-operations': {},
      };

      const result = ConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });
});
