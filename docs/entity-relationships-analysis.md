# Entity Relationships Analysis - MiamBidi

## Executive Summary

This document analyzes the relationships between core entities in the MiamBidi meal planning application: **Pantry Items**, **Recipes**, **Shopping Lists**, and **Ingredients**. The analysis identifies data flow patterns, potential inconsistencies, and provides backward-compatible solutions.

## Core Entity Overview

### 1. **Ingredients** (Base Entity)
- **Purpose**: Master catalog of available ingredients
- **Context**: `IngredientContext.jsx`
- **Storage**: Firestore collection `ingredients`
- **Key Properties**: `name`, `category`, `unit`, `price`, `familyId`, `isPublic`

### 2. **Recipes** (Composition Entity)
- **Purpose**: Cooking instructions with ingredient lists
- **Context**: `RecipeContext.jsx`
- **Storage**: Mock data (future Firestore)
- **Key Properties**: `ingredients[]`, `servings`, `prepTime`, `cookTime`

### 3. **Meal Plan** (Planning Entity)
- **Purpose**: Scheduled recipes for specific dates/meals
- **Context**: `MealPlanContext.jsx`
- **Storage**: Local state (future Firestore)
- **Key Properties**: `recipe`, `date`, `mealType`

### 4. **Shopping Lists** (Derived Entity)
- **Purpose**: Aggregated ingredients from meal plans
- **Context**: `ShoppingListContext.jsx`
- **Storage**: Local state (future Firestore)
- **Key Properties**: `categories{}`, `items[]`, `recipes[]`

### 5. **Pantry Items** (Inventory Entity)
- **Purpose**: Current ingredient inventory
- **Context**: `PantryContext.jsx`
- **Storage**: Firestore collection `pantry`
- **Key Properties**: `ingredientName`, `quantity`, `expiryDate`, `familyId`

## Data Flow Analysis

### Primary Workflow: Meal Planning → Shopping List Generation

```
1. User drags Recipe → Calendar (MealPlanContext)
2. MealPlan stores: { dateKey-mealType: { recipe, date, mealType } }
3. User generates Shopping List from MealPlan
4. ShoppingListGenerator extracts ingredients from recipes
5. Ingredients are categorized and aggregated
6. Shopping List created with categorized items
```

### Secondary Workflow: Shopping → Pantry Management

```
1. User completes shopping list items
2. Items can be added to Pantry (manual process)
3. Pantry tracks inventory with expiry dates
4. Future: Auto-deduct from pantry when cooking
```

## Identified Issues and Edge Cases

### 1. **Data Consistency Issues**

#### Issue: Ingredient Name Mismatches
- **Problem**: Recipe ingredients use free-text names, Pantry uses `ingredientName`
- **Impact**: No automatic linking between recipe ingredients and pantry items
- **Example**: Recipe has "Tomates fraîches", Pantry has "Tomate Fraîche"

#### Issue: Unit Conversion Gaps
- **Problem**: Recipes use various units, Shopping lists aggregate without conversion
- **Impact**: "2 cups flour" + "500g flour" = separate shopping list items
- **Location**: `shoppingListGenerator.js` line 150-180

### 2. **State Synchronization Issues**

#### Issue: Meal Plan Persistence
- **Problem**: MealPlan only exists in local state
- **Impact**: Data lost on page refresh, no family sharing
- **Location**: `MealPlanContext.jsx` - no Firebase integration

#### Issue: Shopping List → Pantry Disconnect
- **Problem**: No automatic flow from completed shopping to pantry
- **Impact**: Manual double-entry required
- **Location**: No integration between contexts

### 3. **Scaling and Performance Issues**

#### Issue: Recipe Scaling Logic
- **Problem**: Recipe scaling doesn't account for family preferences
- **Impact**: Incorrect quantities in shopping lists
- **Location**: `RecipeContext.jsx` lines 1131-1139

## Backward-Compatible Solutions

### Solution 1: Ingredient Name Normalization

```javascript
// Add to IngredientUtils
export const normalizeIngredientName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/\s+/g, ' ');
};

// Usage in shopping list generation
const findMatchingPantryItem = (ingredientName, pantryItems) => {
  const normalized = normalizeIngredientName(ingredientName);
  return pantryItems.find(item => 
    normalizeIngredientName(item.ingredientName) === normalized
  );
};
```

### Solution 2: Enhanced Unit Conversion System

```javascript
// Extend existing UNIT_CONVERSIONS in shoppingList.js
export const ENHANCED_UNIT_CONVERSIONS = {
  // Volume conversions
  'ml': { 'l': 0.001, 'cl': 0.1, 'dl': 0.01 },
  'l': { 'ml': 1000, 'cl': 100, 'dl': 10 },
  'cup': { 'ml': 240, 'l': 0.24 },
  
  // Weight conversions
  'g': { 'kg': 0.001, 'mg': 1000 },
  'kg': { 'g': 1000, 'mg': 1000000 },
  
  // Cooking-specific conversions
  'cuillère à soupe': { 'ml': 15, 'cuillère à café': 3 },
  'cuillère à café': { 'ml': 5 }
};
```

### Solution 3: Meal Plan Persistence Layer

```javascript
// Add to MealPlanContext.jsx
const saveMealPlanToFirebase = useCallback(async () => {
  if (!family?.id) return;
  
  const weekKey = getWeekKey(currentWeek);
  const mealPlanRef = doc(db, 'meal-plans', family.id, 'weeks', weekKey);
  
  await setDoc(mealPlanRef, {
    weekStart: getWeekStart(currentWeek).toISOString(),
    meals: mealPlan,
    lastUpdated: serverTimestamp(),
    updatedBy: currentUser.uid
  });
}, [mealPlan, currentWeek, family, currentUser]);
```

## Recommended User Workflows

### Workflow 1: Weekly Meal Planning (Verified)
1. Navigate to `/calendar`
2. Drag recipes from sidebar to calendar slots
3. Plan 3-7 meals for the week
4. Navigate to `/liste-courses`
5. Generate shopping list from meal plan
6. Export or share shopping list

### Workflow 2: Pantry-Aware Shopping (Future Enhancement)
1. Complete Workflow 1
2. Check pantry before shopping
3. Mark items as "already have" in shopping list
4. After shopping, add new items to pantry
5. When cooking, deduct ingredients from pantry

### Workflow 3: Recipe Discovery and Planning
1. Browse recipes in `/recipes`
2. Filter by dietary restrictions or cuisine
3. Add interesting recipes to favorites
4. Use favorites in meal planning workflow

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
- ✅ Fix drag and drop functionality
- ✅ Add shopping list export functionality
- ✅ Improve recipe display consistency

### Phase 2: Data Consistency (Next Sprint)
- [ ] Implement ingredient name normalization
- [ ] Add unit conversion system
- [ ] Create pantry-shopping list integration

### Phase 3: Persistence and Sharing (Future)
- [ ] Add meal plan Firebase persistence
- [ ] Implement family sharing for meal plans
- [ ] Add automatic pantry deduction

## Testing Recommendations

### Integration Tests Needed
1. **Meal Plan → Shopping List Flow**
   - Test recipe ingredient extraction
   - Verify quantity aggregation
   - Check category assignment

2. **Shopping List → Pantry Flow**
   - Test manual pantry addition
   - Verify expiry date handling
   - Check family isolation

3. **Cross-Context State Management**
   - Test context provider nesting
   - Verify state updates propagate
   - Check error handling

## Conclusion

The current entity relationships are well-designed but have gaps in data consistency and persistence. The proposed solutions maintain backward compatibility while addressing critical issues. Priority should be given to data normalization and unit conversion to improve user experience.
