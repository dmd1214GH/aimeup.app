#!/bin/bash
# Block git commit commands
if [[ "$1" == *"git commit"* ]]; then
    echo "❌ Git commit blocked by policy. Please commit manually."
    exit 1
fi
exit 0