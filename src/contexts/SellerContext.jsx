/**
 * Seller Context for MiamBidi Marketplace
 * Manages seller profiles, stock, requests, and marketplace functionality
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
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import {
  SELLER_COLLECTIONS,
  DEFAULT_SELLER_PROFILE,
  SellerUtils
} from '../types/seller';
import { generateCompleteSellerDemoData } from '../utils/sellerDemoData';

const SellerContext = createContext();

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}

export function SellerProvider({ children }) {
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerStock, setSellerStock] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [shoppingRequests, setShoppingRequests] = useState([]);
  const [sellerResponses, setSellerResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  // Check if current user is a seller
  const isSeller = currentUser?.role === 'seller';

  // Load seller profile if user is a seller
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    if (isSeller) {
      const unsubscribe = onSnapshot(
        doc(db, SELLER_COLLECTIONS.sellers, currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            setSellerProfile({ id: doc.id, ...doc.data() });
          } else {
            setSellerProfile(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error loading seller profile:', error);
          setError('Erreur lors du chargement du profil vendeur');
          setLoading(false);
        }
      );

      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, [currentUser, isSeller]);

  // Load all sellers for marketplace discovery
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, SELLER_COLLECTIONS.sellers),
        where('isActive', '==', true),
        orderBy('shopName')
      ),
      (snapshot) => {
        const sellers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllSellers(sellers);
      },
      (error) => {
        console.error('Error loading sellers:', error);
        setError('Erreur lors du chargement des vendeurs');
      }
    );

    return unsubscribe;
  }, []);

  // Load seller stock if user is a seller
  useEffect(() => {
    if (!isSeller || !sellerProfile) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, SELLER_COLLECTIONS.sellers, sellerProfile.id, SELLER_COLLECTIONS.stock),
        orderBy('ingredientName')
      ),
      (snapshot) => {
        const stock = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSellerStock(stock);
      },
      (error) => {
        console.error('Error loading seller stock:', error);
        setError('Erreur lors du chargement du stock');
      }
    );

    return unsubscribe;
  }, [isSeller, sellerProfile]);

  /**
   * Creates a new seller profile
   */
  const createSellerProfile = useCallback(async (profileData) => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const sellerDoc = {
        ...DEFAULT_SELLER_PROFILE,
        ...profileData,
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || '',
        role: 'seller',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, SELLER_COLLECTIONS.sellers, currentUser.uid), sellerDoc);
      
      // Update user role in auth context
      await updateDoc(doc(db, 'users', currentUser.uid), {
        role: 'seller',
        updatedAt: serverTimestamp()
      });

      showNotification('Profil vendeur créé avec succès', 'success');
      return sellerDoc;
    } catch (error) {
      console.error('Error creating seller profile:', error);
      showNotification('Erreur lors de la création du profil vendeur', 'error');
      throw error;
    }
  }, [currentUser, showNotification]);

  /**
   * Updates seller profile
   */
  const updateSellerProfile = useCallback(async (updates) => {
    if (!sellerProfile) {
      throw new Error('Profil vendeur non trouvé');
    }

    try {
      await updateDoc(doc(db, SELLER_COLLECTIONS.sellers, sellerProfile.id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      showNotification('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Error updating seller profile:', error);
      showNotification('Erreur lors de la mise à jour du profil', 'error');
      throw error;
    }
  }, [sellerProfile, showNotification]);

  /**
   * Adds item to seller stock
   */
  const addStockItem = useCallback(async (stockData) => {
    if (!sellerProfile) {
      throw new Error('Profil vendeur non trouvé');
    }

    try {
      const stockRef = doc(collection(db, SELLER_COLLECTIONS.sellers, sellerProfile.id, SELLER_COLLECTIONS.stock));
      
      const stockItem = {
        ...stockData,
        id: stockRef.id,
        sellerId: sellerProfile.id,
        addedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isAvailable: true
      };

      await setDoc(stockRef, stockItem);
      showNotification('Article ajouté au stock', 'success');
      return stockItem;
    } catch (error) {
      console.error('Error adding stock item:', error);
      showNotification('Erreur lors de l\'ajout au stock', 'error');
      throw error;
    }
  }, [sellerProfile, showNotification]);

  /**
   * Updates stock item
   */
  const updateStockItem = useCallback(async (stockId, updates) => {
    if (!sellerProfile) {
      throw new Error('Profil vendeur non trouvé');
    }

    try {
      await updateDoc(
        doc(db, SELLER_COLLECTIONS.sellers, sellerProfile.id, SELLER_COLLECTIONS.stock, stockId),
        {
          ...updates,
          lastUpdated: serverTimestamp()
        }
      );

      showNotification('Stock mis à jour', 'success');
    } catch (error) {
      console.error('Error updating stock item:', error);
      showNotification('Erreur lors de la mise à jour du stock', 'error');
      throw error;
    }
  }, [sellerProfile, showNotification]);

  /**
   * Removes item from stock
   */
  const removeStockItem = useCallback(async (stockId) => {
    if (!sellerProfile) {
      throw new Error('Profil vendeur non trouvé');
    }

    try {
      await deleteDoc(
        doc(db, SELLER_COLLECTIONS.sellers, sellerProfile.id, SELLER_COLLECTIONS.stock, stockId)
      );

      showNotification('Article retiré du stock', 'success');
    } catch (error) {
      console.error('Error removing stock item:', error);
      showNotification('Erreur lors de la suppression', 'error');
      throw error;
    }
  }, [sellerProfile, showNotification]);

  /**
   * Finds sellers within delivery radius
   */
  const findNearbySellers = useCallback((clientLocation, maxDistance = 10) => {
    return allSellers.filter(seller => {
      if (!seller.location?.coordinates) return false;

      const distance = SellerUtils.calculateDistance(
        seller.location.coordinates.lat,
        seller.location.coordinates.lng,
        clientLocation.lat,
        clientLocation.lng
      );

      return distance <= Math.min(maxDistance, seller.location.deliveryRadius || 5);
    }).sort((a, b) => {
      const distanceA = SellerUtils.calculateDistance(
        a.location.coordinates.lat,
        a.location.coordinates.lng,
        clientLocation.lat,
        clientLocation.lng
      );
      const distanceB = SellerUtils.calculateDistance(
        b.location.coordinates.lat,
        b.location.coordinates.lng,
        clientLocation.lat,
        clientLocation.lng
      );
      return distanceA - distanceB;
    });
  }, [allSellers]);

  /**
   * Populates demo data for development/testing
   */
  const populateDemoData = useCallback(async (count = 10) => {
    try {
      setLoading(true);

      // Check if demo data already exists
      const existingDemoSellers = allSellers.filter(seller => seller.id?.startsWith('demo-seller-'));
      if (existingDemoSellers.length > 0) {
        showNotification('Les données de démonstration existent déjà', 'info');
        return;
      }

      const demoData = generateCompleteSellerDemoData(count);
      const batch = writeBatch(db);

      // Add sellers
      demoData.sellers.forEach(seller => {
        const sellerRef = doc(db, SELLER_COLLECTIONS.sellers, seller.id);
        batch.set(sellerRef, {
          ...seller,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      // Add stock items
      demoData.stock.forEach(stockItem => {
        const stockRef = doc(
          db,
          SELLER_COLLECTIONS.sellers,
          stockItem.sellerId,
          SELLER_COLLECTIONS.stock,
          stockItem.id
        );
        batch.set(stockRef, {
          ...stockItem,
          addedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      });

      await batch.commit();

      showNotification(
        `${demoData.summary.totalSellers} vendeurs et ${demoData.summary.totalStockItems} articles ajoutés`,
        'success'
      );

      return demoData;
    } catch (error) {
      console.error('Error populating demo data:', error);
      showNotification('Erreur lors de la création des données de démonstration', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [allSellers, showNotification]);

  const value = {
    // State
    sellerProfile,
    sellerStock,
    allSellers,
    shoppingRequests,
    sellerResponses,
    loading,
    error,
    isSeller,

    // Actions
    createSellerProfile,
    updateSellerProfile,
    addStockItem,
    updateStockItem,
    removeStockItem,

    // Queries
    findNearbySellers,

    // Demo Data
    populateDemoData,

    // Utils
    SellerUtils
  };

  return (
    <SellerContext.Provider value={value}>
      {children}
    </SellerContext.Provider>
  );
}

export { SellerContext };
export default SellerContext;
