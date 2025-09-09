#!/bin/bash

# Test if slash commands work when piped as initial instruction

echo "Testing slash command execution in headless mode..."

# Test 1: Try slash command syntax
echo "Test 1: Slash command syntax"
echo "/test-echo with parameters: test=slash" | claude --print --dangerously-skip-permissions > test1.out 2>&1
cat test1.out
echo "---"

# Test 2: Try reading file directly (current approach)
echo "Test 2: Read file approach"
echo "Please read and execute the instructions in /aimeup/.claude/commands/test-echo.md with ARGUMENTS='test=read'" | claude --print --dangerously-skip-permissions > test2.out 2>&1
cat test2.out
echo "---"

echo "Tests complete. Check outputs above."