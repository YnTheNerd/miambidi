/**
 * Pantry Context for MiamBidi
 * Manages family pantry inventory with real-time Firestore synchronization
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useFamily } from './FirestoreFamilyContext';
import { useNotification } from './NotificationContext';
import { useIngredients } from './IngredientContext';
import {
  INGREDIENT_COLLECTIONS,
  DEFAULT_PANTRY_ITEM,
  INGREDIENT_VALIDATION,
  IngredientUtils
} from '../types/ingredient';

const PantryContext = createContext();

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}

export function PantryProvider({ children }) {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiringItems, setExpiringItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);

  const { currentUser } = useAuth();
  const { family } = useFamily();
  const { showNotification } = useNotification();
  const { getIngredientById } = useIngredients();

  // Real-time listener for pantry items
  useEffect(() => {
    if (!currentUser || !family?.id) {
      setPantryItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query pantry items for the family
    const pantryQuery = query(
      collection(db, INGREDIENT_COLLECTIONS.pantry),
      where('familyId', '==', family.id)
      // Removed orderBy to avoid index requirement - will sort in memory
    );

    const unsubscribePantry = onSnapshot(
      pantryQuery,
      (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Compute expiry status
            isExpired: IngredientUtils.isExpired(data.expiryDate),
            daysUntilExpiry: IngredientUtils.daysUntilExpiry(data.expiryDate)
          };
        });

        // Sort in memory since we removed orderBy from query
        items.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName, 'fr'));

        setPantryItems(items);

        // Separate expiring and expired items
        const now = new Date();
        const expiring = items.filter(item =>
          item.daysUntilExpiry !== null &&
          item.daysUntilExpiry <= 7 &&
          item.daysUntilExpiry > 0
        );
        const expired = items.filter(item => item.isExpired);

        setExpiringItems(expiring);
        setExpiredItems(expired);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pantry items:', error);
        setError('Erreur lors du chargement du garde-manger');
        setLoading(false);
      }
    );

    return () => unsubscribePantry();
  }, [currentUser, family?.id]);

  // Add item to pantry
  const addPantryItem = useCallback(async (itemData) => {
    if (!currentUser || !family?.id) {
      throw new Error('Utilisateur ou famille non authentifié');
    }

    // Validate quantity
    if (!itemData.quantity || itemData.quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    try {
      const newItemRef = doc(collection(db, INGREDIENT_COLLECTIONS.pantry));

      const newItem = {
        ...DEFAULT_PANTRY_ITEM,
        ...itemData,
        id: newItemRef.id,
        familyId: family.id,
        originalQuantity: itemData.quantity,
        lastUpdated: serverTimestamp(),
        updatedBy: currentUser.uid,
        usageHistory: []
      };

      await setDoc(newItemRef, newItem);
      showNotification('Article ajouté au garde-manger', 'success');

      // Return item with computed fields for immediate UI update
      return {
        ...newItem,
        isExpired: IngredientUtils.isExpired(newItem.expiryDate),
        daysUntilExpiry: IngredientUtils.daysUntilExpiry(newItem.expiryDate)
      };
    } catch (error) {
      console.error('Error adding pantry item:', error);
      showNotification('Erreur lors de l\'ajout au garde-manger', 'error');
      throw error;
    }
  }, [currentUser, family?.id, showNotification]);

  // Update pantry item
  const updatePantryItem = useCallback(async (itemId, updates) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const itemRef = doc(db, INGREDIENT_COLLECTIONS.pantry, itemId);
      await updateDoc(itemRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
        updatedBy: currentUser.uid
      });

      showNotification('Article mis à jour', 'success');
    } catch (error) {
      console.error('Error updating pantry item:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
      throw error;
    }
  }, [currentUser, showNotification]);

  // Update quantity (for consumption tracking)
  const updateQuantity = useCallback(async (itemId, newQuantity, reason = 'manual') => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    if (newQuantity < 0) {
      throw new Error('La quantité ne peut pas être négative');
    }

    try {
      const item = pantryItems.find(item => item.id === itemId);
      if (!item) {
        throw new Error('Article non trouvé');
      }

      const quantityChange = newQuantity - item.quantity;
      const usageRecord = {
        date: new Date().toISOString(),
        quantityBefore: item.quantity,
        quantityAfter: newQuantity,
        change: quantityChange,
        reason,
        updatedBy: currentUser.uid
      };

      const itemRef = doc(db, INGREDIENT_COLLECTIONS.pantry, itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        usageHistory: [...(item.usageHistory || []), usageRecord],
        lastUpdated: serverTimestamp(),
        updatedBy: currentUser.uid
      });

      // Notify if item is running low
      if (newQuantity <= (item.originalQuantity * 0.2) && newQuantity > 0) {
        showNotification(`Stock faible: ${item.ingredientName}`, 'warning');
      }

      // Notify if item is finished
      if (newQuantity === 0) {
        showNotification(`Stock épuisé: ${item.ingredientName}`, 'info');
      }

    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification('Erreur lors de la mise à jour de la quantité', 'error');
      throw error;
    }
  }, [currentUser, pantryItems, showNotification]);

  // Remove item from pantry
  const removePantryItem = useCallback(async (itemId) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const itemRef = doc(db, INGREDIENT_COLLECTIONS.pantry, itemId);
      await deleteDoc(itemRef);
      showNotification('Article retiré du garde-manger', 'success');
    } catch (error) {
      console.error('Error removing pantry item:', error);
      showNotification('Erreur lors de la suppression', 'error');
      throw error;
    }
  }, [currentUser, showNotification]);

  // Check if ingredient is in pantry
  const isInPantry = useCallback((ingredientName) => {
    return pantryItems.some(item =>
      item.ingredientName.toLowerCase() === ingredientName.toLowerCase()
    );
  }, [pantryItems]);

  // Get pantry item by ingredient name
  const getPantryItemByIngredient = useCallback((ingredientName) => {
    return pantryItems.find(item =>
      item.ingredientName.toLowerCase() === ingredientName.toLowerCase()
    );
  }, [pantryItems]);

  // Get available quantity for ingredient
  const getAvailableQuantity = useCallback((ingredientName, unit) => {
    const item = getPantryItemByIngredient(ingredientName);
    if (!item) return 0;

    // TODO: Add unit conversion logic here
    if (item.unit === unit) {
      return item.quantity;
    }

    return 0; // Return 0 if units don't match (for now)
  }, [getPantryItemByIngredient]);

  // Batch consume ingredients (for shopping list integration)
  const batchConsumeIngredients = useCallback(async (consumptionList) => {
    if (!currentUser || !consumptionList.length) return;

    try {
      const batch = writeBatch(db);
      const updates = [];

      for (const consumption of consumptionList) {
        const { ingredientName, quantity, unit, reason = 'shopping_list' } = consumption;
        const pantryItem = getPantryItemByIngredient(ingredientName);

        if (pantryItem && pantryItem.unit === unit) {
          const newQuantity = Math.max(0, pantryItem.quantity - quantity);
          const itemRef = doc(db, INGREDIENT_COLLECTIONS.pantry, pantryItem.id);

          const usageRecord = {
            date: new Date().toISOString(),
            quantityBefore: pantryItem.quantity,
            quantityAfter: newQuantity,
            change: -(quantity),
            reason,
            updatedBy: currentUser.uid
          };

          batch.update(itemRef, {
            quantity: newQuantity,
            usageHistory: [...(pantryItem.usageHistory || []), usageRecord],
            lastUpdated: serverTimestamp(),
            updatedBy: currentUser.uid
          });

          updates.push({
            ingredientName,
            oldQuantity: pantryItem.quantity,
            newQuantity,
            consumed: quantity
          });
        }
      }

      if (updates.length > 0) {
        await batch.commit();
        showNotification(`${updates.length} articles mis à jour dans le garde-manger`, 'success');
      }

      return updates;
    } catch (error) {
      console.error('Error batch consuming ingredients:', error);
      showNotification('Erreur lors de la mise à jour du garde-manger', 'error');
      throw error;
    }
  }, [currentUser, getPantryItemByIngredient, showNotification]);

  // Get pantry statistics
  const getPantryStats = useCallback(() => {
    const totalItems = pantryItems.length;
    const expiredCount = expiredItems.length;
    const expiringCount = expiringItems.length;
    const lowStockCount = pantryItems.filter(item =>
      item.quantity <= (item.originalQuantity * 0.2) && item.quantity > 0
    ).length;

    const totalValue = pantryItems.reduce((sum, item) => {
      return sum + (item.purchasePrice || 0) * item.quantity;
    }, 0);

    return {
      totalItems,
      expiredCount,
      expiringCount,
      lowStockCount,
      totalValue
    };
  }, [pantryItems, expiredItems, expiringItems]);

  const value = {
    // State
    pantryItems,
    expiringItems,
    expiredItems,
    loading,
    error,

    // Actions
    addPantryItem,
    updatePantryItem,
    updateQuantity,
    removePantryItem,
    batchConsumeIngredients,

    // Queries
    isInPantry,
    getPantryItemByIngredient,
    getAvailableQuantity,
    getPantryStats
  };

  return (
    <PantryContext.Provider value={value}>
      {children}
    </PantryContext.Provider>
  );
}

export { PantryContext };
export default PantryContext;
