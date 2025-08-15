# Kotlin → TypeScript Migration Mapping

This document maps every Kotlin file from the legacy `_reference/EatGPT/` codebase to its target TypeScript package in the new monorepo structure.

## File Naming Convention

**TypeScript files follow a one-class-per-file pattern:**

- Each class, interface, or major type gets its own file
- File names use kebab-case (e.g., `ai-chat-message.ts`)
- Interface files are suffixed with `.interface.ts`
- Base classes are suffixed with `.base.ts`
- This provides better maintainability, easier imports, and clearer separation of concerns

**Format:** `[] source/path/File.kt → target/package/file-name.ts`

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

[] shared/aiapi/AiAssistantResponse.kt → core/aiapi/ai-assistant-response.ts
[] shared/aiapi/AiChatMessage.kt → core/aiapi/ai-chat-message.ts
[] shared/aiapi/AiServiceInterface.kt → core/aiapi/ai-service-interface.ts
[] shared/aiapi/AiToolCall.kt → core/aiapi/ai-tool-call.ts
[] shared/aiapi/AiToolDefinition.kt → core/aiapi/ai-tool-definition.ts
[] shared/aiapi/AiToolHandlerBase.kt → core/aiapi/ai-tool-handler-base.ts
[] shared/aiapi/IAiToolHandler.kt → core/aiapi/ai-tool-handler.interface.ts

#### `packages/core/chatapi/`

[] shared/chatapi/ChatMessageActionBase.kt → core/chatapi/chat-message-action-base.ts
[] shared/chatapi/ChatSystemBlock.kt → core/chatapi/chat-system-block.ts
[] shared/chatapi/IChatable.kt → core/chatapi/chatable.interface.ts
[] shared/chatapi/IChatMessage.kt → core/chatapi/chat-message.interface.ts
[] shared/chatapi/IChatService.kt → core/chatapi/chat-service.interface.ts

#### `packages/core/menuapi/`

#### `packages/core/securityapi/`

[] shared/securityapi/IUser.kt → core/securityapi/user.interface.ts
[] shared/securityapi/UserContext.kt → core/securityapi/user-context.ts

### **Helpers (`packages/helpers/`)**

#### `packages/helpers/utility/`

[] shared/utilities/ChangeDetector.kt → helpers/utility/change-detector.ts
[] shared/utilities/InstantIso8601Serializer.kt → helpers/utility/instant-iso8601-serializer.ts

#### `packages/helpers/openai/`

[] openai/model/OpenAIChatMessage.kt → helpers/openai/openai-chat-message.ts
[] openai/model/OpenAIChatRequest.kt → helpers/openai/openai-chat-request.ts
[] openai/model/OpenAiChatResponse.kt → helpers/openai/openai-chat-response.ts
[] openai/model/OpenAIChoice.kt → helpers/openai/openai-choice.ts
[] openai/model/OpenAIFunctionCall.kt → helpers/openai/openai-function-call.ts
[] openai/model/OpenAIToolCall.kt → helpers/openai/openai-tool-call.ts
[] openai/service/OpenAiService.kt → helpers/openai/openai-service.ts

#### `packages/helpers/files/`

[] shared/service/FileService.kt → helpers/files/file-service.ts

### **Account Domain (`packages/account/`)**

[] account/model/AuthState.kt → account/auth-state.ts
[] account/model/User.kt → account/user.ts
[] account/service/GoogleSignInHelper.kt → account/google-signin-helper.ts
[] account/service/UserManager.kt → account/user-manager.ts
[] account/ui/AccountMenu.kt → account/components/account-menu.tsx
[] account/ui/AuthStateProvider.kt → account/providers/auth-state-provider.tsx
[] account/ui/FirebaseUserProvider.kt → account/providers/firebase-user-provider.tsx
[] account/ui/LoginProvider.kt → account/providers/login-provider.tsx

### **Chat Domain (`packages/chat/`)**

[] chat/model/ChatMessage.kt → chat/chat-message.ts
[] chat/model/ChatMessageDto.kt → chat/chat-message-dto.ts
[] chat/model/ChatUiEvent.kt → chat/chat-ui-event.ts
[] chat/service/ChatStorage.kt → chat/services/chat-storage.ts
[] chat/service/ChatStorageInterface.kt → chat/services/chat-storage.interface.ts
[] chat/service/ChatStorageProvider.kt → chat/services/chat-storage-provider.ts
[] chat/service/FirestoreChatStorage.kt → chat/services/firestore-chat-storage.ts
[] chat/service/LocalChatStorage.kt → chat/services/local-chat-storage.ts
[] chat/viewmodel/ChatViewModel.kt → chat/hooks/use-chat.ts
[] chat/viewmodel/ChatViewModelFactory.kt → chat/hooks/use-chat-factory.ts
[] shared/menuapi/MenuContext.kt → **merge with** helpers/apps/session-context.ts???

### **EatGPT-Specific (`packages/eatgpt/`)**

#### `packages/eatgpt/nutrition/`

[] nutritionProfile/chat/NutritionProfileChatable.kt → eatgpt/nutrition/nutrition-profile-chatable.ts
[] nutritionProfile/chat/NutritionUserProfileToolHandler.kt → eatgpt/nutrition/nutrition-user-profile-tool-handler.ts
[] nutritionProfile/model/MacroNutrients.kt → eatgpt/nutrition/macro-nutrients.ts
[] nutritionProfile/model/Meal.kt → eatgpt/nutrition/meal.ts
[] nutritionProfile/model/MealComponent.kt → eatgpt/nutrition/meal-component.ts
[] nutritionProfile/model/mining/NutritionUserProfileUpdateParams.kt → eatgpt/nutrition/nutrition-user-profile-update-params.ts
[] nutritionProfile/model/NutritionUserDob.kt → eatgpt/nutrition/nutrition-user-dob.ts
[] nutritionProfile/model/NutritionUserProfile.kt → eatgpt/nutrition/nutrition-user-profile.ts
[] nutritionProfile/service/UserProfileParser.kt → eatgpt/nutrition/services/user-profile-parser.ts

#### `packages/eatgpt/healthconnect/`

[] healthconnect/chat/HealthconnectChatable.kt → eatgpt/healthconnect/healthconnect-chatable.ts
[] healthconnect/chat/SaveHCNutritionMessageAction.kt → eatgpt/healthconnect/actions/save-hc-nutrition.ts
[] healthconnect/model/HealthconnectNutritionSummary.kt → eatgpt/healthconnect/healthconnect-nutrition-summary.ts
[] healthconnect/service/HealthConnectManager.kt → eatgpt/healthconnect/health-connect-manager.ts

### **UI Components (`packages/ui-native/`)**

[] chat/ui/ChatAssistantThinkingBubble.kt → ui-native/components/chat/chat-assistant-thinking-bubble.tsx
[] chat/ui/ChatBubble.kt → ui-native/components/chat/chat-bubble.tsx
[] chat/ui/ChatBubbleBottomActions.kt → ui-native/components/chat/chat-bubble-bottom-actions.tsx
[] chat/ui/ChatBubbleContent.kt → ui-native/components/chat/chat-bubble-content.tsx
[] chat/ui/ChatBubbleOverlayGestures.kt → ui-native/components/chat/chat-bubble-overlay-gestures.tsx
[] chat/ui/ChatBubbleTopActions.kt → ui-native/components/chat/chat-bubble-top-actions.tsx
[] chat/ui/ChatInputBar.kt → ui-native/components/chat/chat-input-bar.tsx
[] chat/ui/ChatMenu.kt → ui-native/components/chat/chat-menu.tsx
[] chat/ui/ChatMessageList.kt → ui-native/components/chat/chat-message-list.tsx
[] chat/ui/ChatScreen.kt → ui-native/components/chat/chat-screen.tsx
[] chat/ui/ChatStickyDateHeader.kt → ui-native/components/chat/chat-sticky-date-header.tsx

### **App-Specific (`apps/eatgpt/`)**

[] app/chat/AppChatable.kt → apps/eatgpt/app/chatable.ts

### will not convert

#### **Styles and themes will be setup freshly**

[] app/theme/Color.kt → ❌ **Delete**
[] app/theme/Theme.kt → ❌ **Delete**
[] app/theme/Type.kt → ❌ **Delete**

#### **Test Files (Not Migrated)**

[] app/src/androidTest/java/com/example/eatgpt/ExampleInstrumentedTest.kt → ❌ **Delete** (Android-specific)
[] app/src/test/java/com/example/eatgpt/ExampleUnitTest.kt → ❌ **Delete** (Android-specific)

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
