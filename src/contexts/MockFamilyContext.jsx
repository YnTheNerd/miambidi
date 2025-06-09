import React, { createContext, useContext, useState, useEffect } from 'react';

const MockFamilyContext = createContext();

export function useMockFamily() {
  const context = useContext(MockFamilyContext);
  if (!context) {
    throw new Error('useMockFamily must be used within a MockFamilyProvider');
  }
  return context;
}

export function MockFamilyProvider({ children }) {
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      // Mock current user
      const mockUser = {
        uid: 'mock-user-1',
        email: 'paultakam@gmail.com',
        displayName: 'Mama Takam',
        familyId: 'mock-family-1',
        role: 'admin'
      };

      // Mock family data
      const mockFamily = {
        id: 'mock-family-1',
        name: 'Famille Takam',
        adminId: 'mock-user-1',
        members: ['mock-user-1', 'mock-user-2', 'mock-user-3', 'mock-user-4'],
        createdAt: '2025-05-15T10:00:00.000Z',
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

      // Mock family members
      const mockMembers = [
        {
          uid: 'mock-user-1',
          email: 'paultakam@gmail.com',
          displayName: 'Papa Takam',
          familyId: 'mock-family-1',
          role: 'admin',
          age: 55,
          preferences: {
            dietaryRestrictions: ['vegetarian', 'organic-only'],
            allergies: ['arachides', 'pistaches'],
            favoriteCategories: ['okok', 'eru', 'farm-to-table'],
            dislikedFoods: ['Champignons', 'sauce pistache']
          },
          createdAt: '2025-05-15T10:00:00.000Z'
        },
        {
          uid: 'mock-user-2',
          email: 'jeannieakam@gmail.com',
          displayName: 'Takam Jeannie',
          familyId: 'mock-family-1',
          role: 'admin',
          age: 48,
          preferences: {
            dietaryRestrictions: ['low-sodium'],
            allergies: ['Gombo'],
            favoriteCategories: ['Ndole', 'Mbongo Tchobi', 'Kondre'],
            dislikedFoods: ['koki', 'Couscous tapioca']
          },
          createdAt: '2025-05-15T10:05:00.000Z'
        },
        {
          uid: 'mock-user-3',
          email: 'emma.takam@gmail.com',
          displayName: 'Emma Takam',
          familyId: 'mock-family-1',
          role: 'member',
          age: 17,
          preferences: {
            dietaryRestrictions: [],
            allergies: [],
            favoriteCategories: ['Ndole', 'pizza'],
            dislikedFoods: ['Legumes', 'fish']
          },
          createdAt: '2025-05-15T10:10:00.000Z'
        },
        {
          uid: 'mock-user-4',
          email: 'Arthurtakam@gmail.com',
          displayName: 'Takam Arthur Junior',
          familyId: 'mock-family-1',
          role: 'member',
          age: 12,
          preferences: {
            dietaryRestrictions: [],
            allergies: ['lait'],
            favoriteCategories: ['Ndole', 'collation'],
            dislikedFoods: ['legumes verts', 'soupe']
          },
          createdAt: '2025-05-25T10:15:00.000Z'
        }
      ];

      setCurrentUser(mockUser);
      setFamily(mockFamily);
      setFamilyMembers(mockMembers);
      setLoading(false);
    }, 1000); // Simulate 1 second loading
  }, []);

  // Add new family member
  const addFamilyMember = (memberData) => {
    const newMember = {
      uid: `mock-user-${Date.now()}`,
      email: memberData.email,
      displayName: memberData.displayName,
      familyId: family.id,
      role: 'member',
      age: memberData.age,
      preferences: {
        dietaryRestrictions: memberData.dietaryRestrictions || [],
        allergies: memberData.allergies || [],
        favoriteCategories: memberData.favoriteCategories || [],
        dislikedFoods: memberData.dislikedFoods || []
      },
      createdAt: new Date().toISOString()
    };

    setFamilyMembers(prev => [...prev, newMember]);
    setFamily(prev => ({
      ...prev,
      members: [...prev.members, newMember.uid]
    }));

    return newMember;
  };

  // Update family member
  const updateFamilyMember = (memberId, updates) => {
    setFamilyMembers(prev =>
      prev.map(member =>
        member.uid === memberId
          ? { ...member, ...updates }
          : member
      )
    );
  };

  // Remove family member
  const removeFamilyMember = (memberId) => {
    if (memberId === currentUser.uid) {
      throw new Error('Vous ne pouvez pas vous supprimer de la famille');
    }

    setFamilyMembers(prev => prev.filter(member => member.uid !== memberId));
    setFamily(prev => ({
      ...prev,
      members: prev.members.filter(id => id !== memberId)
    }));
  };

  // Update family settings
  const updateFamilySettings = (settings) => {
    setFamily(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  // Update family name
  const updateFamilyName = (newName) => {
    if (currentUser.role !== 'admin') {
      throw new Error('Seuls les admins peuvent changer les noms de famille ');
    }

    setFamily(prev => ({
      ...prev,
      name: newName.trim()
    }));
  };

  // Update member role
  const updateMemberRole = (memberId, newRole) => {
    if (currentUser.role !== 'admin') {
      throw new Error('Seuls les admins peuvent changer les roles');
    }

    setFamilyMembers(prev =>
      prev.map(member =>
        member.uid === memberId
          ? { ...member, role: newRole }
          : member
      )
    );
  };

  const value = {
    // User data
    currentUser,

    // Family data
    family,
    familyMembers,
    loading,

    // Family operations
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateFamilySettings,
    updateFamilyName,
    updateMemberRole
  };

  return (
    <MockFamilyContext.Provider value={value}>
      {children}
    </MockFamilyContext.Provider>
  );
}
