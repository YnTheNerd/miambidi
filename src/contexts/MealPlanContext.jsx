/**
 * Meal Plan Context for Shared State Management
 * Manages meal planning data shared between calendar and shopping list components
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const MealPlanContext = createContext();

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}

export function MealPlanProvider({ children }) {
  // Meal plan state: { dateKey-mealType: { recipe, date, mealType } }
  const [mealPlan, setMealPlan] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());

  /**
   * Plans a meal for a specific date and meal type
   * @param {string} dateKey - Date key (e.g., "Mon Jan 20 2025")
   * @param {string} mealType - Meal type (e.g., "Déjeuner")
   * @param {object} recipe - Recipe object
   */
  const planMeal = useCallback((dateKey, mealType, recipe) => {
    const mealKey = `${dateKey}-${mealType}`;
    
    setMealPlan(prev => ({
      ...prev,
      [mealKey]: {
        recipe,
        date: dateKey,
        mealType,
        plannedAt: new Date().toISOString()
      }
    }));
  }, []);

  /**
   * Removes a planned meal
   * @param {string} dateKey - Date key
   * @param {string} mealType - Meal type
   */
  const removeMeal = useCallback((dateKey, mealType) => {
    const mealKey = `${dateKey}-${mealType}`;
    
    setMealPlan(prev => {
      const newPlan = { ...prev };
      delete newPlan[mealKey];
      return newPlan;
    });
  }, []);

  /**
   * Gets planned meals for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {object} - Filtered meal plan
   */
  const getMealsForDateRange = useCallback((startDate, endDate) => {
    const filteredPlan = {};
    
    Object.entries(mealPlan).forEach(([mealKey, plannedMeal]) => {
      const mealDate = new Date(plannedMeal.date);
      if (mealDate >= startDate && mealDate <= endDate) {
        filteredPlan[mealKey] = plannedMeal;
      }
    });
    
    return filteredPlan;
  }, [mealPlan]);

  /**
   * Gets all planned meals for the current week
   * @returns {object} - Current week's meal plan
   */
  const getCurrentWeekMeals = useCallback(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    return getMealsForDateRange(startOfWeek, endOfWeek);
  }, [currentWeek, getMealsForDateRange]);

  /**
   * Clears all planned meals
   */
  const clearAllMeals = useCallback(() => {
    setMealPlan({});
  }, []);

  /**
   * Gets statistics about planned meals
   * @returns {object} - Meal plan statistics
   */
  const getMealPlanStats = useCallback(() => {
    const totalMeals = Object.keys(mealPlan).length;
    const uniqueRecipes = new Set(
      Object.values(mealPlan).map(meal => meal.recipe?.id)
    ).size;
    
    // Count meals by type
    const mealTypes = {};
    Object.values(mealPlan).forEach(meal => {
      mealTypes[meal.mealType] = (mealTypes[meal.mealType] || 0) + 1;
    });
    
    return {
      totalMeals,
      uniqueRecipes,
      mealTypes,
      isEmpty: totalMeals === 0
    };
  }, [mealPlan]);

  /**
   * Checks if there are any planned meals
   * @returns {boolean} - Whether meal plan has any meals
   */
  const hasMeals = useCallback(() => {
    return Object.keys(mealPlan).length > 0;
  }, [mealPlan]);

  /**
   * Gets all unique recipes from the meal plan
   * @returns {array} - Array of unique recipes
   */
  const getPlannedRecipes = useCallback(() => {
    const recipes = Object.values(mealPlan)
      .map(meal => meal.recipe)
      .filter(recipe => recipe !== null && recipe !== undefined);
    
    // Remove duplicates based on recipe ID
    const uniqueRecipes = recipes.filter((recipe, index, self) =>
      index === self.findIndex(r => r.id === recipe.id)
    );
    
    return uniqueRecipes;
  }, [mealPlan]);

  /**
   * Updates the current week for calendar navigation
   * @param {Date} newWeek - New week date
   */
  const updateCurrentWeek = useCallback((newWeek) => {
    setCurrentWeek(newWeek);
  }, []);

  /**
   * Navigates to a different week
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  const navigateWeek = useCallback((direction) => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      newWeek.setDate(newWeek.getDate() + (direction * 7));
      return newWeek;
    });
  }, []);

  // Future Firebase integration methods (placeholders)
  const saveMealPlanToFirebase = useCallback(async () => {
    // TODO: Implement Firebase save
    console.log('Saving meal plan to Firebase...');
  }, [mealPlan]);

  const loadMealPlanFromFirebase = useCallback(async (familyId, weekStart) => {
    // TODO: Implement Firebase load
    console.log('Loading meal plan from Firebase...', familyId, weekStart);
  }, []);

  const value = {
    // State
    mealPlan,
    currentWeek,

    // Actions
    planMeal,
    removeMeal,
    clearAllMeals,
    updateCurrentWeek,
    navigateWeek,

    // Queries
    getMealsForDateRange,
    getCurrentWeekMeals,
    getMealPlanStats,
    hasMeals,
    getPlannedRecipes,

    // Future Firebase integration
    saveMealPlanToFirebase,
    loadMealPlanFromFirebase
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export { MealPlanContext };
export default MealPlanContext;
