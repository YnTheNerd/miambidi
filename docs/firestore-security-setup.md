# 🔒 Firestore Security Rules Setup for MiamBidi

## Overview
This guide provides comprehensive Firestore security rules for the MiamBidi application, ensuring proper authentication, authorization, and data protection.

## 🚀 Quick Setup

### 1. Deploy Security Rules
1. **Copy the rules**: Copy the content from `firestore.rules` file
2. **Open Firebase Console**: Go to [Firebase Console](https://console.firebase.google.com/)
3. **Navigate to Firestore**: Select your "miambidi" project > Firestore Database
4. **Go to Rules tab**: Click on "Rules" tab
5. **Paste the rules**: Replace existing rules with the new comprehensive rules
6. **Publish**: Click "Publish" to deploy the rules

### 2. Test the Rules
Use the Firebase Console Rules Playground to test various scenarios:
- User authentication
- Family member access
- Recipe visibility
- Shopping list permissions

## 🔐 Security Features Implemented

### **Authentication Requirements**
- ✅ **All operations require authentication** except public recipe reads
- ✅ **User identity verification** for all personal data access
- ✅ **Session-based security** with Firebase Auth integration

### **User Profile Security**
- ✅ **Self-access only**: Users can only read/write their own profiles
- ✅ **Family visibility**: Family members can see basic info of other members
- ✅ **Data validation**: Ensures required fields are present and properly typed

### **Family Management Security**
- ✅ **Role-based access**: Admin vs Member permissions
- ✅ **Family isolation**: Members can only access their own family data
- ✅ **Admin controls**: Only family admins can modify family settings
- ✅ **Member management**: Admins can manage all family members

### **Recipe Security**
- ✅ **Visibility control**: Public vs Private recipe access
- ✅ **Creator ownership**: Recipe creators have full control
- ✅ **Family sharing**: Private recipes shared within family
- ✅ **Public access**: Public recipes readable by anyone

### **Meal Planning Security**
- ✅ **Family-scoped**: Meal plans isolated to family members
- ✅ **Collaborative editing**: All family members can update meal plans
- ✅ **Creator privileges**: Meal plan creators and admins can delete

### **Shopping List Security**
- ✅ **Family collaboration**: All family members can check off items
- ✅ **Creator control**: List creators and admins can delete lists
- ✅ **Real-time updates**: Multiple family members can update simultaneously

## 📋 Data Structure Requirements

### **User Document Structure**
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  familyId: "family-id", // optional
  createdAt: timestamp,
  // ... other fields
}
```

### **Family Document Structure**
```javascript
{
  name: "Family Name",
  createdBy: "user-id",
  createdAt: timestamp,
  // ... other fields
}
```

### **Recipe Document Structure**
```javascript
{
  title: "Recipe Title",
  createdBy: "user-id",
  createdAt: timestamp,
  visibility: "public" | "private",
  familyId: "family-id", // required for private recipes
  // ... other fields
}
```

## 🧪 Testing Security Rules

### **Test Scenarios**

#### **1. User Profile Access**
```javascript
// ✅ Should ALLOW: User reading own profile
// ❌ Should DENY: User reading another user's profile
// ✅ Should ALLOW: Family member reading basic info of family member
```

#### **2. Family Management**
```javascript
// ✅ Should ALLOW: Family admin updating family settings
// ❌ Should DENY: Regular member updating family settings
// ✅ Should ALLOW: Family member reading family data
```

#### **3. Recipe Visibility**
```javascript
// ✅ Should ALLOW: Anyone reading public recipes
// ✅ Should ALLOW: Family member reading private family recipes
// ❌ Should DENY: Non-family member reading private recipes
```

#### **4. Shopping List Collaboration**
```javascript
// ✅ Should ALLOW: Family member checking off shopping list items
// ✅ Should ALLOW: Family admin deleting shopping lists
// ❌ Should DENY: Non-family member accessing shopping lists
```

## 🔧 Implementation Steps

### **Step 1: Deploy Rules**
1. Copy rules from `firestore.rules`
2. Paste into Firebase Console > Firestore > Rules
3. Click "Publish"

### **Step 2: Update Application Code**
Ensure your application code follows the security model:

```javascript
// Example: Creating a recipe with proper security
const createRecipe = async (recipeData) => {
  const recipe = {
    ...recipeData,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    visibility: 'private', // or 'public'
    familyId: userProfile.familyId // for private recipes
  };
  
  await addDoc(collection(db, 'recipes'), recipe);
};
```

### **Step 3: Test Security**
1. Use Firebase Console Rules Playground
2. Test different user scenarios
3. Verify access controls work as expected

## ⚠️ Important Security Notes

### **Data Validation**
- All documents must include required fields
- Timestamps must use `serverTimestamp()`
- User IDs must match authenticated user

### **Family Isolation**
- Family data is completely isolated between families
- No cross-family data access allowed
- Family membership is strictly enforced

### **Recipe Visibility**
- Public recipes are globally readable
- Private recipes are family-scoped only
- Recipe creators have full control

### **Admin Privileges**
- Family admins can manage all family data
- Regular members have limited permissions
- Admin status is verified server-side

## 🚨 Security Best Practices

### **1. Always Validate on Client**
```javascript
// Validate data before sending to Firestore
if (!recipeData.title || !recipeData.createdBy) {
  throw new Error('Missing required fields');
}
```

### **2. Use Server Timestamps**
```javascript
// Always use serverTimestamp() for consistency
createdAt: serverTimestamp(),
updatedAt: serverTimestamp()
```

### **3. Check User Authentication**
```javascript
// Always verify user is authenticated
if (!auth.currentUser) {
  throw new Error('User not authenticated');
}
```

### **4. Validate Family Membership**
```javascript
// Verify user is family member before operations
if (!userProfile.familyId) {
  throw new Error('User not part of a family');
}
```

## 📞 Troubleshooting

### **Common Issues**

#### **"Permission Denied" Errors**
- Check user authentication status
- Verify family membership
- Ensure required fields are present
- Check document structure matches rules

#### **"Missing Required Fields" Errors**
- Include all required fields in document creation
- Use proper data types (string, timestamp, etc.)
- Validate data before Firestore operations

#### **Family Access Issues**
- Verify user has familyId in profile
- Check family membership document exists
- Ensure family admin role is properly set

## ✅ Security Checklist

- [ ] Rules deployed to Firebase Console
- [ ] User authentication working
- [ ] Family isolation tested
- [ ] Recipe visibility controls working
- [ ] Shopping list permissions verified
- [ ] Admin privileges functioning
- [ ] Data validation rules active
- [ ] No unauthorized access possible

Your Firestore database is now secured with comprehensive rules that protect user data while enabling collaborative family features! 🔒
