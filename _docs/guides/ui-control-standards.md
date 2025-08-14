# UI Control Standards

## Overview
This document defines standards for identifying and referencing UI controls across the AimeUp codebase. These standards ensure consistent, maintainable approaches for testing, styling, analytics, and accessibility.

## Control Identification Strategy

### Problem Statement
UI controls need stable identifiers for multiple purposes:
- **Testing**: Reliable selectors for E2E and component tests
- **Analytics**: Tracking user interactions
- **Accessibility**: Screen reader announcements and navigation
- **Styling**: Targeted style overrides (rare but sometimes necessary)
- **Debugging**: Identifying components in React DevTools

### Current Approach (Temporary)
During initial development, we use text-based and role-based selectors for testing. This allows rapid iteration but will need refinement before production.

### Recommended Approach (Pre-Production)
Use semantic, purpose-driven identifiers that serve multiple needs without being test-specific.

## Identifier Types and Usage

### 1. data-testid (Testing Primary)
**When to use**: For elements that tests need to reliably find
**Format**: `data-testid="context-action-target"`
**Example**: `data-testid="home-nav-kitchensink"`

```tsx
<Button 
  data-testid="home-nav-kitchensink"
  title="View Kitchen Sink" 
  onPress={() => router.push('/kitchensink')}
/>
```

**Pros**:
- Industry standard for testing
- Clearly indicates testable elements
- Can be stripped from production builds

**Cons**:
- Test-specific naming feels wrong
- Additional attribute overhead
- Temptation to overuse

### 2. id (Multi-Purpose)
**When to use**: For elements that need identification beyond testing
**Format**: `id="context-element"`
**Example**: `id="main-navigation"`

```tsx
<View id="main-navigation">
  {/* navigation items */}
</View>
```

**Pros**:
- Semantic HTML standard
- Works for styling, testing, and anchoring
- Familiar to all developers

**Cons**:
- Must be unique per page
- Can conflict with styling needs
- Not React Native friendly (web only)

### 3. data-* attributes (Semantic)
**When to use**: For domain-specific identification
**Format**: `data-[purpose]="value"`
**Examples**: 
- `data-screen="home"`
- `data-component="navigation-menu"`
- `data-action="submit-form"`

```tsx
<View 
  data-screen="home"
  data-component="button-group"
>
  <Button data-action="navigate" data-target="kitchensink" />
</View>
```

**Pros**:
- Semantic and purposeful
- Can serve multiple systems
- Self-documenting

**Cons**:
- No single standard
- May need multiple attributes

### 4. accessibility attributes (A11y Primary)
**When to use**: Always, for accessibility
**Attributes**: 
- `accessibilityLabel` (RN) / `aria-label` (Web)
- `accessibilityHint` (RN) / `aria-describedby` (Web)
- `accessibilityRole` (RN) / `role` (Web)

```tsx
<Button
  accessibilityLabel="Navigate to Kitchen Sink demo"
  accessibilityRole="button"
  accessibilityHint="Shows all UI components"
/>
```

**Pros**:
- Required for accessibility
- Can be used as test selectors
- Improves user experience

**Cons**:
- Verbose for testing
- Platform differences (RN vs Web)

## Recommended Standards

### Phase 1: MVP Development (Current)
1. Use text/role selectors for initial tests
2. Add accessibility attributes to all interactive elements
3. Document elements that prove fragile for later enhancement

### Phase 2: Pre-Production (Before Real UI)
1. Add `data-testid` to critical user paths:
   - Navigation elements
   - Form inputs and submissions  
   - State-changing interactions
   - Error boundaries

2. Format: `data-testid="screen-component-action"`
   - `home-nav-kitchensink` (home screen, nav component, kitchensink action)
   - `kitchensink-button-loading` (kitchensink screen, button component, loading variant)
   - `chat-input-message` (chat screen, input component, message field)

3. Keep testids semantic and readable:
   - ✅ `data-testid="auth-form-submit"`
   - ❌ `data-testid="btn-1"` 
   - ❌ `data-testid="test-button-2"`

### Phase 3: Production
1. Consider using semantic data attributes instead of test-specific ones:
   ```tsx
   <Button
     data-component="navigation"
     data-action="open-kitchensink"
     data-analytics="home_nav_click"
   />
   ```

2. Build abstraction layer for selectors:
   ```typescript
   // selectors.ts
   export const selectors = {
     home: {
       navToKitchenSink: '[data-action="open-kitchensink"]',
       navToTokens: '[data-action="open-tokens"]'
     }
   }
   ```

## Implementation Guidelines

### DO:
- Add identifiers when creating new components
- Use semantic, descriptive names
- Consider multiple consumers (test, analytics, a11y)
- Document special cases
- Keep consistency within a screen/feature

### DON'T:
- Add testids to every element
- Use random or sequential IDs
- Couple identifiers to implementation details
- Change identifiers without updating tests
- Mix identification strategies within a component

## Platform Considerations

### React Native
- No native `id` attribute
- Use `testID` prop (maps to `data-testid` on web)
- Accessibility props are primary identifiers

### React Native Web  
- Supports both RN and web attributes
- `testID` becomes `data-testid`
- Can use web-specific selectors

## Migration Path

1. **Immediate**: Continue with text selectors for BL-0131
2. **Next Sprint**: Add accessibility attributes to all controls
3. **Before Chat UI**: Implement data-testid for navigation
4. **Before Production**: Full identifier audit and standardization

## Open Questions

1. Should we use `testID` (RN) or `data-testid` (Web) or both?
2. How do we handle dynamic lists (e.g., chat messages)?
3. Should identifiers be stripped from production builds?
4. Do we need an identifier registry to prevent duplicates?
5. How do we coordinate with analytics requirements?

## References
- [Testing Library - data-testid](https://testing-library.com/docs/queries/bytestid/)
- [React Native - testID](https://reactnative.dev/docs/view#testid)
- [Playwright - Selectors](https://playwright.dev/docs/selectors)
- [W3C - data attributes](https://www.w3.org/TR/html5/dom.html#custom-data-attribute)