/**
 * Unit Equivalence System for MiamBidi
 * Handles conversions between different units for Cameroonian/African ingredients
 */

// Base unit equivalences for common Cameroonian ingredients
export const INGREDIENT_EQUIVALENCES = {
  // Vegetables - Individual to Weight
  'tomate': {
    '1 pièce': { weight: 150, unit: 'g', description: '≈ 1 tomate moyenne' },
    '1 tomate': { weight: 150, unit: 'g', description: '≈ 1 tomate moyenne' },
    '1 grosse tomate': { weight: 200, unit: 'g', description: '≈ 1 grosse tomate' },
    '1 petite tomate': { weight: 100, unit: 'g', description: '≈ 1 petite tomate' }
  },
  'oignon': {
    '1 pièce': { weight: 100, unit: 'g', description: '≈ 1 oignon moyen' },
    '1 oignon': { weight: 100, unit: 'g', description: '≈ 1 oignon moyen' },
    '1 gros oignon': { weight: 150, unit: 'g', description: '≈ 1 gros oignon' },
    '1 petit oignon': { weight: 70, unit: 'g', description: '≈ 1 petit oignon' }
  },
  'pomme de terre': {
    '1 pièce': { weight: 200, unit: 'g', description: '≈ 1 pomme de terre moyenne' },
    '1 pomme de terre': { weight: 200, unit: 'g', description: '≈ 1 pomme de terre moyenne' },
    '1 grosse pomme de terre': { weight: 300, unit: 'g', description: '≈ 1 grosse pomme de terre' }
  },
  'carotte': {
    '1 pièce': { weight: 80, unit: 'g', description: '≈ 1 carotte moyenne' },
    '1 carotte': { weight: 80, unit: 'g', description: '≈ 1 carotte moyenne' },
    '1 botte': { count: 6, unit: 'pièces', description: '≈ 6 carottes moyennes' }
  },
  'poivron': {
    '1 pièce': { weight: 120, unit: 'g', description: '≈ 1 poivron moyen' },
    '1 poivron': { weight: 120, unit: 'g', description: '≈ 1 poivron moyen' }
  },
  'aubergine': {
    '1 pièce': { weight: 250, unit: 'g', description: '≈ 1 aubergine moyenne' },
    '1 aubergine': { weight: 250, unit: 'g', description: '≈ 1 aubergine moyenne' }
  },
  'courgette': {
    '1 pièce': { weight: 200, unit: 'g', description: '≈ 1 courgette moyenne' },
    '1 courgette': { weight: 200, unit: 'g', description: '≈ 1 courgette moyenne' }
  },

  // Leafy Vegetables
  'épinard': {
    '1 botte': { weight: 200, unit: 'g', description: '≈ 1 botte d\'épinards' },
    '1 paquet': { weight: 150, unit: 'g', description: '≈ 1 paquet d\'épinards' }
  },
  'ndolé': {
    '1 paquet': { weight: 100, unit: 'g', description: '≈ 1 paquet de ndolé' },
    '1 botte': { weight: 150, unit: 'g', description: '≈ 1 botte de ndolé' }
  },
  'eru': {
    '1 paquet': { weight: 100, unit: 'g', description: '≈ 1 paquet d\'eru' },
    '1 botte': { weight: 150, unit: 'g', description: '≈ 1 botte d\'eru' }
  },

  // Fruits
  'banane': {
    '1 pièce': { weight: 120, unit: 'g', description: '≈ 1 banane moyenne' },
    '1 banane': { weight: 120, unit: 'g', description: '≈ 1 banane moyenne' },
    '1 régime': { count: 8, unit: 'pièces', description: '≈ 8 bananes moyennes' }
  },
  'plantain': {
    '1 pièce': { weight: 200, unit: 'g', description: '≈ 1 plantain moyen' },
    '1 plantain': { weight: 200, unit: 'g', description: '≈ 1 plantain moyen' },
    '1 régime': { count: 6, unit: 'pièces', description: '≈ 6 plantains moyens' }
  },
  'avocat': {
    '1 pièce': { weight: 150, unit: 'g', description: '≈ 1 avocat moyen' },
    '1 avocat': { weight: 150, unit: 'g', description: '≈ 1 avocat moyen' }
  },
  'mangue': {
    '1 pièce': { weight: 300, unit: 'g', description: '≈ 1 mangue moyenne' },
    '1 mangue': { weight: 300, unit: 'g', description: '≈ 1 mangue moyenne' }
  },

  // Proteins
  'œuf': {
    '1 pièce': { weight: 60, unit: 'g', description: '≈ 1 œuf moyen' },
    '1 œuf': { weight: 60, unit: 'g', description: '≈ 1 œuf moyen' },
    '1 douzaine': { count: 12, unit: 'pièces', description: '≈ 12 œufs' }
  },
  'poulet': {
    '1 entier': { weight: 1500, unit: 'g', description: '≈ 1 poulet entier' },
    '1 cuisse': { weight: 200, unit: 'g', description: '≈ 1 cuisse de poulet' },
    '1 blanc': { weight: 150, unit: 'g', description: '≈ 1 blanc de poulet' }
  },

  // Packaging Equivalences
  'riz': {
    '1 paquet': { weight: 500, unit: 'g', description: '≈ 1 paquet standard' },
    '1 sac': { weight: 5000, unit: 'g', description: '≈ 1 sac de 5kg' },
    '1 tasse': { weight: 200, unit: 'g', description: '≈ 1 tasse de riz' }
  },
  'haricot': {
    '1 paquet': { weight: 500, unit: 'g', description: '≈ 1 paquet standard' },
    '1 tasse': { weight: 180, unit: 'g', description: '≈ 1 tasse de haricots' }
  },
  'farine': {
    '1 paquet': { weight: 1000, unit: 'g', description: '≈ 1 paquet de 1kg' },
    '1 tasse': { weight: 125, unit: 'g', description: '≈ 1 tasse de farine' }
  },

  // Liquids
  'lait': {
    '1 litre': { volume: 1000, unit: 'ml', description: '≈ 1 litre de lait' },
    '1 tasse': { volume: 250, unit: 'ml', description: '≈ 1 tasse de lait' }
  },
  'huile': {
    '1 litre': { volume: 1000, unit: 'ml', description: '≈ 1 litre d\'huile' },
    '1 cuillère à soupe': { volume: 15, unit: 'ml', description: '≈ 1 c. à soupe' },
    '1 cuillère à café': { volume: 5, unit: 'ml', description: '≈ 1 c. à café' }
  }
};

// Volume to weight conversions for common ingredients
export const VOLUME_TO_WEIGHT = {
  'farine': { '1 tasse': 125, '1 cuillère à soupe': 8 }, // grams
  'sucre': { '1 tasse': 200, '1 cuillère à soupe': 12 },
  'riz': { '1 tasse': 200, '1 cuillère à soupe': 12 },
  'huile': { '1 tasse': 220, '1 cuillère à soupe': 14 },
  'eau': { '1 tasse': 250, '1 cuillère à soupe': 15 },
  'lait': { '1 tasse': 250, '1 cuillère à soupe': 15 }
};

// Standard unit conversions
export const UNIT_CONVERSIONS = {
  // Weight
  'kg': { 'g': 1000, 'mg': 1000000 },
  'g': { 'kg': 0.001, 'mg': 1000 },
  'mg': { 'g': 0.001, 'kg': 0.000001 },
  
  // Volume
  'l': { 'ml': 1000, 'cl': 100, 'dl': 10 },
  'ml': { 'l': 0.001, 'cl': 0.1, 'dl': 0.01 },
  'cl': { 'l': 0.01, 'ml': 10, 'dl': 0.1 },
  'dl': { 'l': 0.1, 'ml': 100, 'cl': 10 },
  
  // Common cooking measures
  'tasse': { 'ml': 250, 'cl': 25 },
  'cuillère à soupe': { 'ml': 15 },
  'cuillère à café': { 'ml': 5 }
};

/**
 * Find equivalent units for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {number} quantity - Quantity to convert
 * @param {string} fromUnit - Original unit
 * @param {string} toUnit - Target unit
 * @returns {object} Conversion result with quantity, unit, and description
 */
export function findEquivalence(ingredientName, quantity, fromUnit, toUnit) {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Check for direct ingredient equivalences
  const equivalences = INGREDIENT_EQUIVALENCES[normalizedName];
  if (equivalences) {
    const fromEquiv = equivalences[fromUnit];
    const toEquiv = equivalences[toUnit];
    
    if (fromEquiv && toEquiv) {
      // Calculate conversion between specific ingredient units
      let convertedQuantity;
      let description = '';
      
      if (fromEquiv.weight && toEquiv.weight) {
        convertedQuantity = (quantity * fromEquiv.weight) / toEquiv.weight;
        description = `${fromEquiv.description} → ${toEquiv.description}`;
      } else if (fromEquiv.count && toEquiv.count) {
        convertedQuantity = (quantity * fromEquiv.count) / toEquiv.count;
        description = `${fromEquiv.description} → ${toEquiv.description}`;
      }
      
      if (convertedQuantity) {
        return {
          quantity: Math.round(convertedQuantity * 100) / 100,
          unit: toUnit,
          description,
          isApproximate: true,
          confidence: 'high'
        };
      }
    }
  }
  
  // Check for standard unit conversions
  const standardConversion = convertStandardUnits(quantity, fromUnit, toUnit);
  if (standardConversion) {
    return standardConversion;
  }
  
  // Check for volume to weight conversions
  const volumeWeightConversion = convertVolumeToWeight(normalizedName, quantity, fromUnit, toUnit);
  if (volumeWeightConversion) {
    return volumeWeightConversion;
  }
  
  return null;
}

/**
 * Convert between standard units (kg, g, l, ml, etc.)
 */
function convertStandardUnits(quantity, fromUnit, toUnit) {
  const conversions = UNIT_CONVERSIONS[fromUnit];
  if (conversions && conversions[toUnit]) {
    return {
      quantity: quantity * conversions[toUnit],
      unit: toUnit,
      description: `Conversion standard: ${fromUnit} → ${toUnit}`,
      isApproximate: false,
      confidence: 'exact'
    };
  }
  return null;
}

/**
 * Convert between volume and weight for specific ingredients
 */
function convertVolumeToWeight(ingredientName, quantity, fromUnit, toUnit) {
  const volumeWeights = VOLUME_TO_WEIGHT[ingredientName];
  if (!volumeWeights) return null;
  
  // Convert from volume to weight
  if (volumeWeights[fromUnit] && (toUnit === 'g' || toUnit === 'kg')) {
    const weightInGrams = quantity * volumeWeights[fromUnit];
    const finalWeight = toUnit === 'kg' ? weightInGrams / 1000 : weightInGrams;
    
    return {
      quantity: Math.round(finalWeight * 100) / 100,
      unit: toUnit,
      description: `Conversion volume → poids pour ${ingredientName}`,
      isApproximate: true,
      confidence: 'medium'
    };
  }
  
  // Convert from weight to volume
  if ((fromUnit === 'g' || fromUnit === 'kg') && volumeWeights['1 tasse']) {
    const weightInGrams = fromUnit === 'kg' ? quantity * 1000 : quantity;
    const gramsPerCup = volumeWeights['1 tasse'];
    
    if (toUnit === 'tasse') {
      return {
        quantity: Math.round((weightInGrams / gramsPerCup) * 100) / 100,
        unit: toUnit,
        description: `Conversion poids → volume pour ${ingredientName}`,
        isApproximate: true,
        confidence: 'medium'
      };
    }
  }
  
  return null;
}

/**
 * Get all possible equivalences for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @returns {array} Array of possible equivalences
 */
export function getAllEquivalences(ingredientName) {
  const normalizedName = ingredientName.toLowerCase().trim();
  const equivalences = INGREDIENT_EQUIVALENCES[normalizedName];
  
  if (!equivalences) return [];
  
  return Object.keys(equivalences).map(unit => ({
    unit,
    ...equivalences[unit]
  }));
}

/**
 * Check if two units can be converted for a specific ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} unit1 - First unit
 * @param {string} unit2 - Second unit
 * @returns {boolean} Whether conversion is possible
 */
export function canConvert(ingredientName, unit1, unit2) {
  return findEquivalence(ingredientName, 1, unit1, unit2) !== null;
}

export default {
  findEquivalence,
  getAllEquivalences,
  canConvert,
  INGREDIENT_EQUIVALENCES,
  VOLUME_TO_WEIGHT,
  UNIT_CONVERSIONS
};
