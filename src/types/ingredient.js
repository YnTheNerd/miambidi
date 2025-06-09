/**
 * Enhanced Ingredient Data Structures for MiamBidi
 * Comprehensive schemas for ingredient management, pricing, and pantry tracking
 */

// Enhanced Ingredient Schema for Firebase Collection
export const IngredientSchema = {
  id: 'string', // unique identifier (Firestore document ID)
  name: 'string', // ingredient name (e.g., "Tomates") - normalized for searching
  normalizedName: 'string', // lowercase, accent-free version for search
  description: 'string', // optional description
  price: 'number', // price in FCFA (required)
  category: 'string', // grocery category (matches GROCERY_CATEGORIES)
  unit: 'string', // default unit for this ingredient (kg, L, pièces, etc.)
  familyId: 'string', // family that owns this ingredient (for family-specific ingredients)
  isPublic: 'boolean', // whether this ingredient is available to all families
  createdBy: 'string', // user ID who created this ingredient
  createdAt: 'timestamp', // Firestore timestamp
  updatedAt: 'timestamp', // Firestore timestamp

  // Enhanced search and matching
  aliases: 'array', // alternative names for this ingredient
  searchTerms: 'array', // computed search terms for better matching

  // Nutritional and storage info
  nutritionalInfo: 'object', // optional nutritional data per 100g/100ml
  averageShelfLife: 'number', // days (for pantry management)
  storageInstructions: 'string', // storage recommendations

  // Commercial info
  preferredBrands: 'array', // array of preferred brand names
  averageWeight: 'number', // average weight/volume per unit (for conversion)
  seasonality: 'array', // months when ingredient is in season

  // Usage tracking
  usageCount: 'number', // how many times used in recipes
  lastUsed: 'timestamp', // last time used in a recipe

  // Additional metadata
  notes: 'string', // additional notes or tips
  tags: 'array', // custom tags for organization
  imageUrl: 'string' // optional image URL
};

// Enhanced Pantry Item Schema
export const PantryItemSchema = {
  id: 'string', // unique identifier
  familyId: 'string', // family that owns this pantry item
  ingredientId: 'string', // reference to ingredient document
  ingredientName: 'string', // denormalized for quick access
  quantity: 'number', // current quantity in pantry
  unit: 'string', // unit of measurement
  purchaseDate: 'timestamp', // when item was purchased
  expiryDate: 'timestamp', // when item expires (optional)
  location: 'string', // storage location (e.g., "Réfrigérateur", "Garde-manger")
  purchasePrice: 'number', // price paid in FCFA (optional)
  supplier: 'string', // where purchased (optional)
  batchNumber: 'string', // for tracking (optional)
  notes: 'string', // optional notes
  isExpired: 'boolean', // computed field
  daysUntilExpiry: 'number', // computed field
  lastUpdated: 'timestamp', // last modification
  updatedBy: 'string', // user who last updated

  // Usage tracking
  originalQuantity: 'number', // quantity when first added
  usageHistory: 'array' // array of usage records
};

// Recipe Ingredient Reference Schema (enhanced)
export const RecipeIngredientSchema = {
  name: 'string', // ingredient name as entered
  quantity: 'number', // amount needed
  unit: 'string', // unit of measurement
  category: 'string', // grocery category

  // Enhanced fields for ingredient management
  ingredientId: 'string|null', // reference to registered ingredient (if matched)
  normalizedName: 'string', // normalized for matching
  estimatedPrice: 'number|null', // price from registered ingredient
  isOptional: 'boolean', // whether ingredient is optional
  substitutes: 'array', // possible substitutes
  preparationNotes: 'string' // how to prepare (e.g., "diced", "chopped")
};

// Grocery categories matching existing system
export const INGREDIENT_CATEGORIES = [
  'Légumes-feuilles & Aromates',
  'Viandes & Poissons',
  'Céréales & Légumineuses',
  'Tubercules & Plantains',
  'Épices & Piments',
  'Huiles & Condiments',
  'Produits laitiers',
  'Fruits',
  'Boissons',
  'Autres'
];

// Enhanced units with conversion factors
export const INGREDIENT_UNITS = [
  // Weight
  { name: 'kg', type: 'weight', factor: 1000 },
  { name: 'g', type: 'weight', factor: 1 },
  { name: 'mg', type: 'weight', factor: 0.001 },

  // Volume
  { name: 'L', type: 'volume', factor: 1000 },
  { name: 'ml', type: 'volume', factor: 1 },
  { name: 'cl', type: 'volume', factor: 10 },
  { name: 'dl', type: 'volume', factor: 100 },

  // Cooking measures
  { name: 'cuillère à café', type: 'volume', factor: 5 },
  { name: 'cuillère à soupe', type: 'volume', factor: 15 },
  { name: 'tasse', type: 'volume', factor: 250 },
  { name: 'verre', type: 'volume', factor: 200 },

  // Count
  { name: 'pièce', type: 'count', factor: 1 },
  { name: 'pièces', type: 'count', factor: 1 },
  { name: 'gousse', type: 'count', factor: 1 },
  { name: 'gousses', type: 'count', factor: 1 },
  { name: 'morceau', type: 'count', factor: 1 },
  { name: 'morceaux', type: 'count', factor: 1 },
  { name: 'tranche', type: 'count', factor: 1 },
  { name: 'tranches', type: 'count', factor: 1 },
  { name: 'botte', type: 'count', factor: 1 },
  { name: 'bottes', type: 'count', factor: 1 },
  { name: 'paquet', type: 'count', factor: 1 },
  { name: 'paquets', type: 'count', factor: 1 }
];

// Storage locations for pantry management
export const STORAGE_LOCATIONS = [
  'Garde-manger',
  'Réfrigérateur',
  'Congélateur',
  'Cave',
  'Placard épices',
  'Placard sec',
  'Autre'
];

// Seasonality months (for ingredient availability)
export const SEASONALITY_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Enhanced validation rules
export const INGREDIENT_VALIDATION = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-'()]+$/ // French characters, numbers, spaces, hyphens, apostrophes, parentheses
  },
  description: {
    required: false,
    maxLength: 500
  },
  price: {
    required: true,
    min: 0,
    max: 1000000 // 1 million FCFA max
  },
  category: {
    required: true,
    allowedValues: INGREDIENT_CATEGORIES
  },
  unit: {
    required: true,
    allowedValues: INGREDIENT_UNITS.map(u => u.name)
  },
  quantity: {
    required: true,
    min: 0,
    max: 10000
  }
};

// Firebase collection paths
export const INGREDIENT_COLLECTIONS = {
  ingredients: 'ingredients',
  pantry: 'pantry',
  pantryItems: 'items' // subcollection under pantry/{familyId}/items
};

// Default values for new ingredients
export const DEFAULT_INGREDIENT = {
  name: '',
  normalizedName: '',
  description: '',
  price: 0,
  category: 'Autres',
  unit: 'pièce',
  isPublic: true, // Changed to true for maximum visibility by default
  aliases: [],
  searchTerms: [],
  nutritionalInfo: {},
  averageShelfLife: null,
  storageInstructions: '',
  preferredBrands: [],
  averageWeight: null,
  seasonality: [],
  usageCount: 0,
  notes: '',
  tags: [],
  imageUrl: ''
};

// Default values for new pantry items
export const DEFAULT_PANTRY_ITEM = {
  quantity: 0,
  unit: 'pièce',
  purchaseDate: null,
  expiryDate: null,
  location: 'Garde-manger',
  purchasePrice: null,
  supplier: '',
  batchNumber: '',
  notes: '',
  originalQuantity: 0,
  usageHistory: []
};

// Search configuration
export const SEARCH_CONFIG = {
  minSearchLength: 2,
  maxResults: 50,
  fuzzyMatchThreshold: 0.8,
  searchFields: ['name', 'normalizedName', 'aliases', 'searchTerms', 'description']
};

// Utility functions for ingredient management
export const IngredientUtils = {
  // Normalize ingredient name for search
  normalizeName: (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n');
  },

  // Generate search terms
  generateSearchTerms: (name, aliases = []) => {
    const terms = new Set();
    const normalized = IngredientUtils.normalizeName(name);

    // Add full name
    terms.add(normalized);

    // Add words from name
    normalized.split(' ').forEach(word => {
      if (word.length >= 2) terms.add(word);
    });

    // Add aliases
    aliases.forEach(alias => {
      const normalizedAlias = IngredientUtils.normalizeName(alias);
      terms.add(normalizedAlias);
      normalizedAlias.split(' ').forEach(word => {
        if (word.length >= 2) terms.add(word);
      });
    });

    return Array.from(terms);
  },

  // Check if pantry item is expired
  isExpired: (expiryDate) => {
    if (!expiryDate) return false;
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      // Set time to start of day for accurate comparison
      expiry.setHours(23, 59, 59, 999);
      now.setHours(0, 0, 0, 0);
      return expiry < now;
    } catch (error) {
      console.error('Error parsing expiry date:', error);
      return false;
    }
  },

  // Calculate days until expiry
  daysUntilExpiry: (expiryDate) => {
    if (!expiryDate) return null;
    try {
      const now = new Date();
      const expiry = new Date(expiryDate);

      // Set time to start of day for accurate comparison
      now.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Error calculating days until expiry:', error);
      return null;
    }
  }
};

export default {
  IngredientSchema,
  PantryItemSchema,
  RecipeIngredientSchema,
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  STORAGE_LOCATIONS,
  SEASONALITY_MONTHS,
  INGREDIENT_VALIDATION,
  INGREDIENT_COLLECTIONS,
  DEFAULT_INGREDIENT,
  DEFAULT_PANTRY_ITEM,
  SEARCH_CONFIG,
  IngredientUtils
};
