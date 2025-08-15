# aimeup - appframework design

appframework shapes the shell of an aimeup app

References:

- `_docs/guides/monorepo.md`

---

## Physical targets within monorepo

### aimeup-core (EXTEND aimeup/core with /menuapi)

Contribute ubiquitously available data classes in the ultra-light core package

```
/aimeup
  /packages
    /core            (--no root export--)     # Existing
      /menuapi       (@aimeup/core/menuapi)  # Existing
        + app-menu-item.ts (from <kotlin> shared/menuapi/AppMenuItem.kt)
```

### @aimeup/appframework (NEW package)

Establish a new "Level 1" package in monorepo to store the medium-weight framework logic. This package should have minimal dependencies.

```
/aimeup
  /packages
    /appframework    (--no root export--)         # new TS & RN/RNweb package
      /style         (@aimeup/appframework/style)    # subfolder export, not separate package
        + tailwind.config.js (from <relocate> apps/eatgpt/tailwind.config.js)
        + global.css (<relocate> apps/eatgpt/global.css)
      /context       (@aimeup/appframework/context) # subfolder export, not separate package
        + session-context.ts (from <kotlin> shared/chatapi/ChatSessionContext.kt )
      /menu          (@aimeup/appframework/menu)  # subfolder export, not separate package
        + ui-top-bar.ts (from <kotlin> shared/chatapi/UITopBar.kt)
        + topmenu-option.ts (from <kotlin> shared/chatapi/UiTopMenuOption.kt)
      /shell         (@aimeup/appframework/shell)  # subfolder export, not separate package
        + appshell.tsx (from <kotlin> app/MainApp.kt, <kotlin> MainActivity.kt)
        + metro.config.js (from <clone> apps/eatgpt/metro.config.js)
```

### @aimeup/testharness (NEW RN/RN-web app)

Establish a new "Level 3" target endpoint for testing and demonstrating application framework functionality

```
/aimeup
  /apps
    /testharness     (@aimeup/testharness)    # For testing aimeup on RN and RN-web
      + testharness-menus.ts (from <kotlin> app/EatGPTMenus.kt)
      + kitchensink.tsx (from <clone> apps/eatgpt/app/kitchensink.tsx)
      + App.tsx (from <kotlin> MainActivity.kt, <clone> apps/eatgpt/app/App.tsx)
```

### @eatgpt/nutrition (EXTEND @eatgpt/nutrition package)

```
/aimeup
  /packages
    /eatgpt
      /nutrition     (@eatgpt/nutrition)      # seed with stubs to support menu testing
        + nutrition-menu.ts (from <kotlin> nutritionProfile/ui/NutritionProfileMenu.kt)
        + eaten-screen.tsx (from <kotlin> nutritionProfile/ui/MealHistoryScreen.kt)
```

### Cleanup

- relocated tailwind.config.js, global.css
- remove kitchen sink from eatgpt app

TODOS:

- need to figure out the naming conventions files vs types, dashes vs camel cvs pascal
- ***

## Functional Overview

### **@aimeup/appframework/style**

Features:

- Baseline styling components for RN / RN-Web (not plain old React)
- Referenced and used by UI related components through the stack
- Can be inherited, overridden, and extended by consuming apps

- Decision: Standardize on Tailwind via NativeWind across RN and RN-Web; RN StyleSheet overrides can be documented later.
- Reference: See `/_docs/epics/react-conversion/react-conversion-backlog.md` BL-0105 ("NativeWind + css-interop").

#### Recommendation

- Use NativeWind (Tailwind for RN) to share a single `tailwind.config.js` and design tokens across native and web (via `react-native-web`). Keep CSS variables in `global.css` for web-only overrides.

#### Applicable package dependencies

- `nativewind`, `tailwindcss`
- `react-native-web`, `react-native-safe-area-context`
- `react-native-svg`
- Optional: `expo-linear-gradient` (or RN alternative)

```typescript
// packages/appframework/style/index.ts
export { default as tailwind } from 'nativewind';
export const theme = {
  colors: { primary: '#4f46e5', muted: '#6b7280' },
  radius: { md: 8 },
};
```

---

### **@aimeup/appframework/context**

Features:

- Standardized method for transparently sharing session context across code layers and remote boundaries
- Automatically configured within framework components, and always available
- Can be enhanced by applications and components

#### Applicable package dependencies

- `react`, `react-native`
- Optional: `zod` for runtime validation of context shape

#### Context Shape

```typescript
// packages/appframework/context/session-context.tsx
// Based on <kotlin> shared/chatapi/ChatSessionContext.kt (ported to TS)
export type PlatformTarget = 'native' | 'web';
export type AuthState = { userId?: string; token?: string; isAuthed: boolean };

export interface AppSessionContext {
  platform: PlatformTarget;
  locale: string;
  auth: AuthState;
  route?: { name: string; params?: Record<string, unknown> };
  flags?: Record<string, boolean>;
  extras?: Record<string, unknown>;
}

// TODO: Question: Any additional required fields from Kotlin context (e.g., tenant, appVersion, deviceId)?   not for now, but STUCK on naming
```

#### Setting and Access Patterns

```typescript
import React, { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext<AppSessionContext | undefined>(undefined);

export function SessionProvider({
  initial,
  children,
}: {
  initial: AppSessionContext;
  children: React.ReactNode;
}) {
  const [ctx, setCtx] = useState(initial);
  const value = useMemo(() => ({ ...ctx, setCtx } as AppSessionContext & { setCtx: typeof setCtx }), [ctx]);
  return <SessionContext.Provider value={value as any}>{children}</SessionProvider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx as AppSessionContext & { setCtx: React.Dispatch<React.SetStateAction<AppSessionContext>> };
}

// Usage in app code
function Example() {
  const session = useSession();
  React.useEffect(() => {
    if (!session.auth.isAuthed) { /* show login */ }
  }, [session.auth.isAuthed]);
  return null;
}
```

#### Serializing for remote calls (Firebase Functions)

```typescript
export function contextHeaders(ctx: AppSessionContext) {
  return {
    'x-aimeup-platform': ctx.platform,
    'x-aimeup-locale': ctx.locale,
    ...(ctx.auth.userId ? { 'x-aimeup-user': ctx.auth.userId } : {}),
  };
}

// Example usage
async function callFn(ctx: AppSessionContext) {
  return fetch('/api', { headers: contextHeaders(ctx) });
}

// TODO: Question: Should we also persist a subset of context into request body for non-header-aware backends?  A:
```

#### Extending context (e.g. for chat, nutrition, providers)

```typescript
// Consumers can module-augment to add domain-specific context
declare module '@aimeup/appframework/context' {
  interface AppSessionContext {
    chat?: { sessionId?: string };
    nutrition?: { profileId?: string };
  }
}
// TODO: Question: Prefer module augmentation vs. generic `extras` bag? Decide to enforce typed domains or allow both.
```

---

### **@aimeup/appframework/menu**

Features:

- UI menu elements and extensible menu framework allowing apps and packages to contribute navigational and control elements to a common app-level RN/RN-web menu controls.
- Shell will request menu injections from components and configure as it.
- Applications have an opportunity to override and adjust the menu.
- Decisions about menus considers context of screen, authentication state, platform (TODO others?)

#### Components specifying menu items

- Approach: contributors register functions returning `AppMenuItem[]` based on current `AppSessionContext`. Shell aggregates, sorts, and renders.
- Mapping: `AppMenuItem` aligns with <kotlin> `shared/menuapi/AppMenuItem.kt`. `UITopBar` aligns with <kotlin> `UITopBar.kt`. `UiTopMenuOption` aligns with <kotlin> `UiTopMenuOption.kt`.

```typescript
// packages/appframework/menu/types.ts
export type MenuPlacement = 'topbar' | 'overflow' | 'contextual';

export interface AppMenuItem {
  id: string;
  title: string;
  icon?: string;
  placement?: MenuPlacement;
  visible?: (ctx: unknown) => boolean;
  onPress?: () => void;
  route?: string;
  order?: number;
}

export interface UITopBar {
  title?: string;
  subtitle?: string;
  items: AppMenuItem[];
}

export interface UiTopMenuOption {
  id: string;
  title: string;
  onPress: () => void;
}

// packages/appframework/menu/registry.ts
type Contributor = (ctx: any) => AppMenuItem[];
const contributors = new Set<Contributor>();
export function registerMenu(fn: Contributor) {
  contributors.add(fn);
  return () => contributors.delete(fn);
}
export function buildMenu(ctx: any, transform?: (items: AppMenuItem[]) => AppMenuItem[]): UITopBar {
  const items = Array.from(contributors)
    .flatMap((fn) => fn(ctx))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const finalItems = transform ? transform(items) : items;
  return { title: ctx?.route?.name, items: finalItems };
}
```

- Example from nutrition:

```typescript
// packages/eatgpt/nutrition/nutrition-menu.ts
import { registerMenu } from '@aimeup/appframework/menu/registry';
export const unregister = registerMenu((ctx) => [
  { id: 'nutrition-history', title: 'History', route: 'NutritionHistory', order: 10 },
  { id: 'nutrition-log', title: 'Log Meal', route: 'NutritionLog', order: 5 },
]);
// TODO: Question: Do we support async contributors (e.g., fetch-based menus)? If yes, make registry async and cache per route.
```

#### Application modifications

```typescript
// apps/testharness/app/menu.ts
import { AppMenuItem } from '@aimeup/appframework/menu/types';
export const appMenuTransform = (items: AppMenuItem[]) =>
  items.filter((i) => i.id !== 'nutrition-log'); // example override
// TODO: Question: Provide both transform hook and config-based excludes? Which is preferred?
```

---

### **@aimeup/appframework/shell**

Sharable, outer-most edge of an application. Applications built on this framework can contain app-shell with minimal additional work. It handles all of the wiring required to be an empty RN/RNWeb app.

- Base app wrapper with navigation, context providers
- Handles RN/RNWeb platform differences
- Provides hooks for apps to integrate
- sets up context
- TODO: Expose providers and themes, configs, etc
- Handles platform

#### Questions

- TODO: Question: How much platform abstraction do we own in `appshell.tsx`? RN/RNWeb differences only, or also navigation config, deep linking, and theming?
- TODO: Question: Navigation library choice: `@react-navigation/native` vs Expo Router? Preference and constraints?

#### Containment pattern

```typescript
// apps/testharness/App.tsx
import React from 'react';
import { AppShell } from '@aimeup/appframework/shell';
import { appMenuTransform } from './app/menu';

export default function App() {
  return (
    <AppShell
      initialContext={{ platform: 'web', locale: 'en-US', auth: { isAuthed: false } }}
      menuTransform={appMenuTransform}
    >
      {/* Routes / Kitchen sink */}
    </AppShell>
  );
}
```

#### Minimal shell surface

```tsx
// packages/appframework/shell/appshell.tsx
import React from 'react';
import { Platform } from 'react-native';
import { SessionProvider, AppSessionContext } from '@aimeup/appframework/context';
// import { buildMenu } from '@aimeup/appframework/menu/registry';

export interface AppShellProps {
  initialContext: AppSessionContext;
  menuTransform?: (items: any[]) => any[];
  children?: React.ReactNode;
}

export function AppShell({ initialContext, menuTransform, children }: AppShellProps) {
  const platform = Platform.OS === 'web' ? 'web' : 'native';
  const seed = { ...initialContext, platform };
  // const topbar = buildMenu(seed, menuTransform); // wired when navigation is present
  return <SessionProvider initial={seed}>{children}</SessionProvider>;
}

// TODO: Question: Expose providers/themes via props only, or also load from a config file?
```

#### Abstracting platform differences on behalf of consuming apps

- TODO: Question: Which differences should shell own? Safe areas, status bar, gesture handler, linking, fonts? Define minimal set now vs later.

---

### **@aimeup/testharness**

Features:

- Fully-runnable RN/RN-Web app, runnable on all target platforms
- Demonstration tool for consuming apps and component packages
- e2e test harness for other aimeup shared components.
- Contains kitchen sink page for all shared components
- Demonstrates integration patterns
- Tests shell functionality
- Not a production-level shippable app
- aimeup developers can use the harness freely, and it will be included local builds and semi-automated testing

```tsx
// apps/testharness/App.tsx (see containment pattern above)
```

---

### **@eatgpt/nutrition**

Features:

- The kotlin mealHistory screen was only a stub used for navigation
- It extended Kotlin menu framework
- Port this over now with minimal dependencies to support standing up the menu framework in the test harness
- Test harness provides a routes/screens to `nutrition/eaten` meal history page
