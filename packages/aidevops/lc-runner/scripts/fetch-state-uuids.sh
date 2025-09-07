#!/bin/bash

# Fetch Linear workflow state UUIDs and save them to config
# This script is for manual troubleshooting only - lc-runner automatically refreshes state mappings
# Usage: ./fetch-state-uuids.sh

if [ -z "$LINEAR_API_KEY" ]; then
    echo "Error: LINEAR_API_KEY environment variable is not set"
    echo "Please set it with: export LINEAR_API_KEY=your_api_key"
    exit 1
fi

# Default to .linear-watcher/state-mappings.json in repo root
# Can be overridden by REPO_ROOT environment variable
REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || echo ".")}"
OUTPUT_FILE="$REPO_ROOT/.linear-watcher/state-mappings.json"

# Ensure directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Fetching Linear workflow states..."
echo "Output will be saved to: $OUTPUT_FILE"

# Fetch states from Linear API
STATES=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ workflowStates { nodes { id name type position team { name } } } }"}')

if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch states from Linear API"
    exit 1
fi

# Parse and format as JSON
echo "$STATES" | jq '
{
  stateUUIDs: .data.workflowStates.nodes | map({(.name): .id}) | add,
  _metadata: {
    fetchedAt: now | strftime("%Y-%m-%d %H:%M:%S UTC"),
    teams: .data.workflowStates.nodes | map(.team.name) | unique
  },
  _comment: "These UUIDs are specific to your Linear team workflow. Run fetch-state-uuids.sh to refresh."
}' > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Successfully saved state UUIDs to $OUTPUT_FILE"
    echo ""
    echo "States found:"
    echo "$STATES" | jq -r '.data.workflowStates.nodes[] | "  - \(.name): \(.id)"'
else
    echo "Error: Failed to parse Linear API response"
    exit 1
fi