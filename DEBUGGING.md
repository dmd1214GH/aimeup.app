# Debugging Guide for AimeUp Web Server

## Current Status

✅ **Web server is running** on `http://localhost:8082`
✅ **VS Code debug configurations** are set up
✅ **Source maps** are enabled for debugging

## Debugging Options

### 1. Chrome DevTools (Recommended for Web Development)

- **URL**: `http://localhost:8082`
- **How to use**:
  1. Open your browser and navigate to `http://localhost:8082`
  2. Press `F12` or right-click and select "Inspect"
  3. Use the **Sources** tab to set breakpoints in your code
  4. Use the **Console** tab for logging and debugging
  5. Use the **Network** tab to debug API calls

### 2. VS Code Chrome Debugging

- **Configuration**: "Debug Expo Web in Chrome"
- **How to use**:
  1. Open VS Code
  2. Go to Run and Debug (Ctrl+Shift+D)
  3. Select "Debug Expo Web in Chrome"
  4. Press F5 to start debugging
  5. Set breakpoints in VS Code - they will work in the browser

### 3. VS Code Chrome Attach

- **Configuration**: "Attach to Chrome"
- **How to use**:
  1. Start Chrome with remote debugging: `chrome --remote-debugging-port=9222`
  2. Navigate to `http://localhost:8082`
  3. In VS Code, select "Attach to Chrome" and press F5
  4. Set breakpoints in VS Code

### 4. Node.js Backend Debugging

- **Configuration**: "Attach to Node.js"
- **How to use**:
  1. Start your app with Node.js debugging: `NODE_OPTIONS='--inspect=0.0.0.0:9229' pnpm dev`
  2. In VS Code, select "Attach to Node.js" and press F5
  3. Set breakpoints in your Node.js code

## Quick Start Commands

### Start Web Server with Debugging

```bash
# In the Docker container
cd apps/eatgpt
NODE_OPTIONS='--inspect=0.0.0.0:9229' pnpm start:web
```

### Check Server Status

```bash
# Check if server is running
lsof -i -P -n | grep LISTEN

# Check Expo processes
ps aux | grep expo
```

### Access Your App

- **Web**: http://localhost:8082
- **Metro Bundler**: http://localhost:8082 (if available)

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on port 8082
lsof -ti:8082 | xargs kill
```

### Clear Expo Cache

```bash
cd apps/eatgpt
pnpm start:clean
```

### Restart Development Server

```bash
cd apps/eatgpt
pnpm stop
pnpm dev
```

## Debugging Tips

1. **Set breakpoints** in VS Code or Chrome DevTools
2. **Use console.log()** for quick debugging
3. **Check the Network tab** for API call issues
4. **Use React DevTools** extension for React component debugging
5. **Check the Console tab** for JavaScript errors

## VS Code Extensions for Better Debugging

- **React Developer Tools** - For React component debugging
- **ES7+ React/Redux/React-Native snippets** - For code snippets
- **Auto Rename Tag** - For JSX editing
- **Bracket Pair Colorizer** - For better code readability

## Next Steps

1. **Test the debugger**: Set a breakpoint in your React component
2. **Debug API calls**: Use the Network tab in Chrome DevTools
3. **Debug state changes**: Use React DevTools
4. **Set up conditional breakpoints**: For complex debugging scenarios

Your web server is now ready for debugging! 🚀
