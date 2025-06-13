# Firestore Database Setup for MiamBidi

## Overview

This document provides comprehensive instructions for setting up Firestore indexes required for MiamBidi's blog functionality and other features.

## Critical Blog Indexes

The blog functionality requires several composite indexes to function properly. Without these indexes, users will encounter errors when accessing the blog management page.

### Required Indexes

#### 1. User Blog Queries
```json
{
  "collectionGroup": "blogs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "authorId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "updatedAt",
      "order": "DESCENDING"
    }
  ]
}
```

#### 2. Public Blog Queries
```json
{
  "collectionGroup": "blogs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "visibility",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "publishedAt",
      "order": "DESCENDING"
    }
  ]
}
```

#### 3. Author + Status Queries
```json
{
  "collectionGroup": "blogs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "authorId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "updatedAt",
      "order": "DESCENDING"
    }
  ]
}
```

#### 4. Family Blog Queries
```json
{
  "collectionGroup": "blogs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "familyId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "publishedAt",
      "order": "DESCENDING"
    }
  ]
}
```

#### 5. Visibility Queries
```json
{
  "collectionGroup": "blogs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "visibility",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "publishedAt",
      "order": "DESCENDING"
    }
  ]
}
```

## Setup Methods

### Method 1: Automatic Index Creation (Recommended)

1. **Deploy the Application**: Deploy your application with the updated `firestore.indexes.json`
2. **Trigger Queries**: Navigate to the blog section and perform actions that trigger the queries
3. **Follow Firebase Links**: When errors occur, Firebase provides direct links to create indexes
4. **Click the Links**: Follow the provided links to automatically create the required indexes

### Method 2: Manual Firebase Console Setup

1. **Open Firebase Console**: Go to [Firebase Console](https://console.firebase.google.com/)
2. **Select Project**: Choose your MiamBidi project
3. **Navigate to Firestore**: Go to Firestore Database → Indexes
4. **Create Composite Indexes**: Add each of the required indexes listed above

### Method 3: Firebase CLI Deployment

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Deploy Indexes**: `firebase deploy --only firestore:indexes`

## Error Handling

The application includes robust error handling for missing indexes:

### Fallback Queries
- When composite indexes are missing, the app uses simpler queries without `orderBy`
- Results are sorted client-side to maintain functionality
- Users see informative messages about database initialization

### Error Messages
- **French Language**: All error messages are in French for consistency
- **User-Friendly**: Clear explanations of temporary limitations
- **Actionable**: Retry buttons and alternative actions when possible

### Graceful Degradation
- **No App Crashes**: Missing indexes don't break the application
- **Limited Functionality**: Some features may be temporarily limited
- **Automatic Recovery**: Full functionality resumes once indexes are created

## Monitoring and Validation

### Index Status Check
```javascript
// Check if indexes are working
const testIndexes = async () => {
  try {
    // Test user blogs query
    const userQuery = query(
      collection(db, 'blogs'),
      where('authorId', '==', 'test-user'),
      orderBy('updatedAt', 'desc')
    );
    await getDocs(userQuery);
    console.log('✅ User blogs index working');

    // Test public blogs query
    const publicQuery = query(
      collection(db, 'blogs'),
      where('status', '==', 'published'),
      where('visibility', '==', 'public'),
      orderBy('publishedAt', 'desc')
    );
    await getDocs(publicQuery);
    console.log('✅ Public blogs index working');

  } catch (error) {
    console.error('❌ Index missing:', error);
  }
};
```

### Performance Monitoring
- Monitor query performance in Firebase Console
- Check for slow queries that might need additional indexes
- Review usage patterns to optimize index strategy

## Deployment Checklist

### Pre-Deployment
- [ ] Update `firestore.indexes.json` with all required indexes
- [ ] Test locally with Firestore emulator
- [ ] Verify all blog queries work correctly
- [ ] Test error handling with missing indexes

### Post-Deployment
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Test blog functionality in production
- [ ] Monitor error logs for missing indexes
- [ ] Verify user experience is smooth

### Troubleshooting
- [ ] Check Firebase Console for index creation status
- [ ] Review application logs for Firestore errors
- [ ] Test with different user accounts and scenarios
- [ ] Verify fallback queries work correctly

## Security Rules

Ensure your Firestore security rules allow proper access to blog collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog collection rules
    match /blogs/{blogId} {
      // Allow read for published public blogs
      allow read: if resource.data.status == 'published' && 
                     resource.data.visibility == 'public';
      
      // Allow read for authenticated users on premium content
      allow read: if request.auth != null && 
                     resource.data.status == 'published' && 
                     resource.data.visibility == 'premium';
      
      // Allow full access for blog authors
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.authorId;
      
      // Allow creation for authenticated users
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.authorId;
    }
  }
}
```

## Support and Maintenance

### Regular Maintenance
- Review index usage monthly
- Clean up unused indexes
- Monitor query performance
- Update indexes for new features

### Emergency Procedures
- If critical indexes are missing, use Firebase Console quick-create links
- Monitor application logs for new index requirements
- Have rollback plan for index changes

### Contact Information
- Firebase Support: [Firebase Support](https://firebase.google.com/support)
- Documentation: [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

---

**Note**: Index creation can take several minutes to hours depending on data size. Plan accordingly for production deployments.
