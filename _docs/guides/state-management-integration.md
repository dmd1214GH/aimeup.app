# State Management Integration Guide

## The Problem

AimeUp uses Redux and TanStack Query for different purposes. Without clear boundaries, you get:
- **Data duplication** - storing the same data in both places
- **Cache conflicts** - two systems fighting over data updates
- **Debugging hell** - unclear which system owns what

## Simple Rule

- **Redux** = UI state (what the user sees/interacts with)
- **TanStack Query** = Server requests (API calls that fetch data)

## What Goes Where

### Redux - UI State
- Modal open/closed states
- Form input values  
- Current theme (light/dark)
- Which tab is selected
- Loading spinners for UI actions

### TanStack Query - API Calls
- OpenAI chat requests
- Fetching user profiles
- Any HTTP request that retrieves server data
- Request loading states, errors, retries

## Examples

```typescript
// ✅ Redux for UI state
const isModalOpen = useSelector(state => state.ui.modalOpen)
dispatch(setModalOpen(true))

// ✅ TanStack Query for server requests  
const { data: chatResponse } = useMutation({
  mutationFn: (message) => openai.chat.completions.create(message)
})

// ❌ Don't store server responses in Redux
dispatch(setChatResponse(response)) // Wrong!

// ❌ Don't use TanStack Query for UI state
const { data: modalState } = useQuery(['modal'], () => getModalState()) // Wrong!
```

## File Organization

- **`/store/`** - Redux slices (UI state only)
- **`/api/`** - TanStack Query hooks (server requests only)

## Enforcement

ESLint prevents the most common mistakes:

- **Redux slice files** can't import TanStack Query
- **API/query files** can't import Redux hooks

The linter will catch violations with clear error messages pointing to this guide.

## Debugging

When something breaks:
1. **UI not updating?** → Check Redux DevTools
2. **API request failing?** → Check TanStack Query DevTools
3. **Data out of sync?** → Make sure you're not storing the same data twice