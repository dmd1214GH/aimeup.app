# Docker Development Environment

This document describes how to use Docker for developing the AimeUp React Native + Web monorepo.

## Prerequisites

- Docker Desktop for Mac installed and running
- Access to the same network for physical device testing

## Quick Start

### 1. Build the Docker image

```bash
docker-compose build
```

### 2. Start the container

```bash
docker-compose up -d
```

This starts the container in detached mode (background).

### 3. First-time setup - Install dependencies

```bash
docker-compose exec aimeup-dev pnpm install
```

This installs all monorepo dependencies. The dependencies are stored in a Docker volume for better performance.

### 4. Run development servers

```bash
docker-compose exec aimeup-dev pnpm dev
```

This starts all development servers using Turborepo in parallel mode.

### 5. Access the application

- **Web**: Open http://localhost:8081 in your browser
- **Physical device**: See [Physical Device Connection](#physical-device-connection) below

### 6. Stop the container

```bash
docker-compose down
```

## Common Commands

| Task                 | Command                                            |
| -------------------- | -------------------------------------------------- |
| Start container      | `docker-compose up -d`                             |
| Install dependencies | `docker-compose exec aimeup-dev pnpm install`      |
| Run dev servers      | `docker-compose exec aimeup-dev pnpm dev`          |
| Build all packages   | `docker-compose exec aimeup-dev pnpm build`        |
| Run tests            | `docker-compose exec aimeup-dev pnpm test`         |
| Run linting          | `docker-compose exec aimeup-dev pnpm hygiene`      |
| Type checking        | `docker-compose exec aimeup-dev pnpm typecheck`    |
| Full quality check   | `docker-compose exec aimeup-dev _scripts/aimequal` |
| Execute any command  | `docker-compose exec aimeup-dev <command>`         |
| Stop container       | `docker-compose down`                              |
| View container logs  | `docker-compose logs -f aimeup-dev`                |
| Rebuild image        | `docker-compose build --no-cache`                  |

## Physical Device Connection

To connect a physical iOS or Android device:

1. Ensure your device is on the same network as your host machine

2. Find your host machine's IP address:

   ```bash
   # On macOS
   ipconfig getifaddr en0
   # Or
   hostname -I
   ```

3. Start the development server in the container:

   ```bash
   docker-compose exec aimeup-dev pnpm dev
   ```

4. On your physical device:
   - Install the Expo Go app from App Store (iOS) or Play Store (Android)
   - Open Expo Go and scan the QR code shown in the terminal
   - Or manually enter: `exp://<YOUR_HOST_IP>:8081`

## Troubleshooting

### Container won't start

- Ensure Docker Desktop is running
- Check for port conflicts: `lsof -i :8081`
- View logs: `docker-compose logs aimeup-dev`

### Dependencies won't install

- Clear volumes and rebuild:
  ```bash
  docker-compose down -v
  docker-compose build --no-cache
  docker-compose up -d
  docker-compose exec aimeup-dev pnpm install
  ```

### Hot reload not working

- Ensure file watching is enabled in Docker Desktop settings
- Check that the source code is properly mounted:
  ```bash
  docker-compose exec aimeup-dev ls -la /aimeup
  ```

### Can't connect from physical device

- Verify both device and host are on the same network
- Check firewall settings on host machine
- Ensure Expo is binding to 0.0.0.0 (should be automatic with our config)
- Try accessing http://<YOUR_HOST_IP>:8081 from device browser first

### Performance issues on macOS

Docker on macOS uses virtualization which can impact performance. The setup uses named volumes for `node_modules` and pnpm cache to mitigate this. If performance is still poor:

- Increase Docker Desktop resource limits (CPU, Memory)
- Consider using native development for performance-critical work

## Architecture Notes

- **Base image**: node:22.18-slim for minimal size
- **Package manager**: pnpm 10.14.0 with shamefully-hoist=true for React Native
- **Volumes**:
  - Source code: Bind mount for real-time sync
  - node_modules: Named volume for performance
  - pnpm store: Named volume for caching
- **Ports**: 8081 (Expo web), 19000-19006 (Expo DevTools)
- **Keep-alive**: Container uses `tail -f /dev/null` to stay running

## Platform Compatibility

This Docker setup has been tested on:

- ✅ macOS with Docker Desktop

Other platforms (Linux, Windows) have not been tested but may work with adjustments.
