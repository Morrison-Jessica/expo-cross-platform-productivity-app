# Productivity App

## Course / Module 1

Connected Devices & Applications — Module 1

## Project Overview

A local productivity app for iOS and web, built with Expo and React Native. The app has three screens: Home / Tasks, Add Task, and Settings. Tasks and preferences persist between sessions.

## Features

- Create tasks with a required title, optional description, and required High, Medium, or Low priority.
- View saved tasks with color-coded priority labels.
- Mark tasks complete or incomplete, with a status label and struck-through titles for completed tasks.
- Delete tasks after confirmation.
- Filter tasks by All, Active, or Completed.
- View total and completed task counts.
- Save a user name and Light or Dark theme preference.
- Apply the saved theme across all screens and navigation.
- Display validation, loading, and storage error messages.

**Chosen enhanced feature:** Dark Mode, implemented with NativeWind and restored from saved settings when the app starts.

## Tech Stack

- Expo SDK 55 and React Native 0.83
- React 19 and TypeScript
- Expo Router for navigation
- NativeWind v4 with Tailwind CSS v3 for styling
- Expo SQLite for tasks
- Expo SecureStore for iOS settings
- Browser `localStorage` for web settings

## Data Storage

Tasks use Expo SQLite in the local `productivity.db` database. The `tasks` table stores an ID, title, description, priority, and completion status. A small migration adds completion status to existing databases without removing tasks; existing and new tasks default to incomplete.

Settings are stored together under the `productivity_settings` key:

- **iOS:** Expo SecureStore.
- **Web:** browser `localStorage`.

Selecting **Save Settings** saves the user name and applies the selected theme. Light is the default when no preferences have been saved.

SQLite web support uses Metro WebAssembly (`.wasm`) asset support. The Metro development server also supplies the cross-origin isolation headers needed by SQLite on web. A deployed web server must provide equivalent headers.

Data is stored locally on each device or browser; the app does not sync data between platforms.

## Getting Started

Install Node.js and npm before starting. Local iOS simulator testing also requires macOS, Xcode, and an installed iOS simulator.

Run these commands from the project directory.

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

### Run on web

```bash
npm run web
```

### Run on the iOS simulator

```bash
npm run ios
```

The web and iOS commands start Expo for the selected platform; they are alternatives to starting the development server separately.

## Testing

The app was tested on:

- Google Chrome.
- An iPhone 17 Pro simulator running iOS 26.2.

The main verification steps are:

1. Create tasks with each priority, including a task without a description; confirm blank titles and missing priorities are rejected.
2. Confirm saved tasks appear on Home and remain after refresh or restart.
3. Toggle completion and check the visual feedback, filters, and counts.
4. Cancel a deletion, then confirm a deletion and verify the updated list and counts.
5. Save a user name and each theme; confirm settings persist after reload and the theme applies to all screens and navigation.

Run the TypeScript check with:

```bash
npx tsc --noEmit
```

## Project Status

The Module 1 task-management and settings features are implemented, including Dark Mode as the chosen enhanced feature. The app supports local task creation, completion changes, confirmed deletion, status filtering, statistics, and saved preferences on iOS and web.

## AI Disclosure

ChatGPT was used to assist with troubleshooting, development guidance, and documentation. All code was reviewed and approved by the author.
