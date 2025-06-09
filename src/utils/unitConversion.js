/**
 * Unit Conversion Utilities for French Cooking Measurements
 * Handles aggregation of ingredients with different units
 */

import { UNIT_CONVERSIONS } from '../types/shoppingList.js';

/**
 * Determines the unit type (weight, volume, spoons, count)
 * @param {string} unit - The unit to classify
 * @returns {string} - The unit type
 */
export function getUnitType(unit) {
  const normalizedUnit = unit.toLowerCase().trim();
  
  if (UNIT_CONVERSIONS.weight[normalizedUnit] !== undefined) {
    return 'weight';
  }
  if (UNIT_CONVERSIONS.volume[normalizedUnit] !== undefined) {
    return 'volume';
  }
  if (UNIT_CONVERSIONS.spoons[normalizedUnit] !== undefined) {
    return 'spoons';
  }
  if (UNIT_CONVERSIONS.count[normalizedUnit] !== undefined) {
    return 'count';
  }
  
  return 'unknown';
}

/**
 * Converts a quantity to the base unit for its type
 * @param {number} quantity - The quantity to convert
 * @param {string} unit - The unit to convert from
 * @returns {object} - {value: number, baseUnit: string, type: string}
 */
export function convertToBaseUnit(quantity, unit) {
  const unitType = getUnitType(unit);
  const normalizedUnit = unit.toLowerCase().trim();
  
  switch (unitType) {
    case 'weight':
      return {
        value: quantity * UNIT_CONVERSIONS.weight[normalizedUnit],
        baseUnit: 'g',
        type: 'weight'
      };
      
    case 'volume':
      return {
        value: quantity * UNIT_CONVERSIONS.volume[normalizedUnit],
        baseUnit: 'ml',
        type: 'volume'
      };
      
    case 'spoons':
      return {
        value: quantity * UNIT_CONVERSIONS.spoons[normalizedUnit],
        baseUnit: 'ml',
        type: 'volume'
      };
      
    case 'count':
      return {
        value: quantity,
        baseUnit: 'pièces',
        type: 'count'
      };
      
    default:
      return {
        value: quantity,
        baseUnit: unit,
        type: 'unknown'
      };
  }
}

/**
 * Converts from base unit to the most appropriate display unit
 * @param {number} value - Value in base unit
 * @param {string} type - Unit type (weight, volume, count)
 * @returns {object} - {quantity: number, unit: string}
 */
export function convertFromBaseUnit(value, type) {
  switch (type) {
    case 'weight':
      if (value >= 1000) {
        return {
          quantity: Math.round((value / 1000) * 100) / 100,
          unit: 'kg'
        };
      }
      return {
        quantity: Math.round(value * 10) / 10,
        unit: 'g'
      };
      
    case 'volume':
      if (value >= 1000) {
        return {
          quantity: Math.round((value / 1000) * 100) / 100,
          unit: 'L'
        };
      }
      return {
        quantity: Math.round(value * 10) / 10,
        unit: 'ml'
      };
      
    case 'count':
      return {
        quantity: Math.round(value),
        unit: value > 1 ? 'pièces' : 'pièce'
      };
      
    default:
      return {
        quantity: value,
        unit: 'unité'
      };
  }
}

/**
 * Checks if two ingredients can be aggregated (same name and compatible units)
 * @param {object} ingredient1 - First ingredient
 * @param {object} ingredient2 - Second ingredient
 * @returns {boolean} - Whether they can be aggregated
 */
export function canAggregateIngredients(ingredient1, ingredient2) {
  // Must have the same name (case-insensitive)
  if (ingredient1.name.toLowerCase() !== ingredient2.name.toLowerCase()) {
    return false;
  }
  
  // Must have compatible unit types
  const type1 = getUnitType(ingredient1.unit);
  const type2 = getUnitType(ingredient2.unit);
  
  return type1 === type2 && type1 !== 'unknown';
}

/**
 * Aggregates two ingredients with compatible units
 * @param {object} ingredient1 - First ingredient
 * @param {object} ingredient2 - Second ingredient
 * @returns {object} - Aggregated ingredient
 */
export function aggregateIngredients(ingredient1, ingredient2) {
  if (!canAggregateIngredients(ingredient1, ingredient2)) {
    throw new Error('Cannot aggregate incompatible ingredients');
  }
  
  // Convert both to base units
  const base1 = convertToBaseUnit(ingredient1.quantity, ingredient1.unit);
  const base2 = convertToBaseUnit(ingredient2.quantity, ingredient2.unit);
  
  // Sum the base values
  const totalBaseValue = base1.value + base2.value;
  
  // Convert back to appropriate display unit
  const displayUnit = convertFromBaseUnit(totalBaseValue, base1.type);
  
  return {
    name: ingredient1.name,
    quantity: displayUnit.quantity,
    unit: displayUnit.unit,
    category: ingredient1.category,
    originalIngredients: [
      {
        quantity: ingredient1.quantity,
        unit: ingredient1.unit,
        source: ingredient1.source || 'unknown'
      },
      {
        quantity: ingredient2.quantity,
        unit: ingredient2.unit,
        source: ingredient2.source || 'unknown'
      }
    ]
  };
}

/**
 * Scales ingredient quantities based on serving adjustments
 * @param {object} ingredient - The ingredient to scale
 * @param {number} scalingFactor - The scaling factor (e.g., 1.5 for 50% more)
 * @returns {object} - Scaled ingredient
 */
export function scaleIngredient(ingredient, scalingFactor) {
  return {
    ...ingredient,
    quantity: Math.round(ingredient.quantity * scalingFactor * 100) / 100,
    originalQuantity: ingredient.quantity,
    scalingFactor
  };
}

/**
 * Normalizes ingredient names for better matching
 * @param {string} name - The ingredient name
 * @returns {string} - Normalized name
 */
export function normalizeIngredientName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c');
}

/**
 * Formats quantity and unit for display
 * @param {number} quantity - The quantity
 * @param {string} unit - The unit
 * @returns {string} - Formatted string
 */
export function formatQuantityUnit(quantity, unit) {
  // Handle decimal places
  const formattedQuantity = quantity % 1 === 0 
    ? quantity.toString() 
    : quantity.toFixed(1);
  
  // Handle plural forms
  const formattedUnit = quantity > 1 && unit === 'pièce' ? 'pièces' : unit;
  
  return `${formattedQuantity} ${formattedUnit}`;
}

export default {
  getUnitType,
  convertToBaseUnit,
  convertFromBaseUnit,
  canAggregateIngredients,
  aggregateIngredients,
  scaleIngredient,
  normalizeIngredientName,
  formatQuantityUnit
};
