# Kotlin → TypeScript Migration Mapping

This document maps every Kotlin file from the legacy `_reference/EatGPT/` codebase to its target TypeScript package in the new monorepo structure.

## Package Structure Overview

```
packages/
├── core/           # Core domain types and interfaces
│   ├── aiapi/      # AI service contracts
│   ├── chatapi/    # Chat system contracts
│   ├── menuapi/    # Menu system contracts
│   └── securityapi/ # Security contracts
├── helpers/        # Utility functions and helpers
│   ├── utility/    # General utilities
│   ├── openai/     # OpenAI integration
│   ├── account/    # Account utilities
│   ├── chatable/   # Chat utilities
│   └── files/      # File handling utilities
├── account/        # Account domain
├── chat/           # Chat domain
├── ui-native/      # React Native UI components
├── eatgpt/         # EatGPT-specific implementations
│   ├── nutrition/  # Nutrition domain
│   └── healthconnect/ # HealthConnect domain
└── tokens/         # Design tokens
```

## Complete File Mapping

### **Core Domain (`packages/core/`)**

#### `packages/core/aiapi/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiAssistantResponse.kt` → `index.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiChatMessage.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiServiceInterface.kt` → `service.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiToolCall.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiToolDefinition.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/AiToolHandlerBase.kt` → `base.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/aiapi/IAiToolHandler.kt` → `interfaces.ts`

#### `packages/core/chatapi/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/ChatMessageActionBase.kt` → `base.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/ChatSessionContext.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/ChatSystemBlock.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/IChatable.kt` → `interfaces.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/IChatMessage.kt` → `interfaces.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/IChatService.kt` → `interfaces.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/UITopBar.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/chatapi/UiTopMenuOption.kt` → `types.ts`

#### `packages/core/menuapi/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/menuapi/AppMenuItem.kt` → `types.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/menuapi/MenuContext.kt` → `types.ts`

#### `packages/core/securityapi/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/securityapi/IUser.kt` → `interfaces.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/securityapi/UserContext.kt` → `types.ts`

### **Helpers (`packages/helpers/`)**

#### `packages/helpers/utility/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/utilities/ChangeDetector.kt` → `change-detector.ts`
- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/utilities/InstantIso8601Serializer.kt` → `serializers.ts`

#### `packages/helpers/openai/`

- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAIChatMessage.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAIChatRequest.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAiChatResponse.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAIChoice.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAIFunctionCall.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/model/OpenAIToolCall.kt` → `types.ts`
- `_reference/EatGPT/openai/src/main/java/com/eatgpt/openai/service/OpenAiService.kt` → `service.ts`

#### `packages/helpers/files/`

- `_reference/EatGPT/shared/src/main/java/com/eatgpt/shared/service/FileService.kt` → `service.ts`

### **Account Domain (`packages/account/`)**

- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/model/AuthState.kt` → `types.ts`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/model/User.kt` → `types.ts`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/service/GoogleSignInHelper.kt` → `google-signin.ts`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/service/UserManager.kt` → `user-manager.ts`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/ui/AccountMenu.kt` → `components/account-menu.tsx`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/ui/AuthStateProvider.kt` → `providers/auth-state-provider.tsx`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/ui/FirebaseUserProvider.kt` → `providers/firebase-user-provider.tsx`
- `_reference/EatGPT/account/src/main/java/com/eatgpt/account/ui/LoginProvider.kt` → `providers/login-provider.tsx`

### **Chat Domain (`packages/chat/`)**

- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/model/ChatMessage.kt` → `types.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/model/ChatMessageDto.kt` → `types.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/model/ChatUiEvent.kt` → `types.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/service/ChatStorage.kt` → `services/storage.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/service/ChatStorageInterface.kt` → `services/interfaces.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/service/ChatStorageProvider.kt` → `services/provider.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/service/FirestoreChatStorage.kt` → `services/firestore-storage.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/service/LocalChatStorage.kt` → `services/local-storage.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/viewmodel/ChatViewModel.kt` → `hooks/use-chat.ts`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/viewmodel/ChatViewModelFactory.kt` → `hooks/use-chat-factory.ts`

### **EatGPT-Specific (`packages/eatgpt/`)**

#### `packages/eatgpt/nutrition/`

- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/chat/NutritionProfileChatable.kt` → `chatable.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/chat/NutritionUserProfileToolHandler.kt` → `tool-handler.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/MacroNutrients.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/Meal.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/MealComponent.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/mining/NutritionUserProfileUpdateParams.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/NutritionUserDob.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/model/NutritionUserProfile.kt` → `types.ts`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/service/UserProfileParser.kt` → `services/parser.ts`

#### `packages/eatgpt/healthconnect/`

- `_reference/EatGPT/healthconnect/src/main/java/com/eatgpt/healthconnect/chat/HealthconnectChatable.kt` → `chatable.ts`
- `_reference/EatGPT/healthconnect/src/main/java/com/eatgpt/healthconnect/chat/SaveHCNutritionMessageAction.kt` → `actions/save-nutrition.ts`
- `_reference/EatGPT/healthconnect/src/main/java/com/eatgpt/healthconnect/model/HealthconnectNutritionSummary.kt` → `types.ts`
- `_reference/EatGPT/healthconnect/src/main/java/com/eatgpt/healthconnect/service/HealthConnectManager.kt` → `manager.ts`

### **UI Components (`packages/ui-native/`)**

- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatAssistantThinkingBubble.kt` → `components/chat/thinking-bubble.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatBubble.kt` → `components/chat/bubble.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatBubbleBottomActions.kt` → `components/chat/bubble-actions.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatBubbleContent.kt` → `components/chat/bubble-content.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatBubbleOverlayGestures.kt` → `components/chat/bubble-gestures.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatBubbleTopActions.kt` → `components/chat/bubble-top-actions.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatInputBar.kt` → `components/chat/input-bar.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatMenu.kt` → `components/chat/menu.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatMessageList.kt` → `components/chat/message-list.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatScreen.kt` → `components/chat/screen.tsx`
- `_reference/EatGPT/chat/src/main/java/com/eatgpt/chat/ui/ChatStickyDateHeader.kt` → `components/chat/date-header.tsx`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/ui/MealHistoryScreen.kt` → `components/nutrition/meal-history.tsx`
- `_reference/EatGPT/nutritionProfile/src/main/java/com/eatgpt/nutritionProfile/ui/NutritionProfileMenu.kt` → `components/nutrition/menu.tsx`

### **App-Specific (`apps/eatgpt/`)**

- `_reference/EatGPT/app/src/main/java/com/eatgpt/chat/AppChatable.kt` → `app/chatable.ts`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/EatGPTMenus.kt` → `app/menus.ts`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/MainActivity.kt` → `app/main-activity.tsx`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/MainApp.kt` → `app/main-app.tsx`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/theme/Color.kt` → `app/theme/colors.ts`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/theme/Theme.kt` → `app/theme/theme.ts`
- `_reference/EatGPT/app/src/main/java/com/eatgpt/theme/Type.kt` → `app/theme/typography.ts`

### **Test Files (Not Migrated)**

- `_reference/EatGPT/app/src/androidTest/java/com/example/eatgpt/ExampleInstrumentedTest.kt` → ❌ **Delete** (Android-specific)
- `_reference/EatGPT/app/src/test/java/com/example/eatgpt/ExampleUnitTest.kt` → ❌ **Delete** (Android-specific)

## Migration Priority

### **Phase 1: Core Contracts (High Priority)**

1. `packages/core/aiapi/` - AI service interfaces
2. `packages/core/chatapi/` - Chat system contracts
3. `packages/core/securityapi/` - User authentication contracts

### **Phase 2: Domain Models (Medium Priority)**

1. `packages/account/` - User management
2. `packages/chat/` - Chat functionality
3. `packages/eatgpt/nutrition/` - Nutrition domain

### **Phase 3: UI Components (Lower Priority)**

1. `packages/ui-native/` - Reusable components
2. `apps/eatgpt/` - App-specific screens

### **Phase 4: Platform-Specific (Lowest Priority)**

1. `packages/eatgpt/healthconnect/` - Android-only features

## Notes

- **Test files** are not migrated (Android-specific)
- **UI components** are converted to React Native components
- **ViewModels** become React hooks
- **Services** become utility functions or React context providers
- **Models** become TypeScript interfaces and types
- **Platform-specific code** (HealthConnect) needs conditional compilation for web/iOS
