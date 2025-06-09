/**
 * 🌱 Seeder Firestore Complet pour MiamBidi
 * Script de peuplement de base de données pour les collections ingredients et pantry
 * Intégration complète avec l'architecture existante de MiamBidi
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_COLLECTIONS,
  STORAGE_LOCATIONS,
  IngredientUtils
} from '../types/ingredient';

// 📋 IDs des familles existantes dans la base de données
export const EXISTING_FAMILY_IDS = [
  'family_266fHuQjaAhOsOnFLLht3NTIyCJ3_1748321932411',
  'family_l9aSEPbf1XhHewl6Pxcwc7VtF443_1748328958704',
  'family_5FdRMRhp3zThAI0SAt4pV1uf2FA2_1748322881072',
  'family_EpwibQwdanfD595fP3swaE5Ihdn2_1748319390966'
];

// 🥘 Données d'ingrédients camerounais/africains réalistes
export const SAMPLE_INGREDIENTS = [
  {
    name: 'Feuilles de Ndolé',
    description: 'Feuilles traditionnelles pour la préparation du ndolé, plat national camerounais',
    price: 1500,
    category: 'Légumes-feuilles & Aromates',
    unit: 'paquet',
    aliases: ['Ndolé', 'Feuilles ndolé'],
    notes: 'Disponible frais ou séché. Bien nettoyer avant utilisation.',
    storageInstructions: 'Conserver au réfrigérateur si frais, dans un endroit sec si séché',
    averageShelfLife: 7,
    seasonality: ['Octobre', 'Novembre', 'Décembre', 'Janvier'],
    isPublic: true
  },
  {
    name: 'Huile de Palme Rouge',
    description: 'Huile de palme traditionnelle non raffinée, essentielle pour la cuisine camerounaise',
    price: 2500,
    category: 'Huiles & Condiments',
    unit: 'L',
    aliases: ['Huile rouge', 'Palm oil'],
    notes: 'Choisir une huile de qualité, non blanchie pour plus de saveur.',
    storageInstructions: 'Conserver dans un endroit frais et sec, à l\'abri de la lumière',
    averageShelfLife: 365,
    isPublic: true
  },
  {
    name: 'Arachides Crues',
    description: 'Arachides fraîches non grillées pour la préparation de sauces et pâtes d\'arachides',
    price: 800,
    category: 'Céréales & Légumineuses',
    unit: 'kg',
    aliases: ['Cacahuètes', 'Groundnuts'],
    notes: 'Vérifier la fraîcheur, éviter les arachides moisies.',
    storageInstructions: 'Conserver dans un récipient hermétique au sec',
    averageShelfLife: 180,
    seasonality: ['Septembre', 'Octobre', 'Novembre'],
    isPublic: true
  },
  {
    name: 'Plantains Mûrs',
    description: 'Plantains jaunes mûrs, parfaits pour les plats sucrés et salés',
    price: 500,
    category: 'Tubercules & Plantains',
    unit: 'kg',
    aliases: ['Bananes plantains', 'Plantain'],
    notes: 'Choisir selon le degré de maturité désiré pour la recette.',
    storageInstructions: 'Conserver à température ambiante, réfrigérer si très mûrs',
    averageShelfLife: 7,
    isPublic: true
  },
  {
    name: 'Poisson Fumé (Machoiron)',
    description: 'Poisson fumé traditionnel, apporte une saveur unique aux plats',
    price: 3000,
    category: 'Viandes & Poissons',
    unit: 'kg',
    aliases: ['Machoiron fumé', 'Poisson boucané'],
    notes: 'Bien nettoyer et dessaler avant utilisation.',
    storageInstructions: 'Conserver au réfrigérateur dans un récipient hermétique',
    averageShelfLife: 14,
    isPublic: true
  },
  {
    name: 'Crevettes Séchées',
    description: 'Petites crevettes séchées pour assaisonner les sauces et soupes',
    price: 4500,
    category: 'Viandes & Poissons',
    unit: 'paquet',
    aliases: ['Crevettes sèches', 'Dried shrimps'],
    notes: 'Rincer rapidement avant utilisation pour enlever l\'excès de sel.',
    storageInstructions: 'Conserver dans un récipient hermétique au sec',
    averageShelfLife: 365,
    isPublic: true
  },
  {
    name: 'Feuilles de Manioc',
    description: 'Jeunes feuilles de manioc, riches en nutriments, pour les sauces vertes',
    price: 800,
    category: 'Légumes-feuilles & Aromates',
    unit: 'botte',
    aliases: ['Pondu', 'Cassava leaves'],
    notes: 'Bien cuire pour éliminer les substances toxiques naturelles.',
    storageInstructions: 'Utiliser rapidement ou congeler après blanchiment',
    averageShelfLife: 3,
    seasonality: ['Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'],
    isPublic: true
  },
  {
    name: 'Ignames Blanches',
    description: 'Tubercules d\'igname blanche, base alimentaire importante',
    price: 1200,
    category: 'Tubercules & Plantains',
    unit: 'kg',
    aliases: ['Yam', 'Igname'],
    notes: 'Choisir des ignames fermes sans taches noires.',
    storageInstructions: 'Conserver dans un endroit frais, sec et aéré',
    averageShelfLife: 30,
    seasonality: ['Août', 'Septembre', 'Octobre', 'Novembre'],
    isPublic: true
  },
  {
    name: 'Piment Rouge Frais',
    description: 'Piments rouges frais locaux, très piquants',
    price: 300,
    category: 'Épices & Piments',
    unit: 'paquet',
    aliases: ['Piment fort', 'Hot pepper'],
    notes: 'Manipuler avec précaution, porter des gants si nécessaire.',
    storageInstructions: 'Conserver au réfrigérateur ou faire sécher',
    averageShelfLife: 10,
    isPublic: true
  },
  {
    name: 'Gingembre Frais',
    description: 'Rhizome de gingembre frais, indispensable pour les marinades et tisanes',
    price: 600,
    category: 'Légumes-feuilles & Aromates',
    unit: 'kg',
    aliases: ['Ginger'],
    notes: 'Éplucher avant utilisation, peut être congelé râpé.',
    storageInstructions: 'Conserver au réfrigérateur dans le bac à légumes',
    averageShelfLife: 21,
    isPublic: true
  },
  {
    name: 'Cube Maggi',
    description: 'Bouillon cube pour assaisonnement, très populaire en cuisine africaine',
    price: 150,
    category: 'Épices & Piments',
    unit: 'paquet',
    aliases: ['Bouillon cube', 'Maggi'],
    notes: 'Utiliser avec modération pour contrôler le sodium.',
    storageInstructions: 'Conserver dans un endroit sec à l\'abri de l\'humidité',
    averageShelfLife: 730,
    isPublic: true
  },
  {
    name: 'Riz Parfumé',
    description: 'Riz long grain parfumé, accompagnement de base',
    price: 1800,
    category: 'Céréales & Légumineuses',
    unit: 'kg',
    aliases: ['Riz jasmin', 'Riz long'],
    notes: 'Rincer plusieurs fois avant cuisson pour enlever l\'amidon.',
    storageInstructions: 'Conserver dans un récipient hermétique à l\'abri des insectes',
    averageShelfLife: 365,
    isPublic: true
  }
];

// 🏪 Données d'exemple pour le garde-manger
export const SAMPLE_PANTRY_ITEMS = [
  {
    ingredientName: 'Riz Parfumé',
    quantity: 5,
    unit: 'kg',
    location: 'Garde-manger',
    purchasePrice: 1800,
    notes: 'Stock principal pour la famille',
    daysUntilExpiry: 300
  },
  {
    ingredientName: 'Huile de Palme Rouge',
    quantity: 2,
    unit: 'L',
    location: 'Garde-manger',
    purchasePrice: 2500,
    notes: 'Huile de qualité du marché central',
    daysUntilExpiry: 200
  },
  {
    ingredientName: 'Plantains Mûrs',
    quantity: 3,
    unit: 'kg',
    location: 'Garde-manger',
    purchasePrice: 500,
    notes: 'Pour les repas de cette semaine',
    daysUntilExpiry: 5
  },
  {
    ingredientName: 'Poisson Fumé (Machoiron)',
    quantity: 1,
    unit: 'kg',
    location: 'Réfrigérateur',
    purchasePrice: 3000,
    notes: 'Pour le ndolé du weekend',
    daysUntilExpiry: 10
  },
  {
    ingredientName: 'Gingembre Frais',
    quantity: 0.5,
    unit: 'kg',
    location: 'Réfrigérateur',
    purchasePrice: 600,
    notes: 'Pour les tisanes et marinades',
    daysUntilExpiry: 15
  }
];

/**
 * 🔧 Fonction utilitaire pour générer un ID utilisateur simulé
 */
function generateMockUserId(familyId) {
  return `user_admin_${familyId.split('_')[1]}_${Date.now()}`;
}

/**
 * 🔧 Fonction utilitaire pour calculer la date d'expiration
 */
function calculateExpiryDate(daysFromNow) {
  if (!daysFromNow) return null;
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * 🧹 Nettoyer les collections existantes (pour les tests)
 */
export async function clearExistingData() {
  console.log('🧹 Nettoyage des données existantes...');
  
  try {
    const batch = writeBatch(db);
    let deleteCount = 0;

    // Supprimer les ingrédients existants
    const ingredientsSnapshot = await getDocs(collection(db, INGREDIENT_COLLECTIONS.ingredients));
    ingredientsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    // Supprimer les éléments du garde-manger existants
    const pantrySnapshot = await getDocs(collection(db, INGREDIENT_COLLECTIONS.pantry));
    pantrySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`✅ ${deleteCount} documents supprimés avec succès`);
    } else {
      console.log('ℹ️ Aucune donnée existante à supprimer');
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

/**
 * 🌱 Créer et peupler la collection ingredients
 */
export async function seedIngredientsCollection() {
  console.log('🌱 Création de la collection ingredients...');
  
  try {
    const batch = writeBatch(db);
    const createdIngredients = [];

    for (const ingredientData of SAMPLE_INGREDIENTS) {
      // Générer un ID de document unique
      const ingredientRef = doc(collection(db, INGREDIENT_COLLECTIONS.ingredients));
      
      // Utiliser le premier ID de famille comme propriétaire par défaut
      const familyId = EXISTING_FAMILY_IDS[0];
      const mockUserId = generateMockUserId(familyId);
      
      // Préparer les données complètes de l'ingrédient
      const normalizedName = IngredientUtils.normalizeName(ingredientData.name);
      const searchTerms = IngredientUtils.generateSearchTerms(
        ingredientData.name,
        ingredientData.aliases || []
      );

      const completeIngredient = {
        id: ingredientRef.id,
        name: ingredientData.name,
        normalizedName,
        description: ingredientData.description || '',
        price: ingredientData.price,
        category: ingredientData.category,
        unit: ingredientData.unit,
        familyId: familyId,
        isPublic: ingredientData.isPublic || false,
        createdBy: mockUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Données de recherche
        aliases: ingredientData.aliases || [],
        searchTerms,
        
        // Informations de stockage
        storageInstructions: ingredientData.storageInstructions || '',
        averageShelfLife: ingredientData.averageShelfLife || null,
        seasonality: ingredientData.seasonality || [],
        
        // Métadonnées
        usageCount: 0,
        lastUsed: null,
        notes: ingredientData.notes || '',
        tags: [],
        preferredBrands: [],
        nutritionalInfo: {},
        averageWeight: null,
        imageUrl: ''
      };

      batch.set(ingredientRef, completeIngredient);
      createdIngredients.push({
        id: ingredientRef.id,
        name: ingredientData.name,
        ...completeIngredient
      });
    }

    await batch.commit();
    console.log(`✅ ${createdIngredients.length} ingrédients créés avec succès`);
    
    // Retourner les ingrédients créés avec leurs IDs pour utilisation dans le garde-manger
    return createdIngredients;
  } catch (error) {
    console.error('❌ Erreur lors de la création des ingrédients:', error);
    throw error;
  }
}

/**
 * 🏪 Créer et peupler la collection pantry pour toutes les familles
 */
export async function seedPantryCollection(createdIngredients) {
  console.log('🏪 Création de la collection pantry...');
  
  try {
    const batch = writeBatch(db);
    let totalPantryItems = 0;

    // Pour chaque famille existante
    for (const familyId of EXISTING_FAMILY_IDS) {
      const mockUserId = generateMockUserId(familyId);
      
      // Créer 3-5 éléments de garde-manger par famille
      const itemsToCreate = SAMPLE_PANTRY_ITEMS.slice(0, Math.floor(Math.random() * 3) + 3);
      
      for (const pantryData of itemsToCreate) {
        // Trouver l'ingrédient correspondant
        const matchingIngredient = createdIngredients.find(
          ing => ing.name === pantryData.ingredientName
        );
        
        if (!matchingIngredient) {
          console.warn(`⚠️ Ingrédient non trouvé: ${pantryData.ingredientName}`);
          continue;
        }

        // Générer un ID de document unique pour l'élément du garde-manger
        const pantryItemRef = doc(collection(db, INGREDIENT_COLLECTIONS.pantry));
        
        // Calculer les dates
        const purchaseDate = new Date();
        purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 7)); // Acheté dans les 7 derniers jours
        
        const expiryDate = pantryData.daysUntilExpiry 
          ? calculateExpiryDate(pantryData.daysUntilExpiry)
          : null;

        const pantryItem = {
          id: pantryItemRef.id,
          familyId: familyId,
          ingredientId: matchingIngredient.id,
          ingredientName: matchingIngredient.name,
          quantity: pantryData.quantity,
          unit: pantryData.unit,
          purchaseDate: purchaseDate,
          expiryDate: expiryDate,
          location: pantryData.location,
          purchasePrice: pantryData.purchasePrice || null,
          supplier: '',
          batchNumber: '',
          notes: pantryData.notes || '',
          isExpired: false,
          daysUntilExpiry: pantryData.daysUntilExpiry || null,
          lastUpdated: serverTimestamp(),
          updatedBy: mockUserId,
          originalQuantity: pantryData.quantity,
          usageHistory: []
        };

        batch.set(pantryItemRef, pantryItem);
        totalPantryItems++;
      }
    }

    await batch.commit();
    console.log(`✅ ${totalPantryItems} éléments de garde-manger créés pour ${EXISTING_FAMILY_IDS.length} familles`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du garde-manger:', error);
    throw error;
  }
}

/**
 * 🔍 Vérifier l'état actuel des collections
 */
export async function verifyCollections() {
  console.log('🔍 Vérification des collections...');
  
  try {
    // Vérifier les ingrédients
    const ingredientsSnapshot = await getDocs(collection(db, INGREDIENT_COLLECTIONS.ingredients));
    const ingredientsCount = ingredientsSnapshot.size;
    
    // Vérifier le garde-manger
    const pantrySnapshot = await getDocs(collection(db, INGREDIENT_COLLECTIONS.pantry));
    const pantryCount = pantrySnapshot.size;
    
    // Vérifier les familles
    const familiesSnapshot = await getDocs(collection(db, 'families'));
    const familiesCount = familiesSnapshot.size;

    console.log('📊 État des collections:');
    console.log(`   • Familles: ${familiesCount}`);
    console.log(`   • Ingrédients: ${ingredientsCount}`);
    console.log(`   • Éléments garde-manger: ${pantryCount}`);
    
    return {
      families: familiesCount,
      ingredients: ingredientsCount,
      pantry: pantryCount
    };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

/**
 * 🚀 Fonction principale d'exécution du seeding
 */
export async function runCompleteSeeding(options = {}) {
  const { clearExisting = false, skipVerification = false } = options;
  
  console.log('🚀 Démarrage du seeding complet de MiamBidi...');
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'));
  
  try {
    // Étape 1: Nettoyage optionnel
    if (clearExisting) {
      await clearExistingData();
    }
    
    // Étape 2: Vérification initiale
    if (!skipVerification) {
      await verifyCollections();
    }
    
    // Étape 3: Création des ingrédients
    const createdIngredients = await seedIngredientsCollection();
    
    // Étape 4: Création du garde-manger
    await seedPantryCollection(createdIngredients);
    
    // Étape 5: Vérification finale
    const finalStats = await verifyCollections();
    
    console.log('🎉 Seeding terminé avec succès!');
    console.log('📈 Résultats finaux:', finalStats);
    
    return {
      success: true,
      stats: finalStats,
      ingredientsCreated: createdIngredients.length,
      familiesProcessed: EXISTING_FAMILY_IDS.length
    };
    
  } catch (error) {
    console.error('💥 Erreur critique lors du seeding:', error);
    return {
      success: false,
      error: error.message,
      stats: null
    };
  }
}

export default {
  EXISTING_FAMILY_IDS,
  SAMPLE_INGREDIENTS,
  SAMPLE_PANTRY_ITEMS,
  clearExistingData,
  seedIngredientsCollection,
  seedPantryCollection,
  verifyCollections,
  runCompleteSeeding
};
