# Smart Livestock Health — Module 1: Production Mobile Application Foundation

> **Smart Livestock Health** is a commercial, mobile-first AI-powered livestock health monitoring platform designed for dairy farmers, farm owners, farm managers, and veterinarians.

This repository contains the primary **React Native / Expo** mobile application.

---

## 1. Scope of Module 1

Module 1 establishes the **production mobile application foundation**:
- **Clean Feature-Oriented Architecture**: Scalable layout separating `app/` (routing) from `src/` (domain features, components, services, and state).
- **Nature + Tech + Farmer-Friendly Design System**: Unified design tokens (`colors`, `spacing`, `typography`, `touchTargets`, `shadows`) and accessible component library.
- **Multilingual Architecture**: i18n support for **English (`en`)**, **Hindi (`hi`)**, and **Marathi (`mr`)** with instant switching and local persistence via AsyncStorage.
- **State Management & Local Storage**: TanStack Query for server state, Zustand for client/UI state, Expo SecureStore for credentials abstraction, and SQLite local storage driver interface stub.
- **API & Security Abstraction**: Environment configuration (`dev`, `staging`, `prod`), typed `HttpClient`, Auth service contract abstraction, normalized error handling, zero password logging.
- **Initial User Flow Screens**:
  - Splash / App Initialization
  - Welcome Screen
  - Language Selection (EN, HI, MR)
  - Authentication UI (Login, Register / Account Creation, Forgot Password)
  - Farmer-Friendly Onboarding (4 steps)
  - Farm Setup
  - Authenticated Main Application Shell (Home, Animals, AI Assistant, Alerts, More)

---

## 2. Technology Stack

- **Framework**: Expo (SDK 57) + React Native
- **Routing**: Expo Router (File-based navigation)
- **Language**: TypeScript (Strict Mode Enabled)
- **Server State Management**: TanStack Query (`@tanstack/react-query`)
- **Client State Management**: Zustand (`zustand`)
- **Sensitive Credentials Storage**: Expo SecureStore (`expo-secure-store`)
- **Local Persistence & Preferences**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **Local Database Interface Stub**: Expo SQLite (`expo-sqlite`) abstraction layer for future offline sync queue
- **Internationalization**: `i18next` + `react-i18next`
- **Icons**: `lucide-react-native`
- **Linting & Formatting**: ESLint + Prettier

---

## 3. Project Structure

```text
smart-livestock-app/
├── app/                        # Navigation & Router Layer (Expo Router)
│   ├── _layout.tsx             # Root layout (QueryClientProvider, i18n, Session load)
│   ├── index.tsx               # Splash / App Initialization Redirect Router
│   ├── (auth)/                 # Unauthenticated Authentication Stack
│   │   ├── welcome.tsx         # Welcome Branding & Value Proposition
│   │   ├── language.tsx        # Language Selection (EN, HI, MR)
│   │   ├── login.tsx           # Farmer-Friendly Login Form
│   │   ├── register.tsx        # Account Creation with Role Selection
│   │   └── forgot-password.tsx # Password Reset Request
│   ├── (onboarding)/           # Onboarding & Setup Stack
│   │   ├── index.tsx           # 4-step Walkthrough
│   │   └── farm-setup.tsx      # Farm Name & Livestock Setup
│   └── (main)/                 # Authenticated Application Shell
│       ├── _layout.tsx         # Bottom Tab Navigator (Home, Animals, AI, Alerts, More)
│       ├── index.tsx           # Home Dashboard Shell & Health Overview
│       ├── animals.tsx         # Herd List with Controlled Empty State
│       ├── ai-assistant.tsx    # AI Assistant with Controlled Coming Soon State
│       ├── alerts.tsx          # Health Alerts with Filter Chips & Empty State
│       └── more.tsx            # Settings, Profile & Language Controls
│
├── src/                        # Core Application Source Code
│   ├── components/             # Reusable Design System Component Library
│   │   ├── AppText.tsx         # Typography wrapper
│   │   ├── AppButton.tsx       # Touch-target compliant buttons (min 48px)
│   │   ├── AppInput.tsx        # Accessible inputs with error & password toggle
│   │   ├── AppCard.tsx         # Surface card containers
│   │   ├── AppHeader.tsx       # Standardized screen header
│   │   ├── AppIconButton.tsx   # Touch-compliant icon buttons
│   │   ├── LoadingState.tsx    # Loading indicators
│   │   ├── ErrorState.tsx      # Standardized error banner
│   │   ├── EmptyState.tsx      # Controlled empty screen states
│   │   ├── StatusBadge.tsx     # Icon + Text accessible status indicators
│   │   ├── Divider.tsx         # Layout dividers
│   │   └── ScreenContainer.tsx # Safe-area & keyboard scroll container
│   ├── configuration/
│   │   └── env.ts              # Multi-environment config (dev, staging, prod)
│   ├── i18n/
│   │   ├── index.ts            # i18next configuration & language switcher
│   │   └── locales/            # Translation dictionary JSONs
│   │       ├── en.json         # English
│   │       ├── hi.json         # Hindi (हिंदी)
│   │       └── mr.json         # Marathi (मराठी)
│   ├── services/
│   │   ├── httpClient.ts       # Typed HTTP client abstraction with error normalization
│   │   └── authService.ts      # Auth contract service abstraction
│   ├── storage/
│   │   ├── secureStorage.ts    # SecureStore abstraction for auth tokens
│   │   ├── localStorage.ts     # AsyncStorage abstraction for user preferences
│   │   └── database.ts         # SQLite driver interface stub for future offline queue
│   ├── store/
│   │   ├── useAppStore.ts      # Zustand store for UI preferences, language & farm state
│   │   └── useAuthStore.ts     # Zustand store for authentication lifecycle
│   ├── theme/
│   │   ├── tokens.ts           # Nature + Tech design tokens (colors, spacing, radiuses, shadows)
│   │   └── theme.ts            # Exported unified theme
│   └── types/
│       └── index.ts            # Core TypeScript interfaces & types
│
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── app.json                    # Expo configuration manifest
├── tsconfig.json               # TypeScript strict mode configuration
└── README.md                   # Developer documentation
```

---

## 4. Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on mobile device OR Android Emulator / iOS Simulator

### Quick Start

1. Clone or navigate to the project workspace:
   ```bash
   cd smart-livestock-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. Run on Android emulator:
   ```bash
   npm run android
   ```

---

## 5. Development & Code Quality Commands

- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```

- **ESLint Linting**:
  ```bash
  npx eslint .
  ```

- **Prettier Formatting Check**:
  ```bash
  npx prettier --check "src/**/*.{ts,tsx}" "app/**/*.{ts,tsx}"
  ```

---

## 6. Environment Configuration

Environment variables are managed in `src/configuration/env.ts`. You can override environments by setting `EXPO_PUBLIC_APP_ENV`:

```bash
# Development (default)
EXPO_PUBLIC_APP_ENV=development

# Staging
EXPO_PUBLIC_APP_ENV=staging

# Production
EXPO_PUBLIC_APP_ENV=production
```

> [!CAUTION]
> Never commit production secrets or private API keys to git repositories.

---

## 7. Extension Points for Future Modules

The architecture is explicitly designed so future domains can be added without refactoring Module 1 core code:

1. **Backend Integration (Module 2+)**: Connect Spring Boot REST & WebSockets APIs inside `src/services/` by swapping `AuthServiceAdapter` and `HttpClient`.
2. **Animal Management**: Expand `app/(main)/animals.tsx` and create `src/features/animals/`.
3. **IoT Telemetry Stream**: Connect Bluetooth/MQTT sensors via `src/services/telemetryService.ts` and update `LocalDatabase` for offline caching.
4. **AI Assistant**: Connect OpenAI / Gemini LLM API stream in `app/(main)/ai-assistant.tsx`.
5. **Offline Sync Engine**: Implement SQLite tables in `src/storage/database.ts` and sync queue engine.

---

## 8. Explicit Non-Goals in Module 1

- No fake backend endpoints pretending to be production servers.
- No real AI models embedded in client.
- No real IoT hardware telemetry.
- No complex database sync engine.
