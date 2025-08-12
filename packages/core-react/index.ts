export { QueryProvider } from './providers/QueryProvider'
export { ReduxProvider } from './providers/ReduxProvider'
export { AppProviders } from './providers/AppProviders'
export { store } from './store'
export type { RootState, AppDispatch } from './store'

// UI slice actions
export {
  setComposerOpen,
  setActiveChatId,
  setSidebarCollapsed,
  setTheme,
  resetUi,
} from './store/slices/uiSlice'

// Auth slice actions
export {
  setUser,
  setPreAuthMode,
  setLoading,
  logout,
} from './store/slices/authSlice'