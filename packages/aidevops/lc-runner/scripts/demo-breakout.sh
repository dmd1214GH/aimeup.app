#!/bin/bash

# Demonstration script for Linear Sub-Issue Breakout Feature
# This script demonstrates the breakout functionality using the CLI

set -e

echo "================================================"
echo "Linear Sub-Issue Breakout Feature Demonstration"
echo "================================================"
echo ""

# Check if LINEAR_API_KEY is set
if [ -z "$LINEAR_API_KEY" ]; then
    echo "❌ Error: LINEAR_API_KEY environment variable is not set"
    echo "Please set your Linear API key: export LINEAR_API_KEY='your-key-here'"
    exit 1
fi

# Set demo variables
PARENT_ISSUE="AM-DEMO"
WORKING_DIR="/tmp/breakout-demo"

echo "📋 Demo Configuration:"
echo "  Parent Issue: $PARENT_ISSUE"
echo "  Working Directory: $WORKING_DIR"
echo ""

# Create working directory
mkdir -p "$WORKING_DIR"

# Step 1: Create a sample parent issue with breakouts
echo "Step 1: Creating sample parent issue content..."
cat > "$WORKING_DIR/demo-issue.md" << 'EOF'
# E-Commerce Platform Enhancement

Implement comprehensive enhancements to our e-commerce platform.

## Requirements
1. Shopping cart improvements
2. Payment processing updates
3. User experience enhancements

## Breakout Issues

### Shopping Cart Optimization
Optimize the shopping cart for better performance:
- Implement cart persistence across sessions
- Add quick-add functionality
- Optimize database queries
- Add real-time inventory checks

### Payment Gateway Integration
Integrate new payment gateway options:
- Add support for Apple Pay
- Integrate Google Pay
- Implement cryptocurrency payments
- Add payment retry logic

Blocks: Checkout Flow Redesign

### Checkout Flow Redesign  
Redesign the checkout flow for better conversion:
- Simplify form fields
- Add progress indicator
- Implement one-click checkout
- Add guest checkout option

Blocked by: Payment Gateway Integration

### Analytics Dashboard
Create analytics dashboard for cart metrics:
- Cart abandonment rates
- Average order value tracking
- Conversion funnel analysis
- Payment method statistics

## Solution Design
Implementation will follow microservices architecture...
EOF

echo "✅ Sample issue created at: $WORKING_DIR/demo-issue.md"
echo ""

# Step 2: Demonstrate getting parent metadata
echo "Step 2: Getting parent issue metadata..."
echo "Command: lc-runner linear-api get-metadata \"$PARENT_ISSUE\""
echo ""
echo "Sample output (if issue exists):"
cat << 'EOF'
{
  "success": true,
  "data": {
    "teamId": "team-engineering",
    "labelIds": ["enhancement", "backend", "frontend"],
    "projectId": "q4-improvements",
    "priority": 2,
    "assigneeId": "user-123"
  }
}
EOF
echo ""

# Step 3: Check for existing children
echo "Step 3: Checking for existing child issues..."
echo "Command: lc-runner linear-api get-children \"$PARENT_ISSUE\""
echo ""
echo "Sample output:"
cat << 'EOF'
{
  "success": true,
  "data": []
}
EOF
echo "(No existing children found)"
echo ""

# Step 4: Create sub-issues
echo "Step 4: Creating sub-issues from breakouts..."
echo ""

# Demo creating first sub-issue
echo "Creating 'Shopping Cart Optimization' sub-issue:"
cat << 'EOF'
lc-runner linear-api create-issue '{
  "title": "Shopping Cart Optimization",
  "description": "Optimize the shopping cart for better performance:\n- Implement cart persistence across sessions\n- Add quick-add functionality\n- Optimize database queries\n- Add real-time inventory checks",
  "teamId": "team-engineering",
  "parentId": "AM-DEMO",
  "labelIds": ["enhancement", "backend", "frontend"],
  "priority": 2
}'
EOF
echo ""
echo "Expected response:"
cat << 'EOF'
{
  "success": true,
  "data": {
    "id": "issue-abc123",
    "identifier": "AM-201",
    "url": "https://linear.app/team/issue/AM-201",
    "title": "Shopping Cart Optimization"
  }
}
EOF
echo ""

# Step 5: Create relationships
echo "Step 5: Creating blocking relationships..."
echo ""
echo "Making 'Checkout Flow Redesign' blocked by 'Payment Gateway Integration':"
cat << 'EOF'
lc-runner linear-api create-relation '{
  "issueId": "checkout-flow-id",
  "relatedIssueId": "payment-gateway-id",
  "type": "blocked_by"
}'
EOF
echo ""
echo "Expected response:"
cat << 'EOF'
{
  "success": true
}
EOF
echo ""

# Step 6: Update parent issue
echo "Step 6: Updating parent issue content..."
echo ""
echo "The parent issue's '## Breakout Issues' section is updated to:"
cat << 'EOF'
## Breakout Issues
AM-201
AM-202
AM-203
AM-204
EOF
echo ""
echo "Linear automatically renders these as sub-issue cards."
echo ""

# Step 7: Demonstrate duplicate handling
echo "Step 7: Demonstrating duplicate detection..."
echo ""
echo "If we try to create 'Shopping Cart Optimization' again:"
echo "1. System detects existing child with same title"
echo "2. Updates existing issue instead of creating duplicate"
echo "3. Reports update in operation results"
echo ""

# Step 8: Full workflow via subagent
echo "Step 8: Using lc-breakout-handler subagent (in grooming context)..."
echo ""
cat << 'EOF'
When invoked via Task tool:
{
  "subagent_type": "lc-breakout-handler",
  "prompt": "Create sub-issues for:
    - issueId: AM-DEMO
    - workingFolder: /tmp/breakout-demo
    - selectedBreakouts: all"
}

The subagent will:
1. Read the parent issue content
2. Extract all breakout sections
3. Check for existing children
4. Create new issues or update existing
5. Establish relationships
6. Update parent content
7. Return comprehensive results
EOF
echo ""

# Summary
echo "================================================"
echo "Demo Summary"
echo "================================================"
echo ""
echo "✅ Key Features Demonstrated:"
echo "  • Automatic sub-issue creation from markdown"
echo "  • Metadata inheritance from parent"
echo "  • Duplicate detection and handling"
echo "  • Relationship establishment"
echo "  • Parent content transformation"
echo ""
echo "📚 For more information, see:"
echo "  • Documentation: /packages/aidevops/lc-runner/docs/breakout-feature.md"
echo "  • Tests: /packages/aidevops/lc-runner/tests/breakout-*.test.ts"
echo "  • Subagent: /packages/aime-aidev/assets/claude-agents/lc-breakout-handler.md"
echo ""
echo "🎉 Demo complete!"