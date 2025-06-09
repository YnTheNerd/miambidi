/**
 * Comprehensive Recipe Data Structures for MiamBidi
 * Enhanced schemas for recipe management, cost calculation, and AI integration
 */

// Enhanced Recipe Schema for Firebase Collection
export const RecipeSchema = {
  id: 'string', // Auto-generated Firestore document ID
  name: 'string', // Required - Recipe name (primary input for AI generation)
  description: 'string', // Optional - Brief recipe description (AI-generatable)
  
  // Enhanced ingredient structure for cost calculation
  ingredients: 'array', // Array of RecipeIngredient objects
  
  instructions: 'array', // Step-by-step cooking instructions (AI-generatable)
  
  // Time and serving information (AI-generatable)
  prepTime: 'number', // Preparation time in minutes
  cookTime: 'number', // Cooking time in minutes
  totalTime: 'number', // Calculated: prepTime + cookTime
  servings: 'string', // Number of servings (e.g., "4 personnes", "6-8 portions")
  
  // Enhanced search and categorization
  aliases: 'array', // Alternative names for search (similar to ingredient aliases)
  searchTerms: 'array', // Generated search terms including name, aliases, ingredients
  category: 'string', // Recipe category (Plat principal, Dessert, Entrée, etc.)
  cuisine: 'string', // Cuisine type (Camerounaise, Française, etc.)
  difficulty: 'string', // Cooking difficulty (Facile, Moyen, Difficile)
  
  // Cost and nutrition tracking
  totalCost: 'number', // Total recipe cost in FCFA
  costPerServing: 'number', // Calculated cost per serving
  lastCostUpdate: 'timestamp', // When cost was last calculated
  nutritionInfo: 'object', // Nutritional information
  
  // Media and presentation
  imageUrl: 'string', // Firebase Storage URL or fallback to '/images/recipes/default-meal.jpg'
  tags: 'array', // Dietary tags (végétarien, sans gluten, épicé, etc.)
  
  // Metadata following MiamBidi patterns
  familyId: 'string|null', // Family ownership (null for public recipes)
  createdBy: 'string', // Required - User who created the recipe
  visibility: 'string', // 'private', 'family', 'public'
  isPublic: 'boolean', // Public visibility (default: false for family recipes)
  public: 'boolean', // Alternative public flag for compatibility
  createdAt: 'timestamp',
  updatedAt: 'timestamp',

  // Social features
  rating: 'number', // Average rating (0-5)
  reviews: 'number', // Number of reviews
  likedBy: 'array', // Array of user IDs who liked this recipe
  
  // AI integration preparation
  aiGenerated: 'boolean', // Flag indicating if recipe was AI-generated
  aiPrompt: 'string', // Original prompt used for AI generation (if applicable)
  lastAiUpdate: 'timestamp' // When AI last modified the recipe
};

// Recipe Ingredient Schema with enhanced cost calculation
export const RecipeIngredientSchema = {
  ingredientId: 'string|null', // Reference to ingredients collection (null for temporary)
  name: 'string', // Ingredient name
  quantity: 'number', // Amount needed
  unit: 'string', // Measurement unit (kg, pièce, litre, etc.)
  price: 'number', // Price per unit in FCFA (snapshot for historical accuracy)
  totalCost: 'number', // Calculated: quantity * price
  notes: 'string', // Optional preparation notes
  isTemporary: 'boolean' // True if ingredient doesn't exist in ingredients collection
};

// Nutrition Information Schema
export const NutritionInfoSchema = {
  calories: 'number',
  proteins: 'number', // in grams
  carbs: 'number', // in grams
  fats: 'number', // in grams
  fiber: 'number' // in grams
};

// Recipe categories in French
export const RECIPE_CATEGORIES = [
  'Plat principal',
  'Entrée', 
  'Dessert',
  'Accompagnement',
  'Boisson',
  'Sauce',
  'Soupe',
  'Salade',
  'Petit-déjeuner',
  'Collation',
  'Autres'
];

// Cuisine types with focus on African/Cameroonian
export const CUISINE_TYPES = [
  'Camerounaise',
  'Africaine',
  'Française',
  'Internationale',
  'Fusion',
  'Méditerranéenne',
  'Asiatique',
  'Américaine',
  'Autres'
];

// Difficulty levels in French
export const DIFFICULTY_LEVELS = [
  'Facile',
  'Moyen',
  'Difficile',
  'Expert'
];

// Dietary and cooking tags
export const RECIPE_TAGS = [
  // Dietary restrictions
  'Végétarien',
  'Végétalien',
  'Sans gluten',
  'Sans lactose',
  'Sans noix',
  'Halal',
  
  // Cooking methods
  'Grillé',
  'Bouilli',
  'Frit',
  'Cuit à la vapeur',
  'Rôti',
  'Braisé',
  
  // Characteristics
  'Épicé',
  'Doux',
  'Rapide',
  'Économique',
  'Festif',
  'Traditionnel',
  'Moderne',
  'Santé'
];

// Comprehensive validation rules
export const RECIPE_VALIDATION = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-'()]+$/ // French characters, numbers, spaces
  },
  description: {
    required: false,
    maxLength: 500
  },
  servings: {
    required: true,
    pattern: /^[0-9\-\s]+[a-zA-ZÀ-ÿ\s]*$/ // Numbers followed by optional text
  },
  prepTime: {
    required: true,
    min: 0,
    max: 1440 // 24 hours max
  },
  cookTime: {
    required: true,
    min: 0,
    max: 1440 // 24 hours max
  },
  category: {
    required: true,
    allowedValues: RECIPE_CATEGORIES
  },
  cuisine: {
    required: true,
    allowedValues: CUISINE_TYPES
  },
  difficulty: {
    required: true,
    allowedValues: DIFFICULTY_LEVELS
  },
  ingredients: {
    required: true,
    minLength: 1,
    maxLength: 50
  },
  instructions: {
    required: true,
    minLength: 1,
    maxLength: 20
  }
};

// Default values for new recipes
export const DEFAULT_RECIPE = {
  name: '',
  description: '',
  ingredients: [],
  instructions: [''],
  prepTime: 15,
  cookTime: 30,
  totalTime: 45,
  servings: '4 personnes',
  aliases: [],
  searchTerms: [],
  category: 'Plat principal',
  cuisine: 'Camerounaise',
  difficulty: 'Moyen',
  totalCost: 0,
  costPerServing: 0,
  nutritionInfo: {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
    fiber: 0
  },
  imageUrl: '/images/recipes/default-meal.jpg',
  tags: [],
  visibility: 'family', // Default to family visibility
  isPublic: false, // Family recipes are private by default
  public: false, // Alternative public flag for compatibility
  rating: 0,
  reviews: 0,
  likedBy: [],
  aiGenerated: false,
  aiPrompt: '',
  lastAiUpdate: null
};

// Default values for recipe ingredients
export const DEFAULT_RECIPE_INGREDIENT = {
  ingredientId: null,
  name: '',
  quantity: 1,
  unit: 'pièce',
  price: 0,
  totalCost: 0,
  notes: '',
  isTemporary: false
};

// Search configuration for recipes
export const RECIPE_SEARCH_CONFIG = {
  minSearchLength: 2,
  maxResults: 50,
  fuzzyMatchThreshold: 0.8,
  searchFields: ['name', 'description', 'aliases', 'searchTerms', 'ingredients.name', 'tags']
};

// Utility functions for recipe management
export const RecipeUtils = {
  // Normalize recipe name for search
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

  // Generate search terms for recipes
  generateSearchTerms: (recipe) => {
    const terms = new Set();
    const normalized = RecipeUtils.normalizeName(recipe.name);

    // Add full name
    terms.add(normalized);

    // Add words from name
    normalized.split(' ').forEach(word => {
      if (word.length >= 2) terms.add(word);
    });

    // Add aliases
    recipe.aliases?.forEach(alias => {
      const normalizedAlias = RecipeUtils.normalizeName(alias);
      terms.add(normalizedAlias);
      normalizedAlias.split(' ').forEach(word => {
        if (word.length >= 2) terms.add(word);
      });
    });

    // Add ingredient names
    recipe.ingredients?.forEach(ingredient => {
      const normalizedIngredient = RecipeUtils.normalizeName(ingredient.name);
      terms.add(normalizedIngredient);
    });

    // Add category and cuisine
    if (recipe.category) terms.add(RecipeUtils.normalizeName(recipe.category));
    if (recipe.cuisine) terms.add(RecipeUtils.normalizeName(recipe.cuisine));

    return Array.from(terms);
  },

  // Calculate total recipe cost
  calculateTotalCost: (ingredients) => {
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.totalCost || 0);
    }, 0);
  },

  // Calculate cost per serving
  calculateCostPerServing: (totalCost, servings) => {
    const servingNumber = parseInt(servings) || 1;
    return totalCost / servingNumber;
  },

  // Calculate total time
  calculateTotalTime: (prepTime, cookTime) => {
    return (prepTime || 0) + (cookTime || 0);
  },

  // Format time for display
  formatTime: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  },

  // Format cost for display
  formatCost: (cost) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost).replace('XAF', 'FCFA');
  }
};

export default {
  RecipeSchema,
  RecipeIngredientSchema,
  NutritionInfoSchema,
  RECIPE_CATEGORIES,
  CUISINE_TYPES,
  DIFFICULTY_LEVELS,
  RECIPE_TAGS,
  RECIPE_VALIDATION,
  DEFAULT_RECIPE,
  DEFAULT_RECIPE_INGREDIENT,
  RECIPE_SEARCH_CONFIG,
  RecipeUtils
};
