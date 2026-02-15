# Todo App (Expo + Convex)

A React Native Todo app built with Expo Router and Convex.

## Features

- Email/password authentication with Convex Auth
- Todo CRUD with priority and category
- Offline-friendly startup for previously signed-in users
- Auto-sync status and network awareness
- Settings screen with:
  - Profile (name + email)
  - Version
  - Preferences (dark mode, notifications, auto-sync)

## Tech Stack

- Expo SDK 54 + Expo Router
- React Native 0.81
- Convex (`convex`, `@convex-dev/auth`)
- AsyncStorage + NetInfo

## Prerequisites

- Node.js 18+
- npm
- Expo CLI/EAS CLI (via `npx` is fine)
- Convex account

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start Convex (in terminal 1)

```bash
npx convex dev
```

3. Start Expo (in terminal 2)

```bash
npm run start
```

## Environment

This project uses `.env.local` for local Convex setup.

Expected values:

- `CONVEX_DEPLOYMENT`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CONVEX_SITE_URL`

`npx convex dev` will provision/update deployment values as needed.

## Auth Notes

- Convex auth provider config lives in:
  - `convex/auth.config.ts`
- Auth server config lives in:
  - `convex/auth.ts`
- Custom password profile stores `name` and `email` on sign-up.

## Convex Schema

Schema is in:

- `convex/schema.ts`

Includes:

- Convex Auth tables (`...authTables`)
- Explicit `users` table extension with optional `name`
- `todos` table

## Run Migrations / Utilities

Utility mutations are in:

- `convex/migrations.ts`

Example:

```bash
npx convex run migrations:cleanupOrphanAuthRecords
```

## Build with EAS

### Preview build (internal)

```bash
eas build -p android --profile preview
eas build -p ios --profile preview
```

### Production build

```bash
eas build -p android --profile production
eas build -p ios --profile production
```

### Build all

```bash
eas build -p all --profile production
```

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Folder Highlights

- `app/` Expo Router screens
- `components/` UI building blocks
- `contexts/` Auth and Sync state
- `hooks/` app hooks (theme, network, auto-sync, notifications)
- `convex/` backend functions, schema, auth config

## License

Private/internal project.
