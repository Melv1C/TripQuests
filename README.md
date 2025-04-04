# TripQuests

A gamified, social web app for group travel. Users join private "trips," create and complete creative "quests," submit proof (images, notes), and review each other's submissions via a peer review system.

## Firebase Configuration

This project uses Firebase for authentication, database, and storage. Follow these steps to set up your Firebase project:

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts to create a new project
3. Choose whether to enable Google Analytics (optional)

### 2. Register a Web App

1. In your Firebase project dashboard, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "TripQuests Web")
3. Register the app and copy the Firebase configuration object provided

### 3. Set Up Authentication

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the Email/Password provider
3. Optionally, enable other providers like Google, Facebook, etc.

### 4. Create Firestore Database

1. Go to "Firestore Database" in the Firebase Console
2. Click "Create database"
3. Start in test mode for development (you'll set up security rules later)
4. Choose a database location close to your target users

### 5. Set Up Storage

1. Go to "Storage" in the Firebase Console
2. Click "Get started"
3. Start with test rules for development
4. Choose a storage location close to your target users

### 6. Configure Environment Variables

1. Create a `.env` file in the root of the project (it's already in `.gitignore`)
2. Add your Firebase configuration as environment variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
# VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id # Optional, for Analytics
```

## Development

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Firebase Emulators (Optional)

For local development without connecting to production Firebase services:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in the project: `firebase init`
   - Select Firestore, Authentication, and Storage emulators
4. Start emulators: `firebase emulators:start`

## Tech Stack

- **Frontend:** React (with Vite), TypeScript, Material-UI (MUI), TanStack Query, Jotai, React Hook Form, Zod
- **Backend-as-a-Service:** Firebase (Firestore, Auth, Storage, Hosting, Security Rules)
