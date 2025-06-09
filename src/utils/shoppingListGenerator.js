/**
 * Shopping List Generation Algorithm
 * Extracts and aggregates ingredients from meal plans
 */

import { 
  GROCERY_CATEGORIES, 
  SHOPPING_LIST_CONFIG 
} from '../types/shoppingList.js';
import {
  canAggregateIngredients,
  aggregateIngredients,
  scaleIngredient,
  normalizeIngredientName,
  formatQuantityUnit
} from './unitConversion.js';

/**
 * Generates a shopping list from meal plan data
 * @param {object} mealPlan - The meal plan object from DragDropMealCalendar
 * @param {array} allRecipes - Array of all available recipes
 * @param {object} options - Generation options
 * @returns {object} - Complete shopping list object
 */
export function generateShoppingList(mealPlan, allRecipes, options = {}) {
  const {
    startDate = new Date().toISOString().split('T')[0],
    endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    familySize = 4,
    title = null
  } = options;

  // Step 1: Extract all ingredients from planned meals
  const extractedIngredients = extractIngredientsFromMealPlan(mealPlan, allRecipes);
  
  // Step 2: Scale ingredients based on family size and servings
  const scaledIngredients = scaleIngredientsForFamily(extractedIngredients, familySize);
  
  // Step 3: Aggregate similar ingredients
  const aggregatedIngredients = aggregateIngredientsList(scaledIngredients);
  
  // Step 4: Categorize ingredients
  const categorizedIngredients = categorizeIngredients(aggregatedIngredients);
  
  // Step 5: Calculate priorities and statistics
  const enrichedIngredients = enrichIngredientsWithMetadata(categorizedIngredients, mealPlan);
  
  // Step 6: Build final shopping list structure
  const shoppingList = buildShoppingListStructure(
    enrichedIngredients,
    startDate,
    endDate,
    title
  );

  return shoppingList;
}

/**
 * Extracts ingredients from all planned meals
 * @param {object} mealPlan - Meal plan object
 * @param {array} allRecipes - All available recipes
 * @returns {array} - Array of ingredients with source information
 */
function extractIngredientsFromMealPlan(mealPlan, allRecipes) {
  const extractedIngredients = [];
  
  Object.entries(mealPlan).forEach(([mealKey, plannedMeal]) => {
    if (!plannedMeal || !plannedMeal.recipe) return;
    
    const recipe = plannedMeal.recipe;
    const [dateStr, mealType] = mealKey.split('-').slice(-2);
    
    recipe.ingredients.forEach(ingredient => {
      extractedIngredients.push({
        ...ingredient,
        source: {
          recipeId: recipe.id,
          recipeName: recipe.name,
          mealKey: mealKey,
          date: dateStr,
          mealType: mealType,
          originalServings: recipe.servings
        }
      });
    });
  });
  
  return extractedIngredients;
}

/**
 * Scales ingredients based on family size and recipe servings
 * @param {array} ingredients - Array of ingredients
 * @param {number} familySize - Target family size
 * @returns {array} - Scaled ingredients
 */
function scaleIngredientsForFamily(ingredients, familySize) {
  return ingredients.map(ingredient => {
    const originalServings = ingredient.source.originalServings || 4;
    const scalingFactor = familySize / originalServings;
    
    return scaleIngredient(ingredient, scalingFactor);
  });
}

/**
 * Aggregates ingredients with the same name and compatible units
 * @param {array} ingredients - Array of ingredients
 * @returns {array} - Aggregated ingredients
 */
function aggregateIngredientsList(ingredients) {
  const aggregatedMap = new Map();
  
  ingredients.forEach(ingredient => {
    const normalizedName = normalizeIngredientName(ingredient.name);
    
    if (aggregatedMap.has(normalizedName)) {
      const existing = aggregatedMap.get(normalizedName);
      
      if (canAggregateIngredients(existing, ingredient)) {
        try {
          const aggregated = aggregateIngredients(existing, ingredient);
          
          // Merge source information
          aggregated.sources = [
            ...(existing.sources || [existing.source]),
            ingredient.source
          ];
          
          aggregatedMap.set(normalizedName, aggregated);
        } catch (error) {
          // If aggregation fails, keep as separate items
          console.warn('Failed to aggregate ingredients:', error);
          aggregatedMap.set(`${normalizedName}_${Date.now()}`, ingredient);
        }
      } else {
        // Different units, keep separate
        aggregatedMap.set(`${normalizedName}_${ingredient.unit}`, ingredient);
      }
    } else {
      aggregatedMap.set(normalizedName, ingredient);
    }
  });
  
  return Array.from(aggregatedMap.values());
}

/**
 * Categorizes ingredients according to grocery categories
 * @param {array} ingredients - Array of ingredients
 * @returns {object} - Ingredients grouped by category
 */
function categorizeIngredients(ingredients) {
  const categorized = {};
  
  // Initialize all categories
  Object.keys(GROCERY_CATEGORIES).forEach(category => {
    categorized[category] = [];
  });
  
  ingredients.forEach(ingredient => {
    const category = ingredient.category || 'Autres';
    
    if (categorized[category]) {
      categorized[category].push(ingredient);
    } else {
      categorized['Autres'].push(ingredient);
    }
  });
  
  return categorized;
}

/**
 * Enriches ingredients with metadata (priority, recipes, etc.)
 * @param {object} categorizedIngredients - Categorized ingredients
 * @param {object} mealPlan - Original meal plan
 * @returns {object} - Enriched categorized ingredients
 */
function enrichIngredientsWithMetadata(categorizedIngredients, mealPlan) {
  const enriched = {};
  
  Object.entries(categorizedIngredients).forEach(([category, ingredients]) => {
    enriched[category] = ingredients.map(ingredient => {
      const sources = ingredient.sources || [ingredient.source];
      const recipeNames = [...new Set(sources.map(s => s.recipeName))];
      const recipeIds = [...new Set(sources.map(s => s.recipeId))];
      
      // Calculate priority based on meal timing
      const priority = calculateIngredientPriority(sources, mealPlan);
      
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        originalQuantity: ingredient.originalQuantity || ingredient.quantity,
        originalUnit: ingredient.originalUnit || ingredient.unit,
        category: category,
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        recipes: recipeIds,
        recipeNames: recipeNames,
        priority: priority,
        notes: null,
        estimatedCost: null,
        store: null,
        sources: sources
      };
    });
  });
  
  return enriched;
}

/**
 * Calculates ingredient priority based on meal timing and importance
 * @param {array} sources - Array of source information
 * @param {object} mealPlan - Meal plan object
 * @returns {string} - Priority level ('high', 'medium', 'low')
 */
function calculateIngredientPriority(sources, mealPlan) {
  const today = new Date();
  const urgentDays = 2; // Consider meals within 2 days as urgent
  
  let hasUrgentMeal = false;
  let mealCount = sources.length;
  
  sources.forEach(source => {
    const mealDate = new Date(source.date);
    const daysDiff = (mealDate - today) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= urgentDays) {
      hasUrgentMeal = true;
    }
  });
  
  if (hasUrgentMeal) return 'high';
  if (mealCount > 1) return 'medium';
  return 'low';
}

/**
 * Builds the final shopping list structure
 * @param {object} enrichedIngredients - Enriched categorized ingredients
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {string} title - Custom title
 * @returns {object} - Complete shopping list
 */
function buildShoppingListStructure(enrichedIngredients, startDate, endDate, title) {
  const totalItems = Object.values(enrichedIngredients)
    .reduce((sum, items) => sum + items.length, 0);
  
  const totalRecipes = new Set(
    Object.values(enrichedIngredients)
      .flat()
      .flatMap(item => item.recipes)
  ).size;
  
  const listTitle = title || `Liste de courses - Semaine du ${new Date(startDate).toLocaleDateString('fr-FR')}`;
  
  return {
    id: `shopping-list-${Date.now()}`,
    title: listTitle,
    startDate,
    endDate,
    familyId: 'mock-family-1', // TODO: Get from context
    createdBy: 'current-user', // TODO: Get from auth context
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: 'active',
    
    categories: enrichedIngredients,
    
    stats: {
      totalItems,
      completedItems: 0,
      totalRecipes,
      estimatedCost: null,
      completionPercentage: 0
    },
    
    assignedTo: [],
    sharedWith: [],
    
    // Future Firebase integration
    firebaseId: null,
    syncStatus: 'local',
    lastSyncAt: null
  };
}

export default {
  generateShoppingList
};
