# React + TypeScript Standards

## Code Style & Standards
- Use TypeScript for all new code
- Follow React 19 patterns and hooks
- Use functional components with hooks
- Prefer named exports over default exports
- Use meaningful variable and function names

## Architecture Guidelines
- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries
- Maintain separation of concerns between UI, business logic, and data

## Component Patterns
- Use functional components with hooks
- Implement proper prop typing with TypeScript interfaces
- Use React.memo() for performance optimization when needed
- Implement proper error boundaries for error handling

## State Management

### Clear Boundaries: Redux, TanStack Query, and Firestore

**Use Redux for client state and TanStack Query for server state, avoiding overlap**

#### Redux Toolkit - Client State Only
- UI state (modals, forms, navigation)
- User preferences and settings  
- Transient application state
- Authentication state (current user info)
- **Never store**: Server data, API responses, data that needs offline sync

#### TanStack Query - API Request Lifecycle
- OpenAI API calls and request management
- HTTP requests that need caching/retries/deduplication
- Request metadata and loading states
- **Never store**: UI state, data that Firestore handles

#### Firestore - Server Data with Offline Sync
- Chat messages (via real-time listeners)
- User profiles and persistent data
- Multi-device synchronized data
- **Never store**: Transient UI state, API request metadata

### Implementation Guidelines
- **File organization**: Keep Redux slices, TanStack Query hooks, and Firestore utilities in separate directories
- **ESLint enforcement**: Lint rules prevent importing TanStack Query in Redux files and vice versa
- **Mode switching**: Support both PreAuth mode (local files + Redux) and Firebase mode (Firestore + real-time)
- **Integration patterns**: See `_docs/guides/state-management-integration.md` for detailed patterns

### Legacy React State Management
- Use React hooks for local component state
- Prefer useState and useReducer for complex local state
- Use Context API sparingly, only for non-performance-critical shared state
- Keep state as local as possible

## Performance Best Practices
- Use proper memoization techniques (useMemo, useCallback)
- Minimize re-renders
- Implement proper dependency arrays in useEffect
- Use React DevTools Profiler for performance analysis

