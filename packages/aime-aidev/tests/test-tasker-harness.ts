import * as fs from 'fs';
import * as path from 'path';

/**
 * Test harness for the lc-issue-tasker subagent
 * This script demonstrates how to invoke the subagent with various test scenarios
 */

// Test fixtures directory
const fixturesDir = path.join(__dirname, 'fixtures');

// Sample issue content for testing
const sampleIssueNoTaskList = `# Test Issue: Create User Authentication

## Requirements

Create a user authentication system with email/password login and JWT tokens.

## Acceptance Criteria

- [ ] Users can register with email and password
- [ ] Users can login with valid credentials
- [ ] JWT tokens are generated on successful login
- [ ] Tokens expire after 24 hours
- [ ] Invalid login attempts are rejected

## Metadata
- URL: https://linear.app/test/issue/TEST-123
- Identifier: TEST-123
- Status: Tasking-ai
`;

const sampleIssueWithValidTaskList = `# Test Issue: Create User Authentication

## Requirements

Create a user authentication system with email/password login and JWT tokens.

## Acceptance Criteria

- [ ] Users can register with email and password
- [ ] Users can login with valid credentials
- [ ] JWT tokens are generated on successful login
- [ ] Tokens expire after 24 hours
- [ ] Invalid login attempts are rejected

## Task List for TEST-123

1. () Create authentication service module
   - Create /packages/auth/auth.service.ts
   - Implement register and login methods
   - Add password hashing with bcrypt
2. () Add JWT token generation
   - Install jsonwebtoken package
   - Create token generation utility
   - Set 24-hour expiration
3. () Create user registration endpoint
   - Add POST /api/auth/register route
   - Validate email format
   - Hash password before storage
4. () Create user login endpoint
   - Add POST /api/auth/login route
   - Verify credentials
   - Return JWT on success
5. () Add authentication tests
   - Test successful registration
   - Test successful login
   - Test invalid credentials
   - Test token expiration
6. () Update documentation
   - Add API documentation
   - Include authentication flow diagram
   - Document token usage

## Metadata
- URL: https://linear.app/test/issue/TEST-123
- Identifier: TEST-123
- Status: Tasking-ai
`;

const sampleIssueWithInvalidTaskList = `# Test Issue: Create User Authentication

## Requirements

Create a user authentication system with email/password login and JWT tokens.

## Acceptance Criteria

- [ ] Users can register with email and password
- [ ] Users can login with valid credentials
- [ ] JWT tokens are generated on successful login
- [ ] Tokens expire after 24 hours
- [ ] Invalid login attempts are rejected

## Task List for TEST-123

1. () Do authentication stuff
2. () Make it work
3. () Test something

## Metadata
- URL: https://linear.app/test/issue/TEST-123
- Identifier: TEST-123
- Status: Tasking-ai
`;

const sampleIssueAmbiguous = `# Test Issue: Improve Performance

## Requirements

Make the application faster.

## Acceptance Criteria

- [ ] Performance is better
- [ ] Users are happy

## Metadata
- URL: https://linear.app/test/issue/TEST-124
- Identifier: TEST-124
- Status: Tasking-ai
`;

// Create test fixtures
function createTestFixtures() {
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  // Create test issue files
  fs.writeFileSync(path.join(fixturesDir, 'issue-no-tasklist.md'), sampleIssueNoTaskList);
  fs.writeFileSync(path.join(fixturesDir, 'issue-valid-tasklist.md'), sampleIssueWithValidTaskList);
  fs.writeFileSync(
    path.join(fixturesDir, 'issue-invalid-tasklist.md'),
    sampleIssueWithInvalidTaskList
  );
  fs.writeFileSync(path.join(fixturesDir, 'issue-ambiguous.md'), sampleIssueAmbiguous);

  console.log('✅ Test fixtures created in', fixturesDir);
}

// Simulate subagent invocation
function simulateTaskerInvocation(scenario: string) {
  console.log(`\n📋 Testing scenario: ${scenario}`);
  console.log('='.repeat(50));

  let issueFile: string;
  let expectedResult: string;

  switch (scenario) {
    case 'no-tasklist':
      issueFile = 'issue-no-tasklist.md';
      expectedResult = 'Should generate a new comprehensive task list';
      break;
    case 'valid-tasklist':
      issueFile = 'issue-valid-tasklist.md';
      expectedResult = 'Should validate existing task list as meeting criteria';
      break;
    case 'invalid-tasklist':
      issueFile = 'issue-invalid-tasklist.md';
      expectedResult = 'Should regenerate task list (existing one inadequate)';
      break;
    case 'ambiguous':
      issueFile = 'issue-ambiguous.md';
      expectedResult = 'Should return Blocked status with questions';
      break;
    default:
      console.error('Unknown scenario:', scenario);
      return;
  }

  const issueContent = fs.readFileSync(path.join(fixturesDir, issueFile), 'utf-8');

  console.log(`📄 Input file: ${issueFile}`);
  console.log(`📍 Expected: ${expectedResult}`);
  console.log('\n📝 Simulated prompt to subagent:');
  console.log('-'.repeat(50));
  console.log(`
Task the following Linear issue:
- issueId: TEST-123
- workingFolder: ${fixturesDir}
- repoRoot: /aimeup
- issueContent:

${issueContent}

Please analyze the requirements, validate or generate a task list, check all 8 success criteria, and create an operation report.
`);
  console.log('-'.repeat(50));

  // Simulate expected response
  const simulatedResponse = {
    'no-tasklist': {
      status: 'Complete',
      summary: 'Generated comprehensive task list with 6 tasks',
      tasksGenerated: true,
      validationPassed: true,
      blockingQuestions: [],
      reportCreated: true,
    },
    'valid-tasklist': {
      status: 'Complete',
      summary: 'Existing task list validates against all criteria',
      tasksGenerated: false,
      validationPassed: true,
      blockingQuestions: [],
      reportCreated: true,
    },
    'invalid-tasklist': {
      status: 'Complete',
      summary: 'Regenerated task list (existing was inadequate)',
      tasksGenerated: true,
      validationPassed: true,
      blockingQuestions: [],
      reportCreated: true,
    },
    ambiguous: {
      status: 'Blocked',
      summary: 'Requirements too vague to create actionable tasks',
      tasksGenerated: false,
      validationPassed: false,
      blockingQuestions: [
        'What specific performance metrics need improvement?',
        'What are the current performance bottlenecks?',
        'What constitutes "better" performance?',
      ],
      reportCreated: true,
    },
  };

  const response = simulatedResponse[scenario as keyof typeof simulatedResponse];
  console.log('\n📤 Expected subagent response:');
  console.log(JSON.stringify(response, null, 2));
}

// Main test runner
function runTests() {
  console.log('🚀 LC Issue Tasker Test Harness');
  console.log('================================\n');

  // Create test fixtures
  createTestFixtures();

  // Run test scenarios
  const scenarios = ['no-tasklist', 'valid-tasklist', 'invalid-tasklist', 'ambiguous'];

  scenarios.forEach((scenario) => {
    simulateTaskerInvocation(scenario);
  });

  console.log('\n✅ Test harness demonstration complete');
  console.log('📌 Note: This is a simulation showing expected behavior');
  console.log('📌 Actual subagent invocation would use Claude Code Task tool');
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

export { createTestFixtures, simulateTaskerInvocation };
