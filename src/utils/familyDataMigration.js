/**
 * Family Data Migration Utility for MiamBidi
 * Helps migrate mock data to Firestore and provides sample data creation
 */

import { 
  doc, 
  setDoc, 
  collection, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Sample family data for testing and development
 */
export const SAMPLE_FAMILY_DATA = {
  family: {
    name: 'Famille Takam',
    settings: {
      allowMemberInvites: true,
      weekStartsOn: 'Lundi',
      defaultMealTimes: ['Petit dejeuner', 'Dejeuner', 'Dinner', 'Collation'],
      shoppingListCategories: [
        'Tubercules & Plantains', 
        'Viandes & Poissons', 
        'Légumes-feuilles & Aromates', 
        'Céréales & Légumineuses', 
        'Huiles & Condiments', 
        'Boissons',
        'Collations',
        'Épices & Piments', 
        'Produits Laitiers & Œufs', 
        'Produits Congelés', 
        'Autres'
      ]
    }
  },
  members: [
    {
      email: 'paultakam@gmail.com',
      displayName: 'Papa Takam',
      role: 'admin',
      age: 55,
      preferences: {
        dietaryRestrictions: ['vegetarian', 'organic-only'],
        allergies: ['arachides', 'pistaches'],
        favoriteCategories: ['okok', 'eru', 'farm-to-table'],
        dislikedFoods: ['Champignons', 'sauce pistache']
      }
    },
    {
      email: 'jeannieakam@gmail.com',
      displayName: 'Takam Jeannie',
      role: 'admin',
      age: 48,
      preferences: {
        dietaryRestrictions: ['low-sodium'],
        allergies: ['Gombo'],
        favoriteCategories: ['Ndole', 'Mbongo Tchobi', 'Kondre'],
        dislikedFoods: ['koki', 'Couscous tapioca']
      }
    },
    {
      email: 'emma.takam@gmail.com',
      displayName: 'Emma Takam',
      role: 'member',
      age: 17,
      preferences: {
        dietaryRestrictions: [],
        allergies: [],
        favoriteCategories: ['Ndole', 'pizza'],
        dislikedFoods: ['Legumes', 'fish']
      }
    },
    {
      email: 'arthurtakam@gmail.com',
      displayName: 'Takam Arthur Junior',
      role: 'member',
      age: 12,
      preferences: {
        dietaryRestrictions: [],
        allergies: ['lait'],
        favoriteCategories: ['Ndole', 'collation'],
        dislikedFoods: ['legumes verts', 'soupe']
      }
    }
  ]
};

/**
 * Create sample family data in Firestore for testing
 * @param {string} userId - The user ID who will be the family admin
 * @returns {Promise<string>} - The created family ID
 */
export async function createSampleFamilyData(userId) {
  try {
    const familyId = `family_${userId}_${Date.now()}`;
    const batch = writeBatch(db);

    // Create family document
    const familyDoc = {
      id: familyId,
      name: SAMPLE_FAMILY_DATA.family.name,
      createdBy: userId,
      adminId: userId,
      members: [userId], // Start with just the creator
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: SAMPLE_FAMILY_DATA.family.settings
    };

    batch.set(doc(db, 'families', familyId), familyDoc);

    // Create family member document for the creator
    const creatorMember = {
      uid: userId,
      familyId: familyId,
      role: 'admin',
      joinedAt: serverTimestamp(),
      addedBy: userId,
      // Use first member data as template for creator
      ...SAMPLE_FAMILY_DATA.members[0],
      email: '', // Will be filled from user profile
      displayName: '' // Will be filled from user profile
    };

    batch.set(doc(db, 'families', familyId, 'members', userId), creatorMember);

    // Create additional sample family members (as non-user members)
    SAMPLE_FAMILY_DATA.members.slice(1).forEach((memberData, index) => {
      const memberId = `sample_member_${index + 1}_${Date.now()}`;
      const memberDoc = {
        uid: memberId,
        familyId: familyId,
        role: memberData.role,
        email: memberData.email,
        displayName: memberData.displayName,
        age: memberData.age,
        preferences: memberData.preferences,
        createdAt: serverTimestamp(),
        addedBy: userId,
        isSampleData: true // Mark as sample data
      };

      batch.set(doc(db, 'families', familyId, 'members', memberId), memberDoc);
      
      // Add member ID to family members array
      familyDoc.members.push(memberId);
    });

    // Update family document with all member IDs
    batch.update(doc(db, 'families', familyId), {
      members: familyDoc.members
    });

    await batch.commit();

    console.log('✅ Sample family data created successfully:', familyId);
    return familyId;
  } catch (error) {
    console.error('❌ Error creating sample family data:', error);
    throw error;
  }
}

/**
 * Migrate mock family data to Firestore format
 * @param {Object} mockFamilyData - Mock family data from MockFamilyContext
 * @param {string} userId - Current user ID
 * @returns {Object} - Firestore-compatible family data
 */
export function migrateMockDataToFirestore(mockFamilyData, userId) {
  const { family, familyMembers } = mockFamilyData;

  // Convert family data
  const firestoreFamily = {
    id: family.id || `family_${userId}_${Date.now()}`,
    name: family.name,
    createdBy: userId,
    adminId: family.adminId || userId,
    members: family.members || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: family.settings || SAMPLE_FAMILY_DATA.family.settings
  };

  // Convert family members
  const firestoreMembers = familyMembers.map(member => ({
    uid: member.uid,
    familyId: firestoreFamily.id,
    role: member.role || 'member',
    email: member.email,
    displayName: member.displayName,
    age: member.age,
    preferences: member.preferences || {
      dietaryRestrictions: [],
      allergies: [],
      favoriteCategories: [],
      dislikedFoods: []
    },
    createdAt: serverTimestamp(),
    addedBy: userId
  }));

  return {
    family: firestoreFamily,
    members: firestoreMembers
  };
}

/**
 * Validate family data structure
 * @param {Object} familyData - Family data to validate
 * @returns {Object} - Validation result
 */
export function validateFamilyData(familyData) {
  const errors = [];
  const warnings = [];

  // Validate family structure
  if (!familyData.family) {
    errors.push('Family data is missing');
  } else {
    if (!familyData.family.name) {
      errors.push('Family name is required');
    }
    if (!familyData.family.createdBy) {
      errors.push('Family creator ID is required');
    }
  }

  // Validate members structure
  if (!familyData.members || !Array.isArray(familyData.members)) {
    errors.push('Family members data is missing or invalid');
  } else {
    familyData.members.forEach((member, index) => {
      if (!member.uid) {
        errors.push(`Member ${index + 1}: UID is required`);
      }
      if (!member.displayName) {
        warnings.push(`Member ${index + 1}: Display name is missing`);
      }
      if (!member.role) {
        warnings.push(`Member ${index + 1}: Role is missing, defaulting to 'member'`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Clean up sample data (for testing purposes)
 * @param {string} familyId - Family ID to clean up
 */
export async function cleanupSampleData(familyId) {
  try {
    const batch = writeBatch(db);

    // Delete family document
    batch.delete(doc(db, 'families', familyId));

    // Note: In a real implementation, you'd also need to delete
    // all subcollection documents (members), but this requires
    // additional queries to find all member documents

    await batch.commit();
    console.log('✅ Sample data cleaned up:', familyId);
  } catch (error) {
    console.error('❌ Error cleaning up sample data:', error);
    throw error;
  }
}

export default {
  SAMPLE_FAMILY_DATA,
  createSampleFamilyData,
  migrateMockDataToFirestore,
  validateFamilyData,
  cleanupSampleData
};
