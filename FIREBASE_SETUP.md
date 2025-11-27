# Firebase Setup Guide

This guide will help you set up Firebase for the YouTube Deep Analyzer application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the wizard to create your project
4. Once created, click on the web icon (</>) to add a web app

## Step 2: Get Firebase Configuration

After adding a web app, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to **Build → Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode" (we'll set rules next)
4. Select your preferred location (choose closest to your users)
5. Click "Enable"

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read/write access to analyses collection
    // Note: For production, consider adding authentication
    match /analyses/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

**⚠️ Important:** These rules allow public access. For production use with user authentication, update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{document=**} {
      allow read, write: if request.auth != null; // Require authentication
    }
  }
}
```

## Step 5: Add Firebase Configuration to Your App

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Firebase configuration values to `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
```

**Note:** All Firebase environment variables must be prefixed with `NEXT_PUBLIC_` because they're used in client-side code.

## Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Analyze a YouTube video
3. Check the Firebase Console → Firestore Database
4. You should see a new collection called `analyses` with your saved analysis

## Firestore Data Structure

The app stores analysis results in the `analyses` collection with this structure:

```typescript
{
  videoId: string,              // YouTube video ID
  videoTitle: string,           // Video title
  videoChannel: string,         // Channel name
  videoUrl: string,             // Full YouTube URL
  modelUsed: string,           // AI model identifier
  totalComments: number,        // Number of comments analyzed
  analysis: {                   // Full analysis results object
    // ... detailed analysis data
  },
  tokensUsed: {                 // Optional token usage
    prompt: number,
    completion: number,
    total: number
  },
  createdAt: Timestamp         // Server-generated timestamp
}
```

## Troubleshooting

### Error: "Firebase app not initialized"
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
- Restart your dev server after adding environment variables

### Error: "Permission denied"
- Verify Firestore security rules allow read/write
- Check Firebase Console → Firestore Database → Rules

### Error: "Quota exceeded"
- Free tier limits: 1GB storage, 50K reads/day, 20K writes/day
- Check usage in Firebase Console → Usage and billing
- Consider upgrading to Blaze (pay-as-you-go) plan

## For Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all `NEXT_PUBLIC_FIREBASE_*` variables
4. Redeploy your application

## Free Tier Limits

Firebase Free (Spark) Plan includes:
- **Storage:** 1 GB
- **Document Reads:** 50,000/day
- **Document Writes:** 20,000/day
- **Document Deletes:** 20,000/day
- **Network Egress:** 10 GB/month

For most use cases, this is sufficient. If you exceed these limits, consider upgrading to the Blaze plan.
