# Claude Code Docker Setup Guide

## Overview

This guide documents the setup and usage of Claude Code CLI and essential AI-assisted development tools in the Docker container environment for the AimeUp project.

## Prerequisites

- Docker and docker-compose installed
- The base Docker container from Issue 1 (AM-42) set up and running
- Valid API keys for Anthropic Claude and Linear

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file and fill in your actual API keys:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `LINEAR_API_KEY`: Your Linear API key
- `GIT_USER_NAME`: Your Git username
- `GIT_USER_EMAIL`: Your Git email

### 2. Build and Start the Container

Build the Claude-enabled Docker image:

```bash
docker-compose -f docker-compose.yml -f docker-compose.claude.yml build
```

Start the container:

```bash
docker-compose -f docker-compose.yml -f docker-compose.claude.yml up -d
```

### 3. Install Dependencies and Build

Install monorepo dependencies:

```bash
docker-compose exec aimeup-dev pnpm install
```

Build all packages:

```bash
docker-compose exec aimeup-dev pnpm build
```

### 4. Verify Installation

Run the acceptance test script:

```bash
./_scripts/test-claude-docker.sh
```

## Usage

### Running Claude Code

Execute Claude Code commands in the container:

```bash
docker-compose exec aimeup-dev claude --version
docker-compose exec aimeup-dev claude "Your prompt here"
```

### Running lc-runner

Execute Linear/Claude runner operations:

```bash
docker-compose exec aimeup-dev pnpm lc-runner <operation> <issueId>
```

Example:

```bash
docker-compose exec aimeup-dev pnpm lc-runner Deliver AM-43
```

### Accessing the Container Shell

For interactive development:

```bash
docker-compose exec aimeup-dev zsh
```

## File Structure

- `Dockerfile.claude`: Extended Dockerfile with Claude Code installation
- `docker-compose.claude.yml`: Extended compose configuration with API keys
- `.env.example`: Template for environment variables
- `.env`: Your local environment configuration (gitignored)
- `_scripts/test-claude-docker.sh`: Automated test script

## Troubleshooting

### Claude Code API Key Issues

If Claude Code reports "Invalid API key":

1. Verify ANTHROPIC_API_KEY is set correctly in `.env`
2. Restart the container: `docker-compose down && docker-compose -f docker-compose.yml -f docker-compose.claude.yml up -d`
3. Check environment inside container: `docker-compose exec aimeup-dev env | grep ANTHROPIC`

### Git Configuration Not Working

If commits fail with user identity issues:

1. Verify GIT_USER_NAME and GIT_USER_EMAIL are set in `.env`
2. Check configuration: `docker-compose exec aimeup-dev git config --list`
3. Manually configure if needed: `docker-compose exec aimeup-dev git config --global user.name "Your Name"`

### lc-runner Not Found

If `pnpm lc-runner` fails:

1. Ensure you've run `pnpm install` and `pnpm build` in the container
2. Verify the package exists: `docker-compose exec aimeup-dev ls packages/aidevops/lc-runner/dist`
3. Check help: `docker-compose exec aimeup-dev pnpm lc-runner --help`

### Container Not Starting

If the container fails to start:

1. Check logs: `docker-compose logs aimeup-dev`
2. Ensure base image is built: `docker-compose build`
3. Remove old containers: `docker-compose down -v` (warning: removes volumes)

## Gitpod Compatibility

The setup is designed to be compatible with Gitpod:

- Environment variables can be set in Gitpod user settings
- No secrets are stored in the repository
- Git configuration uses environment variables
- All tools work with standard Node.js environment

To use in Gitpod, set these environment variables in your Gitpod settings:

- ANTHROPIC_API_KEY
- LINEAR_API_KEY
- GIT_USER_NAME
- GIT_USER_EMAIL

## Notes

- API keys are never committed to the repository
- The `.env` file is gitignored for security
- Dependencies are installed in a Docker volume for performance
- The container runs with working directory `/aimeup`
- All development commands should be executed via `docker-compose exec`
