import React, { createContext, useContext, useState, useEffect } from 'react';
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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const FamilyContext = createContext();

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}

export function FamilyProvider({ children }) {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creer une nouvelle famille 
  async function createFamily(familyName) {
    if (!currentUser) throw new Error('L\'utilisateur doit être authentifié');

    const familyId = `family_${currentUser.uid}_${Date.now()}`;
    const familyDoc = {
      id: familyId,
      name: familyName,
      adminId: currentUser.uid,
      members: [currentUser.uid],
      createdAt: new Date().toISOString(),
      settings: {
        allowMemberInvites: true,
        weekStartsOn: 'Lundi', // monday, sunday
        defaultMealTimes: ['Petit dejeuner', 'Dejeuner', 'Dinner'],
        shoppingListCategories: [
          'Fruits & Légumes', 
          'Tubercules & Plantains', 
          'Légumes-feuilles & Aromates', 
          'Céréales & Légumineuses', 
          'Huiles & Condiments',
          'Produits Laitiers',
          'Viande & Poisson',
          'Épicerie',
          'Surgelés',
          'Boissons', 
          'Collations', 
          'Autres' 
        ]
      }
    };

    try {
      // Creer un document famille
      await setDoc(doc(db, 'families', familyId), familyDoc);
      
      // Mettre a jour le profil utilisateur avec l'ID de la famille
      await updateUserProfile({ familyId, role: 'admin' });
      
      setFamily(familyDoc);
      return familyDoc;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  // Rejoindre une famille existante
  async function joinFamily(familyId) {
    if (!currentUser) throw new Error('L\'utilisateur doit être authentifié');

    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (!familyDoc.exists()) {
        throw new Error('La famille n\'existe pas');
      }

      // Ajouter l'utilisateur aux membres de la famille
      await updateDoc(doc(db, 'families', familyId), {
        members: arrayUnion(currentUser.uid)
      });

      // Mettre a jour le profil utilisateur
      await updateUserProfile({ familyId, role: 'member' });

      return familyDoc.data();
    } catch (error) {
      console.error('Error joining family:', error);
      throw error;
    }
  }

  // Quitter la famille
  async function leaveFamily() {
    if (!currentUser || !userProfile?.familyId) return;

    try {
      // Supprimer l'utilisateur des membres de la famille
      await updateDoc(doc(db, 'families', userProfile.familyId), {
        members: arrayRemove(currentUser.uid)
      });

      // Mettre a jour le profil utilisateur
      await updateUserProfile({ familyId: null, role: 'admin' });

      setFamily(null);
      setFamilyMembers([]);
    } catch (error) {
      console.error('Error leaving family:', error);
      throw error;
    }
  }

  // Fetch family data
  async function fetchFamily(familyId) {
    try {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (familyDoc.exists()) {
        return familyDoc.data();
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    }
    return null;
  }

  // Fetch family members
  async function fetchFamilyMembers(memberIds) {
    if (!memberIds || memberIds.length === 0) return [];

    try {
      const membersQuery = query(
        collection(db, 'users'),
        where('uid', 'in', memberIds)
      );
      const membersSnapshot = await getDocs(membersQuery);
      return membersSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching family members:', error);
      return [];
    }
  }

  // Update family settings
  async function updateFamilySettings(settings) {
    if (!family) return;

    try {
      await updateDoc(doc(db, 'families', family.id), {
        settings: { ...family.settings, ...settings }
      });
    } catch (error) {
      console.error('Error updating family settings:', error);
      throw error;
    }
  }

  // Real-time family data subscription
  useEffect(() => {
    if (!userProfile?.familyId) {
      setFamily(null);
      setFamilyMembers([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'families', userProfile.familyId),
      async (doc) => {
        if (doc.exists()) {
          const familyData = doc.data();
          setFamily(familyData);
          
          // Fetch family members
          const members = await fetchFamilyMembers(familyData.members);
          setFamilyMembers(members);
        } else {
          setFamily(null);
          setFamilyMembers([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to family changes:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userProfile?.familyId]);

  const value = {
    family,
    familyMembers,
    loading,
    createFamily,
    joinFamily,
    leaveFamily,
    fetchFamily,
    updateFamilySettings
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}
