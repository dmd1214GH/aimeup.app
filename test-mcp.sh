#!/bin/bash
echo "Testing MCP in Docker container..."
docker exec aimeup-aimeup-dev-1 bash -c "cd /aimeup && echo 'list your available tools' | claude --print 2>&1 | grep -E '(mcp__|linear_)' | head -10"