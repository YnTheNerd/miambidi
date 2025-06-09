# Firebase Setup Guide for MiamBidi

## 🔥 Firebase Configuration Troubleshooting

If you're encountering the error "Firebase: Error (auth/configuration-not-found)", follow this comprehensive guide to resolve the issue.

## 1. Firebase Console Setup

### Step 1: Verify Project Exists
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Ensure the project "miambidi" exists
3. If not, create a new project with the ID "miambidi"

### Step 2: Enable Authentication
1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", add your domain (localhost:5174 for development), and save

### Step 3: Configure Authorized Domains
1. In **Authentication** > **Settings** > **Authorized domains**
2. Ensure these domains are added:
   - `localhost` (for development)
   - `miambidi.firebaseapp.com` (default)
   - Your production domain (if applicable)

### Step 4: Get Configuration Keys
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. If no web app exists, click "Add app" and select web (</>) icon
4. Copy the configuration object

## 2. Verify Firebase Configuration

### Current Configuration Check
Your current `src/firebase.js` should have:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBfXa4eLs5pab9Zia5kS8idvHx-tMssc94",
  authDomain: "miambidi.firebaseapp.com",
  projectId: "miambidi",
  storageBucket: "miambidi.firebasestorage.app",
  messagingSenderId: "278582031159",
  appId: "1:278582031159:web:14503ac6077607b53460b2",
  measurementId: "G-GLH328GZJT"
};
```

### Validation Steps
1. **API Key**: Should start with "AIzaSy"
2. **Auth Domain**: Should end with ".firebaseapp.com"
3. **Project ID**: Should match your Firebase project ID
4. **App ID**: Should start with your project number

## 3. Common Issues and Solutions

### Issue 1: "auth/configuration-not-found"
**Causes:**
- Authentication not enabled in Firebase Console
- Incorrect project configuration
- Missing authorized domains

**Solutions:**
1. Enable Email/Password and Google authentication in Firebase Console
2. Add localhost to authorized domains
3. Verify project ID matches Firebase Console

### Issue 2: "auth/unauthorized-domain"
**Causes:**
- Current domain not in authorized domains list

**Solutions:**
1. Add `localhost` to authorized domains
2. Add your development server URL (e.g., `localhost:5174`)

### Issue 3: "auth/popup-blocked"
**Causes:**
- Browser blocking popups for Google sign-in

**Solutions:**
1. Allow popups for localhost in browser settings
2. Try signing in again

## 4. Testing Your Configuration

### Browser Console Testing
1. Open browser developer tools
2. Go to Console tab
3. Look for Firebase debug messages when the app loads
4. Check for any configuration errors

### Manual Testing Steps
1. **Load the app**: Go to `http://localhost:5174`
2. **Check console**: Look for "🔥 Firebase Configuration Debug Info"
3. **Test email login**: Try creating an account with email/password
4. **Test Google login**: Try signing in with Google

## 5. Environment-Specific Configuration

### Development Environment
```javascript
// In src/firebase.js - already configured
if (process.env.NODE_ENV === 'development') {
  // Development-specific settings
  console.log('Running in development mode');
}
```

### Production Environment
For production deployment, ensure:
1. Add your production domain to authorized domains
2. Update CORS settings if needed
3. Configure proper security rules

## 6. Debugging Commands

### Check Firebase Status
Open browser console and run:
```javascript
// Check if Firebase is initialized
console.log('Firebase Auth:', firebase.auth());
console.log('Current User:', firebase.auth().currentUser);
```

### Validate Configuration
The app automatically runs validation on startup. Check console for:
- ✅ Firebase configuration is valid
- ❌ Firebase configuration has errors

## 7. Quick Fix Checklist

- [ ] Firebase project "miambidi" exists
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled
- [ ] localhost added to authorized domains
- [ ] Configuration keys are correct
- [ ] Browser allows popups
- [ ] No console errors on app load

## 8. Contact Support

If issues persist:
1. Check browser console for specific error messages
2. Verify all steps in this guide
3. Try creating a new Firebase project for testing
4. Clear browser cache and cookies

## 9. Alternative Configuration

If the current project has issues, you can create a new Firebase project:

1. Create new project in Firebase Console
2. Enable Authentication with Email/Password and Google
3. Copy the new configuration
4. Replace the config in `src/firebase.js`
5. Update project ID references

Remember to keep your API keys secure and never commit them to public repositories in production!
