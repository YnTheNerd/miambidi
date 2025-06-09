/**
 * Shopping List Data Structures and TypeScript-like interfaces for JavaScript
 * Designed for future Firebase integration and family collaboration
 */

// Shopping List Item Structure
export const ShoppingListItemSchema = {
  id: 'string', // unique identifier
  name: 'string', // ingredient name
  quantity: 'number', // aggregated quantity
  unit: 'string', // standardized unit (g, kg, ml, L, pièces, etc.)
  originalQuantity: 'number', // original quantity before aggregation
  originalUnit: 'string', // original unit before conversion
  category: 'string', // ingredient category
  isCompleted: 'boolean', // purchase status
  completedBy: 'string|null', // family member who marked as completed
  completedAt: 'string|null', // ISO timestamp
  recipes: 'array', // array of recipe IDs that require this ingredient
  recipeNames: 'array', // array of recipe names for display
  priority: 'string', // 'high', 'medium', 'low' based on meal urgency
  notes: 'string|null', // optional notes (substitutions, brand preferences)
  estimatedCost: 'number|null', // future feature for budget tracking
  store: 'string|null', // preferred store/section for this item
};

// Shopping List Structure
export const ShoppingListSchema = {
  id: 'string', // unique identifier
  title: 'string', // e.g., "Liste de courses - Semaine du 20 janvier"
  startDate: 'string', // ISO date string
  endDate: 'string', // ISO date string
  familyId: 'string', // family identifier
  createdBy: 'string', // user ID who generated the list
  createdAt: 'string', // ISO timestamp
  lastModified: 'string', // ISO timestamp
  status: 'string', // 'draft', 'active', 'completed', 'archived'
  
  // Categorized items
  categories: {
    'Légumes-feuilles & Aromates': 'array', // ShoppingListItem[]
    'Viandes & Poissons': 'array',
    'Céréales & Légumineuses': 'array',
    'Tubercules & Plantains': 'array',
    'Épices & Piments': 'array',
    'Huiles & Condiments': 'array',
    'Produits laitiers': 'array',
    'Fruits': 'array',
    'Boissons': 'array',
    'Autres': 'array'
  },
  
  // Aggregated statistics
  stats: {
    totalItems: 'number',
    completedItems: 'number',
    totalRecipes: 'number',
    estimatedCost: 'number|null',
    completionPercentage: 'number'
  },
  
  // Collaboration features
  assignedTo: 'array', // array of family member IDs
  sharedWith: 'array', // array of family member IDs with view access
  
  // Future Firebase integration fields
  firebaseId: 'string|null', // Firestore document ID
  syncStatus: 'string', // 'synced', 'pending', 'error'
  lastSyncAt: 'string|null'
};

// Meal Plan Item for Shopping List Generation
export const MealPlanItemSchema = {
  id: 'string',
  date: 'string', // ISO date string
  mealType: 'string', // 'Petit-déjeuner', 'Déjeuner', 'Dîner'
  recipe: 'object', // full recipe object
  servings: 'number|null', // planned servings (defaults to recipe.servings)
  scalingFactor: 'number', // multiplier for ingredient quantities
  familyMembers: 'array', // array of family member IDs eating this meal
  status: 'string' // 'planned', 'prepared', 'completed'
};

// Unit Conversion Mapping
export const UNIT_CONVERSIONS = {
  // Weight conversions (to grams)
  weight: {
    'g': 1,
    'kg': 1000,
    'mg': 0.001
  },
  
  // Volume conversions (to milliliters)
  volume: {
    'ml': 1,
    'L': 1000,
    'cl': 10,
    'dl': 100
  },
  
  // Spoon/cup conversions (to milliliters)
  spoons: {
    'cuillère à café': 5,
    'cuillère à soupe': 15,
    'tasse': 250,
    'verre': 200
  },
  
  // Count items (no conversion)
  count: {
    'pièce': 1,
    'pièces': 1,
    'gousse': 1,
    'gousses': 1,
    'morceau': 1,
    'morceaux': 1,
    'tranche': 1,
    'tranches': 1
  }
};

// French Grocery Categories (matching recipe ingredient categories)
export const GROCERY_CATEGORIES = {
  'Légumes-feuilles & Aromates': {
    icon: '🥬',
    color: '#4CAF50',
    priority: 1,
    description: 'Légumes frais, herbes et aromates'
  },
  'Viandes & Poissons': {
    icon: '🥩',
    color: '#F44336',
    priority: 2,
    description: 'Viandes, poissons et fruits de mer'
  },
  'Céréales & Légumineuses': {
    icon: '🌾',
    color: '#FF9800',
    priority: 3,
    description: 'Riz, haricots, lentilles et céréales'
  },
  'Tubercules & Plantains': {
    icon: '🥔',
    color: '#8BC34A',
    priority: 4,
    description: 'Pommes de terre, ignames, plantains'
  },
  'Épices & Piments': {
    icon: '🌶️',
    color: '#E91E63',
    priority: 5,
    description: 'Épices, piments et assaisonnements'
  },
  'Huiles & Condiments': {
    icon: '🫒',
    color: '#FFC107',
    priority: 6,
    description: 'Huiles, vinaigres et condiments'
  },
  'Produits laitiers': {
    icon: '🥛',
    color: '#2196F3',
    priority: 7,
    description: 'Lait, fromages et produits laitiers'
  },
  'Fruits': {
    icon: '🍎',
    color: '#4CAF50',
    priority: 8,
    description: 'Fruits frais et secs'
  },
  'Boissons': {
    icon: '🥤',
    color: '#00BCD4',
    priority: 9,
    description: 'Boissons et liquides'
  },
  'Autres': {
    icon: '📦',
    color: '#9E9E9E',
    priority: 10,
    description: 'Autres produits'
  }
};

// Shopping List Generation Configuration
export const SHOPPING_LIST_CONFIG = {
  defaultTitle: 'Liste de courses',
  maxItemsPerCategory: 50,
  aggregationThreshold: 0.1, // minimum quantity difference to aggregate
  defaultServingAdjustment: 1.0, // multiplier for family size
  
  // Priority calculation weights
  priorityWeights: {
    mealUrgency: 0.4, // how soon the meal is planned
    ingredientImportance: 0.3, // main vs. optional ingredients
    familyPreferences: 0.3 // family member dietary needs
  }
};

// Future Firebase Collection Structure
export const FIREBASE_COLLECTIONS = {
  shoppingLists: 'shopping-lists', // /shopping-lists/{listId}
  mealPlans: 'meal-plans', // /meal-plans/{familyId}/plans/{planId}
  families: 'families', // /families/{familyId}
  recipes: 'recipes', // /recipes/{recipeId}
  
  // Subcollections
  listItems: 'items', // /shopping-lists/{listId}/items/{itemId}
  listHistory: 'history', // /shopping-lists/{listId}/history/{historyId}
  familyMembers: 'members' // /families/{familyId}/members/{memberId}
};

export default {
  ShoppingListItemSchema,
  ShoppingListSchema,
  MealPlanItemSchema,
  UNIT_CONVERSIONS,
  GROCERY_CATEGORIES,
  SHOPPING_LIST_CONFIG,
  FIREBASE_COLLECTIONS
};
