/**
 * Intelligent Stock Generator for Seller Marketplace
 * Analyzes public recipes to generate realistic seller stocks
 */

import { GROCERY_CATEGORIES } from '../types/shoppingList';

// Cameroonian market prices (in FCFA per unit)
const MARKET_PRICES = {
  // Légumes-feuilles & Aromates
  'épinards': { min: 200, max: 400, unit: 'botte' },
  'persil': { min: 100, max: 200, unit: 'botte' },
  'coriandre': { min: 100, max: 200, unit: 'botte' },
  'basilic': { min: 150, max: 250, unit: 'botte' },
  'menthe': { min: 100, max: 200, unit: 'botte' },
  'céleri': { min: 200, max: 300, unit: 'botte' },
  'oseille': { min: 150, max: 250, unit: 'botte' },
  
  // Légumes
  'tomates': { min: 800, max: 1200, unit: 'kg' },
  'oignons': { min: 600, max: 900, unit: 'kg' },
  'ail': { min: 1500, max: 2000, unit: 'kg' },
  'gingembre': { min: 2000, max: 3000, unit: 'kg' },
  'piment': { min: 1000, max: 1500, unit: 'kg' },
  'carotte': { min: 500, max: 800, unit: 'kg' },
  'pomme de terre': { min: 400, max: 600, unit: 'kg' },
  'patate douce': { min: 300, max: 500, unit: 'kg' },
  'igname': { min: 400, max: 600, unit: 'kg' },
  'plantain': { min: 200, max: 400, unit: 'kg' },
  'banane': { min: 300, max: 500, unit: 'kg' },
  'avocat': { min: 200, max: 300, unit: 'pièce' },
  'concombre': { min: 500, max: 800, unit: 'kg' },
  'courgette': { min: 600, max: 900, unit: 'kg' },
  'aubergine': { min: 700, max: 1000, unit: 'kg' },
  'poivron': { min: 1000, max: 1500, unit: 'kg' },
  'chou': { min: 300, max: 500, unit: 'pièce' },
  'salade': { min: 200, max: 300, unit: 'pièce' },
  
  // Viandes & Poissons
  'bœuf': { min: 3000, max: 4500, unit: 'kg' },
  'porc': { min: 2500, max: 3500, unit: 'kg' },
  'agneau': { min: 3500, max: 5000, unit: 'kg' },
  'chèvre': { min: 3000, max: 4000, unit: 'kg' },
  'poulet': { min: 2000, max: 3000, unit: 'kg' },
  'poisson': { min: 1500, max: 2500, unit: 'kg' },
  'crevettes': { min: 4000, max: 6000, unit: 'kg' },
  'crabe': { min: 3000, max: 4500, unit: 'kg' },
  'escargot': { min: 2000, max: 3000, unit: 'kg' },
  
  // Céréales & Légumineuses
  'riz': { min: 600, max: 900, unit: 'kg' },
  'maïs': { min: 400, max: 600, unit: 'kg' },
  'mil': { min: 500, max: 700, unit: 'kg' },
  'sorgho': { min: 500, max: 700, unit: 'kg' },
  'blé': { min: 700, max: 1000, unit: 'kg' },
  'avoine': { min: 800, max: 1200, unit: 'kg' },
  'haricots': { min: 800, max: 1200, unit: 'kg' },
  'lentilles': { min: 1000, max: 1500, unit: 'kg' },
  'pois chiches': { min: 1200, max: 1800, unit: 'kg' },
  'arachides': { min: 1000, max: 1500, unit: 'kg' },
  
  // Huiles & Matières grasses
  'huile de palme': { min: 1500, max: 2500, unit: 'L' },
  'huile d\'arachide': { min: 2000, max: 3000, unit: 'L' },
  'huile de tournesol': { min: 1800, max: 2800, unit: 'L' },
  'huile d\'olive': { min: 3000, max: 5000, unit: 'L' },
  'beurre': { min: 2500, max: 3500, unit: 'kg' },
  'margarine': { min: 1500, max: 2500, unit: 'kg' },
  
  // Épices & Condiments
  'sel': { min: 200, max: 400, unit: 'kg' },
  'poivre': { min: 3000, max: 5000, unit: 'kg' },
  'curry': { min: 2000, max: 3500, unit: 'kg' },
  'curcuma': { min: 2500, max: 4000, unit: 'kg' },
  'cannelle': { min: 4000, max: 6000, unit: 'kg' },
  'muscade': { min: 5000, max: 8000, unit: 'kg' },
  'clou de girofle': { min: 6000, max: 10000, unit: 'kg' },
  'cardamome': { min: 8000, max: 12000, unit: 'kg' },
  'cube maggi': { min: 50, max: 100, unit: 'pièce' },
  'concentré de tomate': { min: 300, max: 500, unit: 'boîte' },
  
  // Produits laitiers
  'lait': { min: 600, max: 900, unit: 'L' },
  'yaourt': { min: 300, max: 500, unit: 'pot' },
  'fromage': { min: 2000, max: 4000, unit: 'kg' },
  'crème fraîche': { min: 1500, max: 2500, unit: 'L' },
  
  // Fruits
  'mangue': { min: 500, max: 800, unit: 'kg' },
  'ananas': { min: 300, max: 500, unit: 'pièce' },
  'papaye': { min: 400, max: 600, unit: 'kg' },
  'orange': { min: 400, max: 600, unit: 'kg' },
  'citron': { min: 800, max: 1200, unit: 'kg' },
  'pamplemousse': { min: 300, max: 500, unit: 'kg' },
  'pomme': { min: 1000, max: 1500, unit: 'kg' },
  'poire': { min: 1200, max: 1800, unit: 'kg' },
  'raisin': { min: 1500, max: 2500, unit: 'kg' },
  
  // Boissons
  'eau': { min: 200, max: 400, unit: 'L' },
  'jus de fruit': { min: 500, max: 800, unit: 'L' },
  'soda': { min: 300, max: 500, unit: 'L' },
  'bière': { min: 400, max: 600, unit: 'L' },
  'vin': { min: 2000, max: 5000, unit: 'L' }
};

// Popular Cameroonian ingredients by frequency
const POPULAR_INGREDIENTS = [
  'tomates', 'oignons', 'ail', 'gingembre', 'piment',
  'huile de palme', 'cube maggi', 'sel', 'poivre',
  'riz', 'plantain', 'igname', 'patate douce',
  'poulet', 'bœuf', 'poisson', 'crevettes',
  'épinards', 'persil', 'coriandre', 'basilic',
  'concentré de tomate', 'curry', 'curcuma'
];

/**
 * Analyzes public recipes to extract ingredient frequency
 */
export function analyzeRecipeIngredients(recipes) {
  const ingredientFrequency = {};
  const ingredientCategories = {};
  
  recipes.forEach(recipe => {
    if (recipe.isPublic && recipe.ingredients) {
      recipe.ingredients.forEach(ingredient => {
        const name = ingredient.name.toLowerCase().trim();
        
        // Count frequency
        ingredientFrequency[name] = (ingredientFrequency[name] || 0) + 1;
        
        // Track category
        if (ingredient.category) {
          ingredientCategories[name] = ingredient.category;
        }
      });
    }
  });
  
  return { ingredientFrequency, ingredientCategories };
}

/**
 * Generates realistic stock quantities based on ingredient type
 */
function generateStockQuantity(ingredientName, category) {
  const name = ingredientName.toLowerCase();
  
  // Base quantities by category
  const baseQuantities = {
    'Légumes-feuilles & Aromates': { min: 5, max: 20 },
    'Légumes': { min: 10, max: 50 },
    'Viandes & Poissons': { min: 5, max: 25 },
    'Céréales & Légumineuses': { min: 20, max: 100 },
    'Huiles & Matières grasses': { min: 5, max: 20 },
    'Épices & Condiments': { min: 10, max: 50 },
    'Produits laitiers': { min: 10, max: 30 },
    'Fruits': { min: 10, max: 40 },
    'Boissons': { min: 20, max: 100 }
  };
  
  const categoryRange = baseQuantities[category] || { min: 5, max: 30 };
  
  // Adjust for popular ingredients (higher stock)
  const isPopular = POPULAR_INGREDIENTS.includes(name);
  const multiplier = isPopular ? 1.5 : 1;
  
  const min = Math.floor(categoryRange.min * multiplier);
  const max = Math.floor(categoryRange.max * multiplier);
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets market price for an ingredient
 */
function getMarketPrice(ingredientName) {
  const name = ingredientName.toLowerCase();
  const priceInfo = MARKET_PRICES[name];
  
  if (priceInfo) {
    const price = Math.floor(Math.random() * (priceInfo.max - priceInfo.min + 1)) + priceInfo.min;
    return { price, unit: priceInfo.unit };
  }
  
  // Default pricing for unknown ingredients
  return { price: Math.floor(Math.random() * 1000) + 500, unit: 'kg' };
}

/**
 * Generates seller stock based on recipe analysis
 */
export function generateSellerStock(recipes, sellerProfile, options = {}) {
  const {
    maxItems = 50,
    includePopularOnly = false,
    categoryFilter = null
  } = options;
  
  const { ingredientFrequency, ingredientCategories } = analyzeRecipeIngredients(recipes);
  
  // Sort ingredients by frequency
  const sortedIngredients = Object.entries(ingredientFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxItems * 2); // Get more than needed for filtering
  
  const stock = [];
  
  for (const [ingredientName, frequency] of sortedIngredients) {
    if (stock.length >= maxItems) break;
    
    const category = ingredientCategories[ingredientName] || 'Autres';
    
    // Apply category filter if specified
    if (categoryFilter && category !== categoryFilter) continue;
    
    // Skip if only popular ingredients requested and this isn't popular
    if (includePopularOnly && !POPULAR_INGREDIENTS.includes(ingredientName)) continue;
    
    const quantity = generateStockQuantity(ingredientName, category);
    const { price, unit } = getMarketPrice(ingredientName);
    
    // Determine quality based on seller profile
    const qualities = ['economy', 'standard', 'premium'];
    const qualityWeights = sellerProfile.isVerified ? [0.2, 0.5, 0.3] : [0.4, 0.5, 0.1];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    
    // Adjust price based on quality
    const qualityMultipliers = { economy: 0.8, standard: 1.0, premium: 1.3 };
    const finalPrice = Math.floor(price * qualityMultipliers[quality]);
    
    stock.push({
      ingredientName: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
      quantity,
      unit,
      pricePerUnit: finalPrice,
      originalPrice: Math.floor(finalPrice * 0.7), // Assume 30% markup
      quality,
      category,
      frequency,
      isAvailable: Math.random() > 0.1, // 90% availability
      minimumQuantity: Math.max(1, Math.floor(quantity * 0.1)),
      maximumQuantity: quantity * 2,
      notes: generateStockNotes(ingredientName, quality)
    });
  }
  
  return stock;
}

/**
 * Generates contextual notes for stock items
 */
function generateStockNotes(ingredientName, quality) {
  const notes = {
    premium: [
      'Produit de qualité supérieure',
      'Fraîcheur garantie',
      'Origine locale certifiée',
      'Sélection premium'
    ],
    standard: [
      'Bonne qualité',
      'Produit frais',
      'Disponible en permanence',
      'Rapport qualité-prix optimal'
    ],
    economy: [
      'Prix économique',
      'Bon rapport qualité-prix',
      'Idéal pour grandes quantités',
      'Promotion spéciale'
    ]
  };
  
  const qualityNotes = notes[quality] || notes.standard;
  return qualityNotes[Math.floor(Math.random() * qualityNotes.length)];
}

/**
 * Updates seller stock with new recipe data
 */
export function updateSellerStockFromRecipes(currentStock, recipes, options = {}) {
  const { ingredientFrequency } = analyzeRecipeIngredients(recipes);
  
  return currentStock.map(item => {
    const frequency = ingredientFrequency[item.ingredientName.toLowerCase()] || 0;
    
    // Adjust quantities based on demand (frequency)
    const demandMultiplier = Math.min(2, 1 + (frequency / 10));
    const newQuantity = Math.floor(item.quantity * demandMultiplier);
    
    return {
      ...item,
      quantity: newQuantity,
      frequency,
      lastUpdated: new Date().toISOString()
    };
  });
}

export default {
  analyzeRecipeIngredients,
  generateSellerStock,
  updateSellerStockFromRecipes,
  MARKET_PRICES,
  POPULAR_INGREDIENTS
};
