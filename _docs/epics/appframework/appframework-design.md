# aimeup - appframework design
app-framework shapes the outermost layer of an aimeup app

## Elements

### **style**
Baseline themes, styles, and colors.  Core styles are defined at a low level, styles can be inherited and extended by the apps.
<convert> CLONE FROM RNEatGPT apps/eatgpt/tailwind.config.js → ui-native/tailwind.config.js
<convert>  CLONE FROM RNEatGPT apps/eatgpt/global.css → ui-native/global.css

### **context**
Standardized method for sharing session context across code layers and remote barriers transparently using session caching and remote call serialization.

*Kotlin file conversions*
<convert>  shared/chatapi/ChatSessionContext.kt → helpers/appframework/session-context.ts


### **menu**
UI menu elements and extensible menu framework allowing apps and packages to contribute navigational and control elements to the overall experience

*Kotlin file conversions*
<convert>  shared/chatapi/UITopBar.kt → helpers/appframework/menu/ui-top-bar.ts
<convert>  shared/chatapi/UiTopMenuOption.kt → helpers/appframework/menu/ui-top-menu-option.ts
<convert>  shared/menuapi/AppMenuItem.kt → helpers/appframework/menu/app-menu-item.ts


### **shell**
Sharable, outer-most edge of an application.  Applications built on this framework can contain app-shell with minimal additional work.  It handles all of the wiring required to be an empty RN/RNWeb app. 
- Base app wrapper with navigation, context providers
- Handles RN/RNWeb platform differences
- Provides hooks for apps to integrate
- sets up context

### **shell**
Sharable, outer-most edge of an application...

- Handles: navigation, context, platform differences
- Apps provide: routes, content, configuration

**Shell API:**
``` testharness code example
<AppShell providers={['chat', 'nutrition']} theme="system">
```

TODO:  Need more detail on context.  Read this fresh:





*Kotlin file conversions*
<convert>  app/MainApp.kt → helpers/appframework/shell/shell.tsx
<convert>  (CLONE FROM RNEatGPT) apps/eatgpt/metro.config.js → helpers/appframework/shell/metro.config.js

### **testharness**
Fully-functional RN/RN-Web app that can be executed on all target platforms both as a demonstration of functionality and as a test harness for other shared components.
- Kitchen sink for all shared components
- Demonstrates integration patterns
- Tests shell functionality
- Not a production-level shippable app.


*Kotlin file conversions*
<convert>  app/EatGPTMenus.kt → apps/testharness/menus.ts
<convert>  (CLONE FROM RNEatGPT) apps/eatgpt/app/kitchensink.tsx → apps/testharness/kitchensink.tsx
<convert>  app/MainActivity.kt → apps/testharness/App.tsx

### **eatgpt-nutrition**
The kotlin mealHistory screen is only a stub used for navigation.  We can port this over now to support testing of the menu framework.

*Kotlin file conversions*
<convert>  nutritionProfile/ui/NutritionProfileMenu.kt → eatgpt/nutrition/nutrition-profile-menu.tsx
<convert> nutritionProfile/ui/MealHistoryScreen.kt → eatgpt/nutrition/meal-history-screen.tsx


## Acceptance Criteria
[] New testharness app is available through url and expo
[] App supports navigation between a clone of the kitchen sink page, and the ported meal history screen from kotlin, blank stub in kotlin used for navigation testing
[] Menu options are controlled through the menu framework, and are not hard coded in the menu.
[] Styling is controlled from the app-framework styling resources
[] The kitchen sink page demonstrates how styes can be overridden at the application level (extend base theme, CSS custom properties, Component-level className/style props)
[] The test harness contains the shell with minimal additional code
[] The kitchen sink page demonstrates how context set by the shell is available to nested code without passing context all the way through the call chain.