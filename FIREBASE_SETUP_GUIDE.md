# MiamBidi - Family Meal Planning Application

## 🎯 Application Overview
A comprehensive React + Firebase family meal planning application that enables families to:
- Plan weekly meal schedules collaboratively
- Automatically generate shopping lists based on planned recipes
- Manage family member profiles with dietary restrictions
- Share and organize recipe collections

## ✅ Completed Setup

### 1. Dependencies Installed
All required dependencies have been successfully installed:

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/icons-material": "^7.1.0",
    "@mui/material": "^7.1.0",
    "firebase": "^11.8.1",
    "react": "^19.1.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^19.1.0",
    "react-router-dom": "^6.30.1"
  }
}
```

### 2. Firebase Configuration
Created `src/firebase.js` with complete Firebase services:
- Project ID: `food-planner237`
- Auth Domain: `food-planner237.firebaseapp.com`
- Storage Bucket: `food-planner237.firebasestorage.app`
- Services: Firestore, Authentication, Analytics, Storage

### 3. Application Architecture
```
my-react-app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx           # Email/password & Google login
│   │   │   ├── Signup.jsx          # User registration
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── family/
│   │   │   └── FamilySetup.jsx     # Family creation/joining
│   │   └── layout/
│   │       └── Navigation.jsx      # Main navigation with drawer
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Authentication state management
│   │   └── FamilyContext.jsx       # Family data management
│   ├── pages/
│   │   ├── AuthPage.jsx           # Authentication page
│   │   └── Dashboard.jsx          # Main dashboard
│   ├── firebase.js                # Firebase configuration
│   └── App.jsx                    # Main app with routing
├── package.json                   # Dependencies
└── index.html                     # Updated title
```

## 🔧 Firebase Console Setup Required

### Step 1: Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Verify the project `food-planner237` exists
3. If not, create a new project with this exact name

### Step 2: Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Done**

### Step 3: Configure Firestore Security Rules
In the Firebase Console, go to **Firestore Database > Rules** and apply these comprehensive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Family documents - members can read, admins can write
    match /families/{familyId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.members;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.adminId;
    }

    // Recipes - family members can read/write family recipes
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/families/$(resource.data.familyId)) &&
        request.auth.uid in get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members;
    }

    // Meal plans - family members can read/write
    match /mealPlans/{planId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/families/$(resource.data.familyId)) &&
        request.auth.uid in get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members;
    }

    // Shopping lists - family members can read/write
    match /shoppingLists/{listId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/families/$(resource.data.familyId)) &&
        request.auth.uid in get(/databases/$(database)/documents/families/$(resource.data.familyId)).data.members;
    }
  }
}
```

### Step 4: Enable Authentication (Optional)
1. Go to **Authentication** in Firebase Console
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable desired authentication providers (Email/Password, Google, etc.)

### Step 5: Enable Analytics (Optional)
1. Go to **Analytics** in Firebase Console
2. Click **Enable Google Analytics**
3. Follow the setup wizard

## 🚀 Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser

3. Check the browser console for Firebase connection logs

4. Use the Firebase Demo component to test connections

## 📋 Verification Checklist

- [x] Firebase SDK installed and configured
- [x] Material-UI components available
- [x] React Router DOM v6 installed
- [x] React Beautiful DnD installed
- [x] Firebase configuration file created
- [x] Demo component showing Firebase integration
- [ ] Firestore Database enabled in Firebase Console
- [ ] Security rules applied
- [ ] Authentication enabled (if needed)

## 🔍 Testing Firebase Connection

The application includes a `FirebaseDemo` component that:
- Shows connection status for all Firebase services
- Provides test buttons for Firestore, Auth, and Analytics
- Displays Material-UI components and icons
- Logs detailed connection information to console

## 📝 Next Steps

1. Complete the Firebase Console setup steps above
2. Test the Firebase connection using the demo component
3. Start building your application features
4. Consider writing unit tests for Firebase integration

## ⚠️ Important Notes

- React Beautiful DnD is deprecated but still functional
- Firebase security rules currently allow authenticated users only
- Make sure to update security rules for production use
- The current setup uses Firebase v11.8.1 (latest version)
