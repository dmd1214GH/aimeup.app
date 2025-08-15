# EatGPT Functional Overview

## Core User Functionality

EatGPT is a nutrition-focused AI chat application that helps users manage their health and nutrition through conversational AI interactions.

### **Primary Features**

#### **AI Chat Interface**

- **Conversational AI**: Chat with OpenAI-powered assistant about nutrition and health
- **Context-Aware**: AI remembers conversation history and user context
- **Multi-Modal Input**: Support for text, images, and camera photos
- **Chat Management**: Reset conversations, view message history

#### **Nutrition Profile Management**

- **Meal History**: Track and view past meals (currently placeholder)
- **Nutrition Data**: Store and retrieve nutrition information
- **Health Insights**: AI analysis of nutrition patterns

#### **Health Connect Integration** (Android Only)

- **Data Import**: Import nutrition data from Android Health Connect
- **Automated Actions**: Save nutrition information from AI conversations
- **Health Data Sync**: Bridge between AI chat and health tracking

#### **User Authentication**

- **Google Sign-In**: Secure authentication via Google accounts
- **User Profiles**: Personalized experience and data storage
- **Session Management**: Persistent login across app sessions

### **User Experience Flow**

1. **Authentication**: User signs in with Google account
2. **Main Chat**: Primary interface for nutrition conversations
3. **AI Interaction**: Ask questions, share meals, get health advice
4. **Data Management**: View meal history and nutrition profiles
5. **Health Integration**: Connect with Android health data (if available)

### **Platform Support**

- **Android**: Full functionality including Health Connect
- **iOS**: Core chat and nutrition features (no Health Connect)
- **Web**: Chat interface and basic nutrition tracking

### **Key User Benefits**

- **Personalized Nutrition Guidance**: AI adapts to individual health goals
- **Seamless Health Integration**: Connect AI insights with health data
- **Conversational Interface**: Natural language interaction for health management
- **Cross-Platform Access**: Consistent experience across devices

## Technical Architecture

The application uses a modular architecture with:

- **AI Service Layer**: OpenAI integration for intelligent responses
- **Chat System**: Extensible chat framework with plugin support
- **Health Data Layer**: Platform-specific health integrations
- **User Management**: Authentication and profile services
- **UI Framework**: Cross-platform interface components
