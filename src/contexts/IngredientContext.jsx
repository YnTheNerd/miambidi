/**
 * Enhanced Ingredient Context for MiamBidi
 * Comprehensive ingredient management with real-time Firestore synchronization
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
  serverTimestamp,
  limit,
  startAfter,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useFamily } from './FirestoreFamilyContext';
import { useNotification } from './NotificationContext';
import {
  INGREDIENT_COLLECTIONS,
  DEFAULT_INGREDIENT,
  INGREDIENT_VALIDATION,
  IngredientUtils,
  SEARCH_CONFIG
} from '../types/ingredient';

const IngredientContext = createContext();

export function useIngredients() {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error('useIngredients must be used within an IngredientProvider');
  }
  return context;
}

export function IngredientProvider({ children }) {
  const [ingredients, setIngredients] = useState([]);
  const [publicIngredients, setPublicIngredients] = useState([]);
  const [familyIngredients, setFamilyIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { currentUser } = useAuth();
  const { family } = useFamily();
  const { showNotification } = useNotification();

  // Real-time listener for public ingredients (always available)
  useEffect(() => {
    console.log('🔍 Setting up public ingredients listener...');
    setLoading(true);
    setError(null);

    const publicIngredientsQuery = query(
      collection(db, INGREDIENT_COLLECTIONS.ingredients),
      where('isPublic', '==', true),
      limit(100) // Limit public ingredients for performance
      // Removed orderBy to avoid index requirement - will sort in memory
    );

    const unsubscribePublicIngredients = onSnapshot(
      publicIngredientsQuery,
      (snapshot) => {
        console.log(`✅ Public ingredients loaded: ${snapshot.docs.length} items`);
        const publicIngs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'public'
        }));

        // Sort in memory since we removed orderBy from query
        publicIngs.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        setPublicIngredients(publicIngs);

        // If no user or family, show only public ingredients
        if (!currentUser || !family?.id) {
          setIngredients(publicIngs);
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Error fetching public ingredients:', error);
        // Even if public ingredients fail, don't block the app
        setPublicIngredients([]);
        if (!currentUser || !family?.id) {
          setLoading(false);
        }
        // Don't set main error for public ingredients failure
      }
    );

    return () => {
      console.log('🧹 Cleaning up public ingredients listener');
      unsubscribePublicIngredients();
    };
  }, []); // Only run once on mount

  // Real-time listener for family ingredients (when user has a family)
  useEffect(() => {
    // Reset family ingredients when no user or family
    if (!currentUser || !family?.id) {
      console.log('👤 No user or family - clearing family ingredients');
      setFamilyIngredients([]);
      setError(null);
      return;
    }

    console.log(`🏠 Setting up family ingredients listener for family: ${family.id}`);
    setLoading(true);

    const familyIngredientsQuery = query(
      collection(db, INGREDIENT_COLLECTIONS.ingredients),
      where('familyId', '==', family.id)
      // Removed orderBy to avoid index requirement - will sort in memory
    );

    const unsubscribeFamilyIngredients = onSnapshot(
      familyIngredientsQuery,
      (snapshot) => {
        console.log(`✅ Family ingredients snapshot received: ${snapshot.docs.length} items`);

        const familyIngs = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📄 Family ingredient: ${data.name} (ID: ${doc.id})`);
          return {
            id: doc.id,
            ...data,
            source: 'family'
          };
        });

        // Sort in memory since we removed orderBy from query
        familyIngs.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

        console.log(`🔄 Setting family ingredients state: ${familyIngs.length} items`);
        setFamilyIngredients(familyIngs);
        setLoading(false);
        setError(null); // Clear any previous errors
      },
      (error) => {
        console.error('❌ Error fetching family ingredients:', error);

        // Graceful degradation: show warning but don't block public ingredients
        const errorMessage = 'Impossible de charger les ingrédients de la famille. Seuls les ingrédients publics sont affichés.';
        setError(errorMessage);
        setFamilyIngredients([]); // Clear family ingredients on error
        setLoading(false);

        // Show user-friendly notification
        if (showNotification) {
          showNotification(errorMessage, 'warning');
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up family ingredients listener');
      unsubscribeFamilyIngredients();
    };
  }, [currentUser, family?.id, showNotification]);

  // Combine family and public ingredients with proper deduplication
  useEffect(() => {
    console.log(`🔄 Combining ingredients: ${familyIngredients.length} family + ${publicIngredients.length} public`);

    // Create a Map to track ingredients by ID to avoid duplicates
    const ingredientMap = new Map();

    // Add family ingredients first (they have higher priority for display)
    familyIngredients.forEach(ingredient => {
      ingredientMap.set(ingredient.id, {
        ...ingredient,
        source: 'family'
      });
    });

    // Add public ingredients that aren't already in the map
    publicIngredients.forEach(publicIng => {
      if (!ingredientMap.has(publicIng.id)) {
        ingredientMap.set(publicIng.id, {
          ...publicIng,
          source: 'public'
        });
      } else {
        // If the ingredient exists in family list, ensure it's marked as both
        const existing = ingredientMap.get(publicIng.id);
        if (existing.source === 'family' && publicIng.isPublic) {
          ingredientMap.set(publicIng.id, {
            ...existing,
            source: 'both' // Ingredient is both family and public
          });
        }
      }
    });

    // Convert map to array and sort by name
    const combined = Array.from(ingredientMap.values());
    combined.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    console.log(`✅ Final ingredients list: ${combined.length} items (${familyIngredients.length} family, ${publicIngredients.length} public)`);
    console.log('🔍 Ingredient sources breakdown:', {
      family: combined.filter(i => i.source === 'family').length,
      public: combined.filter(i => i.source === 'public').length,
      both: combined.filter(i => i.source === 'both').length
    });

    setIngredients(combined);
  }, [familyIngredients, publicIngredients]);

  // Enhanced validation function
  const validateIngredient = useCallback((ingredientData) => {
    const errors = {};

    // Name validation
    if (!ingredientData.name || ingredientData.name.trim().length < INGREDIENT_VALIDATION.name.minLength) {
      errors.name = `Le nom doit contenir au moins ${INGREDIENT_VALIDATION.name.minLength} caractères`;
    }
    if (ingredientData.name && ingredientData.name.length > INGREDIENT_VALIDATION.name.maxLength) {
      errors.name = `Le nom ne peut pas dépasser ${INGREDIENT_VALIDATION.name.maxLength} caractères`;
    }
    if (ingredientData.name && !INGREDIENT_VALIDATION.name.pattern.test(ingredientData.name)) {
      errors.name = 'Le nom contient des caractères non autorisés';
    }

    // Price validation
    if (ingredientData.price === undefined || ingredientData.price < INGREDIENT_VALIDATION.price.min) {
      errors.price = 'Le prix doit être supérieur ou égal à 0';
    }
    if (ingredientData.price > INGREDIENT_VALIDATION.price.max) {
      errors.price = `Le prix ne peut pas dépasser ${INGREDIENT_VALIDATION.price.max} FCFA`;
    }

    // Category validation
    if (!ingredientData.category || !INGREDIENT_VALIDATION.category.allowedValues.includes(ingredientData.category)) {
      errors.category = 'Veuillez sélectionner une catégorie valide';
    }

    // Unit validation
    if (!ingredientData.unit || !INGREDIENT_VALIDATION.unit.allowedValues.includes(ingredientData.unit)) {
      errors.unit = 'Veuillez sélectionner une unité valide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Enhanced add ingredient function - matches seeding script structure exactly
  const addIngredient = useCallback(async (ingredientData) => {
    console.log('🔄 Adding new ingredient:', ingredientData.name);

    if (!currentUser || !family?.id) {
      const errorMsg = 'Utilisateur ou famille non authentifié. Veuillez vous connecter et rejoindre une famille.';
      console.error('❌ Authentication error:', errorMsg);
      throw new Error(errorMsg);
    }

    const validation = validateIngredient(ingredientData);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors).join(', ');
      console.error('❌ Validation error:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const newIngredientRef = doc(collection(db, INGREDIENT_COLLECTIONS.ingredients));

      // Prepare enhanced ingredient data - EXACT MATCH with seeding script structure
      const normalizedName = IngredientUtils.normalizeName(ingredientData.name);
      const searchTerms = IngredientUtils.generateSearchTerms(
        ingredientData.name,
        ingredientData.aliases || []
      );

      const completeIngredient = {
        // Core identification (matches seeding script)
        id: newIngredientRef.id,
        name: ingredientData.name,
        normalizedName,
        description: ingredientData.description || '',
        price: ingredientData.price,
        category: ingredientData.category,
        unit: ingredientData.unit,
        familyId: family.id,
        isPublic: ingredientData.isPublic !== undefined ? ingredientData.isPublic : true,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Search data (matches seeding script)
        aliases: ingredientData.aliases || [],
        searchTerms,

        // Storage information (matches seeding script)
        storageInstructions: ingredientData.storageInstructions || '',
        averageShelfLife: ingredientData.averageShelfLife || null,
        seasonality: ingredientData.seasonality || [],

        // Metadata (matches seeding script)
        usageCount: 0,
        lastUsed: null,
        notes: ingredientData.notes || '',
        tags: ingredientData.tags || [],
        preferredBrands: ingredientData.preferredBrands || [],
        nutritionalInfo: ingredientData.nutritionalInfo || {},
        averageWeight: ingredientData.averageWeight || null,
        imageUrl: ingredientData.imageUrl || ''
      };

      console.log('💾 Saving ingredient to Firestore with structure:', {
        id: completeIngredient.id,
        name: completeIngredient.name,
        category: completeIngredient.category,
        price: completeIngredient.price,
        familyId: completeIngredient.familyId,
        isPublic: completeIngredient.isPublic
      });

      await setDoc(newIngredientRef, completeIngredient);

      console.log('✅ Ingredient saved successfully to Firestore:', completeIngredient.name);
      console.log('📊 Saved ingredient data structure:', {
        id: completeIngredient.id,
        name: completeIngredient.name,
        normalizedName: completeIngredient.normalizedName,
        searchTerms: completeIngredient.searchTerms,
        familyId: completeIngredient.familyId,
        isPublic: completeIngredient.isPublic,
        hasTimestamps: !!(completeIngredient.createdAt && completeIngredient.updatedAt)
      });

      // Wait a moment to ensure Firestore has processed the write
      await new Promise(resolve => setTimeout(resolve, 100));

      showNotification(`Ingrédient "${completeIngredient.name}" ajouté avec succès`, 'success');

      // Return the ingredient with the actual timestamp values for immediate use
      return {
        ...completeIngredient,
        // Note: serverTimestamp() will be resolved by Firestore,
        // but for immediate return we keep the placeholder
        createdAt: new Date(), // Temporary for immediate use
        updatedAt: new Date()  // Temporary for immediate use
      };
    } catch (error) {
      console.error('❌ Error adding ingredient:', error);

      // Enhanced error messages in French
      let userFriendlyMessage = 'Erreur lors de l\'ajout de l\'ingrédient';
      if (error.code === 'permission-denied') {
        userFriendlyMessage = 'Permissions insuffisantes. Vérifiez vos droits d\'accès.';
      } else if (error.code === 'network-request-failed') {
        userFriendlyMessage = 'Erreur de connexion. Vérifiez votre connexion Internet.';
      } else if (error.code === 'unavailable') {
        userFriendlyMessage = 'Service temporairement indisponible. Réessayez dans quelques instants.';
      }

      showNotification(userFriendlyMessage, 'error');
      throw error;
    }
  }, [currentUser, family?.id, validateIngredient, showNotification]);

  // Enhanced update ingredient function
  const updateIngredient = useCallback(async (ingredientId, updates) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    const validation = validateIngredient(updates);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
      const ingredientRef = doc(db, INGREDIENT_COLLECTIONS.ingredients, ingredientId);

      // Update search terms if name or aliases changed
      const updateData = { ...updates };
      if (updates.name || updates.aliases) {
        updateData.normalizedName = IngredientUtils.normalizeName(updates.name);
        updateData.searchTerms = IngredientUtils.generateSearchTerms(
          updates.name,
          updates.aliases || []
        );
      }

      await updateDoc(ingredientRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      showNotification('Ingrédient mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Error updating ingredient:', error);
      showNotification('Erreur lors de la mise à jour de l\'ingrédient', 'error');
      throw error;
    }
  }, [currentUser, validateIngredient, showNotification]);

  // Delete ingredient function
  const deleteIngredient = useCallback(async (ingredientId) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const ingredientRef = doc(db, INGREDIENT_COLLECTIONS.ingredients, ingredientId);
      await deleteDoc(ingredientRef);
      showNotification('Ingrédient supprimé avec succès', 'success');
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      showNotification('Erreur lors de la suppression de l\'ingrédient', 'error');
      throw error;
    }
  }, [currentUser, showNotification]);

  // Enhanced search function
  const searchIngredients = useCallback(async (searchTerm, options = {}) => {
    if (!searchTerm || searchTerm.length < SEARCH_CONFIG.minSearchLength) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    try {
      const normalizedSearch = IngredientUtils.normalizeName(searchTerm);
      const searchWords = normalizedSearch.split(' ').filter(word => word.length >= 2);

      // Search in current ingredients first (faster)
      const localResults = ingredients.filter(ingredient => {
        const matchesName = ingredient.normalizedName.includes(normalizedSearch);
        const matchesSearchTerms = ingredient.searchTerms?.some(term =>
          term.includes(normalizedSearch)
        );
        const matchesWords = searchWords.some(word =>
          ingredient.searchTerms?.some(term => term.includes(word))
        );

        return matchesName || matchesSearchTerms || matchesWords;
      });

      // Limit results
      const limitedResults = localResults.slice(0, options.maxResults || SEARCH_CONFIG.maxResults);
      setSearchResults(limitedResults);
      return limitedResults;
    } catch (error) {
      console.error('Error searching ingredients:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [ingredients]);

  // Get ingredient by ID
  const getIngredientById = useCallback((ingredientId) => {
    return ingredients.find(ingredient => ingredient.id === ingredientId);
  }, [ingredients]);

  // Get ingredients by category
  const getIngredientsByCategory = useCallback((category) => {
    return ingredients.filter(ingredient => ingredient.category === category);
  }, [ingredients]);

  // Find ingredient by name (for recipe matching)
  const findIngredientByName = useCallback((name) => {
    const normalizedName = IngredientUtils.normalizeName(name);
    return ingredients.find(ingredient =>
      ingredient.normalizedName === normalizedName ||
      ingredient.searchTerms?.includes(normalizedName)
    );
  }, [ingredients]);

  // Batch operations for recipe integration
  const batchUpdateUsage = useCallback(async (ingredientIds) => {
    if (!ingredientIds.length) return;

    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      ingredientIds.forEach(ingredientId => {
        const ingredientRef = doc(db, INGREDIENT_COLLECTIONS.ingredients, ingredientId);
        batch.update(ingredientRef, {
          usageCount: increment(1),
          lastUsed: now,
          updatedAt: now
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating ingredient usage:', error);
    }
  }, []);

  const value = {
    // State
    ingredients,
    publicIngredients,
    familyIngredients,
    searchResults,
    loading,
    error,
    isSearching,

    // Actions
    addIngredient,
    updateIngredient,
    deleteIngredient,
    validateIngredient,
    searchIngredients,
    batchUpdateUsage,

    // Queries
    getIngredientById,
    getIngredientsByCategory,
    findIngredientByName,

    // Utils
    IngredientUtils
  };

  return (
    <IngredientContext.Provider value={value}>
      {children}
    </IngredientContext.Provider>
  );
}

export { IngredientContext };
export default IngredientContext;

