/**
 * Firestore Family Context for MiamBidi
 * Complete family management with real-time Firestore synchronization
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const FirestoreFamilyContext = createContext();

export function useFamily() {
  const context = useContext(FirestoreFamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FirestoreFamilyProvider');
  }
  return context;
}

export function FirestoreFamilyProvider({ children }) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State management
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current user with family role (for API compatibility)
  const [currentFamilyUser, setCurrentFamilyUser] = useState(null);

  // Helper function to generate family ID
  const generateFamilyId = () => `family_${currentUser.uid}_${Date.now()}`;

  // Helper function to generate member ID
  const generateMemberId = () => `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Create a new family
   */
  const createFamily = useCallback(async (familyName) => {
    if (!currentUser) {
      throw new Error('L\'utilisateur doit être authentifié');
    }

    setLoading(true);
    setError(null);

    try {
      const familyId = generateFamilyId();
      const familyDoc = {
        id: familyId,
        name: familyName.trim(),
        createdBy: currentUser.uid,
        adminId: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
      };

      // Create family document
      await setDoc(doc(db, 'families', familyId), familyDoc);

      // Create family member document for the creator
      const memberDoc = {
        uid: currentUser.uid,
        familyId: familyId,
        role: 'admin',
        joinedAt: serverTimestamp(),
        addedBy: currentUser.uid
      };
      await setDoc(doc(db, 'families', familyId, 'members', currentUser.uid), memberDoc);

      // Update user profile with family ID
      await updateUserProfile({ familyId, role: 'admin' });

      showSuccess('Famille créée avec succès!');
      return familyDoc;
    } catch (error) {
      console.error('Error creating family:', error);
      setError(error.message);
      showError('Erreur lors de la création de la famille');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser, updateUserProfile, showSuccess, showError]);

  /**
   * Add a new family member
   */
  const addFamilyMember = useCallback(async (memberData) => {
    if (!family || !currentUser) {
      throw new Error('Famille ou utilisateur non trouvé');
    }

    try {
      const memberId = generateMemberId();
      const newMember = {
        uid: memberId,
        email: memberData.email,
        displayName: memberData.displayName,
        familyId: family.id,
        role: 'member',
        age: memberData.age || null,
        preferences: {
          dietaryRestrictions: memberData.dietaryRestrictions || [],
          allergies: memberData.allergies || [],
          favoriteCategories: memberData.favoriteCategories || [],
          dislikedFoods: memberData.dislikedFoods || []
        },
        createdAt: serverTimestamp(),
        addedBy: currentUser.uid
      };

      // Use batch write for consistency
      const batch = writeBatch(db);

      // Add member to family members subcollection
      batch.set(doc(db, 'families', family.id, 'members', memberId), newMember);

      // Update family document with new member ID
      batch.update(doc(db, 'families', family.id), {
        members: arrayUnion(memberId),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      showSuccess(`${memberData.displayName} ajouté à la famille`);
      return { ...newMember, uid: memberId };
    } catch (error) {
      console.error('Error adding family member:', error);
      showError('Erreur lors de l\'ajout du membre');
      throw error;
    }
  }, [family, currentUser, showSuccess, showError]);

  /**
   * Update family member
   */
  const updateFamilyMember = useCallback(async (memberId, updates) => {
    if (!family) {
      throw new Error('Famille non trouvée');
    }

    try {
      const memberRef = doc(db, 'families', family.id, 'members', memberId);
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      showSuccess('Membre mis à jour avec succès');
    } catch (error) {
      console.error('Error updating family member:', error);
      showError('Erreur lors de la mise à jour du membre');
      throw error;
    }
  }, [family, showSuccess, showError]);

  /**
   * Remove family member
   */
  const removeFamilyMember = useCallback(async (memberId) => {
    if (!family || !currentUser) {
      throw new Error('Famille ou utilisateur non trouvé');
    }

    if (memberId === currentUser.uid) {
      throw new Error('Vous ne pouvez pas vous supprimer de la famille');
    }

    try {
      const batch = writeBatch(db);

      // Remove member from family members subcollection
      batch.delete(doc(db, 'families', family.id, 'members', memberId));

      // Update family document to remove member ID
      batch.update(doc(db, 'families', family.id), {
        members: arrayRemove(memberId),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      showSuccess('Membre supprimé de la famille');
    } catch (error) {
      console.error('Error removing family member:', error);
      showError('Erreur lors de la suppression du membre');
      throw error;
    }
  }, [family, currentUser, showSuccess, showError]);

  /**
   * Update member role
   */
  const updateMemberRole = useCallback(async (memberId, newRole) => {
    if (!family || !currentFamilyUser) {
      throw new Error('Famille ou utilisateur non trouvé');
    }

    if (currentFamilyUser.role !== 'admin') {
      throw new Error('Seuls les admins peuvent changer les rôles');
    }

    try {
      const memberRef = doc(db, 'families', family.id, 'members', memberId);
      await updateDoc(memberRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });

      showSuccess('Rôle du membre mis à jour');
    } catch (error) {
      console.error('Error updating member role:', error);
      showError('Erreur lors de la mise à jour du rôle');
      throw error;
    }
  }, [family, currentFamilyUser, showSuccess, showError]);

  /**
   * Update family settings
   */
  const updateFamilySettings = useCallback(async (settings) => {
    if (!family) {
      throw new Error('Famille non trouvée');
    }

    try {
      await updateDoc(doc(db, 'families', family.id), {
        settings: { ...family.settings, ...settings },
        updatedAt: serverTimestamp()
      });

      showSuccess('Paramètres de la famille mis à jour');
    } catch (error) {
      console.error('Error updating family settings:', error);
      showError('Erreur lors de la mise à jour des paramètres');
      throw error;
    }
  }, [family, showSuccess, showError]);

  /**
   * Update family name
   */
  const updateFamilyName = useCallback(async (newName) => {
    if (!family || !currentFamilyUser) {
      throw new Error('Famille ou utilisateur non trouvé');
    }

    if (currentFamilyUser.role !== 'admin') {
      throw new Error('Seuls les admins peuvent changer le nom de famille');
    }

    try {
      await updateDoc(doc(db, 'families', family.id), {
        name: newName.trim(),
        updatedAt: serverTimestamp()
      });

      showSuccess('Nom de famille mis à jour');
    } catch (error) {
      console.error('Error updating family name:', error);
      showError('Erreur lors de la mise à jour du nom');
      throw error;
    }
  }, [family, currentFamilyUser, showSuccess, showError]);

  /**
   * Join an existing family
   */
  const joinFamily = useCallback(async (familyId) => {
    if (!currentUser) {
      throw new Error('L\'utilisateur doit être authentifié');
    }

    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (!familyDoc.exists()) {
        throw new Error('La famille n\'existe pas');
      }

      const batch = writeBatch(db);

      // Add member to family members subcollection
      const memberDoc = {
        uid: currentUser.uid,
        familyId: familyId,
        role: 'member',
        joinedAt: serverTimestamp(),
        addedBy: currentUser.uid
      };
      batch.set(doc(db, 'families', familyId, 'members', currentUser.uid), memberDoc);

      // Update family document with new member
      batch.update(doc(db, 'families', familyId), {
        members: arrayUnion(currentUser.uid),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Update user profile
      await updateUserProfile({ familyId, role: 'member' });

      showSuccess('Vous avez rejoint la famille!');
      return familyDoc.data();
    } catch (error) {
      console.error('Error joining family:', error);
      showError('Erreur lors de l\'adhésion à la famille');
      throw error;
    }
  }, [currentUser, updateUserProfile, showSuccess, showError]);

  /**
   * Leave family
   */
  const leaveFamily = useCallback(async () => {
    if (!currentUser || !userProfile?.familyId) return;

    try {
      const batch = writeBatch(db);

      // Remove member from family members subcollection
      batch.delete(doc(db, 'families', userProfile.familyId, 'members', currentUser.uid));

      // Update family document to remove member
      batch.update(doc(db, 'families', userProfile.familyId), {
        members: arrayRemove(currentUser.uid),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Update user profile
      await updateUserProfile({ familyId: null, role: null });

      setFamily(null);
      setFamilyMembers([]);
      setCurrentFamilyUser(null);

      showSuccess('Vous avez quitté la famille');
    } catch (error) {
      console.error('Error leaving family:', error);
      showError('Erreur lors de la sortie de la famille');
      throw error;
    }
  }, [currentUser, userProfile, updateUserProfile, showSuccess, showError]);

  /**
   * Fetch family members from subcollection
   */
  const fetchFamilyMembers = useCallback(async (familyId) => {
    if (!familyId) return [];

    try {
      const membersQuery = query(collection(db, 'families', familyId, 'members'));
      const membersSnapshot = await getDocs(membersQuery);
      return membersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      }));
    } catch (error) {
      console.error('Error fetching family members:', error);
      return [];
    }
  }, []);

  /**
   * Real-time family data subscription
   */
  useEffect(() => {
    if (!userProfile?.familyId) {
      setFamily(null);
      setFamilyMembers([]);
      setCurrentFamilyUser(null);
      setLoading(false);
      return;
    }

    console.log('🏠 Setting up family data subscription for:', userProfile.familyId);

    // Subscribe to family document
    const unsubscribeFamily = onSnapshot(
      doc(db, 'families', userProfile.familyId),
      async (familyDoc) => {
        if (familyDoc.exists()) {
          const familyData = { ...familyDoc.data(), id: familyDoc.id };
          setFamily(familyData);
          console.log('🏠 Family data updated:', familyData.name);
        } else {
          setFamily(null);
          console.log('🏠 Family document not found');
        }
      },
      (error) => {
        console.error('Error listening to family changes:', error);
        setError(error.message);
      }
    );

    // Subscribe to family members subcollection
    const unsubscribeMembers = onSnapshot(
      collection(db, 'families', userProfile.familyId, 'members'),
      (membersSnapshot) => {
        const members = membersSnapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        }));
        setFamilyMembers(members);

        // Set current family user for API compatibility
        const currentMember = members.find(member => member.uid === currentUser?.uid);
        if (currentMember) {
          setCurrentFamilyUser({
            ...currentUser,
            ...currentMember,
            familyId: userProfile.familyId
          });
        }

        console.log('👥 Family members updated:', members.length, 'members');
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to family members:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeFamily();
      unsubscribeMembers();
    };
  }, [userProfile?.familyId, currentUser]);

  /**
   * Initialize loading state
   */
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  const value = {
    // State (API compatible with MockFamilyContext)
    currentUser: currentFamilyUser, // For API compatibility
    currentFamily: family, // For RecipeContext compatibility
    family,
    familyMembers,
    loading,
    error,

    // Family operations
    createFamily,
    joinFamily,
    leaveFamily,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateMemberRole,
    updateFamilySettings,
    updateFamilyName,

    // Additional utilities
    fetchFamilyMembers
  };

  return (
    <FirestoreFamilyContext.Provider value={value}>
      {children}
    </FirestoreFamilyContext.Provider>
  );
}
